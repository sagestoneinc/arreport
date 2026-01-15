'use client';

import React from 'react';
import { MidRow } from '@/lib/types';
import { calculateAR, formatAR, determineStatus } from '@/lib/calc';

interface MidTableEditorProps {
  title: string;
  mids: MidRow[];
  threshold: number;
  maxRows: number;
  onMidsChange: (mids: MidRow[]) => void;
}

export default function MidTableEditor({
  title,
  mids,
  threshold,
  maxRows,
  onMidsChange,
}: MidTableEditorProps) {
  const addRow = () => {
    if (mids.length < maxRows) {
      const newId = `${Date.now()}-${Math.random()}`;
      onMidsChange([...mids, { id: newId, name: '', sales: 0, declines: 0 }]);
    }
  };

  const removeRow = (id: string) => {
    onMidsChange(mids.filter((mid) => mid.id !== id));
  };

  const updateRow = (id: string, field: keyof MidRow, value: string | number) => {
    onMidsChange(mids.map((mid) => (mid.id === id ? { ...mid, [field]: value } : mid)));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <button
          onClick={addRow}
          disabled={mids.length >= maxRows}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          + Add MID
        </button>
      </div>

      {mids.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No MIDs added yet. Click &quot;Add MID&quot; to start.
        </p>
      ) : (
        <div className="space-y-3">
          {mids.map((mid) => {
            const ar = calculateAR(mid.sales, mid.declines);
            const status = determineStatus(ar, threshold);
            const statusColor = status === 'PERFORMING' ? 'text-green-600' : 'text-orange-600';

            return (
              <div key={mid.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={mid.name}
                    onChange={(e) => updateRow(mid.id, 'name', e.target.value)}
                    placeholder="MID name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={mid.sales}
                    onChange={(e) => updateRow(mid.id, 'sales', parseInt(e.target.value) || 0)}
                    placeholder="Sales"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={mid.declines}
                    onChange={(e) => updateRow(mid.id, 'declines', parseInt(e.target.value) || 0)}
                    placeholder="Declines"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-center">
                    <div className="font-semibold">{formatAR(ar)}%</div>
                    <div className={`text-xs font-medium ${statusColor}`}>{status}</div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <button
                    onClick={() => removeRow(mid.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
