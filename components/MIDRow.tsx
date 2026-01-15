'use client';

import React from 'react';
import { calculateAR } from '@/lib/calculations';
import { MIDData } from '@/lib/types';

interface MIDRowProps {
  mid:  MIDData;
  onUpdate: (mid: MIDData) => void;
  onRemove: () => void;
}

export default function MIDRow({ mid, onUpdate, onRemove }: MIDRowProps) {
  const ar = calculateAR(mid.sales, mid.declines);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div>
        <label className="block text-xs text-gray-600 mb-1">MID Name</label>
        <input
          type="text"
          value={mid.midName}
          onChange={(e) => onUpdate({ ...mid, midName: e.target.value })}
          placeholder="e.g., CS_395"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Sales</label>
        <input
          type="number"
          min="0"
          value={mid.sales}
          onChange={(e) => onUpdate({ ...mid, sales: Math.max(0, parseInt(e.target.value) || 0) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Declines</label>
        <input
          type="number"
          min="0"
          value={mid.declines}
          onChange={(e) => onUpdate({ ...mid, declines: Math.max(0, parseInt(e.target.value) || 0) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus: ring-blue-500 focus: border-transparent"
        />
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-600 mb-1">AR</div>
        <div className="text-lg font-bold text-blue-600">{ar}%</div>
      </div>
      <div className="flex justify-center md:justify-end">
        <button
          onClick={onRemove}
          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}