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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Daily Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="daily-sales" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="daily-declines" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily AR
          </div>
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 font-semibold">
            {formatAR(ar)}%
          </div>
        </div>
      </div>
    </div>
  );
}
