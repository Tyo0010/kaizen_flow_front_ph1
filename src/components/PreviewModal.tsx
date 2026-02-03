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
import {
  DynamicJobCargoTable,
  type DisplayJobCargoItem,
  type FormType,
} from "./tables";

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
  mot?: string;
  MOT?: string;
  mot_confidence?: number;
  MOT_confidence?: number;
  blNumber?: string;
  blNumber_confidence?: number;
  hblNumber?: string;
  hblNumber_confidence?: number;
  mblNumber?: string;
  mblNumber_confidence?: number;
  awbNumber?: string;
  awbNumber_confidence?: number;
  hawbNumber?: string;
  hawbNumber_confidence?: number;
  consignmentNoteNumber?: string;
  consignmentNoteNumber_confidence?: number;
  portOfLoading?: string;
  portOfLoading_confidence?: number;
  portOfImport?: string;
  portOfImport_confidence?: number;
  portOfDischarge?: string;
  portOfDischarge_confidence?: number;
  flightNumber?: string;
  flightNumber_confidence?: number;
  voyageNo?: string;
  voyageNo_confidence?: number;
  vesselName?: string;
  vesselName_confidence?: number;
  arrivalDate?: string;
  arrivalDate_confidence?: number;
  departureDate?: string;
  departureDate_confidence?: number;
  arrivalDateType?: string;
  arrivalDateType_confidence?: number;
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
  consignorName: string;
  consignorName_confidence?: number;
  consignorAddress: string;
  consignorAddress_confidence?: number;
  "rob/rocForConsignor": string | null;
  "rob/rocForConsignor_confidence"?: number;
  items: JobCargoItem[];
  overall_confidence?: number;
  existItems?: boolean;
  identifiedSubCompany?: string;
  identifiedSubCompany_confidence?: number;
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
  productCode?: string | null;
  productCode_confidence?: number;
  extraDescription?: string;
  extraDescription_confidence?: number;
  identifiedSubCompany?: string;
  identifiedSubCompany_confidence?: number;
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
  voyageNo?: string;
  voyageNo_confidence?: number;
  flightNumber?: string;
  flightNumber_confidence?: number;
  mot?: string;
  mot_confidence?: number;
  MOT?: string;
  MOT_confidence?: number;
  blNumber?: string;
  blNumber_confidence?: number;
  hblNumber?: string;
  hblNumber_confidence?: number;
  mblNumber?: string;
  mblNumber_confidence?: number;
  awbNumber?: string;
  awbNumber_confidence?: number;
  hawbNumber?: string;
  hawbNumber_confidence?: number;
  consignmentNoteNumber?: string;
  consignmentNoteNumber_confidence?: number;
  portOfLoading?: string;
  portOfLoading_confidence?: number;
  portOfImport?: string;
  portOfImport_confidence?: number;
  portOfDischarge?: string;
  portOfDischarge_confidence?: number;
  vesselName_confidence?: number;
  departureDate?: string;
  departureDate_confidence?: number;
  arrivalDate?: string;
  arrivalDate_confidence?: number;
  arrivalDateType?: string;
  arrivalDateType_confidence?: number;
  identifiedSubCompany?: string;
  identifiedSubCompany_confidence?: number;
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
  statisticalDetails?: string;
  statisticalEntries?: StatisticalUOM[];
  itemAmount?: number;
  itemAmount_confidence?: number;
  itemDescription?: string;
  itemDescription_confidence?: number;
  extraDescription?: string;
  extraDescription_confidence?: number;
}

interface SealnetData {
  items: SealnetJobCargoItem[];
  existItems?: boolean;
}

interface ExtractedPreviewData {
  generalInformation: GeneralInformation;
  jobCargo: JobCargo;
  sealnetData?: SealnetData;
  templateType?: "ALDEC" | "SEALNET";
  rawData?: any;
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
  extractedData: ExtractedPreviewData | null;
  setExtractedData: React.Dispatch<
    React.SetStateAction<ExtractedPreviewData | null>
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
  templateName?: string;
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

const parseStatisticalDetailsString = (value: string): StatisticalUOM[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const parts = segment.split(/\s+/);
      const uom = parts.pop() || "";
      const qty = parseFloat(parts.join(" "));
      return {
        UOM: uom,
        quantity: isNaN(qty) ? 0 : qty,
      };
    });
};

const normalizeStringValue = (value?: string | number | null): string => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const withFallbackValue = (
  value?: string | number | null,
  confidence?: number,
  fallback = "",
  fallbackConfidence = 0
): { value: string; confidence?: number } => {
  const normalized = normalizeStringValue(value);
  if (normalized) {
    return { value: normalized, confidence };
  }
  return { value: fallback, confidence: fallbackConfidence };
};

