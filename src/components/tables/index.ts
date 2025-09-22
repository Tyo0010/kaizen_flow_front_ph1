// Export the base table component
export { default as JobCargoTable } from './JobCargoTable';
export type { 
  JobCargoTableProps, 
  DisplayJobCargoItem, 
  JobCargoColumn 
} from './JobCargoTable';

// Export dynamic table component
export { default as DynamicJobCargoTable } from './DynamicJobCargoTable';

// Export specific form table components
export { default as K1FormTable } from './K1FormTable';
export { default as K2FormTable } from './K2FormTable';
export { default as K9FormTable } from './K9FormTable';



// Export form configurations
export {
  FORM_CONFIGURATIONS,
  K1_FORM_COLUMNS,
  K2_FORM_COLUMNS,
  K9_FORM_COLUMNS,
  getColumnsByFormType,
  getFormName,
  getAvailableFormTypes
} from './formConfigurations';
export type { FormType } from './formConfigurations';
