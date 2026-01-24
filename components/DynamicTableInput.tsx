'use client';

import React from 'react';
import { MidRowData } from '@/lib/templates';

interface DynamicTableInputProps {
  label: string;
  rows: MidRowData[];
  onChange: (rows: MidRowData[]) => void;
}

export default function DynamicTableInput({ label, rows, onChange }: DynamicTableInputProps) {
  const addRow = () => {
    onChange([...rows, { mid_name: '', initial_sales: 0, initial_decline: 0 }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof MidRowData, value: string | number) => {
    const newRows = [...rows];
    if (field === 'mid_name') {
      newRows[index] = { ...newRows[index], [field]: value as string };
    } else {
      // For numeric fields, treat empty/blank as 0
      const numValue = value === '' || value === null || value === undefined ? 0 : Number(value);
      newRows[index] = { ...newRows[index], [field]: numValue };
    }
    onChange(newRows);
  };

  const calculateAR = (sales: number, decline: number): string => {
    const total = sales + decline;
    if (total === 0) return '—';
    const ar = (sales / total) * 100;
    return ar.toFixed(2) + '%';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
        >
          + Add MID
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4 border border-gray-200 rounded-md bg-gray-50">
          No MIDs added yet. Click &quot;Add MID&quot; to start.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const ar = calculateAR(row.initial_sales || 0, row.initial_decline || 0);
            return (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={row.mid_name}
                    onChange={(e) => updateRow(index, 'mid_name', e.target.value)}
                    placeholder="MID name"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={row.initial_sales || ''}
                    onChange={(e) => updateRow(index, 'initial_sales', e.target.value)}
                    placeholder="Sales"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={row.initial_decline || ''}
                    onChange={(e) => updateRow(index, 'initial_decline', e.target.value)}
                    placeholder="Declines"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-3">
                  <div className="px-2 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-center font-semibold text-gray-700">
                    {ar}
                  </div>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="w-full px-2 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    title="Remove MID"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
