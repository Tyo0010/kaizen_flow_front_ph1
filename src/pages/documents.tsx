import { useState, useEffect } from "react";
import {
  API_BASE_URL,
  getAuthHeaders,
  handleApiResponse,
  getUsageStats,
  getSessionProcessedData,
  getDocumentsV2,
} from "../utils/api";
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
import { Tabs } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Label } from "../components/ui/label";
import { PreviewModal } from "../components/PreviewModal";

interface DocumentsResponse {
  documents: Document[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  options?: {
    group_by_session: boolean;
    include_processed_files: boolean;
    include_sessions: boolean;
  };
  sessions?: {
    [session_id: string]: {
      session_status: string;
      format_validation_enabled: boolean;
      total_documents: number;
      successful_documents: number;
      failed_documents: number;
      total_pages_consumed: number;
    };
  };
}

interface ProcessedFile {
  filename: string;
  key: string;
  last_modified: string;
  size: number;
  url: string;
}

interface Document {
  document_id: string;
  document_name: string;
  original_filename: string;
  document_url: string;
  processing_status: string;
  created_at: string;
  company_id: string;
  uploaded_by: string;
  format_id: string;
  file_size: number;
  file_type: string;
  cell_count?: number;
  word_count?: number;
  pages_consumed?: number;
  processed_output?: any;
  processed_url?: string;
  session_id?: string;
  processed_files?: ProcessedFile[];
  content_analysis?: {
    billing_rule: string;
    pdf_pages: number;
    words_per_page_avg: number;
  };
  uploader: {
    user_id: string;
    user_name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
    supabase_user_id: string;
    company_id: string;
    role_id: string;
    company?: {
      company_id: string;
      company_name: string;
      company_email: string;
      company_phone: string;
      company_address: string;
      company_status: string;
      tax_id: string;
      created_at: string;
    };
    role?: {
      role_id: string;
      role_name: string;
      role_description: string;
      permissions: {
        delete_own_documents: boolean;
        upload_documents: boolean;
        view_own_documents: boolean;
      };
    };
  };
  output_format: {
    format_id: string;
    format_name: string;
    format_description: string;
    format_extension: string;
    is_active: boolean;
  };
  template?: {
    template_id: string;
    template_name: string;
    template_description?: string;
  };
  template_id?: string;
  template_name?: string;
}

interface OutputFormat {
  format_id: string;
  format_name: string;
  format_description: string;
  format_extension: string;
  is_active: boolean;
}

// Interfaces for PreviewModal data structure
interface ProcessedDataItem {
  invoiceNumber: string | string[];
  invoiceNumber_confidence?: number;
  invoceNumber?: string | string[];
  invoceNumber_confidence?: number;
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
  netWeight?: number;
  netWeight_confidence?: number;
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
  rob_rocForConsignee?: string | null;
  rob_rocForConsignee_confidence?: number;
  consignorName: string;
  consignorName_confidence?: number;
  consignorAddress: string;
  consignorAddress_confidence?: number;
  "rob/rocForConsignor": string | null;
  "rob/rocForConsignor_confidence"?: number;
  rob_rocForConsignor?: string | null;
  rob_rocForConsignor_confidence?: number;
  vesselName?: string;
  vesselName_confidence?: number;
  arrivalDate?: string;
  arrivalDate_confidence?: number;
  items: JobCargoItem[];
  existItems?: boolean;
}

type StatisticalEntry = {
  UOM: string;
  quantity: number;
  confidence?: number;
};

interface JobCargoItem {
  countryOfOrigin: string;
  countryOfOrigin_confidence?: number;
  hsCode: string;
  hsCode_confidence?: number;
  statisticalUOM: StatisticalEntry[];
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
  productCode?: string | null;
  productCode_confidence?: number;
  extraDescription?: string;
  extraDescription_confidence?: number;
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
  netWeight?: string;
  netWeight_confidence?: number;
  incoterms: string;
  incoterms_confidence?: number;
  invoiceNumber: string | string[];
  invoiceNumber_confidence?: number;
  invoiceDate: string;
  invoiceDate_confidence?: number;
  invoiceValue: string;
  invoiceValue_confidence?: number;
  vesselName?: string;
  vesselName_confidence?: number;
  arrivalDate?: string;
  arrivalDate_confidence?: number;
}

interface JobCargo {
  items: DisplayJobCargoItem[];
}

interface SealnetJobCargoItem {
  id: string;
  productCode?: string | null;
  productCode_confidence?: number;
  hsCode?: string;
  hsCode_confidence?: number;
  declaredQty?: number;
  declaredQty_confidence?: number;
  declaredUOM?: string;
  declaredUOM_confidence?: number;
  statisticalEntries?: StatisticalEntry[];
  statisticalDetails?: string;
  itemAmount?: number;
  itemAmount_confidence?: number;
  itemDescription?: string;
  itemDescription_confidence?: number;
  extraDescription?: string;
  extraDescription_confidence?: number;
}

interface ExtractedData {
  generalInformation: GeneralInformation;
  jobCargo: JobCargo;
  sealnetData?: {
    items: SealnetJobCargoItem[];
    existItems?: boolean;
  };
  templateType?: "ALDEC" | "SEALNET";
  rawData?: ProcessedDataItem[];
}

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
  productCode?: string;
  productCode_confidence?: number;
  extraDescription?: string;
  extraDescription_confidence?: number;
  statisticalDetails?: string;
  statisticalDetails_confidence?: number;
  statisticalEntries?: StatisticalEntry[];
  sourceDataIndex?: number;
  sourceItemIndex?: number;
  // K9-specific fields
  packQtyToBeReleased?: number;
  packQtyToBeReleased_confidence?: number;
  packUOMToBeReleased?: string;
  packUOMToBeReleased_confidence?: number;
}