const selectTransportDocument = (
  info: GeneralInformation
): { value: string; confidence?: number; fieldKey: keyof GeneralInformation; editValue: string } => {
  const candidates: Array<{
    key: keyof GeneralInformation;
    value?: string | number | null;
    confidence?: number;
  }> = [
    { key: "blNumber", value: info.blNumber, confidence: info.blNumber_confidence },
    { key: "hblNumber", value: info.hblNumber, confidence: info.hblNumber_confidence },
    { key: "mblNumber", value: info.mblNumber, confidence: info.mblNumber_confidence },
    { key: "awbNumber", value: info.awbNumber, confidence: info.awbNumber_confidence },
    { key: "hawbNumber", value: info.hawbNumber, confidence: info.hawbNumber_confidence },
    {
      key: "consignmentNoteNumber",
      value: info.consignmentNoteNumber,
      confidence: info.consignmentNoteNumber_confidence,
    },
  ];

  const match = candidates.find((candidate) => normalizeStringValue(candidate.value));

  if (match) {
    const normalized = normalizeStringValue(match.value);
    return {
      value: normalized,
      confidence: match.confidence,
      fieldKey: match.key,
      editValue: normalized,
    };
  }

  return {
    value: "",
    confidence: 0,
    fieldKey: "blNumber",
    editValue: "",
  };
};

const getTransportModeDisplay = (info: GeneralInformation) => {
  const rawMode = normalizeStringValue(info.mot || info.MOT);
  if (rawMode) {
    return {
      value: rawMode.toUpperCase(),
      confidence: info.mot_confidence ?? info.MOT_confidence,
    };
  }
  return { value: "", confidence: 0 };
};

const getPortOfImportDisplay = (info: GeneralInformation) => {
  const normalizedImport = normalizeStringValue(info.portOfImport);
  if (normalizedImport) {
    return {
      value: normalizedImport,
      confidence: info.portOfImport_confidence,
    };
  }

  const normalizedDischarge = normalizeStringValue(info.portOfDischarge);
  if (normalizedDischarge) {
    return {
      value: normalizedDischarge,
      confidence: info.portOfDischarge_confidence ?? info.portOfImport_confidence,
    };
  }

  return { value: "", confidence: 0 };
};

const getVesselOrFlightDisplay = (info: GeneralInformation) => {
  const mode = normalizeStringValue(info.mot || info.MOT).toUpperCase();

  if (mode === "SEA") {
    const vessel = normalizeStringValue(info.vesselName);
    const voyage = normalizeStringValue(info.voyageNo);
    const combined = [vessel, voyage ? `Voyage ${voyage}` : null]
      .filter(Boolean)
      .join(" | ");

    if (combined) {
      return {
        value: combined,
        confidence: info.vesselName_confidence ?? info.voyageNo_confidence,
      };
    }

    return { value: "", confidence: 0 };
  }

  if (mode === "AIR") {
    const flight = normalizeStringValue(info.flightNumber);
    if (flight) {
      return {
        value: flight,
        confidence: info.flightNumber_confidence,
      };
    }

    return { value: "", confidence: 0 };
  }

  if (mode) {
    return { value: "", confidence: undefined };
  }

  return { value: "", confidence: 0 };
};

const getArrivalDateDisplay = (info: GeneralInformation) => {
  const arrivalDate = normalizeStringValue(info.arrivalDate);
  const arrivalType =
    normalizeStringValue(info.arrivalDateType) ||
    normalizeStringValue((info as any).arrivalDate_type);

  if (!arrivalDate) {
    return { value: "", confidence: 0 };
  }

  const suffix = arrivalType ? ` (${arrivalType.toUpperCase()})` : "";
  return {
    value: `${arrivalDate}${suffix}`,
    confidence: info.arrivalDate_confidence,
  };
};

const getDepartureDateDisplay = (info: GeneralInformation) =>
  withFallbackValue(info.departureDate, info.departureDate_confidence);

type BaseFormType = "K1" | "K2" | "K3" | "K8" | "K9";

// Map output format names to form types (ALDEC + Sealnet)
const mapOutputFormatToFormType = (
  outputFormat?: string,
  templateType: "ALDEC" | "SEALNET" = "ALDEC"
): FormType => {
  console.log("mapOutputFormatToFormType called with:", {
    outputFormat,
    templateType,
  });

  if (!outputFormat) {
    const fallback = templateType === "SEALNET" ? "SEALNET_K1" : "K1";
    console.log("No output format provided, defaulting to", fallback);
    return fallback;
  }

  const formatLower = outputFormat.toLowerCase();
  const isSealnetFormat =
    templateType === "SEALNET" || formatLower.includes("sealnet");

  const detectBaseForm = (): BaseFormType => {
    if (formatLower.includes("k9") || formatLower.includes("advanced")) {
      console.log("Matched base K9 format");
      return "K9";
    }
    if (formatLower.includes("k8")) {
      console.log("Matched base K8 format");
      return "K8";
    }
    if (formatLower.includes("k3")) {
      console.log("Matched base K3 format");
      return "K3";
    }
    if (formatLower.includes("k2") || formatLower.includes("simplified")) {
      console.log("Matched base K2 format");
      return "K2";
    }
    if (
      formatLower.includes("k1") ||
      formatLower.includes("malaysia") ||
      formatLower.includes("customs")
    ) {
      console.log("Matched base K1 format");
      return "K1";
    }

    console.log("No specific match found, defaulting to base K1");
    return "K1";
  };

  const baseForm = detectBaseForm();

  if (isSealnetFormat) {
    const sealnetForm = `SEALNET_${baseForm}` as FormType;
    console.log("Using Sealnet form type:", sealnetForm);
    return sealnetForm;
  }

  console.log("Using ALDEC form type:", baseForm);
  return baseForm;
};

