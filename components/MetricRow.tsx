'use client';

import React from 'react';
import { calculateAR } from '@/lib/calculations';

interface MetricRowProps {
  label: string;
  sales: number;
  declines:  number;
  onSalesChange: (value: number) => void;
  onDeclinesChange: (value: number) => void;
  isOverall?: boolean;
}

export default function MetricRow({
  label,
  sales,
  declines,
  onSalesChange,
  onDeclinesChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isOverall = false,
}: MetricRowProps) {
  const ar = calculateAR(sales, declines);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
      <div className="font-medium text-gray-700">{label}</div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Sales</label>
        <input
          type="number"
          min="0"
          value={sales}
          onChange={(e) => onSalesChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Declines</label>
        <input
          type="number"
          min="0"
          value={declines}
          onChange={(e) => onDeclinesChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus: ring-blue-500 focus: border-transparent"
        />
      </div>
      <div className="text-center md:text-left">
        <div className="text-xs text-gray-600 mb-1">Approval Rate</div>
        <div className="text-2xl font-bold text-blue-600">{ar}%</div>
      </div>
    </div>
  );
}