import React from 'react';
import JobCargoTable, { type JobCargoTableProps } from './JobCargoTable';
import { K9_FORM_COLUMNS } from './formConfigurations';

interface K9FormTableProps extends Omit<JobCargoTableProps, 'columns'> {
  // You can add K9-specific props here if needed
}

export const K9FormTable: React.FC<K9FormTableProps> = (props) => {
  return (
    <JobCargoTable
      {...props}
      columns={K9_FORM_COLUMNS}
    />
  );
};

export default K9FormTable;
