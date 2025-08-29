import React from 'react';
import JobCargoTable, { type JobCargoTableProps } from './JobCargoTable';
import { K1_FORM_COLUMNS } from './formConfigurations';

interface K1FormTableProps extends Omit<JobCargoTableProps, 'columns'> {
  // You can add K1-specific props here if needed
}

export const K1FormTable: React.FC<K1FormTableProps> = (props) => {
  return (
    <JobCargoTable
      {...props}
      columns={K1_FORM_COLUMNS}
    />
  );
};

export default K1FormTable;
