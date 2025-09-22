import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { updateProcessedData, generateExcelFiles } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import { DynamicJobCargoTable, type DisplayJobCargoItem } from "./tables";

// Interfaces
interface StatisticalUOM {
  UOM: string;
  quantity: number;
  confidence?: number;
}

interface ProcessedDataItem {
  invoiceNumber: string | string[];
  invoiceNumber_confidence?: number;
  invoiceValue: number;
  invoiceValue_confidence?: number;
  invoiceDate: string;
  invoiceDate_confidence?: number;
  incoterms: string;
  incoterms_confidence?: number;
  currency: string;
  currency_confidence?: number;
  grossWeight: number;
  grossWeight_confidence?: number;
  measurementUnit: string;
  measurementUnit_confidence?: number;
  NoOfPackages: number;
  NoOfPackages_confidence?: number;
  generalDescription: string;
  generalDescription_confidence?: number;
  consigneeName: string;
  consigneeName_confidence?: number;
  consigneeAddress: string;
  consigneeAddress_confidence?: number;
  "rob/rocForConsignee": string | null;
  "rob/rocForConsignee_confidence"?: number;
  consignorName: string;
  consignorName_confidence?: number;
  consignorAddress: string;
  consignorAddress_confidence?: number;
  "rob/rocForConsignor": string | null;
  "rob/rocForConsignor_confidence"?: number;
  items: JobCargoItem[];
  overall_confidence?: number;
}

interface JobCargoItem {
  countryOfOrigin: string;
  countryOfOrigin_confidence?: number;
  hsCode: string;
  hsCode_confidence?: number;
  statisticalUOM: StatisticalUOM[];
  statisticalQty: number;
  statisticalQty_confidence?: number;
  declaredQty: number;
  declaredQty_confidence?: number;
  declaredUOM: string;
  declaredUOM_confidence?: number;
  itemAmount: number;
  itemAmount_confidence?: number;
  itemDescription: string;
  itemDescription_confidence?: number;
  itemDescription2: string;
  itemDescription2_confidence?: number;
  itemDescription3: string;
  itemDescription3_confidence?: number;
  // K9-specific fields
  packQtyToBeReleased?: number;
  packQtyToBeReleased_confidence?: number;
  packUOMToBeReleased?: string;
  packUOMToBeReleased_confidence?: number;
}

interface GeneralInformation {
  measurementUnit: string;
  measurementUnit_confidence?: number;
  robRocForConsignee: string;
  robRocForConsignee_confidence?: number;
  robRocForConsignor: string;
  robRocForConsignor_confidence?: number;
  NoOfPackages: string;
  NoOfPackages_confidence?: number;
  consigneeAddress: string;
  consigneeAddress_confidence?: number;
  consigneeName: string;
  consigneeName_confidence?: number;
  consignorAddress: string;
  consignorAddress_confidence?: number;
  consignorName: string;
  consignorName_confidence?: number;
  currency: string;
  currency_confidence?: number;
  generalDescription: string;
  generalDescription_confidence?: number;
  grossWeight: string;
  grossWeight_confidence?: number;
  incoterms: string;
  incoterms_confidence?: number;
  invoiceNumber: string | string[];
  invoiceNumber_confidence?: number;
  invoiceDate: string;
  invoiceDate_confidence?: number;
  invoiceValue: string;
  invoiceValue_confidence?: number;
}

interface JobCargo {
  items: DisplayJobCargoItem[];
}

interface SessionDocument {
  document_id: string;
  document_name: string;
  processing_status: string;
  created_at: string;
  processed_url?: string;
  error_message?: string;
  original_filename?: string;
  file_size?: number;
  file_type?: string;
  pages_consumed?: number;
}

interface SessionStatusResponse {
  upload_session_id: string;
  session_status: string;
  format_validation_enabled: boolean;
  session_info: {
    total_documents: number;
    successful_documents: number;
    failed_documents: number;
    total_pages_consumed: number;
    created_at: string;
    updated_at: string;
  };
  document_status: {
    total_files: number;
    completed_files: number;
    failed_files: number;
    processing_files: number;
    uploaded_files: number;
  };
  documents: SessionDocument[];
  processed_documents: any[];
}

