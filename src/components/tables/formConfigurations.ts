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

// Form configuration mapping
export const FORM_CONFIGURATIONS = {
  'K1': {
    name: 'K1 Form',
    columns: K1_FORM_COLUMNS,
    description: 'Standard customs declaration form for Malaysia'
  },
  'K2': {
    name: 'K2 Form',
    columns: K2_FORM_COLUMNS,
    description: 'Simplified customs form with essential fields'
  }
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
