'use client';

import React, { useState } from 'react';
import { XShieldMerchantRow } from '@/lib/templates';

export interface XShieldHourlyApprovalFormData {
  header_time_start: string;
  header_time_end: string;
  yesterday_from_time: string;
  yesterday_to_time: string;
  yesterday_merchants: XShieldMerchantRow[];
  today_as_of_from_time: string;
  today_as_of_to_time: string;
  today_merchants: XShieldMerchantRow[];
  insights: string;
}

interface XShieldHourlyApprovalFormProps {
  formData: XShieldHourlyApprovalFormData;
  onChange: (name: string, value: string | number | XShieldMerchantRow[]) => void;
  onGenerate: () => void;
}

const emptyMerchantRow: XShieldMerchantRow = {
  merchant_name: '',
  visa_sales: 0,
  visa_declines: 0,
  mc_sales: 0,
  mc_declines: 0,
};

const calculatePercent = (sales: number, declines: number): string => {
  const total = (Number.isFinite(sales) ? sales : 0) + (Number.isFinite(declines) ? declines : 0);
  if (total <= 0) return '0.00%';
  const safeSales = Number.isFinite(sales) ? sales : 0;
  return ((safeSales / total) * 100).toFixed(2) + '%';
};

export default function XShieldHourlyApprovalForm({
  formData,
  onChange,
  onGenerate,
}: XShieldHourlyApprovalFormProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  const updateMerchantRow = (
    section: 'yesterday_merchants' | 'today_merchants',
    index: number,
    field: keyof XShieldMerchantRow,
    value: string
  ) => {
    const rows = [...(formData[section] || [])];
    const nextValue = field === 'merchant_name' ? value : value === '' ? 0 : Number(value);
    rows[index] = { ...rows[index], [field]: nextValue } as XShieldMerchantRow;
    onChange(section, rows);
  };

  const addMerchantRow = (section: 'yesterday_merchants' | 'today_merchants') => {
    const rows = [...(formData[section] || [])];
    rows.push({ ...emptyMerchantRow });
    onChange(section, rows);
  };

  const removeMerchantRow = (section: 'yesterday_merchants' | 'today_merchants', index: number) => {
    const rows = (formData[section] || []).filter((_, i) => i !== index);
    onChange(section, rows.length === 0 ? [{ ...emptyMerchantRow }] : rows);
  };

  const validate = (): boolean => {
    const nextErrors: string[] = [];

    const requiredFields: Array<{ key: keyof XShieldHourlyApprovalFormData; label: string }> = [
      { key: 'header_time_start', label: 'Header time start' },
      { key: 'header_time_end', label: 'Header time end' },
      { key: 'yesterday_from_time', label: 'Yesterday from time' },
      { key: 'yesterday_to_time', label: 'Yesterday to time' },
      { key: 'today_as_of_from_time', label: 'Today as of from time' },
      { key: 'today_as_of_to_time', label: 'Today as of to time' },
      { key: 'insights', label: 'Insights/Actions' },
    ];

    requiredFields.forEach(({ key, label }) => {
      const value = (formData[key] as string) || '';
      if (!value.trim()) {
        nextErrors.push(`${label} is required.`);
      }
    });

    const hasMissingMerchantName = (rows: XShieldMerchantRow[] = []): boolean =>
      rows.some((row) => !row.merchant_name || !row.merchant_name.trim());

    if (hasMissingMerchantName(formData.yesterday_merchants)) {
      nextErrors.push('All yesterday merchant account names are required.');
    }

    if ((formData.yesterday_merchants || []).length === 0) {
      nextErrors.push('Add at least one yesterday merchant account.');
    }

    if (hasMissingMerchantName(formData.today_merchants)) {
      nextErrors.push('All today merchant account names are required.');
    }

    if ((formData.today_merchants || []).length === 0) {
      nextErrors.push('Add at least one today merchant account.');
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    onGenerate();
  };

  const renderMerchantSection = (
    title: string,
    section: 'yesterday_merchants' | 'today_merchants'
  ) => {
    const rows = formData[section] || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <button
            type="button"
            onClick={() => addMerchantRow(section)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            + Add Merchant
          </button>
        </div>

        {rows.map((row, index) => {
          const visaPercent = calculatePercent(row.visa_sales || 0, row.visa_declines || 0);
          const mcPercent = calculatePercent(row.mc_sales || 0, row.mc_declines || 0);

          return (
            <div
              key={`${section}-${index}`}
              className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/60 dark:bg-gray-900/30 space-y-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Merchant Account Name
                </label>
                <button
                  type="button"
                  onClick={() => removeMerchantRow(section, index)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={row.merchant_name}
                onChange={(event) =>
                  updateMerchantRow(section, index, 'merchant_name', event.target.value)
                }
                placeholder="e.g., MID Alpha"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  VISA
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor={`visa-sales-${section}-${index}`}
                    className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >
                    Sales
                  </label>
                  <input
                    id={`visa-sales-${section}-${index}`}
                    type="number"
                    min="0"
                    value={row.visa_sales ?? ''}
                    onChange={(event) =>
                      updateMerchantRow(section, index, 'visa_sales', event.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor={`visa-declines-${section}-${index}`}
                    className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >
                    Declines
                  </label>
                  <input
                    id={`visa-declines-${section}-${index}`}
                    type="number"
                    min="0"
                    value={row.visa_declines ?? ''}
                    onChange={(event) =>
                      updateMerchantRow(section, index, 'visa_declines', event.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    %
                  </label>
                  <div className="px-3 py-2 text-sm text-center font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    {visaPercent}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  MC
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor={`mc-sales-${section}-${index}`}
                    className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >
                    Sales
                  </label>
                  <input
                    id={`mc-sales-${section}-${index}`}
                    type="number"
                    min="0"
                    value={row.mc_sales ?? ''}
                    onChange={(event) =>
                      updateMerchantRow(section, index, 'mc_sales', event.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-4">
                  <label
                    htmlFor={`mc-declines-${section}-${index}`}
                    className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >
                    Declines
                  </label>
                  <input
                    id={`mc-declines-${section}-${index}`}
                    type="number"
                    min="0"
                    value={row.mc_declines ?? ''}
                    onChange={(event) =>
                      updateMerchantRow(section, index, 'mc_declines', event.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    %
                  </label>
                  <div className="px-3 py-2 text-sm text-center font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    {mcPercent}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 text-sm text-gray-500 dark:text-gray-400">
            No merchant accounts added yet. Use &quot;Add Merchant&quot; to start.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          <div className="font-semibold mb-1">Please fix the following:</div>
          <ul className="list-disc list-inside">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Header Time Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="header_time_start"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Start (EST)
            </label>
            <input
              id="header_time_start"
              name="header_time_start"
              type="text"
              value={formData.header_time_start || ''}
              onChange={handleTextChange}
              placeholder="9:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="header_time_end"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              End (EST)
            </label>
            <input
              id="header_time_end"
              name="header_time_end"
              type="text"
              value={formData.header_time_end || ''}
              onChange={handleTextChange}
              placeholder="10:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Yesterday</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="yesterday_from_time"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              From (EST)
            </label>
            <input
              id="yesterday_from_time"
              name="yesterday_from_time"
              type="text"
              value={formData.yesterday_from_time || ''}
              onChange={handleTextChange}
              placeholder="9:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="yesterday_to_time"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              To (EST)
            </label>
            <input
              id="yesterday_to_time"
              name="yesterday_to_time"
              type="text"
              value={formData.yesterday_to_time || ''}
              onChange={handleTextChange}
              placeholder="10:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
        </div>

        {renderMerchantSection('Merchant Accounts', 'yesterday_merchants')}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Today (As Of)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="today_as_of_from_time"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              As of from (EST)
            </label>
            <input
              id="today_as_of_from_time"
              name="today_as_of_from_time"
              type="text"
              value={formData.today_as_of_from_time || ''}
              onChange={handleTextChange}
              placeholder="9:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="today_as_of_to_time"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              As of to (EST)
            </label>
            <input
              id="today_as_of_to_time"
              name="today_as_of_to_time"
              type="text"
              value={formData.today_as_of_to_time || ''}
              onChange={handleTextChange}
              placeholder="10:00 AM"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
        </div>

        {renderMerchantSection('Merchant Accounts', 'today_merchants')}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Insights/Actions
        </h3>
        <textarea
          id="insights"
          name="insights"
          value={formData.insights || ''}
          onChange={handleTextChange}
          placeholder="Summarize routing changes, monitoring notes, or next actions."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm transition-all duration-150 resize-y"
        />
      </div>

      <button
        onClick={handleGenerate}
        className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold text-base shadow-sm"
      >
        Generate Preview
      </button>
    </div>
  );
}
