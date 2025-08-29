import React from 'react';
import JobCargoTable, { type JobCargoTableProps } from './JobCargoTable';
import { K2_FORM_COLUMNS } from './formConfigurations';

interface K2FormTableProps extends Omit<JobCargoTableProps, 'columns'> {
  // You can add K2-specific props here if needed
}

export const K2FormTable: React.FC<K2FormTableProps> = (props) => {
  return (
    <JobCargoTable
      {...props}
      columns={K2_FORM_COLUMNS}
    />
  );
};

export default K2FormTable;
