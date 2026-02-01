'use client';

import React from 'react';
import DynamicTableInput from './DynamicTableInput';
import { MidRowData } from '@/lib/templates';

export interface XShieldHourlyApprovalFormData {
  report_date: string;
  yesterday_good: MidRowData[];
  yesterday_bad: MidRowData[];
  as_of_date: string;
  as_of_time: string;
  as_of_good: MidRowData[];
  as_of_bad: MidRowData[];
  insights: string;
}

interface XShieldHourlyApprovalFormProps {
  formData: XShieldHourlyApprovalFormData;
  onChange: (name: string, value: string | number | MidRowData[]) => void;
  onGenerate: () => void;
}

export default function XShieldHourlyApprovalForm({
  formData,
  onChange,
  onGenerate,
}: XShieldHourlyApprovalFormProps) {
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Report Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="report_date"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Report Date
              </label>
              <input
                id="report_date"
                name="report_date"
                type="date"
                value={formData.report_date || ''}
                onChange={handleTextChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="as_of_date"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                As Of Date
              </label>
              <input
                id="as_of_date"
                name="as_of_date"
                type="date"
                value={formData.as_of_date || ''}
                onChange={handleTextChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="as_of_time"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                As Of Time (EST)
              </label>
              <input
                id="as_of_time"
                name="as_of_time"
                type="text"
                value={formData.as_of_time || ''}
                onChange={handleTextChange}
                placeholder="1:00 PM"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Insights & Actions
          </h3>
          <textarea
            id="insights"
            name="insights"
            value={formData.insights || ''}
            onChange={handleTextChange}
            placeholder="Enter routing changes, monitoring notes, or action items."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm transition-all duration-150 resize-y"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Yesterday</h3>
          <DynamicTableInput
            label="🟢⬆️ Good/Improving MIDs"
            rows={formData.yesterday_good || []}
            onChange={(rows) => onChange('yesterday_good', rows)}
          />
          <DynamicTableInput
            label="🔴⬇️ Bad/Declining MIDs"
            rows={formData.yesterday_bad || []}
            onChange={(rows) => onChange('yesterday_bad', rows)}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">As Of</h3>
          <DynamicTableInput
            label="🟢⬆️ Good/Improving MIDs"
            rows={formData.as_of_good || []}
            onChange={(rows) => onChange('as_of_good', rows)}
          />
          <DynamicTableInput
            label="🔴⬇️ Bad/Declining MIDs"
            rows={formData.as_of_bad || []}
            onChange={(rows) => onChange('as_of_bad', rows)}
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        ✨ Generate Report
      </button>
    </div>
  );
}