interface PreviewModalProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  extractedData: {
    generalInformation: GeneralInformation;
    jobCargo: JobCargo;
  } | null;
  setExtractedData: React.Dispatch<
    React.SetStateAction<{
      generalInformation: GeneralInformation;
      jobCargo: JobCargo;
    } | null>
  >;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  uploadSessionId: string | null;
  sessionStatus: SessionStatusResponse | null;
  setMessage: (message: string) => void;
  outputFormat?: string; // Add output format prop
  allowFormTypeChange?: boolean; // Allow changing form type in preview
}

// Utility function to get background color based on confidence score
const getConfidenceColor = (confidence?: number): string => {
  if (confidence === undefined || confidence === null) {
    return "bg-gray-50"; // Default color when no confidence score
  }

  if (confidence >= 0.8) {
    return "bg-green-50 border-green-200"; // High confidence - green
  } else if (confidence >= 0.5) {
    return "bg-yellow-50 border-yellow-200"; // Medium confidence - yellow
  } else {
    return "bg-red-50 border-red-200"; // Low confidence - red
  }
};

// Utility function to format invoice numbers
const formatInvoiceNumbers = (invoiceNumber: string | string[]): string => {
  if (Array.isArray(invoiceNumber)) {
    return invoiceNumber.join(", ");
  }
  return invoiceNumber || "";
};

// Utility function to parse invoice numbers back to array
const parseInvoiceNumbers = (invoiceNumberString: string): string[] => {
  if (!invoiceNumberString) return [];
  return invoiceNumberString.split(",").map(num => num.trim()).filter(num => num.length > 0);
};

// Map output format names to form types
const mapOutputFormatToFormType = (outputFormat?: string): string => {
  console.log("mapOutputFormatToFormType called with:", outputFormat);

  if (!outputFormat) {
    console.log("No output format provided, defaulting to K1");
    return "K1"; // Default to K1
  }

  const formatLower = outputFormat.toLowerCase();
  console.log("Format lowercase:", formatLower);

  // Map common output format names to form types
  // You can customize these mappings based on your actual output format names
  if (
    formatLower.includes("k1") ||
    formatLower.includes("malaysia") ||
    formatLower.includes("customs")
  ) {
    console.log("Matched K1 format");
    return "K1";
  } else if (formatLower.includes("k2") || formatLower.includes("simplified")) {
    console.log("Matched K2 format");
    return "K2";
  } else if (formatLower.includes("k9") || formatLower.includes("advanced")) {
    console.log("Matched K9 format");
    return "K9";
  }
  // You can add more specific mappings based on your actual format names:
  // Example: if your formats are named like "Malaysia K1 Export Form", "Commercial Invoice Template", etc.
  switch (formatLower) {
    case "malaysia k1 export form":
    case "k1 export declaration":
      console.log("Matched specific K1 format");
      return "K1";
    case "k2 simplified form":
    case "simplified customs declaration":
      console.log("Matched specific K2 format");
      return "K2";
    default:
      console.log("No specific match found, defaulting to K1");
      return "K1"; // Default fallback
  }
};