function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"uploaded" | "processed">(
    "uploaded"
  );

  // Unified pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Page jump input state
  const [jumpToPageValue, setJumpToPageValue] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [showSessionAggregation, setShowSessionAggregation] = useState(false);

  // Session data from enhanced API
  const [sessionData, setSessionData] = useState<{
    [session_id: string]: any;
  } | null>(null);

  // Group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Usage statistics state
  const [usageStats, setUsageStats] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Preview loading state
  const [previewLoading, setPreviewLoading] = useState<Set<string>>(new Set());

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentOutputFormat, setCurrentOutputFormat] = useState<string | null>(
    null
  );
  const [currentTemplateName, setCurrentTemplateName] = useState<string | null>(
    null
  );

  const detectSealnetTemplate = (
    templateHint?: string | null,
    dataItem?: ProcessedDataItem
  ) => {
    if (templateHint?.toLowerCase() === "sealnet") {
      return true;
    }

    if (!dataItem) {
      return false;
    }

    if (
      "rob_rocForConsignee" in dataItem ||
      "rob_rocForConsignor" in dataItem ||
      "vesselName" in dataItem ||
      "arrivalDate" in dataItem
    ) {
      return true;
    }

    const firstCargoItem =
      Array.isArray(dataItem.items) && dataItem.items.length > 0
        ? dataItem.items.find(Boolean)
        : undefined;

    if (firstCargoItem) {
      if (
        "productCode" in firstCargoItem ||
        "extraDescription" in firstCargoItem
      ) {
        return true;
      }
    }

    return false;
  };

  const formatStatisticalDetailsForDisplay = (
    details?: Array<{ UOM: string; quantity: number }>
  ): string => {
    if (!details || details.length === 0) {
      return "";
    }
    return details
      .map((detail) =>
        `${detail.quantity ?? ""} ${detail.UOM || ""}`.trim()
      )
      .filter((entry) => entry.length > 0)
      .join(", ");
  };

  // Convert API data to UI format
  const convertApiDataToUI = (
    apiData: ProcessedDataItem[],
    templateHint?: string | null
  ): ExtractedData => {
    console.log(
      "convertApiDataToUI - Raw input data:",
      JSON.stringify(apiData, null, 2)
    );
    console.log("convertApiDataToUI - Raw input data type:", typeof apiData);
    console.log(
      "convertApiDataToUI - Raw input data keys:",
      Object.keys(apiData || {})
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
    console.log("convertApiDataToUI - Data array length:", dataArray.length);

    // Use the first item as the base for general information
    const firstItem = dataArray[0];
    const isSealnet = detectSealnetTemplate(templateHint, firstItem);
    console.log(
      "convertApiDataToUI - First item:",
      JSON.stringify(firstItem, null, 2)
    );
    console.log("convertApiDataToUI - First item type:", typeof firstItem);
    console.log(
      "convertApiDataToUI - First item keys:",
      Object.keys(firstItem || {})
    );
    console.log(
      "convertApiDataToUI - Invoice number from first item:",
      firstItem.invoiceNumber
    );
    console.log(
      "convertApiDataToUI - Invoice number with typo from first item:",
      (firstItem as any).invoceNumber
    );

    // Check if data might be nested
    if (firstItem && typeof firstItem === "object") {
      console.log("convertApiDataToUI - Checking for nested data structures:");
      Object.keys(firstItem).forEach((key) => {
        const value = (firstItem as any)[key];
        if (typeof value === "object" && value !== null) {
          console.log(
            `convertApiDataToUI - Nested object found at key '${key}':`,
            JSON.stringify(value, null, 2)
          );
          if (value.invoiceNumber || value.invoceNumber) {
            console.log(
              `convertApiDataToUI - Found invoice number in nested object '${key}':`,
              value.invoiceNumber || value.invoceNumber
            );
          }
        }
      });
    }

    const generalInformation: GeneralInformation = {
      measurementUnit: firstItem.measurementUnit?.toString() || "",
      measurementUnit_confidence: firstItem.measurementUnit_confidence,
      robRocForConsignee:
        firstItem["rob/rocForConsignee"] ||
        (firstItem as any).rob_rocForConsignee ||
        "",
      robRocForConsignee_confidence:
        firstItem["rob/rocForConsignee_confidence"] ||
        (firstItem as any).rob_rocForConsignee_confidence,
      robRocForConsignor:
        firstItem["rob/rocForConsignor"] ||
        (firstItem as any).rob_rocForConsignor ||
        "",
      robRocForConsignor_confidence:
        firstItem["rob/rocForConsignor_confidence"] ||
        (firstItem as any).rob_rocForConsignor_confidence,
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
      netWeight: firstItem.netWeight?.toString() || "",
      netWeight_confidence: firstItem.netWeight_confidence,
      incoterms: firstItem.incoterms || "",
      incoterms_confidence: firstItem.incoterms_confidence,
      invoiceNumber:
        firstItem.invoiceNumber || (firstItem as any).invoceNumber || "",
      invoiceNumber_confidence:
        firstItem.invoiceNumber_confidence ||
        (firstItem as any).invoceNumber_confidence,
      invoiceDate: firstItem.invoiceDate || "",
      invoiceDate_confidence: firstItem.invoiceDate_confidence,
      invoiceValue: firstItem.invoiceValue?.toString() || "0",
      invoiceValue_confidence: firstItem.invoiceValue_confidence,
      vesselName: firstItem.vesselName || "",
      vesselName_confidence: firstItem.vesselName_confidence,
      arrivalDate: firstItem.arrivalDate || "",
      arrivalDate_confidence: firstItem.arrivalDate_confidence,
    };

    // Collect all items from all data entries
    const allItems: DisplayJobCargoItem[] = [];
    const sealnetItems: SealnetJobCargoItem[] = [];
    dataArray.forEach((dataItem, dataIndex) => {
      if (dataItem.items && Array.isArray(dataItem.items)) {
        dataItem.items.forEach((item, itemIndex) => {
          const statisticalEntries =
            item.statisticalUOM && Array.isArray(item.statisticalUOM)
              ? item.statisticalUOM.map((uom) => ({
                UOM: uom.UOM,
                quantity: uom.quantity,
                confidence: uom.confidence,
              }))
              : [];
          const statisticalDetailsDisplay =
            formatStatisticalDetailsForDisplay(statisticalEntries);

          if (isSealnet) {
            sealnetItems.push({
              id: `${dataIndex}-${itemIndex}`,
              productCode: item.productCode || "",
              productCode_confidence: item.productCode_confidence,
              hsCode: item.hsCode || "",
              hsCode_confidence: item.hsCode_confidence,
              declaredQty: item.declaredQty,
              declaredQty_confidence: item.declaredQty_confidence,
              declaredUOM: item.declaredUOM,
              declaredUOM_confidence: item.declaredUOM_confidence,
              statisticalEntries,
              statisticalDetails: statisticalDetailsDisplay,
              itemAmount: item.itemAmount,
              itemAmount_confidence: item.itemAmount_confidence,
              itemDescription: item.itemDescription,
              itemDescription_confidence: item.itemDescription_confidence,
              extraDescription: item.extraDescription,
              extraDescription_confidence: item.extraDescription_confidence,
            });
          }

          const derivedStatisticalQty =
            item.statisticalQty ??
            statisticalEntries[0]?.quantity ??
            item.declaredQty ??
            0;
          const derivedStatisticalUOM =
            statisticalEntries[0]?.UOM || item.declaredUOM || "";

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
            statisticalQty: derivedStatisticalQty || 0,
            statisticalQty_confidence: item.statisticalQty_confidence,
            statisticalUOM: derivedStatisticalUOM,
            statisticalUOM_confidence: item.statisticalQty_confidence,
            productCode: item.productCode || "",
            productCode_confidence: item.productCode_confidence,
            extraDescription: item.extraDescription || "",
            extraDescription_confidence: item.extraDescription_confidence,
            statisticalDetails: statisticalDetailsDisplay,
            statisticalDetails_confidence: item.statisticalQty_confidence,
            statisticalEntries,
            sourceDataIndex: dataIndex,
            sourceItemIndex: itemIndex,
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
      sealnetData: isSealnet
        ? { items: sealnetItems, existItems: firstItem?.existItems }
        : undefined,
      templateType: isSealnet ? "SEALNET" : "ALDEC",
      rawData: dataArray,
    };
  };

  useEffect(() => {
    fetchDocuments();
    fetchOutputFormats();
    fetchUsageStatistics();
  }, [
    currentPage,
    statusFilter,
    formatFilter,
    sessionFilter,
    showSessionAggregation,
    activeTab,
  ]);

  // Add a debug effect to log when data changes
  useEffect(() => {
    console.log("Documents updated:", documents.length, "documents");
    documents.forEach((doc) => {
      if (doc.processed_files && doc.processed_files.length > 0) {
        console.log(
          "Document with processed files:",
          doc.document_id,
          doc.processed_files
        );
      }
    });
  }, [documents]);

  // Clear output format when preview is closed
  useEffect(() => {
    if (!showPreview) {
      setCurrentOutputFormat(null);
      setCurrentTemplateName(null);
    }
  }, [showPreview]);

  const fetchDocuments = async () => {
    setLoading(true);
    setMessage(""); // Clear any previous messages

    // Check if we have authentication
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const params: any = {
        page: currentPage,
        per_page: 20, // Standard page size
      };

      if (statusFilter) params.status = statusFilter;
      if (formatFilter) params.format_id = formatFilter;
      if (sessionFilter) params.session_id = sessionFilter;

      // Configure the V2 API based on active tab
      if (activeTab === "processed") {
        // For processed tab, group by session and only get completed documents
        params.group_by_session = true;
        params.status = "completed";
      }

      // Always include processed files so they're available in both tabs
      params.include_processed_files = true;

      // Include session aggregation data if requested
      if (showSessionAggregation) {
        params.include_sessions = true;
      }

      const data: DocumentsResponse = await getDocumentsV2(params);

      console.log("API Response for", activeTab, "tab:", data);
      console.log("Documents received:", data.documents?.length);
      if (activeTab === "processed") {
        data.documents?.forEach((doc, i) => {
          console.log(`Document ${i}:`, {
            id: doc.document_id,
            name: doc.document_name,
            status: doc.processing_status,
            processed_files: doc.processed_files?.length || 0,
            processed_files_details: doc.processed_files,
          });
        });
      }

      setDocuments(data.documents || []);
      setTotalDocuments(data.pagination.total);
      setTotalPages(data.pagination.pages);

      // Store session data if available
      if (data.sessions) {
        setSessionData(data.sessions);
      }
    } catch (error: any) {
      // Handle specific error types
      if (error.message.includes("Failed to fetch")) {
        setMessage(
          "Network error: Unable to connect to server. Please check your internet connection and try again."
        );
      } else if (error.message.includes("CORS")) {
        setMessage("Server configuration error: Please contact support.");
      } else if (error.message.includes("Session expired")) {
        setMessage("Session expired. Please login again.");
      } else {
        setMessage(`Failed to load documents: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputFormats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/formats`, {
        headers: getAuthHeaders(),
      });

      const data = await handleApiResponse(response);
      setOutputFormats(data.formats || []);
    } catch (error) {
      console.error("Error fetching output formats:", error);
    }
  };

  const fetchUsageStatistics = async () => {
    setUsageLoading(true);
    try {
      // TODO: Uncomment when backend endpoint /documents/usage is implemented
      const data = await getUsageStats();
      setUsageStats(data);

      // Temporary: Set loading to false without making the API call
      console.log("Usage statistics endpoint not yet implemented on backend");
    } catch (error: any) {
      console.error("Error fetching usage statistics:", error);
      // Don't show error message for usage stats as it's not critical
    } finally {
      setUsageLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getAdjustedDate = (dateString: string) => {
    const date = new Date(dateString);
    // Add 8 hours to the date
    date.setHours(date.getHours() + 8);
    return date;
  };

  const formatGroupDate = (dateString: string) => {
    const adjustedDate = getAdjustedDate(dateString);
    return adjustedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupDocumentsBySession = (documents: Document[]) => {
    const groups: { [key: string]: Document[] } = {};

    documents.forEach((doc) => {
      // Group by session_id, use 'no-session' for documents without session_id
      const sessionKey = doc.session_id || "no-session";
      if (!groups[sessionKey]) {
        groups[sessionKey] = [];
      }
      groups[sessionKey].push(doc);
    });

    // Sort groups by date of first document in each group (newest first)
    const sortedGroups = Object.entries(groups).sort(([, docsA], [, docsB]) => {
      const dateA = new Date(docsA[0].created_at).getTime();
      const dateB = new Date(docsB[0].created_at).getTime();
      return dateB - dateA;
    });

    return sortedGroups;
  };

  const groupDocumentsByBaseFilename = (documents: Document[]) => {
    const groups: { [key: string]: Document[] } = {};

    documents.forEach((doc) => {
      // Extract base filename without extension
      const baseFilename = doc.document_name.replace(/\.[^/.]+$/, "");
      if (!groups[baseFilename]) {
        groups[baseFilename] = [];
      }
      groups[baseFilename].push(doc);
    });

    return Object.entries(groups);
  };

  const toggleGroup = (sessionKey: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(sessionKey)) {
      newExpandedGroups.delete(sessionKey);
    } else {
      newExpandedGroups.add(sessionKey);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const getUniqueFormats = (documents: Document[]) => {
    // Group documents by base filename first, then get unique formats
    const baseFilenameGroups = groupDocumentsByBaseFilename(documents);
    const formats = baseFilenameGroups.map(
      ([_, groupDocs]) => groupDocs[0].output_format.format_name
    );
    return [...new Set(formats)].join(", ");
  };

  const getUniqueTemplates = (documents: Document[]) => {
    const templates = documents
      .map((doc) => getTemplateName(doc))
      .filter((name): name is string => Boolean(name));
    return [...new Set(templates)].join(", ");
  };

  const getTemplateName = (doc?: Document | null): string | null => {
    if (!doc) return null;
    return (
      doc.template?.template_name ||
      doc.template_name ||
      null
    );
  };

  const getAllProcessedFilesForGroup = (groupDocuments: Document[]) => {
    const allFiles = groupDocuments.flatMap((doc) => {
      // Check if the document has processed_files
      if (doc.processed_files && doc.processed_files.length > 0) {
        return doc.processed_files;
      }

      return [];
    });
    return allFiles.filter(
      (file) =>
        typeof file.filename === "string" &&
        /\.(xlsx|xls)$/i.test(file.filename)
    );
  };

  // Helper function to check if all documents in a group are processed
  const areAllDocumentsProcessed = (groupDocuments: Document[]) => {
    return groupDocuments.every((doc) => {
      // Check if document has processing_status of 'completed' or 'processed'
      return (
        doc.processing_status === "completed" ||
        doc.processing_status === "processed"
      );
    });
  };

  const hasFailedDocuments = (groupDocuments: Document[]) => {
    return groupDocuments.some((doc) => doc.processing_status === "failed");
  };

  const hasCancelledDocuments = (groupDocuments: Document[]) => {
    return groupDocuments.some((doc) => doc.processing_status === "cancelled");
  };

  const clickHiddenLink = (url: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFileWithFallback = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });

      if (!response.ok) {
        const statusError: any = new Error(
          `Download failed with status ${response.status}`
        );
        statusError.status = response.status;
        throw statusError;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      clickHiddenLink(objectUrl, filename || "download");
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError: any) {
      if (downloadError?.status) {
        throw downloadError;
      }

      console.warn(
        "Presigned download via fetch failed, falling back to direct link",
        downloadError
      );
      clickHiddenLink(url, filename);
    }
  };

  const downloadDocument = async (documentId: string, documentName: string) => {
    try {
      setMessage("Generating download link...");

      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/download`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await handleApiResponse(response);

      if (!data?.download_url) {
        throw new Error("Download link unavailable");
      }

      await downloadFileWithFallback(
        data.download_url,
        documentName || "document"
      );

      setMessage("Download started successfully!");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`Failed to download document: ${error.message}`);
    }
  };

  const downloadProcessedFileDirectly = async (
    url: string,
    filename: string
  ) => {
    try {
      setMessage("Starting download...");

      if (!url) {
        throw new Error("Download URL is missing");
      }

      await downloadFileWithFallback(url, filename || "processed-file");

      setMessage("Download started successfully!");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`Failed to download file: ${error.message}`);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      setMessage("Deleting document...");

      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      await handleApiResponse(response);

      return true; // Return success status
    } catch (error: any) {
      console.error(`Failed to delete document ${documentId}:`, error);
      return false; // Return failure status
    }
  };

  const deleteDocumentGroup = async (
    documentsToDelete: Document[] | string[]
  ) => {
    try {
      // Handle both array of Document objects and array of document IDs
      const documentIds = documentsToDelete.map((doc) =>
        typeof doc === "string" ? doc : doc.document_id
      );

      const isGroup = documentIds.length > 1;

      setMessage(
        isGroup
          ? `Deleting ${documentIds.length} documents...`
          : "Deleting document..."
      );

      let deletedCount = 0;
      let failedCount = 0;
      const failedDocuments: string[] = [];

      // Delete documents sequentially to avoid overwhelming the server
      for (const documentId of documentIds) {
        const success = await deleteDocument(documentId);
        if (success) {
          deletedCount++;
        } else {
          failedCount++;
          failedDocuments.push(documentId);
        }
      }

      // Show results
      if (failedCount === 0) {
        setMessage(
          isGroup
            ? `All ${deletedCount} documents deleted successfully!`
            : "Document deleted successfully!"
        );
      } else if (deletedCount === 0) {
        setMessage(
          isGroup
            ? `Failed to delete all ${documentIds.length} documents.`
            : "Failed to delete document."
        );
      } else {
        setMessage(
          `${deletedCount} documents deleted successfully, ${failedCount} failed. Failed IDs: ${failedDocuments
            .map((id) => id.slice(0, 8))
            .join(", ")}`
        );
      }

      // Refresh the documents list
      await fetchDocuments();

      // Clear message after 5 seconds for group operations, 3 for single
      setTimeout(() => setMessage(""), isGroup ? 5000 : 3000);
    } catch (error: any) {
      setMessage(`Deletion process failed: ${error.message}`);
    }
  };

  const handlePreview = async (groupDocuments: Document[]) => {
    // Get the session_id from the first document in the group
    const sessionId = groupDocuments[0]?.session_id;
    if (!sessionId) {
      setMessage("No session ID found for this group");
      return;
    }

    // Extract the output format from the first document in the group
    const outputFormatName = groupDocuments[0]?.output_format?.format_name;
    const templateName =
      groupDocuments[0]?.template?.template_name ||
      groupDocuments[0]?.template_name ||
      null;
    console.log("Output format for preview:", outputFormatName);
    console.log(
      "Group documents:",
      groupDocuments.map((doc) => ({
        id: doc.document_id,
        name: doc.document_name,
        format: doc.output_format?.format_name,
      }))
    );

    // Add this session to loading state
    setPreviewLoading((prev) => new Set([...prev, sessionId]));
    setMessage("Loading preview data...");

    try {
      // Get processed data for the session
      const processedData = await getSessionProcessedData(sessionId);

      // Convert API data to UI format
      const uiData = convertApiDataToUI(processedData, templateName);

      // Set the extracted data and show preview modal
      setExtractedData(uiData);
      setCurrentSessionId(sessionId);
      setCurrentOutputFormat(outputFormatName || null);
      setCurrentTemplateName(templateName);
      setShowPreview(true);
      setMessage("");

      // Clear loading state
      setPreviewLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error: any) {
      console.error("Preview loading failed:", error);
      setMessage(`Failed to load preview data: ${error.message}`);

      // Clear loading state on error
      setPreviewLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });

      // Clear error message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <div className="text-sm text-gray-500">
          {activeTab === "uploaded" ? (
            loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Loading documents...
              </div>
            ) : (
              <>
                {totalDocuments} total documents
                {totalPages > 1 && (
                  <span className="ml-2 text-gray-400">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </>
            )
          ) : loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              Loading processed documents...
            </div>
          ) : (
            <>
              {totalDocuments} total processed documents
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "uploaded" | "processed")
        }
      >
        {/* Usage Statistics */}
        {usageLoading ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-gray-600">Loading usage statistics...</div>
            </CardContent>
          </Card>
        ) : (
          usageStats && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usage Statistics</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={fetchUsageStatistics}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Current Usage */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Current Usage
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {usageStats.usage?.current_month_usage?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-xs text-blue-600">
                      pages this month
                    </div>
                  </div>

                  {/* Monthly Limit */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      Monthly Limit
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {usageStats.usage?.monthly_limit?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-600">pages allowed</div>
                  </div>

                  {/* Remaining Pages */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">
                      Remaining
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {usageStats.usage?.remaining_pages?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-green-600">pages left</div>
                  </div>

                  {/* Usage Percentage */}
                  <div
                    className={`p-4 rounded-lg border ${(usageStats.usage?.usage_percentage || 0) >= 80
                        ? "bg-red-50 border-red-200"
                        : (usageStats.usage?.usage_percentage || 0) >= 60
                          ? "bg-amber-50 border-amber-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${(usageStats.usage?.usage_percentage || 0) >= 80
                          ? "text-red-800"
                          : (usageStats.usage?.usage_percentage || 0) >= 60
                            ? "text-amber-800"
                            : "text-blue-800"
                        }`}
                    >
                      Usage %
                    </div>
                    <div
                      className={`text-2xl font-bold ${(usageStats.usage?.usage_percentage || 0) >= 80
                          ? "text-red-900"
                          : (usageStats.usage?.usage_percentage || 0) >= 60
                            ? "text-amber-900"
                            : "text-blue-900"
                        }`}
                    >
                      {(usageStats.usage?.usage_percentage || 0).toFixed(1)}%
                    </div>
                    <div
                      className={`text-xs ${(usageStats.usage?.usage_percentage || 0) >= 80
                          ? "text-red-600"
                          : (usageStats.usage?.usage_percentage || 0) >= 60
                            ? "text-amber-600"
                            : "text-blue-600"
                        }`}
                    >
                      of limit used
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant={
                      usageStats.status?.can_upload ? "default" : "destructive"
                    }
                  >
                    {usageStats.status?.can_upload
                      ? "✓ Can Upload"
                      : "✗ Upload Blocked"}
                  </Badge>

                  {usageStats.status?.approaching_limit && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      ⚠️ Approaching Limit
                    </Badge>
                  )}

                  {usageStats.status?.is_over_limit && (
                    <Badge variant="destructive">🚫 Over Limit</Badge>
                  )}

                  <Badge variant="outline">
                    Tier: {usageStats.usage?.subscription_tier || "Unknown"}
                  </Badge>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div>
                      Total lifetime usage:{" "}
                      {usageStats.usage?.total_lifetime_usage?.toLocaleString() ||
                        0}{" "}
                      pages
                    </div>
                    <div>
                      Current month:{" "}
                      {usageStats.usage?.current_month || "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Message display */}
        {message && (
          <Alert
            variant={
              message.includes("Error") ||
                message.includes("Failed") ||
                message.includes("Network error") ||
                message.includes("Session expired")
                ? "destructive"
                : "default"
            }
          >
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="whitespace-pre-line">{message}</div>
                {(message.includes("Failed") ||
                  message.includes("Network error")) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => fetchDocuments()}
                      className="ml-4"
                    >
                      Retry
                    </Button>
                  )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === "uploaded" && (
                  <div>
                    <Label
                      htmlFor="statusFilter"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Processing Status
                    </Label>
                    <Select
                      value={statusFilter || "all"}
                      onValueChange={(value) => {
                        setStatusFilter(value === "all" ? "" : value);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="formatFilter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Output Format
                  </Label>
                  <Select
                    value={formatFilter || "all"}
                    onValueChange={(value) => {
                      setFormatFilter(value === "all" ? "" : value);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Formats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      {outputFormats.map((format) => (
                        <SelectItem
                          key={format.format_id}
                          value={format.format_id}
                        >
                          {format.format_name} ({format.format_extension})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="sessionFilter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Session ID
                  </Label>
                  <Select
                    value={sessionFilter || "all"}
                    onValueChange={(value) => {
                      setSessionFilter(value === "all" ? "" : value);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Sessions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      {sessionData &&
                        Object.keys(sessionData).map((sessionId) => (
                          <SelectItem key={sessionId} value={sessionId}>
                            {sessionId.slice(-8)} (
                            {sessionData[sessionId].total_documents} docs)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Session Aggregation Toggle */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                <input
                  type="checkbox"
                  id="sessionAggregation"
                  checked={showSessionAggregation}
                  onChange={(e) => setShowSessionAggregation(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="sessionAggregation"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Show session aggregation data
                </Label>
              </div>

              {/* Clear Filters Button */}
              {(statusFilter || formatFilter || sessionFilter) && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("");
                      setFormatFilter("");
                      setSessionFilter("");
                      setCurrentPage(1);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Quick Page Navigation for current tab */}
              {((activeTab === "uploaded" && totalPages > 1) ||
                (activeTab === "processed" && totalPages > 1)) && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">
                        Quick Navigation
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={
                            activeTab === "uploaded"
                              ? currentPage === 1
                              : currentPage === 1
                          }
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const lastPage =
                              activeTab === "uploaded" ? totalPages : totalPages;
                            handlePageChange(lastPage);
                          }}
                          disabled={
                            activeTab === "uploaded"
                              ? currentPage === totalPages
                              : currentPage === totalPages
                          }
                        >
                          Last
                        </Button>
                        <span className="text-sm text-gray-500 ml-2">
                          {activeTab === "uploaded"
                            ? `${currentPage}/${totalPages}`
                            : `${currentPage}/${totalPages}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Session Aggregation Summary */}
        {showSessionAggregation && sessionData && (
          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(sessionData).map(([sessionId, session]) => (
                  <div
                    key={sessionId}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Session: {sessionId.slice(-8)}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge
                          variant={
                            session.session_status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {session.session_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Documents:</span>
                        <span>{session.total_documents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful:</span>
                        <span className="text-green-600">
                          {session.successful_documents}
                        </span>
                      </div>
                      {session.failed_documents > 0 && (
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="text-red-600">
                            {session.failed_documents}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Pages Consumed:</span>
                        <span>{session.total_pages_consumed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format Validation:</span>
                        <span>
                          {session.format_validation_enabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <Card>
          {loading ? (
            <CardContent className="p-8 text-center">
              <div className="text-lg text-gray-500">Loading documents...</div>
            </CardContent>
          ) : documents.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="text-lg text-gray-500 mb-2">
                No documents found
              </div>
              <div className="text-sm text-gray-400">
                {statusFilter || formatFilter || sessionFilter
                  ? "Try adjusting your filters or"
                  : ""}
                {activeTab === "uploaded"
                  ? "Upload some files to get started."
                  : "No processed documents available yet."}
              </div>
            </CardContent>
          ) : activeTab === "uploaded" ? (
            // Uploaded Documents View
            <div className="divide-y divide-gray-200">
              {groupDocumentsBySession(documents).map(
                ([sessionKey, groupDocuments]) => (
                  <div
                    key={sessionKey}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    {/* Group Header */}
                    <div className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => toggleGroup(sessionKey)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-5 h-5 text-gray-600 transition-transform ${expandedGroups.has(sessionKey) ? "rotate-90" : ""
                              }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <div className="text-md font-semibold text-gray-800">
                            {formatGroupDate(groupDocuments[0].created_at)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {sessionKey === "no-session"
                              ? "Individual Uploads"
                              : `Session ID: ${sessionKey}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {groupDocumentsByBaseFilename(groupDocuments).length}{" "}
                          unique file
                          {groupDocumentsByBaseFilename(groupDocuments)
                            .length !== 1
                            ? "s"
                            : ""}{" "}
                          • {groupDocuments.length} total document
                          {groupDocuments.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Formats: {getUniqueTemplates(groupDocuments)} {getUniqueFormats(groupDocuments)}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                `Are you sure you want to delete all ${groupDocuments.length
                                } documents from ${sessionKey === "no-session"
                                  ? "individual uploads"
                                  : `session ${sessionKey}`
                                }? This action cannot be undone.`
                              )
                            ) {
                              deleteDocumentGroup(groupDocuments);
                            }
                          }}
                          className="inline-flex items-center"
                          title={`Delete all ${groupDocuments.length} documents from this session`}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </Button>
                      </div>
                    </div>{" "}
                    {/* Group Content */}
                    {expandedGroups.has(sessionKey) && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-25 border-b border-gray-200">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700">
                                Document Name
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700">
                                Status
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700">
                                Template
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700">
                                Output Format
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {groupDocumentsByBaseFilename(groupDocuments).map(
                              ([_, fileGroupDocuments]) => {
                                // Show only the first document from each file group (usually the original PDF)
                                const representativeDocument =
                                  fileGroupDocuments[0];
                                const templateName =
                                  getTemplateName(representativeDocument);
                                return (
                                  <tr
                                    key={representativeDocument.document_id}
                                    className="hover:bg-gray-25 transition-colors"
                                  >
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                          <svg
                                            className="w-4 h-4 text-blue-600"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900 truncate max-w-[400px] mb-1">
                                            {
                                              representativeDocument.document_name
                                            }
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Target Format:{" "}
                                            {
                                              representativeDocument
                                                .output_format.format_name
                                            }{" "}
                                            (
                                            {
                                              representativeDocument
                                                .output_format.format_extension
                                            }
                                            ) • ID:{" "}
                                            {representativeDocument.document_id.slice(
                                              0,
                                              8
                                            )}
                                            ...
                                            {templateName && (
                                              <span>
                                                {" "}
                                                • Template: {templateName}
                                              </span>
                                            )}
                                            {fileGroupDocuments.length > 1 && (
                                              <span>
                                                {" "}
                                                • {
                                                  fileGroupDocuments.length
                                                }{" "}
                                                related files
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <Badge
                                        variant={getStatusBadgeVariant(
                                          representativeDocument.processing_status
                                        )}
                                      >
                                        {representativeDocument.processing_status
                                          .charAt(0)
                                          .toUpperCase() +
                                          representativeDocument.processing_status.slice(
                                            1
                                          )}
                                      </Badge>
                                    </td>
                                    <td className="p-4">
                                      <div className="text-sm text-gray-900">
                                        {templateName || "Default"}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="text-sm text-gray-900">
                                        {
                                          representativeDocument.output_format
                                            .format_name
                                        }{" "}
                                        Form
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {
                                          representativeDocument.output_format
                                            .format_extension
                                        }
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            downloadDocument(
                                              representativeDocument.document_id,
                                              representativeDocument.document_name
                                            );
                                          }}
                                          className="inline-flex items-center"
                                          title="Download original document"
                                        >
                                          <svg
                                            className="w-4 h-4 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                          Download
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }
                            )}

                            {/* Show one processed file for the entire group */}
                            {(() => {
                              // Get all processed files for documents in this group using the new structure
                              const allProcessedFiles =
                                getAllProcessedFilesForGroup(groupDocuments);

                              // Show processed files if any exist (limit to first 2)
                              if (allProcessedFiles.length > 0) {
                                const displayedFiles = allProcessedFiles.slice(
                                  0,
                                  2
                                );
                                const templateName = getTemplateName(
                                  groupDocuments[0]
                                );
                                return displayedFiles.map(
                                  (processedFile, index) => (
                                    <tr
                                      key={`group-processed-${index}`}
                                      className="bg-green-25 hover:bg-green-50 transition-colors border-l-4 border-green-500"
                                    >
                                      <td className="p-4 pl-8">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                            <svg
                                              className="w-4 h-4 text-green-600"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                          <div>
                                            <div className="font-medium text-green-900 truncate max-w-[400px] mb-1">
                                              {processedFile.filename}
                                            </div>
                                            <div className="text-xs text-green-600">
                                              Processed Output •{" "}
                                              {(
                                                processedFile.size /
                                                1024 /
                                                1024
                                              ).toFixed(2)}{" "}
                                              MB
                                              {allProcessedFiles.length > 1 && (
                                                <span>
                                                  {" "}
                                                  • {
                                                    allProcessedFiles.length
                                                  }{" "}
                                                  processed files available
                                                  {allProcessedFiles.length >
                                                    2 &&
                                                    index === 1 && (
                                                      <span>
                                                        {" "}
                                                        (showing first 2)
                                                      </span>
                                                    )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <Badge
                                          variant="default"
                                          className="bg-green-100 text-green-800 border-green-200"
                                        >
                                          Processed
                                        </Badge>
                                      </td>
                                      <td className="p-4">
                                        <div className="text-sm text-green-900">
                                          {templateName || "Default"}
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <div className="text-sm text-green-900">
                                          {
                                            groupDocuments[0]?.output_format
                                              ?.format_name
                                          }{" "}
                                          Form
                                        </div>
                                        <div className="text-xs text-green-600">
                                          {groupDocuments[0]?.output_format
                                            ?.format_extension || "Output File"}
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <div className="flex gap-2">
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadProcessedFileDirectly(
                                                processedFile.url,
                                                processedFile.filename
                                              );
                                            }}
                                            className="inline-flex items-center bg-green-600 hover:bg-green-700"
                                            title="Download processed file"
                                          >
                                            <svg
                                              className="w-4 h-4 mr-1"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                            Download
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                );
                              } else {
                                // Show Preview button if no processed files exist and group has session_id
                                const sessionId = groupDocuments[0]?.session_id;
                                if (sessionId) {
                                  const isLoading =
                                    previewLoading.has(sessionId);
                                  const allProcessed =
                                    areAllDocumentsProcessed(groupDocuments);
                                  const hasFailed =
                                    hasFailedDocuments(groupDocuments);
                                  const hasCancelled =
                                    hasCancelledDocuments(groupDocuments);
                                  const templateName = getTemplateName(
                                    groupDocuments[0]
                                  );

                                  return (
                                    <tr
                                      key={`group-preview-${sessionId}`}
                                      className={`hover:bg-blue-50 transition-colors border-l-4 ${hasFailed
                                          ? "bg-red-25 border-red-500"
                                          : hasCancelled
                                            ? "bg-orange-25 border-orange-500"
                                            : "bg-blue-25 border-blue-500"
                                        }`}
                                    >
                                      <td className="p-4 pl-8">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center ${hasFailed
                                                ? "from-red-100 to-red-200"
                                                : hasCancelled
                                                  ? "from-orange-100 to-orange-200"
                                                  : "from-blue-100 to-blue-200"
                                              }`}
                                          >
                                            <svg
                                              className={`w-4 h-4 ${hasFailed
                                                  ? "text-red-600"
                                                  : hasCancelled
                                                    ? "text-orange-600"
                                                    : "text-blue-600"
                                                }`}
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              {hasFailed ? (
                                                <path
                                                  fillRule="evenodd"
                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                  clipRule="evenodd"
                                                />
                                              ) : hasCancelled ? (
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                  clipRule="evenodd"
                                                />
                                              ) : (
                                                <path
                                                  fillRule="evenodd"
                                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                  clipRule="evenodd"
                                                />
                                              )}
                                            </svg>
                                          </div>
                                          <div>
                                            <div
                                              className={`font-medium truncate max-w-[400px] mb-1 ${hasFailed
                                                  ? "text-red-900"
                                                  : hasCancelled
                                                    ? "text-orange-900"
                                                    : "text-blue-900"
                                                }`}
                                            >
                                              {hasFailed
                                                ? "Processing Failed"
                                                : hasCancelled
                                                  ? "Processing Cancelled"
                                                  : "Generate Excel Files"}
                                            </div>
                                            <div
                                              className={`text-xs ${hasFailed
                                                  ? "text-red-600"
                                                  : hasCancelled
                                                    ? "text-orange-600"
                                                    : "text-blue-600"
                                                }`}
                                            >
                                              {hasFailed
                                                ? "Some documents failed to process • Check individual document status"
                                                : hasCancelled
                                                  ? "Processing was cancelled by user request"
                                                  : allProcessed
                                                    ? "No processed files found • Click Preview to generate Excel files"
                                                    : "Processing in progress • Please wait for completion"}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <Badge
                                          variant={
                                            hasFailed
                                              ? "destructive"
                                              : hasCancelled
                                                ? "secondary"
                                                : allProcessed
                                                  ? "secondary"
                                                  : "outline"
                                          }
                                          className={
                                            hasFailed
                                              ? "bg-red-100 text-red-800 border-red-200"
                                              : hasCancelled
                                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                                : allProcessed
                                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          }
                                        >
                                          {hasFailed
                                            ? "Failed"
                                            : hasCancelled
                                              ? "Cancelled"
                                              : allProcessed
                                                ? "Ready to Process"
                                                : "Processing"}
                                        </Badge>
                                      </td>
                                      <td className="p-4">
                                        <div className="text-sm text-green-900">
                                          {templateName || "Default"}
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <div className="text-sm text-green-900">
                                          {
                                            groupDocuments[0]?.output_format
                                              ?.format_name
                                          }{" "}
                                          Form
                                        </div>
                                        <div className="text-xs text-green-600">
                                          {groupDocuments[0]?.output_format
                                            ?.format_extension || "Output File"}
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <div className="flex gap-2">
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (hasFailed) {
                                                // You could add a retry mechanism here
                                                setMessage(
                                                  "Some documents failed to process. Please check individual document status or try re-uploading the failed files."
                                                );
                                              } else if (!hasCancelled) {
                                                // Only allow action if not cancelled
                                                handlePreview(groupDocuments);
                                              }
                                            }}
                                            disabled={
                                              isLoading ||
                                              hasCancelled ||
                                              (!allProcessed && !hasFailed)
                                            }
                                            className={`inline-flex items-center disabled:opacity-50 ${hasFailed
                                                ? "bg-red-600 hover:bg-red-700"
                                                : hasCancelled
                                                  ? "bg-gray-400 cursor-not-allowed"
                                                  : allProcessed
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "bg-gray-400 cursor-not-allowed"
                                              }`}
                                            title={
                                              hasFailed
                                                ? "Some documents failed to process"
                                                : hasCancelled
                                                  ? "Processing was cancelled - button disabled"
                                                  : allProcessed
                                                    ? "Generate Excel files for preview"
                                                    : "Please wait for all documents to finish processing"
                                            }
                                          >
                                            {isLoading ? (
                                              <div className="animate-spin w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full"></div>
                                            ) : hasFailed ? (
                                              <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                />
                                              </svg>
                                            ) : hasCancelled ? (
                                              <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                              </svg>
                                            )}
                                            {isLoading
                                              ? "Opening..."
                                              : hasFailed
                                                ? "Failed"
                                                : hasCancelled
                                                  ? "Cancelled"
                                                  : allProcessed
                                                    ? "Preview"
                                                    : "Processing..."}
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            // Processed Documents View
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processed File</TableHead>
                  <TableHead>Original Document</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Collect all unique processed files from all documents
                  const allProcessedFiles = new Map();

                  documents.forEach((document) => {
                    if (
                      document.processed_files &&
                      document.processed_files.length > 0
                    ) {
                      document.processed_files.forEach((processedFile) => {
                        // Use filename + size as the unique key to avoid duplicates
                        const uniqueKey = `${processedFile.filename}-${processedFile.size}`;
                        if (!allProcessedFiles.has(uniqueKey)) {
                          allProcessedFiles.set(uniqueKey, {
                            ...processedFile,
                            sourceDocument: document,
                          });
                        }
                      });
                    }
                  });

                  // Convert map to array and render
                  const uniqueProcessedFiles = Array.from(
                    allProcessedFiles.values()
                  );

                  if (uniqueProcessedFiles.length > 0) {
                    return uniqueProcessedFiles.map((processedFile, index) => (
                      <TableRow
                        key={`${processedFile.sourceDocument.document_id}-${index}`}
                        className="hover:bg-gray-25"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[400px] mb-1">
                                {processedFile.filename}
                              </div>
                              <div className="text-xs text-gray-500">
                                From:{" "}
                                {processedFile.sourceDocument.original_filename}{" "}
                                • ID:{" "}
                                {processedFile.sourceDocument.document_id.slice(
                                  0,
                                  8
                                )}
                                ...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {processedFile.sourceDocument.original_filename}
                          </div>
                          <div className="text-xs text-gray-500">
                            {processedFile.sourceDocument.file_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {new Date(
                              processedFile.last_modified
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {(processedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                downloadProcessedFileDirectly(
                                  processedFile.url,
                                  processedFile.filename
                                )
                              }
                              className="inline-flex items-center bg-green-600 hover:bg-green-700"
                              title="Download processed file"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Download
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                downloadDocument(
                                  processedFile.sourceDocument.document_id,
                                  processedFile.sourceDocument.original_filename
                                )
                              }
                              title="Download original file"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              Original
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                  } else {
                    // Fallback - show documents that don't have processed_files
                    const documentsWithoutProcessedFiles = documents.filter(
                      (document) =>
                        !document.processed_files ||
                        document.processed_files.length === 0
                    );

                    return documentsWithoutProcessedFiles.map((document) => (
                      <TableRow
                        key={document.document_id}
                        className="hover:bg-gray-25"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[400px] mb-1">
                                {document.document_name} ({document.file_type})
                              </div>
                              <div className="text-xs text-gray-500">
                                Original: {document.original_filename} • ID:{" "}
                                {document.document_id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {document.original_filename}
                          </div>
                          <div className="text-xs text-gray-500">
                            {document.file_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {new Date(document.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {(document.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                downloadDocument(
                                  document.document_id,
                                  document.document_name
                                )
                              }
                              className="inline-flex items-center bg-green-600 hover:bg-green-700"
                              title="Download processed file"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Download
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                downloadDocument(
                                  document.document_id,
                                  document.original_filename
                                )
                              }
                              title="Download original file"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              Original
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                  }
                })()}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No processed documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination - show for both tabs */}
          {!loading &&
            ((activeTab === "uploaded" &&
              documents.length > 0 &&
              totalPages > 1) ||
              (activeTab === "processed" &&
                documents.length > 0 &&
                totalPages > 1)) && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {activeTab === "uploaded" ? (
                    <>
                      Showing page {currentPage} of {totalPages} (
                      {totalDocuments} total documents)
                    </>
                  ) : (
                    <>
                      Showing page {currentPage} of {totalPages} (
                      {totalDocuments} total documents)
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activeTab === "uploaded") {
                        handlePageChange(currentPage - 1);
                      } else {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>

                  {/* Page numbers */}
                  {Array.from(
                    {
                      length: Math.min(5, totalPages),
                    },
                    (_, i) => {
                      const currentPageNum = currentPage;
                      const totalPagesNum = totalPages;
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(totalPagesNum - 4, currentPageNum - 2)
                        ) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPageNum === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activeTab === "uploaded") {
                        handlePageChange(currentPage + 1);
                      } else {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>

                  {/* Jump to page input */}
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-500">Go to:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpToPageValue}
                      placeholder="Page"
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setJumpToPageValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const pageNum = parseInt(jumpToPageValue);
                          const maxPage = totalPages;
                          if (pageNum >= 1 && pageNum <= maxPage) {
                            handlePageChange(pageNum);
                            setJumpToPageValue("");
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const pageNum = parseInt(jumpToPageValue);
                        const maxPage = totalPages;
                        if (pageNum >= 1 && pageNum <= maxPage) {
                          handlePageChange(pageNum);
                          setJumpToPageValue("");
                        }
                      }}
                      disabled={
                        !jumpToPageValue ||
                        parseInt(jumpToPageValue) < 1 ||
                        parseInt(jumpToPageValue) > totalPages
                      }
                      className="px-3"
                    >
                      Go
                    </Button>
                  </div>
                </div>
              </div>
            )}
        </Card>
      </Tabs>

      {/* Preview Modal */}
      <PreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        extractedData={extractedData}
        setExtractedData={setExtractedData}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        uploading={false}
        setUploading={() => { }}
        uploadSessionId={currentSessionId}
        sessionStatus={null}
        setMessage={setMessage}
        outputFormat={currentOutputFormat || undefined}
        templateName={currentTemplateName || undefined}
      />
    </div>
  );
}

// Export the function to be called from main.tsx
export { DocumentsPage as default };

// Export the function to handle upload success
export const handleDocumentUploadSuccess = (uploadSessionId: string) => {
  // Store the session ID so it can be picked up when the documents page loads
  localStorage.setItem("pending_upload_session", uploadSessionId);
};
