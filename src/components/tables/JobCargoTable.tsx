import React from 'react'
import { Input } from '../ui/input'

// Interfaces
export interface DisplayJobCargoItem {
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
  // K9 Form specific fields
  packQtyToBeReleased?: number;
  packQtyToBeReleased_confidence?: number;
  packUOMToBeReleased?: string;
  packUOMToBeReleased_confidence?: number;
}

export interface JobCargoTableProps {
  items: DisplayJobCargoItem[];
  isEditMode: boolean;
  onUpdate: (itemIndex: number, field: keyof DisplayJobCargoItem, value: string | number) => void;
  getConfidenceColor: (confidence?: number) => string;
  columns?: JobCargoColumn[];
}

export interface JobCargoColumn {
  key: keyof DisplayJobCargoItem;
  label: string;
  width?: string;
  type?: 'text' | 'number';
  step?: string;
}

// Default columns for K1 form (current implementation)
export const K1_COLUMNS: JobCargoColumn[] = [
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
]

export const JobCargoTable: React.FC<JobCargoTableProps> = ({
  items,
  isEditMode,
  onUpdate,
  getConfidenceColor,
  columns = K1_COLUMNS
}) => {
  const renderCell = (item: DisplayJobCargoItem, column: JobCargoColumn, index: number) => {
    const value = item[column.key];
    const confidenceKey = `${column.key}_confidence` as keyof DisplayJobCargoItem;
    const confidence = item[confidenceKey] as number | undefined;

    if (isEditMode) {
      return (
        <Input
          type={column.type || 'text'}
          step={column.step}
          value={value}
          onChange={(e) => onUpdate(index, column.key, column.type === 'number' ? e.target.value : e.target.value)}
          className={`w-full border-none p-1 text-xs h-6 ${column.width}`}
        />
      );
    }

    return (
      <div className={`p-1 text-xs w-full h-full border rounded ${getConfidenceColor(confidence)}`}>
        {value}
      </div>
    );
  };

  return (
    <div className="overflow-auto w-full max-h-96 border border-gray-200 rounded-lg">
      <table className="w-full border-collapse border border-gray-300 text-xs min-w-max">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column.key}
                className="border border-gray-300 px-1 py-1 text-left text-xs font-medium"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.key} className="border border-gray-300 p-0">
                  {renderCell(item, column, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobCargoTable;
