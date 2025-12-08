import React from 'react';
import JobCargoTable, { type JobCargoTableProps } from './JobCargoTable';
import {
  getColumnsByFormType,
  getFormName,
  type FormType,
} from './formConfigurations';

interface DynamicJobCargoTableProps
  extends Omit<JobCargoTableProps, 'columns'> {
  selectedFormType: FormType;
  onFormTypeChange: (formType: FormType) => void;
  showFormSelector?: boolean;
}

export const DynamicJobCargoTable: React.FC<DynamicJobCargoTableProps> = ({
  selectedFormType,
  onFormTypeChange,
  showFormSelector = true,
  ...tableProps
}) => {
  const columns = getColumnsByFormType(selectedFormType);
  const formName = getFormName(selectedFormType);

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Job Cargo - {formName}
          </h3>
          <div className="text-xs text-gray-500">
            {tableProps.items.length} item(s)
          </div>
        </div>
        
        <JobCargoTable
          {...tableProps}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default DynamicJobCargoTable;
