'use client';

import React, { useMemo } from 'react';

export interface ManualRebillsFormData {
  date: string;
  rebills_reruns: number;
  rebills_sales: number;
  rebills_approval: number;
  visa_appr: number;
  visa_approvals: number;
  visa_txns: number;
  mc_appr: number;
  mc_approvals: number;
  mc_txns: number;
  decline1_reason: string;
  decline1_count: number;
  decline2_reason: string;
  decline2_count: number;
  decline3_reason: string;
  decline3_count: number;
  insights: string;
}

interface ManualRebillsFormProps {
  formData: ManualRebillsFormData;
  onChange: (name: string, value: string | number) => void;
  onGenerate: () => void;
}

function computeShare(count: number, total: number): string | null {
  if (!total || total === 0) return null;
  const percentage = (count / total) * 100;
  return percentage.toFixed(2);
}

function computeApprovalRate(sales: number, reruns: number): string | null {
  if (!reruns || reruns === 0) return null;
  const percentage = (sales / reruns) * 100;
  return percentage.toFixed(2);
}

function computeCardNetworkRate(approvals: number, txns: number): string | null {
  if (!txns || txns === 0) return null;
  const percentage = (approvals / txns) * 100;
  return percentage.toFixed(2);
}

export default function ManualRebillsForm({
  formData,
  onChange,
  onGenerate,
}: ManualRebillsFormProps) {
  // Compute approval rate
  const approvalRate = useMemo(() => {
    return computeApprovalRate(formData.rebills_sales, formData.rebills_reruns);
  }, [formData.rebills_sales, formData.rebills_reruns]);

  // Compute card network rates
  const visaRate = useMemo(() => {
    return computeCardNetworkRate(formData.visa_approvals, formData.visa_txns);
  }, [formData.visa_approvals, formData.visa_txns]);

  const mcRate = useMemo(() => {
    return computeCardNetworkRate(formData.mc_approvals, formData.mc_txns);
  }, [formData.mc_approvals, formData.mc_txns]);

  // Compute decline shares
  const declineShares = useMemo(() => {
    return [
      computeShare(formData.decline1_count || 0, formData.rebills_reruns),
      computeShare(formData.decline2_count || 0, formData.rebills_reruns),
      computeShare(formData.decline3_count || 0, formData.rebills_reruns),
    ];
  }, [
    formData.decline1_count,
    formData.decline2_count,
    formData.decline3_count,
    formData.rebills_reruns,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value === '' ? 0 : parseFloat(value);
      onChange(name, isNaN(numValue) ? 0 : numValue);
    } else {
      onChange(name, value);
    }
  };

  const getInputValue = (name: keyof ManualRebillsFormData) => {
    const value = formData[name];
    if (typeof value === 'number') {
      return value === 0 ? '' : String(value);
    }
    return value ?? '';
  };

  const renderComputedField = (label: string, value: string | null) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400 font-semibold">
          {value ? `${value}%` : '—'}
        </div>
      </div>
    );
  };

  const renderInputField = (
    name: keyof ManualRebillsFormData,
    label: string,
    type: string = 'number',
    required: boolean = false
  ) => {
    return (
      <div className="space-y-1">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={getInputValue(name)}
          onChange={handleChange}
          required={required}
          min={type === 'number' ? 0 : undefined}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Manual Rebills Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Manual Rebills Summary
          </h3>
          <div className="space-y-4">
            {renderInputField('date', 'Report Date', 'date', true)}
            {renderInputField('rebills_reruns', 'Reruns Declines', 'number', true)}
            {renderInputField('rebills_sales', 'Sales Count', 'number', true)}
            {renderComputedField('Approval Rate (%)', approvalRate)}
          </div>
        </div>

        {/* Card Network Section — VISA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Card Network — VISA
          </h3>
          <div className="space-y-4">
            {renderInputField('visa_approvals', 'Visa Re-runs Approvals', 'number')}
            {renderInputField('visa_txns', 'Visa Re-runs Transactions', 'number')}
            {renderComputedField('Visa Approval %', visaRate)}
          </div>
        </div>

        {/* Card Network Section — MC */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Card Network — MC
          </h3>
          <div className="space-y-4">
            {renderInputField('mc_approvals', 'MC Re-runs Approvals', 'number')}
            {renderInputField('mc_txns', 'MC Re-runs Transactions', 'number')}
            {renderComputedField('MC Approval %', mcRate)}
          </div>
        </div>

        {/* Common Declines Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-lg transition md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Common Declines
          </h3>
          <div className="space-y-4">
            {/* Decline 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('decline1_reason', 'Decline Reason', 'text')}
              {renderInputField('decline1_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', declineShares[0])}
            </div>
            {/* Decline 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('decline2_reason', 'Decline Reason', 'text')}
              {renderInputField('decline2_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', declineShares[1])}
            </div>
            {/* Decline 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('decline3_reason', 'Decline Reason', 'text')}
              {renderInputField('decline3_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', declineShares[2])}
            </div>
          </div>
        </div>

        {/* Insights Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-lg transition xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Insights</h3>
          <textarea
            id="insights"
            name="insights"
            value={formData.insights || ''}
            onChange={handleChange}
            placeholder="Enter any additional insights or observations..."
            rows={6}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none font-mono text-sm resize-y"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        ✨ Generate Report
      </button>
    </div>
  );
}