// Convert UI data back to API format for updates
const convertUIDataToAPI = (uiData: {
  generalInformation: GeneralInformation;
  jobCargo: JobCargo;
}): ProcessedDataItem[] => {
  // Handle invoice number conversion - if it's a string with commas, convert to array
  let invoiceNumber = uiData.generalInformation.invoiceNumber;
  if (typeof invoiceNumber === "string" && invoiceNumber.includes(",")) {
    invoiceNumber = parseInvoiceNumbers(invoiceNumber);
  }

  const apiDataItem: ProcessedDataItem = {
    invoiceNumber: invoiceNumber,
    invoiceNumber_confidence:
      uiData.generalInformation.invoiceNumber_confidence,
    invoiceValue: parseFloat(uiData.generalInformation.invoiceValue) || 0,
    invoiceValue_confidence: uiData.generalInformation.invoiceValue_confidence,
    invoiceDate: uiData.generalInformation.invoiceDate,
    invoiceDate_confidence: uiData.generalInformation.invoiceDate_confidence,
    incoterms: uiData.generalInformation.incoterms,
    incoterms_confidence: uiData.generalInformation.incoterms_confidence,
    currency: uiData.generalInformation.currency,
    currency_confidence: uiData.generalInformation.currency_confidence,
    grossWeight: parseFloat(uiData.generalInformation.grossWeight) || 0,
    grossWeight_confidence: uiData.generalInformation.grossWeight_confidence,
    measurementUnit: uiData.generalInformation.measurementUnit,
    measurementUnit_confidence:
      uiData.generalInformation.measurementUnit_confidence,
    NoOfPackages: parseInt(uiData.generalInformation.NoOfPackages) || 0,
    NoOfPackages_confidence: uiData.generalInformation.NoOfPackages_confidence,
    generalDescription: uiData.generalInformation.generalDescription,
    generalDescription_confidence:
      uiData.generalInformation.generalDescription_confidence,
    consigneeName: uiData.generalInformation.consigneeName,
    consigneeName_confidence:
      uiData.generalInformation.consigneeName_confidence,
    consigneeAddress: uiData.generalInformation.consigneeAddress,
    consigneeAddress_confidence:
      uiData.generalInformation.consigneeAddress_confidence,
    "rob/rocForConsignee": uiData.generalInformation.robRocForConsignee || null,
    "rob/rocForConsignee_confidence":
      uiData.generalInformation.robRocForConsignee_confidence,
    consignorName: uiData.generalInformation.consignorName,
    consignorName_confidence:
      uiData.generalInformation.consignorName_confidence,
    consignorAddress: uiData.generalInformation.consignorAddress,
    consignorAddress_confidence:
      uiData.generalInformation.consignorAddress_confidence,
    "rob/rocForConsignor": uiData.generalInformation.robRocForConsignor || null,
    "rob/rocForConsignor_confidence":
      uiData.generalInformation.robRocForConsignor_confidence,
    items: uiData.jobCargo.items.map((item) => ({
      countryOfOrigin: item.countryOfOrigin,
      countryOfOrigin_confidence: item.countryOfOrigin_confidence,
      hsCode: item.hsCode,
      hsCode_confidence: item.hsCode_confidence,
      statisticalUOM: [
        {
          UOM: item.statisticalUOM,
          quantity: item.statisticalQty,
        },
      ],
      statisticalQty: item.statisticalQty,
      statisticalQty_confidence: item.statisticalQty_confidence,
      declaredQty: item.declaredQty,
      declaredQty_confidence: item.declaredQty_confidence,
      declaredUOM: item.declaredUOM,
      declaredUOM_confidence: item.declaredUOM_confidence,
      itemAmount: item.itemAmount,
      itemAmount_confidence: item.itemAmount_confidence,
      itemDescription: item.itemDescription,
      itemDescription_confidence: item.itemDescription_confidence,
      itemDescription2: item.itemDescription2,
      itemDescription2_confidence: item.itemDescription2_confidence,
      itemDescription3: item.itemDescription3,
      itemDescription3_confidence: item.itemDescription3_confidence,
      // K9-specific fields (optional)
      ...(item.packQtyToBeReleased !== undefined && {
        packQtyToBeReleased: item.packQtyToBeReleased,
        packQtyToBeReleased_confidence: item.packQtyToBeReleased_confidence,
      }),
      ...(item.packUOMToBeReleased !== undefined && {
        packUOMToBeReleased: item.packUOMToBeReleased,
        packUOMToBeReleased_confidence: item.packUOMToBeReleased_confidence,
      }),
    })),
  };

  return [apiDataItem];
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  showPreview,
  setShowPreview,
  extractedData,
  setExtractedData,
  isEditMode,
  setIsEditMode,
  uploading,
  setUploading,
  uploadSessionId,
  setMessage,
  outputFormat,
  allowFormTypeChange = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine form type based on output format and sync state
  const formType = mapOutputFormatToFormType(outputFormat);
  const [selectedFormType, setSelectedFormType] = useState<string>(() => {
    return mapOutputFormatToFormType(outputFormat);
  });

  // Force sync state with computed form type
  React.useEffect(() => {
    if (formType !== selectedFormType) {
      setSelectedFormType(formType);
    }
  }, [formType, selectedFormType]);

  // Clear error when modal opens/closes and validate data
  React.useEffect(() => {
    if (showPreview) {
      setError("");

      // Validate extracted data
      if (!extractedData) {
        setError(
          "No data available to preview. Please upload and process documents first."
        );
      } else if (!extractedData.generalInformation) {
        setError(
          "General information is missing. Please reprocess the documents."
        );
      } else if (!extractedData.jobCargo || !extractedData.jobCargo.items) {
        setError(
          "Job cargo information is missing. Please reprocess the documents."
        );
      }
    }
  }, [showPreview, extractedData]);

  const clearError = () => {
    setError("");
  };

  const updateGeneralInformation = (
    field: keyof GeneralInformation,
    value: string
  ) => {
    if (!extractedData) {
      setError(
        "No data available to update. Please reload the page and try again."
      );
      return;
    }

    try {
      setError(""); // Clear any existing errors
      
      // Handle invoice number specially to convert comma-separated string back to array
      let processedValue: string | string[] = value;
      if (field === "invoiceNumber" && value) {
        const parsedNumbers = parseInvoiceNumbers(value);
        processedValue = parsedNumbers.length > 1 ? parsedNumbers : value;
      }
      
      setExtractedData({
        ...extractedData,
        generalInformation: {
          ...extractedData.generalInformation,
          [field]: processedValue,
        },
      });
    } catch (error) {
      console.error("Error updating general information:", error);
      setError("Failed to update field. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    if (!extractedData || !uploadSessionId) {
      setError("Missing required data or session ID. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("Saving changes...");

      const apiData = convertUIDataToAPI(extractedData);

      if (uploadSessionId) {
        await updateProcessedData(uploadSessionId, apiData);
        setMessage("Changes saved successfully!");
        setIsEditMode(false);
      } else {
        const errorMsg =
          "Warning: Changes saved locally but could not sync to server";
        setMessage(errorMsg);
        setError(errorMsg);
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save changes. Please try again.";
      setError(`Error saving changes: ${errorMessage}`);
      setMessage(`Error saving changes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSaveToggle = () => {
    if (isEditMode) {
      handleSaveChanges();
    } else {
      setIsEditMode(true);
    }
  };

  const updateJobCargo = (
    itemIndex: number,
    field: keyof DisplayJobCargoItem,
    value: string | number
  ) => {
    if (!extractedData) {
      setError(
        "No data available to update. Please reload the page and try again."
      );
      return;
    }

    try {
      setError(""); // Clear any existing errors
      const updatedItems = [...extractedData.jobCargo.items];

      // Validate itemIndex
      if (itemIndex < 0 || itemIndex >= updatedItems.length) {
        setError("Invalid item index. Please refresh and try again.");
        return;
      }

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [field]:
          field === "declaredQty" ||
          field === "itemAmount" ||
          field === "statisticalQty" ||
          field === "packQtyToBeReleased"
            ? Number(value)
            : value,
      };

      setExtractedData({
        ...extractedData,
        jobCargo: {
          ...extractedData.jobCargo,
          items: updatedItems,
        },
      });
    } catch (error) {
      console.error("Error updating job cargo:", error);
      setError("Failed to update cargo item. Please try again.");
    }
  };

  const handleGenerateExcel = async () => {
    if (!extractedData || !uploadSessionId) {
      setError(
        "Missing required data or session ID. Please ensure data is loaded properly."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const apiData = convertUIDataToAPI(extractedData);

      await generateExcelFiles(uploadSessionId, apiData);

      setMessage("Excel files generation requested! Checking for processed files...");
      
      // Wait 2 seconds then check for processed files
      // Check if we're on the documents page (including admin routes)
      if (
        location.pathname === "/documents" ||
        location.pathname === "/admin/documents"
      ) {
        // Reload the page to refresh the documents list
        window.location.reload();
      } else {
        // Navigate to documents page from other pages
        // Check if user is admin or regular user to navigate to correct documents page
        const user = localStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          if (userData.role?.role_name === "admin") {
            navigate("/admin/documents");
          } else {
            navigate("/documents");
          }
        } else {
          // Fallback to regular documents page
          navigate("/documents");
        }
      }
    } catch (error: any) {
      console.error("Excel generation error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate Excel files. Please try again.";
      setError(`Error generating Excel files: ${errorMessage}`);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent
        className="max-w-[80vw] w-[80vw] max-h-[90vh] h-[90vh] flex flex-col"
        style={{ width: "80vw", maxWidth: "80vw" }}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Preview Extracted Data</DialogTitle>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <span>Confidence Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span>High (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span>Medium (≥50%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>Low (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span>No Score</span>
            </div>
          </div>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="flex-shrink-0">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {extractedData && (
          <div className="flex flex-col flex-1 min-h-0">
            <Tabs
              defaultValue="general"
              className="flex flex-col flex-1 min-h-0"
            >
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="general">General Information</TabsTrigger>
                <TabsTrigger value="cargo">Job Cargo</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto w-full">
                <TabsContent value="general" className="space-y-4 mt-4">
                  {/* INVOICE INFORMATION */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                      INVOICE INFORMATION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
                      <div className="space-y-1">
                        <Label htmlFor="invoiceNumber" className="text-sm">
                          Invoice No.
                        </Label>
                        {isEditMode ? (
                          <textarea
                            id="invoiceNumber"
                            value={formatInvoiceNumbers(
                              extractedData.generalInformation.invoiceNumber
                            )}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "invoiceNumber",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded-md resize-none text-xs leading-tight"
                            rows={2}
                            placeholder="Enter invoice numbers separated by commas"
                            style={{ 
                              wordBreak: 'break-word',
                              lineHeight: '1.2'
                            }}
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border min-h-[2rem] flex items-start min-w-[180px] text-xs leading-tight ${getConfidenceColor(
                              extractedData.generalInformation
                                .invoiceNumber_confidence
                            )}`}
                            style={{ 
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                              lineHeight: '1.2'
                            }}
                          >
                            {formatInvoiceNumbers(extractedData.generalInformation.invoiceNumber)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="invoiceValue" className="text-sm">
                          Invoice Value
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="invoiceValue"
                            value={
                              extractedData.generalInformation.invoiceValue
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "invoiceValue",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .invoiceValue_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.invoiceValue}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="invoiceDate" className="text-sm">
                          Date
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="invoiceDate"
                            value={extractedData.generalInformation.invoiceDate}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "invoiceDate",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .invoiceDate_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.invoiceDate}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="incoterms" className="text-sm">
                          Inco Term
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="incoterms"
                            value={extractedData.generalInformation.incoterms}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "incoterms",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .incoterms_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.incoterms}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="currency" className="text-sm">
                          Currency
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="currency"
                            value={extractedData.generalInformation.currency}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "currency",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .currency_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.currency}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PACKAGE INFORMATION */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                      PACKAGE INFORMATION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
                      <div className="space-y-1">
                        <Label htmlFor="grossWeight" className="text-sm">
                          Gross Weight
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="grossWeight"
                            value={extractedData.generalInformation.grossWeight}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "grossWeight",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .grossWeight_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.grossWeight}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="measurementUnit" className="text-sm">
                          Measurement
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="measurementUnit"
                            value={
                              extractedData.generalInformation.measurementUnit
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "measurementUnit",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .measurementUnit_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.measurementUnit}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="NoOfPackages" className="text-sm">
                          No. of Package
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="NoOfPackages"
                            value={
                              extractedData.generalInformation.NoOfPackages
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "NoOfPackages",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .NoOfPackages_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.NoOfPackages}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CARGO DESCRIPTION */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                      CARGO DESCRIPTION
                    </h3>
                    <div className="pl-3">
                      <div className="space-y-1">
                        <Label htmlFor="generalDescription" className="text-sm">
                          General
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="generalDescription"
                            value={
                              extractedData.generalInformation
                                .generalDescription
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "generalDescription",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .generalDescription_confidence
                            )}`}
                          >
                            {
                              extractedData.generalInformation
                                .generalDescription
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CONSIGNEE AND CONSIGNOR INFORMATION */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CONSIGNEE INFORMATION */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                        CONSIGNEE INFORMATION
                      </h3>
                      <div className="space-y-3 pl-3">
                        <div className="space-y-1">
                          <Label htmlFor="consigneeName" className="text-sm">
                            Consignee Name
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="consigneeName"
                              value={
                                extractedData.generalInformation.consigneeName
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "consigneeName",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .consigneeName_confidence
                              )}`}
                            >
                              {extractedData.generalInformation.consigneeName}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="consigneeAddress" className="text-sm">
                            Consignee Address
                          </Label>
                          {isEditMode ? (
                            <textarea
                              id="consigneeAddress"
                              className="w-full p-2 border rounded-md resize-none text-sm"
                              rows={2}
                              value={
                                extractedData.generalInformation
                                  .consigneeAddress
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "consigneeAddress",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border min-h-[3rem] flex items-start min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .consigneeAddress_confidence
                              )}`}
                            >
                              {
                                extractedData.generalInformation
                                  .consigneeAddress
                              }
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor="robRocForConsignee"
                            className="text-sm"
                          >
                            ROB / ROC No.
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="robRocForConsignee"
                              value={
                                extractedData.generalInformation
                                  .robRocForConsignee
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "robRocForConsignee",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .robRocForConsignee_confidence
                              )}`}
                            >
                              {
                                extractedData.generalInformation
                                  .robRocForConsignee
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CONSIGNOR INFORMATION */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                        CONSIGNOR INFORMATION
                      </h3>
                      <div className="space-y-3 pl-3">
                        <div className="space-y-1">
                          <Label htmlFor="consignorName" className="text-sm">
                            Consignor Name
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="consignorName"
                              value={
                                extractedData.generalInformation.consignorName
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "consignorName",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .consignorName_confidence
                              )}`}
                            >
                              {extractedData.generalInformation.consignorName}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="consignorAddress" className="text-sm">
                            Consignor Address
                          </Label>
                          {isEditMode ? (
                            <textarea
                              id="consignorAddress"
                              className="w-full p-2 border rounded-md resize-none text-sm"
                              rows={2}
                              value={
                                extractedData.generalInformation
                                  .consignorAddress
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "consignorAddress",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border min-h-[3rem] flex items-start min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .consignorAddress_confidence
                              )}`}
                            >
                              {
                                extractedData.generalInformation
                                  .consignorAddress
                              }
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor="robRocForConsignor"
                            className="text-sm"
                          >
                            ROB / ROC No.
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="robRocForConsignor"
                              value={
                                extractedData.generalInformation
                                  .robRocForConsignor
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "robRocForConsignor",
                                  e.target.value
                                )
                              }
                              className="text-sm bg-amber-400"
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                                extractedData.generalInformation
                                  .robRocForConsignor_confidence
                              )}`}
                            >
                              {
                                extractedData.generalInformation
                                  .robRocForConsignor
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cargo" className="space-y-4 mt-4">
                  <DynamicJobCargoTable
                    selectedFormType={selectedFormType}
                    onFormTypeChange={setSelectedFormType}
                    showFormSelector={allowFormTypeChange}
                    items={extractedData.jobCargo.items}
                    isEditMode={isEditMode}
                    onUpdate={updateJobCargo}
                    getConfidenceColor={getConfidenceColor}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <DialogFooter className="flex justify-between flex-shrink-0 mt-4">
          <Button
            variant="outline"
            onClick={handleEditSaveToggle}
            disabled={isLoading || uploading}
          >
            {isEditMode ? (isLoading ? "Saving..." : "Save Changes") : "Edit"}
          </Button>

          <Button
            onClick={handleGenerateExcel}
            disabled={uploading || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? "Generating..." : "Generate Excel & Go to Documents"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
