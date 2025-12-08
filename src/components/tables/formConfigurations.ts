import type { JobCargoColumn } from './JobCargoTable';

// K1 Form Configuration (Malaysia Customs)
export const K1_FORM_COLUMNS: JobCargoColumn[] = [
  { key: 'countryOfOrigin', label: 'Country', width: 'min-w-[50px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'statisticalQty', label: 'Stat Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'statisticalUOM', label: 'Stat UOM', width: 'min-w-[40px]' },
  { key: 'declaredQty', label: 'Decl Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'declaredUOM', label: 'Decl UOM', width: 'min-w-[40px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[60px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Desc 1', width: 'min-w-[40px]' },
  { key: 'itemDescription2', label: 'Desc 2', width: 'min-w-[40px]' },
  { key: 'itemDescription3', label: 'Description 3', width: 'min-w-[120px]' },
];

// K2 Form Configuration (Alternative format)
export const K2_FORM_COLUMNS: JobCargoColumn[] = [
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'statisticalQty', label: 'Stat Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'statisticalUOM', label: 'Stat UOM', width: 'min-w-[40px]' },
  { key: 'declaredQty', label: 'Decl Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'declaredUOM', label: 'Decl UOM', width: 'min-w-[40px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[60px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Desc 1', width: 'min-w-[40px]' },
  { key: 'itemDescription2', label: 'Desc 2', width: 'min-w-[40px]' },
  { key: 'itemDescription3', label: 'Description 3', width: 'min-w-[120px]' },
];

export const K9_FORM_COLUMNS: JobCargoColumn[] = [
  { key: 'countryOfOrigin', label: 'Country', width: 'min-w-[50px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'statisticalQty', label: 'Stat Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'statisticalUOM', label: 'Stat UOM', width: 'min-w-[40px]' },
  { key: 'declaredQty', label: 'Decl Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'declaredUOM', label: 'Decl UOM', width: 'min-w-[40px]' },
  { key: 'packQtyToBeReleased', label: 'Pack Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'packUOMToBeReleased', label: 'Pack UOM', width: 'min-w-[40px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[60px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Desc 1', width: 'min-w-[40px]' },
  { key: 'itemDescription2', label: 'Desc 2', width: 'min-w-[40px]' },
  { key: 'itemDescription3', label: 'Description 3', width: 'min-w-[120px]' },
];

export const SEALNET_K1_COLUMNS: JobCargoColumn[] = [
  { key: 'productCode', label: 'Product Code', width: 'min-w-[100px]' },
  { key: 'countryOfOrigin', label: 'Country of Origin', width: 'min-w-[80px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'declaredQty', label: 'Declared Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'declaredUOM', label: 'Declared UOM', width: 'min-w-[60px]' },
  { key: 'statisticalDetails', label: 'Statistical UOMs', width: 'min-w-[180px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[80px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Item Description', width: 'min-w-[200px]' },
  { key: 'extraDescription', label: 'Extra Description', width: 'min-w-[200px]' },
];

export const SEALNET_K2_COLUMNS: JobCargoColumn[] = [
  { key: 'productCode', label: 'Product Code', width: 'min-w-[100px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'declaredQty', label: 'Declared Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'declaredUOM', label: 'Declared UOM', width: 'min-w-[60px]' },
  { key: 'statisticalDetails', label: 'Statistical UOMs', width: 'min-w-[180px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[80px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Item Description', width: 'min-w-[200px]' },
  { key: 'extraDescription', label: 'Extra Description', width: 'min-w-[200px]' },
];

export const SEALNET_K3_COLUMNS: JobCargoColumn[] = [
  { key: 'productCode', label: 'Product Code', width: 'min-w-[100px]' },
  { key: 'countryOfOrigin', label: 'Country of Origin', width: 'min-w-[80px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'declaredQty', label: 'Declared Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'declaredUOM', label: 'Declared UOM', width: 'min-w-[60px]' },
  { key: 'statisticalDetails', label: 'Statistical UOMs', width: 'min-w-[180px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[80px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Item Description', width: 'min-w-[200px]' },
];

export const SEALNET_K8_COLUMNS: JobCargoColumn[] = [
  { key: 'productCode', label: 'Product Code', width: 'min-w-[100px]' },
  { key: 'countryOfOrigin', label: 'Country of Origin', width: 'min-w-[80px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'declaredQty', label: 'Declared Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'declaredUOM', label: 'Declared UOM', width: 'min-w-[60px]' },
  { key: 'statisticalDetails', label: 'Statistical UOMs', width: 'min-w-[180px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[80px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Item Description', width: 'min-w-[200px]' },
  { key: 'extraDescription', label: 'Extra Description', width: 'min-w-[200px]' },
];

export const SEALNET_K9_COLUMNS: JobCargoColumn[] = [
  { key: 'productCode', label: 'Product Code', width: 'min-w-[100px]' },
  { key: 'countryOfOrigin', label: 'Country', width: 'min-w-[50px]' },
  { key: 'hsCode', label: 'HS Code', width: 'min-w-[80px]' },
  { key: 'statisticalQty', label: 'Stat Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'statisticalUOM', label: 'Stat UOM', width: 'min-w-[40px]' },
  { key: 'declaredQty', label: 'Decl Qty', width: 'min-w-[50px]', type: 'number' },
  { key: 'declaredUOM', label: 'Decl UOM', width: 'min-w-[40px]' },
  { key: 'packQtyToBeReleased', label: 'Pack Qty', width: 'min-w-[60px]', type: 'number' },
  { key: 'packUOMToBeReleased', label: 'Pack UOM', width: 'min-w-[40px]' },
  { key: 'itemAmount', label: 'Amount', width: 'min-w-[60px]', type: 'number', step: '0.01' },
  { key: 'itemDescription', label: 'Item Description', width: 'min-w-[200px]' },
  { key: 'extraDescription', label: 'Extra Description', width: 'min-w-[200px]' },
];

// Form configuration mapping
export const FORM_CONFIGURATIONS = {
  'K1': {
    name: 'ALDEC K1 Form',
    columns: K1_FORM_COLUMNS,
    description: 'Standard customs declaration form for Malaysia'
  },
  'K2': {
    name: 'ALDEC K2 Form',
    columns: K2_FORM_COLUMNS,
    description: 'Simplified customs form with essential fields'
  },
  'K3': {
    name: 'ALDEC K3 Form',
    columns: K1_FORM_COLUMNS,
    description: 'Basic customs form without country of origin'
  },
  'K8': {
    name: 'ALDEC K8 Form',
    columns: K1_FORM_COLUMNS,
    description: 'Compact customs form for low-value items'
  },
  'K9': {
    name: 'ALDEC K9 Form',
    columns: K9_FORM_COLUMNS,
    description: 'Advanced customs form with pack quantity fields'
  },
  'SEALNET_K1': {
    name: 'Sealnet K1 Template',
    columns: SEALNET_K1_COLUMNS,
    description: 'Sealnet K1 item breakdown with country of origin'
  },
  'SEALNET_K2': {
    name: 'Sealnet K2 Template',
    columns: SEALNET_K2_COLUMNS,
    description: 'Sealnet K2 item breakdown without country of origin'
  },
  'SEALNET_K3': {
    name: 'Sealnet K3 Template',
    columns: SEALNET_K3_COLUMNS,
    description: 'Sealnet K3 item breakdown with country of origin'
  },
  'SEALNET_K8': {
    name: 'Sealnet K8 Template',
    columns: SEALNET_K8_COLUMNS,
    description: 'Sealnet K8 item breakdown with extra description'
  },
  'SEALNET_K9': {
    name: 'Sealnet K9 Template',
    columns: SEALNET_K9_COLUMNS,
    description: 'Sealnet K9 item breakdown with pack quantity fields'
  },
} as const;

export type FormType = keyof typeof FORM_CONFIGURATIONS;

// Helper function to get columns by form type
export const getColumnsByFormType = (formType: string): JobCargoColumn[] => {
  const config = FORM_CONFIGURATIONS[formType as FormType];
  return config ? config.columns : K1_FORM_COLUMNS; // Default to K1 if not found
};

// Helper function to get form name
export const getFormName = (formType: string): string => {
  const config = FORM_CONFIGURATIONS[formType as FormType];
  return config ? config.name : 'K1 Form (Malaysia Customs)';
};

// Helper function to get all available form types
export const getAvailableFormTypes = () => {
  return Object.keys(FORM_CONFIGURATIONS).map(key => ({
    key,
    name: FORM_CONFIGURATIONS[key as FormType].name,
    description: FORM_CONFIGURATIONS[key as FormType].description
  }));
};