// Convert UI data back to API format for updates
const convertUIDataToAPI = (
  uiData: ExtractedPreviewData
): ProcessedDataItem[] => {
  if (uiData.templateType === "SEALNET" && uiData.rawData) {
    const rawEntries = Array.isArray(uiData.rawData)
      ? uiData.rawData
      : [uiData.rawData];

    const clonedEntries: ProcessedDataItem[] = rawEntries.map(
      (entry: ProcessedDataItem) => ({
        ...entry,
        items: entry.items
          ? entry.items.map((item: JobCargoItem) => ({
              ...item,
              statisticalUOM: item.statisticalUOM
                ? item.statisticalUOM.map((detail: StatisticalUOM) => ({
                    ...detail,
                  }))
                : [],
            }))
          : [],
      })
    );

    const general = uiData.generalInformation;
    const normalizedInvoice =
      typeof general.invoiceNumber === "string"
        ? general.invoiceNumber.includes(",")
          ? parseInvoiceNumbers(general.invoiceNumber)
          : general.invoiceNumber
        : general.invoiceNumber;

    const assign = (target: any, keys: string[], value: any) => {
      keys.forEach((key) => {
        target[key] = value;
      });
    };

    const toNumber = (value: any) => {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    clonedEntries.forEach((entry, dataIndex) => {
      assign(entry, ["measurementUnit"], general.measurementUnit);
      assign(
        entry,
        ["measurementUnit_confidence"],
        general.measurementUnit_confidence
      );
      assign(entry, ["incoterms"], general.incoterms);
      assign(entry, ["incoterms_confidence"], general.incoterms_confidence);
      assign(entry, ["currency"], general.currency);
      assign(entry, ["currency_confidence"], general.currency_confidence);
      assign(entry, ["generalDescription"], general.generalDescription || "");
      assign(
        entry,
        ["generalDescription_confidence"],
        general.generalDescription_confidence
      );
      assign(entry, ["invoiceDate"], general.invoiceDate || "");
      assign(
        entry,
        ["invoiceDate_confidence"],
        general.invoiceDate_confidence
      );
      assign(entry, ["invoiceValue"], toNumber(general.invoiceValue));
      assign(
        entry,
        ["invoiceValue_confidence"],
        general.invoiceValue_confidence
      );
      assign(entry, ["grossWeight"], toNumber(general.grossWeight));
      assign(
        entry,
        ["grossWeight_confidence"],
        general.grossWeight_confidence
      );
      if (general.netWeight !== undefined) {
        assign(entry, ["netWeight"], toNumber(general.netWeight));
        assign(entry, ["netWeight_confidence"], general.netWeight_confidence);
      }
      assign(entry, ["NoOfPackages"], parseInt(general.NoOfPackages) || 0);
      assign(
        entry,
        ["NoOfPackages_confidence"],
        general.NoOfPackages_confidence
      );
      assign(entry, ["consigneeName"], general.consigneeName || "");
      assign(
        entry,
        ["consigneeName_confidence"],
        general.consigneeName_confidence
      );
      assign(entry, ["consigneeAddress"], general.consigneeAddress || "");
      assign(
        entry,
        ["consigneeAddress_confidence"],
        general.consigneeAddress_confidence
      );
      assign(entry, ["consignorName"], general.consignorName || "");
      assign(
        entry,
        ["consignorName_confidence"],
        general.consignorName_confidence
      );
      assign(entry, ["consignorAddress"], general.consignorAddress || "");
      assign(
        entry,
        ["consignorAddress_confidence"],
        general.consignorAddress_confidence
      );
      assign(entry, ["vesselName"], general.vesselName || "");
      assign(entry, ["vesselName_confidence"], general.vesselName_confidence);
      assign(entry, ["arrivalDate"], general.arrivalDate || "");
      assign(
        entry,
        ["arrivalDate_confidence"],
        general.arrivalDate_confidence
      );
      const transportMode = general.mot || general.MOT || "";
      const arrivalDateType =
        general.arrivalDateType ||
        (general as any).arrivalDate_type ||
        "";
      assign(entry, ["MOT", "mot"], transportMode);
      assign(
        entry,
        ["MOT_confidence", "mot_confidence"],
        general.mot_confidence ?? general.MOT_confidence
      );
      assign(entry, ["voyageNo"], general.voyageNo || "");
      assign(
        entry,
        ["voyageNo_confidence"],
        general.voyageNo_confidence
      );
      assign(entry, ["flightNumber"], general.flightNumber || "");
      assign(
        entry,
        ["flightNumber_confidence"],
        general.flightNumber_confidence
      );
      assign(entry, ["departureDate"], general.departureDate || "");
      assign(
        entry,
        ["departureDate_confidence"],
        general.departureDate_confidence
      );
      assign(entry, ["arrivalDateType"], arrivalDateType);
      assign(
        entry,
        ["arrivalDateType_confidence"],
        general.arrivalDateType_confidence
      );
      assign(entry, ["portOfLoading"], general.portOfLoading || "");
      assign(
        entry,
        ["portOfLoading_confidence"],
        general.portOfLoading_confidence
      );
      assign(entry, ["portOfImport"], general.portOfImport || "");
      assign(
        entry,
        ["portOfImport_confidence"],
        general.portOfImport_confidence
      );
      assign(entry, ["portOfDischarge"], general.portOfDischarge || "");
      assign(
        entry,
        ["portOfDischarge_confidence"],
        general.portOfDischarge_confidence
      );
      assign(entry, ["blNumber"], general.blNumber || "");
      assign(
        entry,
        ["blNumber_confidence"],
        general.blNumber_confidence
      );
      assign(entry, ["hblNumber"], general.hblNumber || "");
      assign(
        entry,
        ["hblNumber_confidence"],
        general.hblNumber_confidence
      );
      assign(entry, ["mblNumber"], general.mblNumber || "");
      assign(
        entry,
        ["mblNumber_confidence"],
        general.mblNumber_confidence
      );
      assign(entry, ["awbNumber"], general.awbNumber || "");
      assign(
        entry,
        ["awbNumber_confidence"],
        general.awbNumber_confidence
      );
      assign(entry, ["hawbNumber"], general.hawbNumber || "");
      assign(
        entry,
        ["hawbNumber_confidence"],
        general.hawbNumber_confidence
      );
      assign(
        entry,
        ["consignmentNoteNumber"],
        general.consignmentNoteNumber || ""
      );
      assign(
        entry,
        ["consignmentNoteNumber_confidence"],
        general.consignmentNoteNumber_confidence
      );
      assign(entry, ["invoiceNumber", "invoceNumber"], normalizedInvoice);
      assign(
        entry,
        ["invoiceNumber_confidence", "invoceNumber_confidence"],
        general.invoiceNumber_confidence
      );
      assign(
        entry,
        ["rob_rocForConsignee", "rob/rocForConsignee"],
        general.robRocForConsignee || null
      );
      assign(
        entry,
        [
          "rob_rocForConsignee_confidence",
          "rob/rocForConsignee_confidence",
        ],
        general.robRocForConsignee_confidence
      );
      assign(
        entry,
        ["rob_rocForConsignor", "rob/rocForConsignor"],
        general.robRocForConsignor || null
      );
      assign(
        entry,
        [
          "rob_rocForConsignor_confidence",
          "rob/rocForConsignor_confidence",
        ],
        general.robRocForConsignor_confidence
      );
      entry.existItems =
        uiData.sealnetData?.existItems ?? entry.existItems;

      if (!entry.items || !Array.isArray(entry.items)) {
        return;
      }

      entry.items = entry.items.map((rawItem: JobCargoItem, itemIndex: number) => {
        const uiItem =
          uiData.jobCargo.items.find(
            (item) =>
              item.sourceDataIndex === dataIndex &&
              item.sourceItemIndex === itemIndex
          ) ||
          uiData.jobCargo.items.find(
            (item) => item.id === `${dataIndex}-${itemIndex}`
          ) ||
          uiData.jobCargo.items[itemIndex];

        if (!uiItem) {
          return rawItem;
        }

        const updatedItem: any = { ...rawItem };

        updatedItem.productCode =
          uiItem.productCode !== undefined ? uiItem.productCode : null;
        updatedItem.productCode_confidence = uiItem.productCode_confidence;
        updatedItem.hsCode = uiItem.hsCode || "";
        updatedItem.hsCode_confidence = uiItem.hsCode_confidence;
        updatedItem.itemDescription = uiItem.itemDescription || "";
        updatedItem.itemDescription_confidence =
          uiItem.itemDescription_confidence;
        updatedItem.extraDescription = uiItem.extraDescription || "";
        updatedItem.extraDescription_confidence =
          uiItem.extraDescription_confidence;
        updatedItem.declaredQty = toNumber(uiItem.declaredQty);
        updatedItem.declaredQty_confidence = uiItem.declaredQty_confidence;
        updatedItem.declaredUOM = uiItem.declaredUOM || "";
        updatedItem.declaredUOM_confidence = uiItem.declaredUOM_confidence;
        updatedItem.itemAmount = toNumber(uiItem.itemAmount);
        updatedItem.itemAmount_confidence = uiItem.itemAmount_confidence;
        updatedItem.statisticalQty = toNumber(uiItem.statisticalQty);
        updatedItem.statisticalQty_confidence =
          uiItem.statisticalQty_confidence;
        updatedItem.packQtyToBeReleased = uiItem.packQtyToBeReleased;
        updatedItem.packQtyToBeReleased_confidence =
          uiItem.packQtyToBeReleased_confidence;
        updatedItem.packUOMToBeReleased = uiItem.packUOMToBeReleased;
        updatedItem.packUOMToBeReleased_confidence =
          uiItem.packUOMToBeReleased_confidence;

        const statsEntries: StatisticalUOM[] =
          (uiItem.statisticalEntries &&
            uiItem.statisticalEntries.length > 0 &&
            uiItem.statisticalEntries) ||
          rawItem.statisticalUOM ||
          (uiItem.statisticalDetails
            ? parseStatisticalDetailsString(uiItem.statisticalDetails)
            : []);

        updatedItem.statisticalUOM = statsEntries
          ? statsEntries.map((detail: StatisticalUOM) => ({
              UOM: detail.UOM || "",
              quantity: toNumber(detail.quantity),
              confidence: detail.confidence,
            }))
          : [];

        return updatedItem;
      });
    });

    return clonedEntries;
  }

  // Handle invoice number conversion - if it's a string with commas, convert to array
  let invoiceNumber = uiData.generalInformation.invoiceNumber;
  if (typeof invoiceNumber === "string" && invoiceNumber.includes(",")) {
    invoiceNumber = parseInvoiceNumbers(invoiceNumber);
  }

  const transportMode =
    uiData.generalInformation.mot ||
    (uiData.generalInformation as any).MOT ||
    "";
  const arrivalDateType =
    uiData.generalInformation.arrivalDateType ||
    (uiData.generalInformation as any).arrivalDate_type ||
    "";
  const portOfImport =
    uiData.generalInformation.portOfImport ||
    uiData.generalInformation.portOfDischarge ||
    "";
  const portOfImportConfidence =
    uiData.generalInformation.portOfImport_confidence ??
    uiData.generalInformation.portOfDischarge_confidence;

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
    ...(uiData.generalInformation.netWeight && {
      netWeight: parseFloat(uiData.generalInformation.netWeight) || 0,
      netWeight_confidence: uiData.generalInformation.netWeight_confidence,
    }),
    measurementUnit: uiData.generalInformation.measurementUnit,
    measurementUnit_confidence:
      uiData.generalInformation.measurementUnit_confidence,
    NoOfPackages: parseInt(uiData.generalInformation.NoOfPackages) || 0,
    NoOfPackages_confidence: uiData.generalInformation.NoOfPackages_confidence,
    generalDescription: uiData.generalInformation.generalDescription,
    generalDescription_confidence:
      uiData.generalInformation.generalDescription_confidence,
    vesselName: uiData.generalInformation.vesselName || "",
    vesselName_confidence: uiData.generalInformation.vesselName_confidence,
    voyageNo: uiData.generalInformation.voyageNo || "",
    voyageNo_confidence: uiData.generalInformation.voyageNo_confidence,
    flightNumber: uiData.generalInformation.flightNumber || "",
    flightNumber_confidence: uiData.generalInformation.flightNumber_confidence,
    arrivalDate: uiData.generalInformation.arrivalDate || "",
    arrivalDate_confidence: uiData.generalInformation.arrivalDate_confidence,
    arrivalDateType,
    arrivalDateType_confidence:
      uiData.generalInformation.arrivalDateType_confidence,
    departureDate: uiData.generalInformation.departureDate || "",
    departureDate_confidence:
      uiData.generalInformation.departureDate_confidence,
    portOfLoading: uiData.generalInformation.portOfLoading || "",
    portOfLoading_confidence:
      uiData.generalInformation.portOfLoading_confidence,
    portOfImport,
    portOfImport_confidence: portOfImportConfidence,
    portOfDischarge: uiData.generalInformation.portOfDischarge || "",
    portOfDischarge_confidence:
      uiData.generalInformation.portOfDischarge_confidence,
    blNumber: uiData.generalInformation.blNumber || "",
    blNumber_confidence: uiData.generalInformation.blNumber_confidence,
    hblNumber: uiData.generalInformation.hblNumber || "",
    hblNumber_confidence: uiData.generalInformation.hblNumber_confidence,
    mblNumber: uiData.generalInformation.mblNumber || "",
    mblNumber_confidence: uiData.generalInformation.mblNumber_confidence,
    awbNumber: uiData.generalInformation.awbNumber || "",
    awbNumber_confidence: uiData.generalInformation.awbNumber_confidence,
    hawbNumber: uiData.generalInformation.hawbNumber || "",
    hawbNumber_confidence: uiData.generalInformation.hawbNumber_confidence,
    consignmentNoteNumber:
      uiData.generalInformation.consignmentNoteNumber || "",
    consignmentNoteNumber_confidence:
      uiData.generalInformation.consignmentNoteNumber_confidence,
    mot: transportMode,
    MOT: transportMode,
    mot_confidence:
      uiData.generalInformation.mot_confidence ??
      (uiData.generalInformation as any).MOT_confidence,
    MOT_confidence:
      uiData.generalInformation.mot_confidence ??
      (uiData.generalInformation as any).MOT_confidence,
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
  templateName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const derivedTemplateType = React.useMemo<"ALDEC" | "SEALNET">(() => {
    if (templateName) {
      return templateName.toLowerCase() === "sealnet" ? "SEALNET" : "ALDEC";
    }
    if (extractedData?.templateType === "SEALNET") {
      return "SEALNET";
    }
    if (extractedData?.sealnetData?.items?.length) {
      return "SEALNET";
    }
    return "ALDEC";
  }, [templateName, extractedData]);
  const isSealnetTemplate = derivedTemplateType === "SEALNET";

  // Determine form type based on output format and template
  const formType = mapOutputFormatToFormType(outputFormat, derivedTemplateType);
  const [selectedFormType, setSelectedFormType] = useState<FormType>(() => {
    return formType;
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
      } else if (isSealnetTemplate) {
        if (
          !extractedData.sealnetData ||
          !extractedData.sealnetData.items ||
          extractedData.sealnetData.items.length === 0
        ) {
          setError(
            "Sealnet cargo information is missing. Please reprocess the documents."
          );
        }
      } else if (!extractedData.jobCargo || !extractedData.jobCargo.items) {
        setError(
          "Job cargo information is missing. Please reprocess the documents."
        );
      }
    }
  }, [showPreview, extractedData, isSealnetTemplate]);

  const transportDisplay = React.useMemo(() => {
    if (!extractedData?.generalInformation) return null;
    const info = extractedData.generalInformation;
    const rawMode = normalizeStringValue(info.mot || info.MOT).toUpperCase();
    const vesselField: keyof GeneralInformation | null =
      rawMode === "SEA"
        ? "vesselName"
        : rawMode === "AIR"
        ? "flightNumber"
        : null;

    return {
      rawMode,
      vesselField,
      mode: getTransportModeDisplay(info),
      doc: selectTransportDocument(info),
      pol: withFallbackValue(info.portOfLoading, info.portOfLoading_confidence),
      pod: getPortOfImportDisplay(info),
      vesselFlight: getVesselOrFlightDisplay(info),
      arrival: getArrivalDateDisplay(info),
      departure: getDepartureDateDisplay(info),
    };
  }, [extractedData]);

  const renderSealnetCell = (
    value?: React.ReactNode,
    confidence?: number,
    multiline = false
  ) => {
    const hasValue = value !== undefined && value !== null && value !== "";
    return (
      <div
        className={`p-2 rounded border text-xs ${
          multiline ? "min-h-[3rem]" : "min-h-[2rem]"
        } ${getConfidenceColor(confidence)}`}
      >
        {hasValue ? value : <span className="text-gray-400">—</span>}
      </div>
    );
  };

  const SealnetField = ({
    label,
    value,
    confidence,
    multiline = false,
    fieldKey,
    className = "",
  }: {
    label: string;
    value?: React.ReactNode;
    confidence?: number;
    multiline?: boolean;
    fieldKey?: keyof GeneralInformation;
    className?: string;
  }) => {
    const stringValue =
      value === undefined || value === null ? "" : String(value);

    if (isEditMode && fieldKey) {
      if (multiline) {
        return (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {label}
            </Label>
            <textarea
              value={stringValue}
              onChange={(e) =>
                updateGeneralInformation(fieldKey, e.target.value)
              }
              className="w-full p-2 border rounded-md text-xs leading-tight min-h-[3rem]"
            />
          </div>
        );
      }

      return (
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </Label>
          <Input
            value={stringValue}
            onChange={(e) => updateGeneralInformation(fieldKey, e.target.value)}
            className="text-xs"
          />
        </div>
      );
    }

    return (
      <div className={`space-y-1 ${className}`}>
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </Label>
        {renderSealnetCell(value, confidence, multiline)}
      </div>
    );
  };

  const renderSealnetGeneralInformation = () => {
    if (!extractedData?.generalInformation) {
      return null;
    }

    const info = extractedData.generalInformation;

    return (
      <>
        {/* CUSTOMIZATION INFO */}
        {(info.identifiedSubCompany || isEditMode) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-800 bg-blue-50 px-2 py-1.5 rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              AI CUSTOMIZATION IDENTIFICATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
              <SealnetField
                label="Identified Client/Sub-Company"
                value={info.identifiedSubCompany || "No specific client identified"}
                confidence={info.identifiedSubCompany_confidence}
                fieldKey="identifiedSubCompany"
                className="bg-blue-50/30 border-blue-100"
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
            INVOICE INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
            <SealnetField
              label="Invoice No."
              value={formatInvoiceNumbers(info.invoiceNumber)}
              confidence={info.invoiceNumber_confidence}
              multiline
              fieldKey="invoiceNumber"
            />
            <SealnetField
              label="Invoice Value"
              value={info.invoiceValue}
              confidence={info.invoiceValue_confidence}
              fieldKey="invoiceValue"
            />
            <SealnetField
              label="Invoice Date"
              value={info.invoiceDate}
              confidence={info.invoiceDate_confidence}
              fieldKey="invoiceDate"
            />
            <SealnetField
              label="Incoterms"
              value={info.incoterms}
              confidence={info.incoterms_confidence}
              fieldKey="incoterms"
            />
            <SealnetField
              label="Currency"
              value={info.currency}
              confidence={info.currency_confidence}
              fieldKey="currency"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
            SHIPMENT INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
            <SealnetField
              label="Vessel Name"
              value={info.vesselName}
              confidence={info.vesselName_confidence}
              multiline
              fieldKey="vesselName"
            />
            <SealnetField
              label="Arrival Date"
              value={info.arrivalDate}
              confidence={info.arrivalDate_confidence}
              fieldKey="arrivalDate"
            />
            <SealnetField
              label="Gross Weight"
              value={info.grossWeight}
              confidence={info.grossWeight_confidence}
              fieldKey="grossWeight"
            />
            <SealnetField
              label="Measurement Unit"
              value={info.measurementUnit}
              confidence={info.measurementUnit_confidence}
              fieldKey="measurementUnit"
            />
            <SealnetField
              label="No. of Packages"
              value={info.NoOfPackages}
              confidence={info.NoOfPackages_confidence}
              fieldKey="NoOfPackages"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
            CARGO DESCRIPTION
          </h3>
          <div className="pl-3">
            <SealnetField
              label="General Description"
              value={info.generalDescription}
              confidence={info.generalDescription_confidence}
              multiline
              fieldKey="generalDescription"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3 bg-white border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800">
              CONSIGNEE INFORMATION
            </h4>
            <SealnetField
              label="Name"
              value={info.consigneeName}
              confidence={info.consigneeName_confidence}
              multiline
              fieldKey="consigneeName"
            />
            <SealnetField
              label="Address"
              value={info.consigneeAddress}
              confidence={info.consigneeAddress_confidence}
              multiline
              fieldKey="consigneeAddress"
            />
            <SealnetField
              label="ROB/ROC"
              value={info.robRocForConsignee}
              confidence={info.robRocForConsignee_confidence}
              fieldKey="robRocForConsignee"
            />
          </div>

          <div className="space-y-3 bg-white border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800">
              CONSIGNOR INFORMATION
            </h4>
            <SealnetField
              label="Name"
              value={info.consignorName}
              confidence={info.consignorName_confidence}
              multiline
              fieldKey="consignorName"
            />
            <SealnetField
              label="Address"
              value={info.consignorAddress}
              confidence={info.consignorAddress_confidence}
              multiline
              fieldKey="consignorAddress"
            />
            <SealnetField
              label="ROB/ROC"
              value={info.robRocForConsignor}
              confidence={info.robRocForConsignor_confidence}
              fieldKey="robRocForConsignor"
            />
          </div>
        </div>
      </>
    );
  };

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

    const numericFields: Array<keyof DisplayJobCargoItem> = [
      "declaredQty",
      "itemAmount",
      "statisticalQty",
      "packQtyToBeReleased",
    ];

    const shouldCastToNumber =
      typeof value === "number" || numericFields.includes(field);

    const nextValue = shouldCastToNumber ? Number(value) : value;

    const nextItem: DisplayJobCargoItem = {
      ...updatedItems[itemIndex],
      [field]: nextValue,
    };

    if (field === "statisticalDetails") {
      nextItem.statisticalEntries = parseStatisticalDetailsString(
        String(value)
      );
    }

    updatedItems[itemIndex] = nextItem;

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
      // anal: ui is conv to file output regardless of edit
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
                  {isSealnetTemplate ? (
                    renderSealnetGeneralInformation()
                  ) : (
                    <>
                  {/* CUSTOMIZATION INFO */}
                  {(extractedData.generalInformation.identifiedSubCompany || isEditMode) && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-blue-800 bg-blue-50 px-2 py-1.5 rounded flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        AI CUSTOMIZATION IDENTIFICATION
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
                        <div className="space-y-1">
                          <Label htmlFor="identifiedSubCompany" className="text-sm font-medium text-blue-700">
                            Identified Client/Sub-Company
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="identifiedSubCompany"
                              value={extractedData.generalInformation.identifiedSubCompany || ""}
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "identifiedSubCompany",
                                  e.target.value
                                )
                              }
                              className="text-sm border-blue-200 focus:border-blue-400"
                              placeholder="e.g., Apple Inc."
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm bg-blue-50/30 border-blue-100 ${getConfidenceColor(
                                extractedData.generalInformation.identifiedSubCompany_confidence
                              )}`}
                            >
                              {extractedData.generalInformation.identifiedSubCompany || "No specific client identified"}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Rules for this client were automatically applied by AI.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                          Invoice Date
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
                        <Label htmlFor="netWeight" className="text-sm">
                          Net Weight
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="netWeight"
                            value={extractedData.generalInformation.netWeight || ""}
                            onChange={(e) =>
                              updateGeneralInformation(
                                "netWeight",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              extractedData.generalInformation
                                .netWeight_confidence
                            )}`}
                          >
                            {extractedData.generalInformation.netWeight || ""}
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

                  {/* TRANSPORT INFORMATION */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1.5 rounded">
                      TRANSPORT INFORMATION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-3">
                      <div className="space-y-1">
                        <Label htmlFor="mot" className="text-sm">
                          MOT (Mode)
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="mot"
                            value={
                              extractedData.generalInformation.mot ||
                              extractedData.generalInformation.MOT ||
                              ""
                            }
                            onChange={(e) =>
                              updateGeneralInformation("mot", e.target.value)
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              transportDisplay?.mode.confidence
                            )}`}
                          >
                            {transportDisplay?.mode.value ?? ""}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                          <Label htmlFor="departureDate" className="text-sm">
                            Departure Date (ETD)
                          </Label>
                          {isEditMode ? (
                            <Input
                              id="departureDate"
                              value={
                                extractedData.generalInformation.departureDate ||
                                ""
                              }
                              onChange={(e) =>
                                updateGeneralInformation(
                                  "departureDate",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          ) : (
                            <div
                              className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                                transportDisplay?.departure.confidence
                              )}`}
                            >
                              {transportDisplay?.departure.value ??
                                ""}
                            </div>
                          )}
                        </div>

                      <div className="space-y-1">
                        <Label htmlFor="portOfLoading" className="text-sm">
                          Port/Airport of Loading (POL)
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="portOfLoading"
                            value={
                              extractedData.generalInformation.portOfLoading ||
                              ""
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "portOfLoading",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              transportDisplay?.pol.confidence
                            )}`}
                          >
                            {transportDisplay?.pol.value ?? ""}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="portOfImport" className="text-sm">
                          Port/Airport of Import (POD)
                        </Label>
                        {isEditMode ? (
                          <Input
                            id="portOfImport"
                            value={
                              extractedData.generalInformation.portOfImport ||
                              extractedData.generalInformation.portOfDischarge ||
                              ""
                            }
                            onChange={(e) =>
                              updateGeneralInformation(
                                "portOfImport",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              transportDisplay?.pod.confidence
                            )}`}
                          >
                            {transportDisplay?.pod.value ?? ""}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor="vesselFlight"
                          className="text-sm"
                        >
                          Vessel Name / Flight No
                        </Label>
                        {isEditMode && transportDisplay?.vesselField ? (
                          (() => {
                            const vesselField = transportDisplay.vesselField;
                            return (
                              <Input
                                id="vesselFlight"
                                value={
                                  (extractedData.generalInformation as any)[
                                    vesselField
                                  ] || ""
                                }
                                onChange={(e) =>
                                  updateGeneralInformation(
                                    vesselField,
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            );
                          })()
                        ) : isEditMode && !transportDisplay?.vesselField ? (
                          <div className="p-2 rounded border h-8 flex items-center min-w-[180px] text-sm bg-gray-50 text-gray-500">
                            {""}
                          </div>
                        ) : (
                          <div
                            className={`p-2 rounded border h-8 flex items-center min-w-[180px] text-sm ${getConfidenceColor(
                              transportDisplay?.vesselFlight.confidence
                            )}`}
                          >
                            {transportDisplay?.vesselFlight.value ??
                              ""}
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
                    </>
                  )}
                </TabsContent>

                <TabsContent value="cargo" className="space-y-4 mt-4">
                  <DynamicJobCargoTable
                    selectedFormType={selectedFormType}
                    onFormTypeChange={setSelectedFormType}
                    showFormSelector={allowFormTypeChange && !isSealnetTemplate}
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
