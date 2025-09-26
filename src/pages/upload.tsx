import { useState, useRef, useEffect } from "react";
import {
  API_BASE_URL,
  getAuthHeaders,
  handleApiResponse,
  getSessionStatus,
  getSessionProcessedData,
  requestPresignedUrls,
  uploadToS3,
  confirmUpload,
  processWithBypass,
  cancelProcessing,
  getSessionIssues,
} from "../utils/api";
import type { SessionIssuesResponse } from "../utils/api";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { PreviewModal } from "../components/PreviewModal";

interface OutputFormat {
  format_id: string;
  format_name: string;
  format_description: string;
  format_extension: string;
  is_active: boolean;
}

// Updated interface to match API response structure
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
}

interface JobCargoItem {
  countryOfOrigin: string;
  countryOfOrigin_confidence?: number;
  hsCode: string;
  hsCode_confidence?: number;
  statisticalUOM: Array<{
    UOM: string;
    quantity: number;
  }>;
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

// For displaying in the UI (flattened structure)
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

// For UI display (simplified structure)
interface DisplayJobCargoItem {
  id: string;
  countryOfOrigin: string;
  countryOfOrigin_confidence?: number;
  declaredQty: number;
  declaredQty_confidence?: number;
  declaredUOM: string;
  declaredUOM_confidence?: number;
  hsCode: string;
  hsCode_confidence?: number;
  itemAmount: number;
  itemAmount_confidence?: number;
  itemDescription: string;
  itemDescription_confidence?: number;
  itemDescription2: string;
  itemDescription2_confidence?: number;
  itemDescription3: string;
  itemDescription3_confidence?: number;
  statisticalQty: number;
  statisticalQty_confidence?: number;
  statisticalUOM: string;
  statisticalUOM_confidence?: number;
  // K9-specific fields
  packQtyToBeReleased?: number;
  packQtyToBeReleased_confidence?: number;
  packUOMToBeReleased?: string;
  packUOMToBeReleased_confidence?: number;
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
  processed_documents: SessionProcessedDocument[];
}

interface SessionDocument {
  document_id: string;
  document_name: string;
  processing_status: string;
  created_at: string;
  processed_url?: string;
  error_message?: string;
  // Additional fields that may be present
  original_filename?: string;
  file_size?: number;
  file_type?: string;
  pages_consumed?: number;
}

interface SessionProcessedDocument {
  document_id: string;
  processed_url: string;
  document_name: string;
}

// Presigned URL upload interfaces
interface PresignedUrlInfo {
  filename: string;
  upload_url: string;
  s3_key: string;
  unique_filename: string;
  content_type?: string;
}

interface PresignedUrlResponse {
  upload_session_id: string;
  presigned_urls: PresignedUrlInfo[];
  validation_required?: boolean;
  note?: string;
}

interface UploadConfirmFile {
  s3_key: string;
  filename: string;
  size: number;
}

interface UploadConfirmResponse {
  message: string;
  upload_session_id: string;
  created_documents: any[];
  failed_confirmations: any[];
  completion_signal_sent: boolean;
  summary: {
    total_files: number;
    successful_confirmations: number;
    failed_confirmations: number;
    total_pages_consumed: number;
  };
  usage_info: {
    pages_consumed_this_upload: number;
    monthly_usage: number;
    monthly_limit: number;
    remaining_pages: number;
    subscription_tier: string;
  };
}

// Enhanced API response interfaces
interface ProcessWithBypassResponse {
  message: string;
  session_id: string;
  session_info: {
    session_status: string;
    format_validation_enabled: boolean;
    bypass_triggered: boolean;
    total_documents: number;
  };
  documents_updated: number;
  processing_triggered: boolean;
}

interface CancelProcessingResponse {
  message: string;
  session_id: string;
  cancellation_info: {
    cancelled_at: string;
    session_status: string;
    documents_cancelled: number;
    format_validation_enabled: boolean;
  };
  refund_summary: {
    total_pages_refunded: number;
    total_pages_calculated: number;
    refund_processed: boolean;
  };
  document_details: Array<{
    document_id: string;
    document_name: string;
    original_pages: number;
    refund_pages: number;
    final_charge: number;
  }>;
  updated_usage: {
    monthly_usage: number;
    monthly_limit: number;
    remaining_pages: number;
    subscription_tier: string;
  };
}

function MainPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [outputFormat, setOutputFormat] = useState("");
  const [formatValidator, setFormatValidator] = useState(false);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingFormats, setLoadingFormats] = useState(false);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    generalInformation: GeneralInformation;
    jobCargo: JobCargo;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Session tracking for processing status
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatusResponse | null>(null);
  const [pollingSession, setPollingSession] = useState<string | null>(null);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [hasCompletedDocuments, setHasCompletedDocuments] = useState(false);
  
  // Use useRef to store the polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // New state for presigned URL upload
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);

  // State for format validation bypass/cancel options
  const [showValidationOptions, setShowValidationOptions] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [isProcessingBypass, setIsProcessingBypass] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Session issues state
  const [sessionIssues, setSessionIssues] = useState<SessionIssuesResponse | null>(null);
  const [showDocumentIssues, setShowDocumentIssues] = useState(false);

  useEffect(() => {
    fetchOutputFormats();
  }, []);

  // Cleanup polling interval on component unmount or when pollingSession changes
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Clear interval when polling session ends
  useEffect(() => {
    if (!pollingSession && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [pollingSession]);

  // Helper function to get file info for presigned URL request
  const getFileInfo = (files: File[]) => {
    return files.map((file) => ({
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size: file.size,
    }));
  };

  // Convert API data to UI format
  const convertApiDataToUI = (
    apiData: ProcessedDataItem[]
  ): { generalInformation: GeneralInformation; jobCargo: JobCargo } => {
    console.log(
      "convertApiDataToUI - Raw input data:",
      JSON.stringify(apiData, null, 2)
    );

    if (!apiData || apiData.length === 0) {
      throw new Error("No processed data available");
    }

    // Handle both array and single object responses
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];
    console.log(
      "convertApiDataToUI - Data array:",
      JSON.stringify(dataArray, null, 2)
    );

    // Use the first item as the base for general information
    const firstItem = dataArray[0];
    console.log(
      "convertApiDataToUI - First item:",
      JSON.stringify(firstItem, null, 2)
    );
    console.log(
      "convertApiDataToUI - Invoice number from first item:",
      firstItem.invoiceNumber
    );
    console.log(
      "convertApiDataToUI - Invoice number with typo from first item:",
      (firstItem as any).invoceNumber
    );

    const generalInformation: GeneralInformation = {
      measurementUnit: firstItem.measurementUnit?.toString() || "",
      measurementUnit_confidence: firstItem.measurementUnit_confidence,
      robRocForConsignee: firstItem["rob/rocForConsignee"] || "",
      robRocForConsignee_confidence:
        firstItem["rob/rocForConsignee_confidence"],
      robRocForConsignor: firstItem["rob/rocForConsignor"] || "",
      robRocForConsignor_confidence:
        firstItem["rob/rocForConsignor_confidence"],
      NoOfPackages: firstItem.NoOfPackages?.toString() || "0",
      NoOfPackages_confidence: firstItem.NoOfPackages_confidence,
      consigneeAddress: firstItem.consigneeAddress || "",
      consigneeAddress_confidence: firstItem.consigneeAddress_confidence,
      consigneeName: firstItem.consigneeName || "",
      consigneeName_confidence: firstItem.consigneeName_confidence,
      consignorAddress: firstItem.consignorAddress || "",
      consignorAddress_confidence: firstItem.consignorAddress_confidence,
      consignorName: firstItem.consignorName || "",
      consignorName_confidence: firstItem.consignorName_confidence,
      currency: firstItem.currency || "",
      currency_confidence: firstItem.currency_confidence,
      generalDescription: firstItem.generalDescription || "",
      generalDescription_confidence: firstItem.generalDescription_confidence,
      grossWeight: firstItem.grossWeight?.toString() || "0",
      grossWeight_confidence: firstItem.grossWeight_confidence,
      incoterms: firstItem.incoterms || "",
      incoterms_confidence: firstItem.incoterms_confidence,
      // Handle both correct and typo versions of invoice number field
      invoiceNumber:
        firstItem.invoiceNumber || (firstItem as any).invoceNumber || "",
      invoiceNumber_confidence:
        firstItem.invoiceNumber_confidence ||
        (firstItem as any).invoceNumber_confidence,
      invoiceDate: firstItem.invoiceDate || "",
      invoiceDate_confidence: firstItem.invoiceDate_confidence,
      invoiceValue: firstItem.invoiceValue?.toString() || "0",
      invoiceValue_confidence: firstItem.invoiceValue_confidence,
    };

    console.log(
      "convertApiDataToUI - Generated general information:",
      JSON.stringify(generalInformation, null, 2)
    );

    // Collect all items from all data entries
    const allItems: DisplayJobCargoItem[] = [];
    dataArray.forEach((dataItem, dataIndex) => {
      if (dataItem.items && Array.isArray(dataItem.items)) {
        dataItem.items.forEach((item, itemIndex) => {
          allItems.push({
            id: `${dataIndex}-${itemIndex}`,
            countryOfOrigin: item.countryOfOrigin || "",
            countryOfOrigin_confidence: item.countryOfOrigin_confidence,
            declaredQty: item.declaredQty || 0,
            declaredQty_confidence: item.declaredQty_confidence,
            declaredUOM: item.declaredUOM || "",
            declaredUOM_confidence: item.declaredUOM_confidence,
            hsCode: item.hsCode || "",
            hsCode_confidence: item.hsCode_confidence,
            itemAmount: item.itemAmount || 0,
            itemAmount_confidence: item.itemAmount_confidence,
            itemDescription: item.itemDescription || "",
            itemDescription_confidence: item.itemDescription_confidence,
            itemDescription2: item.itemDescription2 || "",
            itemDescription2_confidence: item.itemDescription2_confidence,
            itemDescription3: item.itemDescription3 || "",
            itemDescription3_confidence: item.itemDescription3_confidence,
            statisticalQty: item.statisticalQty || 0,
            statisticalQty_confidence: item.statisticalQty_confidence,
            statisticalUOM:
              item.statisticalUOM &&
              Array.isArray(item.statisticalUOM) &&
              item.statisticalUOM.length > 0
                ? item.statisticalUOM.find(
                    (uom) => uom.quantity === item.statisticalQty
                  )?.UOM || item.statisticalUOM[0].UOM
                : item.declaredUOM || "",
            statisticalUOM_confidence: item.statisticalQty_confidence,
            // K9-specific fields
            packQtyToBeReleased: item.packQtyToBeReleased,
            packQtyToBeReleased_confidence: item.packQtyToBeReleased_confidence,
            packUOMToBeReleased: item.packUOMToBeReleased,
            packUOMToBeReleased_confidence: item.packUOMToBeReleased_confidence,
          });
        });
      }
    });

    return {
      generalInformation,
      jobCargo: { items: allItems },
    };
  };

  // Convert UI data back to API format for updates

  const handlePreview = async () => {
    if (selectedFiles.length < 1 || !outputFormat) {
      setMessage("Please select files and output format");
      return;
    }

    // Preview is only available when processing is complete
    if (!isProcessingComplete || !uploadSessionId) {
      setMessage(
        "Please upload files first and wait for processing to complete before previewing."
      );
      return;
    }

    try {
      setMessage("Loading extracted data...");
      console.log("Starting preview for session:", uploadSessionId);

      // Get processed data from API using session ID
      const apiData = await getSessionProcessedData(uploadSessionId);
      console.log("Retrieved processed data:", apiData);

      // Convert API data to UI format
      const uiData = convertApiDataToUI(apiData);
      console.log("Converted UI data:", uiData);

      setExtractedData(uiData);
      setShowPreview(true);
      setIsEditMode(false);
      setMessage("");
    } catch (error: any) {
      console.error("Preview error:", error);
      if (error.message?.includes("No completed documents found")) {
        setMessage(
          "Processing is still in progress. Please wait for documents to complete processing before previewing."
        );
        setIsProcessingComplete(false); // Reset the state since documents aren't actually ready
      } else {
        setMessage(`Error loading preview: ${error.message}`);
      }
    }
  };

  const fetchOutputFormats = async () => {
    setLoadingFormats(true);
    try {
      console.log(
        "Fetching output formats from:",
        `${API_BASE_URL}/documents/formats`
      );
      const response = await fetch(`${API_BASE_URL}/documents/formats`, {
        headers: getAuthHeaders(),
      });

      console.log("Response status:", response.status);
      const data = await handleApiResponse(response);
      console.log("Fetched output formats:", data);

      const formats = data.formats || [];
      console.log("Setting output formats:", formats);
      setOutputFormats(formats);

      if (formats.length === 0) {
        setMessage("No output formats available");
      }
    } catch (error) {
      console.error("Error fetching output formats:", error);
      setMessage(
        "Failed to load output formats. Please check your connection and try again."
      );
    } finally {
      setLoadingFormats(false);
    }
  };

  // Real session status checking function
  const checkSessionStatus = async (
    sessionId: string
  ): Promise<SessionStatusResponse | null> => {
    try {
      console.log(`Checking status for session: ${sessionId}`);
      const data = await getSessionStatus(sessionId);
      console.log(`Session status response:`, data);
      return data;
    } catch (error: any) {
      console.error("Error checking session status:", error);

      // Handle specific API error cases based on the documentation
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        console.log(
          "Session not found - may still be initializing or no documents match this session ID"
        );
        return null;
      }

      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        console.error("Authentication failed for session status check");
        setMessage(
          "Authentication error. Please refresh the page and try again."
        );
        return null;
      }

      if (
        error.message?.includes("500") ||
        error.message?.includes("Internal server error")
      ) {
        console.error("Server error while checking session status");
        setMessage(
          "Server error while checking status. Will continue trying..."
        );
        return null;
      }

      // For other errors, continue polling but log the error
      console.log("Unknown error, will continue polling:", error.message);
      return null;
    }
  };

  const manualCheckStatus = async () => {
    if (!pollingSession) return;

    console.log("Manual status check requested");
    const status = await checkSessionStatus(pollingSession);

    if (status) {
      console.log("Manual check - status received:", status);
      setSessionStatus(status);

      // Check for completed documents before updating processing state
      const completedDocs =
        status.documents?.filter(
          (doc: any) => doc.processing_status === "completed"
        ) || [];
      const hasCompletedDocuments = completedDocs.length > 0;

      setHasCompletedDocuments(hasCompletedDocuments);

      // If processing is complete, stop polling and enable upload button
      if (
        status.session_status === "completed" ||
        status.session_status === "partially_completed" ||
        status.session_status === "pending_review"
      ) {
        setIsProcessingComplete(hasCompletedDocuments);
        setPollingSession(null);
        setUploading(false);
        console.log("Manual check detected completion, stopping polling");
        
        // Handle pending_review state
        if (status.session_status === "pending_review") {
          try {
            const issues = await getSessionIssues(pollingSession);
            setSessionIssues(issues);
            setShowDocumentIssues(true);
            setMessage("Processing completed but requires review due to verification issues.");
          } catch (error) {
            console.error("Failed to fetch session issues in manual check:", error);
            setMessage("Processing completed but failed to load verification issues.");
          }
        }
      } else if (status.session_status === "failed") {
        setPollingSession(null);
        setUploading(false);
        console.log("Manual check detected failure, stopping polling");
      }
    }
  };

  const startPollingSession = (sessionId: string) => {
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setPollingSession(sessionId);
    setMessage("Processing files... Checking status in a moment...");
    console.log(`Starting to poll session: ${sessionId}`);

    let attemptCount = 0;
    const maxAttempts = 60; // Maximum attempts (15 minutes at 15-second intervals)

    const pollFunction = async () => {
      try {
        attemptCount++;
        console.log(
          `Polling session status for: ${sessionId} (attempt ${attemptCount}/${maxAttempts})`
        );
        
        const status = await checkSessionStatus(sessionId);

        if (status) {
          console.log("Session status received:", status);
          setSessionStatus(status);

          // Check for completed documents
          const completedDocs =
            status.documents?.filter(
              (doc: any) => doc.processing_status === "completed"
            ) || [];
          const hasCompletedDocsReady = completedDocs.length > 0;

          setHasCompletedDocuments(hasCompletedDocsReady);

          // Check if we should stop polling (terminal states)
          const isTerminalState = ["completed", "partially_completed", "failed", "pending_review"].includes(status.session_status);

          switch (status.session_status) {
            case "uploaded":
              setMessage(
                "Files uploaded successfully! Processing will begin shortly..."
              );
              break;
            case "processing":
              setMessage(
                `Processing ${status.document_status.processing_files} of ${status.document_status.total_files} files...`
              );
              break;
            case "completed":
              if (hasCompletedDocsReady) {
                setMessage(
                  `All ${status.document_status.total_files} files processed successfully! You can now preview the extracted data.`
                );
                setIsProcessingComplete(true);
              } else {
                setMessage(
                  `Processing completed but no documents are ready yet. This may indicate an issue with document processing.`
                );
                setIsProcessingComplete(false);
              }
              break;
            case "pending_review":
              setMessage("Processing completed but requires review due to verification issues.");
              setIsProcessingComplete(true);
              // Fetch session issues to display
              try {
                const issues = await getSessionIssues(sessionId);
                setSessionIssues(issues);
                setShowDocumentIssues(true);
                console.log("Session issues fetched:", issues);
              } catch (error) {
                console.error("Failed to fetch session issues:", error);
                setMessage("Processing completed but failed to load verification issues.");
              }
              break;
            case "partially_completed":
              if (hasCompletedDocsReady) {
                setMessage(
                  `${status.document_status.completed_files} of ${status.document_status.total_files} files processed successfully. ${status.document_status.failed_files} failed. Preview available for completed files.`
                );
                setIsProcessingComplete(true);
              } else {
                setMessage(
                  `${status.document_status.completed_files} of ${status.document_status.total_files} files processed but documents are not ready yet. This may indicate an issue.`
                );
                setIsProcessingComplete(false);
              }
              break;
            case "failed":
              // Check if this is a format validation failure that can be bypassed
              const hasValidationEnabled = status.format_validation_enabled;
              const failedDocs =
                status.documents?.filter(
                  (doc: any) => doc.processing_status === "failed"
                ) || [];
              const hasValidationErrors = failedDocs.some(
                (doc: any) =>
                  doc.error_message
                    ?.toLowerCase()
                    .includes("format validation") ||
                  doc.error_message?.toLowerCase().includes("validation failed")
              );

              if (hasValidationEnabled && hasValidationErrors) {
                setValidationErrorMessage(
                  "Format validation failed. You can either process anyway or cancel to get a refund."
                );
                setShowValidationOptions(true);
                setMessage(
                  "Format validation failed. Please choose how to proceed."
                );
              } else {
                setMessage("Processing failed. Please try uploading again.");
              }
              break;
            default:
              console.log(`Unknown status: ${status.session_status}`);
              setMessage(`Status: ${status.session_status}`);
          }

          // Stop polling if we've reached a terminal state
          if (isTerminalState) {
            console.log(`Terminal state reached (${status.session_status}), stopping polling`);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setPollingSession(null);
            setUploading(false);
            return;
          }
          
          // Continue polling for non-terminal states
          console.log(`Non-terminal state (${status.session_status}), continuing polling`);
        } else {
          console.log(
            `No status received, session may not exist yet (attempt ${attemptCount}/${maxAttempts})`
          );

          // If we've tried many times and still no session, stop polling
          if (attemptCount >= maxAttempts) {
            console.log("Max attempts reached, stopping polling");
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setPollingSession(null);
            setUploading(false);
            setMessage(
              "Unable to check processing status. Please check your documents page or contact support."
            );
            return;
          } else {
            // Update message to show we're still trying
            setMessage(
              `Waiting for processing to begin... (${attemptCount}/${maxAttempts} checks)`
            );
            console.log("No status yet, but continuing polling");
          }
        }
      } catch (error) {
        console.error("Error in poll function:", error);
        // Continue polling even if there's an error, unless we've reached max attempts
        if (attemptCount >= maxAttempts) {
          console.log("Max attempts reached due to errors, stopping polling");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPollingSession(null);
          setUploading(false);
          setMessage("Error checking status after multiple attempts. Please try again.");
          return;
        }
        console.log("Error occurred but continuing polling");
      }
    };

    // Start polling immediately, then every 15 seconds
    console.log("Starting initial status check...");
    pollFunction();
    
    // Set up the recurring interval
    pollingIntervalRef.current = setInterval(() => {
      console.log("Interval triggered, running poll function...");
      pollFunction();
    }, 15000); // Poll every 15 seconds
    
    console.log("Polling interval set up successfully");
  };

  const handleFiles = (files: FileList) => {
    // Reset processing state when new files are added
    setIsProcessingComplete(false);
    setHasCompletedDocuments(false);
    setUploadSessionId(null);
    setSessionStatus(null);
    setIsUploadingToS3(false);
    setUploadProgress("");
    setSessionIssues(null);
    setShowDocumentIssues(false);
    if (pollingSession) {
      setPollingSession(null);
    }
    
    // Clear any active polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Log the file details for debugging
    Array.from(files).forEach((file) => {
      console.log(
        `File Upload Attempt: Name: ${file.name}, Type: '${file.type}'`
      );
    });

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
    ];

    const allowedExtensions = [".pdf", ".xls", ".xlsx", ".xlsm"];

    const validFiles = Array.from(files).filter((file) => {
      // Check 1: Is the MIME type in our list? (Good first check)
      const isMimeTypeAllowed = allowedMimeTypes.includes(file.type);

      // Check 2: Does the file extension match our list? (Great fallback)
      // We use toLowerCase() to handle extensions like .PDF or .XLSX
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const isExtensionAllowed = allowedExtensions.includes(fileExtension);

      // If either the MIME type OR the extension is allowed, accept the file.
      // This is much more reliable.
      return isMimeTypeAllowed || isExtensionAllowed;
    });

    if (validFiles.length !== files.length) {
      alert(
        "Invalid file type detected. Please upload only PDF or supported Excel files (.xls, .xlsx, .xlsm)."
      );
    } else {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    // Reset processing state when files are removed
    setIsProcessingComplete(false);
    setHasCompletedDocuments(false);
    setUploadSessionId(null);
    setSessionStatus(null);
    setIsUploadingToS3(false);
    setUploadProgress("");
    setSessionIssues(null);
    setShowDocumentIssues(false);
    if (pollingSession) {
      setPollingSession(null);
    }
    
    // Clear any active polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Clear extracted data and preview state
    setExtractedData(null);
    setShowPreview(false);
    setIsEditMode(false);
    // Clear any messages
    setMessage("");
    // Clear validation options
    setShowValidationOptions(false);
    setValidationErrorMessage("");
  };

  // Handle format validation bypass
  const handleProcessWithBypass = async () => {
    if (!uploadSessionId) {
      setMessage("No session ID available for bypass processing.");
      return;
    }

    setIsProcessingBypass(true);
    setMessage("Processing documents with format validation bypass...");

    try {
      const response: ProcessWithBypassResponse = await processWithBypass(
        uploadSessionId
      );
      console.log("Bypass processing response:", response);

      setMessage(response.message);
      setShowValidationOptions(false);
      setValidationErrorMessage("");

      // Resume polling to track the processing
      startPollingSession(uploadSessionId);
    } catch (error: any) {
      console.error("Bypass processing error:", error);

      // Handle specific session errors
      if (error.message.includes("Session not found")) {
        setMessage("Session not found. Please try uploading your files again.");
        setShowValidationOptions(false);
        // Reset upload state
        setUploading(false);
        setUploadSessionId(null);
        setSessionStatus(null);
      } else {
        setMessage(`Failed to process with bypass: ${error.message}`);
      }
    } finally {
      setIsProcessingBypass(false);
    }
  };

  // Handle processing cancellation and refund
  const handleCancelProcessing = async () => {
    if (!uploadSessionId) {
      setMessage("No session ID available for cancellation.");
      return;
    }

    setIsCancelling(true);
    setMessage("Cancelling processing and processing refund...");

    try {
      const response: CancelProcessingResponse = await cancelProcessing(
        uploadSessionId
      );
      console.log("Cancel processing response:", response);

      setMessage(
        `${response.message} Refunded ${response.refund_summary.total_pages_refunded} pages.`
      );
      setShowValidationOptions(false);
      setValidationErrorMessage("");

      // Reset upload state
      setUploading(false);
      setIsUploadingToS3(false);
      setUploadProgress("");
      setUploadSessionId(null);
      setSessionStatus(null);
      setSessionIssues(null);
      setShowDocumentIssues(false);

      // Stop any polling
      if (pollingSession) {
        setPollingSession(null);
      }
      
      // Clear any active polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Clear files and reset to initial state
      setSelectedFiles([]);
      setIsProcessingComplete(false);
      setHasCompletedDocuments(false);
    } catch (error: any) {
      console.error("Cancel processing error:", error);

      // Handle specific session errors
      if (error.message.includes("Session not found")) {
        setMessage(
          "Session not found. Your files may have already been processed or the session expired."
        );
        setShowValidationOptions(false);
        // Reset upload state
        setUploading(false);
        setUploadSessionId(null);
        setSessionStatus(null);
        setSelectedFiles([]);
        
        // Clear any active polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        setMessage(`Failed to cancel processing: ${error.message}`);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length < 1 || !outputFormat) {
      setMessage("Please select files and output format");
      return;
    }

    console.log("Starting upload process...", {
      filesCount: selectedFiles.length,
      outputFormat: outputFormat,
    });

    setUploading(true);
    setIsUploadingToS3(true);
    setMessage("");

    try {
      const fileInfos = getFileInfo(selectedFiles);

      // Step 1: Request presigned URLs
      setUploadProgress("Requesting upload URLs...");
      console.log("Step 1: Requesting presigned URLs");

      const presignedResponse: PresignedUrlResponse =
        await requestPresignedUrls(fileInfos, outputFormat);
      console.log("Presigned URLs response:", presignedResponse);

      const { upload_session_id, presigned_urls } = presignedResponse;
      setUploadSessionId(upload_session_id);

      // Step 2: Upload files to S3
      setUploadProgress("Uploading files to cloud storage...");
      console.log("Step 2: Uploading files to S3");

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const presignedUrl = presigned_urls[index];
        if (!presignedUrl) {
          throw new Error(`No presigned URL found for file ${file.name}`);
        }

        console.log(`Uploading ${file.name} to S3...`);
        return uploadToS3(
          file,
          presignedUrl.upload_url,
          presignedUrl.content_type || file.type
        );
      });

      await Promise.all(uploadPromises);
      console.log("All files uploaded to S3 successfully");

      // Step 3: Confirm upload and trigger processing
      setUploadProgress("Confirming upload and starting processing...");
      console.log("Step 3: Confirming upload");

      const confirmationFiles: UploadConfirmFile[] = presigned_urls.map(
        (url: PresignedUrlInfo, index: number) => ({
          s3_key: url.s3_key,
          filename: url.filename,
          size: selectedFiles[index].size,
        })
      );

      const confirmResponse: UploadConfirmResponse = await confirmUpload(
        upload_session_id,
        outputFormat,
        confirmationFiles,
        formatValidator
      );
      console.log("Upload confirmation response:", confirmResponse);

      setIsUploadingToS3(false);
      setUploadProgress("");

      if (confirmResponse.completion_signal_sent) {
        startPollingSession(upload_session_id);
      }

      setMessage(
        `Upload successful! Files are being processed. Session ID: ${upload_session_id}`
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      setIsUploadingToS3(false);
      setUploadProgress("");

      // Handle specific upload errors
      let errorMessage = `Upload failed: ${error.message}`;

      if (error.message?.includes("Monthly page limit exceeded")) {
        errorMessage = `Monthly page limit already exceeded`;
      } else if (error.message?.includes("Usage limit exceeded")) {
        errorMessage = `Monthly page limit already exceeded`;
      } else if (error.message?.includes("S3 upload failed")) {
        errorMessage = `Cloud storage upload failed: ${error.message}`;
      } else if (error.message?.includes("File not found in S3")) {
        errorMessage = `Upload confirmation failed: File not found in cloud storage. Please try again.`;
      } else if (error.message?.includes("Invalid output format")) {
        errorMessage = `Invalid output format selected. Please choose a valid format.`;
      }

      setMessage(errorMessage);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Submit Your Files
      </h1>

      {/* Message display */}
      {message && (
        <Alert
          variant={
            message.includes("Error") || 
            message.includes("Failed") || 
            message.includes("Monthly page limit already exceeded")
              ? "destructive"
              : "default"
          }
          className="w-full max-w-lg"
        >
          <AlertDescription className="whitespace-pre-line">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Output format selector */}
      <div className="w-full max-w-lg">
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger className="w-full h-12">
            <SelectValue
              placeholder={
                loadingFormats ? "Loading formats..." : "Select Output Format"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {loadingFormats ? (
              <SelectItem value="loading" disabled>
                Loading formats...
              </SelectItem>
            ) : outputFormats.length === 0 ? (
              <SelectItem value="no-formats" disabled>
                No formats available
              </SelectItem>
            ) : (
              outputFormats.map((format) => (
                <SelectItem key={format.format_id} value={format.format_id}>
                  {format.format_name} ({format.format_extension})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <p className="text-gray-600 text-left max-w-lg text-xs">
        Choose the desired output format for your files. This will determine the
        type of file you receive after conversion.
      </p>

      {/* Format Validator Checkbox */}
      <div className="w-full max-w-lg flex items-center space-x-2">
        <Checkbox
          id="format-validator"
          checked={formatValidator}
          onCheckedChange={(checked) => setFormatValidator(checked === true)}
        />
        <label
          htmlFor="format-validator"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Enable format validation
        </label>
      </div>
      <p className="text-gray-600 text-left max-w-lg text-xs">
        When enabled, uploaded documents will be validated for format and structure. Disable to bypass validation if needed.
      </p>

      {/* File upload area */}
      <Card
        className={`w-full max-w-4xl border-2 border-dashed p-16 text-center transition-colors cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-blue-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
          <h2 className="text-2xl font-semibold text-gray-700">
            Drag and drop PDF or Excel files here
          </h2>
          <p className="text-gray-500">Or</p>
          <Button
            onClick={handleFileSelect}
            variant="secondary"
            size="lg"
            className="px-6 py-3"
          >
            Upload PDF or Excel Files
          </Button>
          <p className="text-sm text-gray-400 mt-2">
            PDF and Excel files are accepted • Minimum 1 file required
          </p>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-700">
                Selected Files ({selectedFiles.length})
              </CardTitle>
              {selectedFiles.length < 1 ? (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  Need to select files
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Ready to submit
                </Badge>
              )}
            </div>
            {/* File size info */}
            {selectedFiles.length > 0 && (
              <div className="mt-2">
                {(() => {
                  const totalSize = selectedFiles.reduce(
                    (sum, file) => sum + file.size,
                    0
                  );
                  const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);

                  return (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Total size: {sizeMB}MB</span>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Presigned URL Upload
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => {
                const isPDF = file.type === "application/pdf";
                const isExcel =
                  file.type === "application/vnd.ms-excel" ||
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                          isPDF
                            ? "bg-gradient-to-br from-red-100 to-red-200"
                            : isExcel
                            ? "bg-gradient-to-br from-green-100 to-green-200"
                            : "bg-gradient-to-br from-gray-100 to-gray-200"
                        }`}
                      >
                        {isPDF ? (
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : isExcel ? (
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-gray-900 font-medium truncate max-w-[500px] mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {isPDF
                              ? "PDF Document"
                              : isExcel
                              ? "Excel Spreadsheet"
                              : "Document"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 w-8 h-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                      title="Remove file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Clear all button */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedFiles([]);
                    // Reset processing state when all files are cleared
                    setIsProcessingComplete(false);
                    setHasCompletedDocuments(false);
                    setUploadSessionId(null);
                    setSessionStatus(null);
                    setIsUploadingToS3(false);
                    setUploadProgress("");
                    setSessionIssues(null);
                    setShowDocumentIssues(false);
                    if (pollingSession) {
                      setPollingSession(null);
                    }
                    
                    // Clear any active polling interval
                    if (pollingIntervalRef.current) {
                      clearInterval(pollingIntervalRef.current);
                      pollingIntervalRef.current = null;
                    }
                    
                    // Clear extracted data and preview state
                    setExtractedData(null);
                    setShowPreview(false);
                    setIsEditMode(false);
                    // Clear any messages
                    setMessage("");
                    // Clear validation options
                    setShowValidationOptions(false);
                    setValidationErrorMessage("");
                  }}
                  className="text-sm text-gray-500 hover:text-red-500 font-medium"
                >
                  Clear all files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Status Display */}
      {pollingSession && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <div>
                  <div className="font-medium text-blue-800">
                    Processing Session:{" "}
                    {uploadSessionId
                      ? uploadSessionId.slice(-8)
                      : pollingSession.slice(-8)}
                  </div>
                  {sessionStatus ? (
                    <>
                      <div className="text-sm text-blue-600">
                        Status:{" "}
                        <span className="font-medium">
                          {sessionStatus.session_status}
                        </span>{" "}
                        | Failed:{" "}
                        <span className="font-medium text-red-600">
                          {sessionStatus.document_status.failed_files}
                        </span>
                        {sessionStatus.document_status.processing_files > 0 && (
                          <span>
                            {" "}
                            | Processing:{" "}
                            <span className="font-medium text-amber-600">
                              {sessionStatus.document_status.processing_files}
                            </span>
                          </span>
                        )}
                        {sessionStatus.document_status.uploaded_files > 0 && (
                          <span>
                            {" "}
                            | Uploaded:{" "}
                            <span className="font-medium">
                              {sessionStatus.document_status.uploaded_files}
                            </span>
                          </span>
                        )}
                        {sessionStatus.format_validation_enabled && (
                          <span>
                            {" "}
                            | Format Validation:{" "}
                            <span className="font-medium text-purple-600">
                              Enabled
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Checking status every 15 seconds •{" "}
                        {sessionStatus.documents?.length || 0} documents in
                        session
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-blue-600">
                        Initializing processing... Please wait
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Checking status every 15 seconds • Session may still be
                        starting up
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={manualCheckStatus}
                className="ml-4"
              >
                Check Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Complete Indicator */}
      {isProcessingComplete && hasCompletedDocuments && !pollingSession && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="font-medium text-green-800">
                Processing completed! You can now preview the extracted data and
                generate Excel files.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Format Validation Error Options */}
      {showValidationOptions && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="font-medium text-yellow-800">
                    Format Validation Failed
                  </div>
                </div>
                <p className="text-sm text-yellow-700 mb-4">
                  {validationErrorMessage}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleProcessWithBypass}
                  disabled={isProcessingBypass || isCancelling}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {isProcessingBypass ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    "Process Anyway"
                  )}
                </Button>

                <Button
                  onClick={handleCancelProcessing}
                  disabled={isProcessingBypass || isCancelling}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  {isCancelling ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      Cancelling...
                    </div>
                  ) : (
                    "Cancel & Refund"
                  )}
                </Button>
              </div>

              <div className="text-xs text-yellow-600">
                <p>
                  <strong>Process Anyway:</strong> Continue processing with
                  potential format issues
                </p>
                <p>
                  <strong>Cancel & Refund:</strong> Cancel processing and get
                  refunded (you only pay for format validation)
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Document Verification Issues */}
      {showDocumentIssues && sessionIssues && (
        <Card className="w-full max-w-4xl border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <CardTitle className="text-lg font-semibold text-red-800">
                Document Verification Issues
              </CardTitle>
              <Badge variant="destructive" className="ml-auto">
                Requires Attention
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-red-700 mb-4">
                The following issues were detected during document verification:
              </div>
              
              {/* Document issues list */}
              <div className="space-y-2">
                {sessionIssues.document_issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-red-800 text-sm">
                        {issue.document_name} - {issue.processing_status}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Source: {issue.file_type} • {(issue.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {issue.error_message && (
                        <div className="text-xs text-gray-600 mt-1">
                          {issue.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Session level issues if any */}
                {sessionIssues.session_issues && Array.isArray(sessionIssues.session_issues) && sessionIssues.session_issues.map((sessionIssue, sessionIndex) => (
                  <div key={`session-${sessionIndex}`} className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-red-800 text-sm">
                        {sessionIssue.issue}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Source: {sessionIssue.sourceDocument}
                      </div>
                      {sessionIssue.affectedItems && sessionIssue.affectedItems.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Items: {sessionIssue.affectedItems.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Legacy session issues format for backwards compatibility */}
                {sessionIssues.session_issues && !Array.isArray(sessionIssues.session_issues) && (
                  <div className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-red-800 text-sm">
                        Session Issue: {(sessionIssues.session_issues as any).reason}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Cancelled by: {(sessionIssues.session_issues as any).cancelled_by} at {new Date((sessionIssues.session_issues as any).cancelled_at || '').toLocaleDateString()}
                      </div>
                      {(sessionIssues.session_issues as any).total_refund && (
                        <div className="text-xs text-gray-600 mt-1">
                          Refunded: {(sessionIssues.session_issues as any).total_refund} pages
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-red-200">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-red-700 font-medium">
                    Total Issues Found: {sessionIssues.issue_summary.session_level_issues + sessionIssues.issue_summary.document_level_issues}
                  </span>
                  <span className="text-red-600">
                    Review required before export
                  </span>
                </div>
                
                {/* Explanation text */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You may cancel at this stage to avoid a full page deduction. The 0.5-page verification fee will remain, but the preview will not be charged.
                  </p>
                </div>
                
                <div className="flex gap-3 justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400"
                    onClick={async () => {
                      setShowDocumentIssues(false);
                      await handleProcessWithBypass();
                    }}
                    disabled={isProcessingBypass || isCancelling}
                  >
                    {isProcessingBypass ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        Processing...
                      </div>
                    ) : (
                      "Generate Anyway"
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    onClick={async () => {
                      setShowDocumentIssues(false);
                      await handleCancelProcessing();
                    }}
                    disabled={isProcessingBypass || isCancelling}
                  >
                    {isCancelling ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                        Cancelling...
                      </div>
                    ) : (
                      "Cancel & Refund"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit button */}
      <div className="flex gap-4">
        <Button
          disabled={!isProcessingComplete}
          onClick={handlePreview}
          size="lg"
          className="px-8 py-3"
          variant="outline"
        >
          {isProcessingComplete
            ? "Preview"
            : "Preview (Upload & Process First)"}
        </Button>

        <Button
          disabled={
            selectedFiles.length < 1 ||
            !outputFormat ||
            uploading ||
            pollingSession !== null
          }
          onClick={handleSubmit}
          size="lg"
          className="px-8 py-3"
        >
          {isUploadingToS3
            ? uploadProgress || "Uploading to Cloud..."
            : uploading
            ? "Processing..."
            : pollingSession
            ? "Processing..."
            : `Upload ${
                selectedFiles.length > 0
                  ? `${selectedFiles.length} File${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  : "Files"
              }`}
        </Button>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        extractedData={extractedData}
        setExtractedData={setExtractedData}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        uploading={uploading}
        setUploading={setUploading}
        uploadSessionId={uploadSessionId}
        sessionStatus={sessionStatus}
        setMessage={setMessage}
        outputFormat={
          outputFormats.find((f) => f.format_id === outputFormat)
            ?.format_name || outputFormat
        }
      />
    </div>
  );
}

export default MainPage;
