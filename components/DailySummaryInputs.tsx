'use client';

import React from 'react';
import { Summary } from '@/lib/types';
import { calculateAR, formatAR } from '@/lib/calc';

interface DailySummaryInputsProps {
  dailySummary: Summary;
  onDailySummaryChange: (summary: Summary) => void;
}

export default function DailySummaryInputs({
  dailySummary,
  onDailySummaryChange,
}: DailySummaryInputsProps) {
  const ar = calculateAR(dailySummary.sales, dailySummary.declines);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">📌 Daily Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="daily-sales" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Sales
          </label>
          <input
            id="daily-sales"
            type="number"
            min="0"
            value={dailySummary.sales}
            onChange={(e) =>
              onDailySummaryChange({
                ...dailySummary,
                sales: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="daily-declines" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Declines
          </label>
          <input
            id="daily-declines"
            type="number"
            min="0"
            value={dailySummary.declines}
            onChange={(e) =>
              onDailySummaryChange({
                ...dailySummary,
                declines: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">Daily AR</div>
          <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-semibold">
            {formatAR(ar)}%
          </div>
        </div>
      </div>
    </div>
  );
}
