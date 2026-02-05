'use client';

import React, { useMemo } from 'react';
import { ProcessorsConfig } from '@/lib/templates';
import ProcessorSelector from './ProcessorSelector';

export interface CommonDecline {
  reason: string;
  count: number;
}

export interface BatchRerunsFormData {
  date: string;
  usca_reruns: number;
  usca_sales: number;
  usca_approval: number;
  usca_visa_appr: number;
  usca_visa_approvals: number;
  usca_visa_txns: number;
  usca_mc_appr: number;
  usca_mc_approvals: number;
  usca_mc_txns: number;
  usca_decline1_reason: string;
  usca_decline1_count: number;
  usca_decline2_reason: string;
  usca_decline2_count: number;
  usca_decline3_reason: string;
  usca_decline3_count: number;
  other_reruns: number;
  other_sales: number;
  other_approval: number;
  other_visa_appr: number;
  other_visa_approvals: number;
  other_visa_txns: number;
  other_mc_appr: number;
  other_mc_approvals: number;
  other_mc_txns: number;
  other_decline1_reason: string;
  other_decline1_count: number;
  other_decline2_reason: string;
  other_decline2_count: number;
  other_decline3_reason: string;
  other_decline3_count: number;
}

export interface ProcessorSelections {
  usca: string;
  other: string;
}

interface BatchRerunsFormProps {
  formData: BatchRerunsFormData;
  onChange: (name: string, value: string | number) => void;
  onGenerate: () => void;
  processors?: ProcessorsConfig;
  processorSelections: ProcessorSelections;
  onProcessorChange: (sectionKey: string, value: string) => void;
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

/**
 * Determine if a section has zero volume
 * Zero-volume: reruns == 0 OR reruns is empty AND sales == 0 (treat blank as 0)
 */
function isZeroVolume(reruns: number, sales: number): boolean {
  const actualReruns = reruns || 0;
  const actualSales = sales || 0;
  return actualReruns === 0 && actualSales === 0;
}

export default function BatchRerunsForm({
  formData,
  onChange,
  onGenerate,
  processors,
  processorSelections,
  onProcessorChange,
}: BatchRerunsFormProps) {
  // Compute all percentages
  const uscaApprovalRate = useMemo(() => {
    return computeApprovalRate(formData.usca_sales, formData.usca_reruns);
  }, [formData.usca_sales, formData.usca_reruns]);

  const otherApprovalRate = useMemo(() => {
    return computeApprovalRate(formData.other_sales, formData.other_reruns);
  }, [formData.other_sales, formData.other_reruns]);

  const uscaVisaRate = useMemo(() => {
    return computeCardNetworkRate(formData.usca_visa_approvals, formData.usca_visa_txns);
  }, [formData.usca_visa_approvals, formData.usca_visa_txns]);

  const uscaMcRate = useMemo(() => {
    return computeCardNetworkRate(formData.usca_mc_approvals, formData.usca_mc_txns);
  }, [formData.usca_mc_approvals, formData.usca_mc_txns]);

  const otherVisaRate = useMemo(() => {
    return computeCardNetworkRate(formData.other_visa_approvals, formData.other_visa_txns);
  }, [formData.other_visa_approvals, formData.other_visa_txns]);

  const otherMcRate = useMemo(() => {
    return computeCardNetworkRate(formData.other_mc_approvals, formData.other_mc_txns);
  }, [formData.other_mc_approvals, formData.other_mc_txns]);

  // Compute decline shares
  const uscaDeclineShares = useMemo(() => {
    return [
      computeShare(formData.usca_decline1_count || 0, formData.usca_reruns),
      computeShare(formData.usca_decline2_count || 0, formData.usca_reruns),
      computeShare(formData.usca_decline3_count || 0, formData.usca_reruns),
    ];
  }, [
    formData.usca_decline1_count,
    formData.usca_decline2_count,
    formData.usca_decline3_count,
    formData.usca_reruns,
  ]);

  const otherDeclineShares = useMemo(() => {
    return [
      computeShare(formData.other_decline1_count || 0, formData.other_reruns),
      computeShare(formData.other_decline2_count || 0, formData.other_reruns),
      computeShare(formData.other_decline3_count || 0, formData.other_reruns),
    ];
  }, [
    formData.other_decline1_count,
    formData.other_decline2_count,
    formData.other_decline3_count,
    formData.other_reruns,
  ]);

  // Zero-volume detection
  const uscaZeroVolume = useMemo(
    () => isZeroVolume(formData.usca_reruns, formData.usca_sales),
    [formData.usca_reruns, formData.usca_sales]
  );

  const otherZeroVolume = useMemo(
    () => isZeroVolume(formData.other_reruns, formData.other_sales),
    [formData.other_reruns, formData.other_sales]
  );

  // Get the section header text with selected processor
  const getUscaHeaderText = () => {
    const label = processors?.usca?.label ?? 'US/CA Declines';
    const processor = processorSelections.usca;
    return `${label} → ${processor}`;
  };

  const getOtherHeaderText = () => {
    const label = processors?.other?.label ?? 'All Other Geos';
    const processor = processorSelections.other;
    return `${label} → ${processor}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numValue = value === '' ? 0 : parseFloat(value);
      onChange(name, isNaN(numValue) ? 0 : numValue);
    } else {
      onChange(name, value);
    }
  };

  const getInputValue = (name: keyof BatchRerunsFormData) => {
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
        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold">
          {value ? `${value}%` : '—'}
        </div>
      </div>
    );
  };

  const renderInputField = (
    name: keyof BatchRerunsFormData,
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Report Date Card */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Report Date</h3>
        {renderInputField('date', 'Date', 'date', true)}
      </div>

      {/* US/CA Declines Card */}
      <div
        className={`rounded-lg border p-6 ${
          uscaZeroVolume
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {getUscaHeaderText()}
            </h3>
            {uscaZeroVolume && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                No volume
              </span>
            )}
          </div>
          {processors?.usca && (
            <ProcessorSelector
              config={processors.usca}
              value={processorSelections.usca}
              onChange={(value) => onProcessorChange('usca', value)}
              sectionKey="usca"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Summary Section */}
          {renderInputField('usca_reruns', 'US/CA Re-runs', 'number', true)}
          {renderInputField('usca_sales', 'US/CA Sales', 'number', true)}
          {renderComputedField('US/CA Approval Rate', uscaApprovalRate)}

          {/* Visa Section */}
          {renderComputedField('Visa Approval %', uscaVisaRate)}
          {renderInputField('usca_visa_approvals', 'Visa Approvals', 'number')}
          {renderInputField('usca_visa_txns', 'Visa Transactions', 'number')}

          {/* MC Section */}
          {renderComputedField('MC Approval %', uscaMcRate)}
          {renderInputField('usca_mc_approvals', 'MC Approvals', 'number')}
          {renderInputField('usca_mc_txns', 'MC Transactions', 'number')}
        </div>

        {/* Common Declines Section */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Common Declines</h4>
          <div className="space-y-3">
            {/* Decline 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('usca_decline1_reason', 'Decline Reason', 'text')}
              {renderInputField('usca_decline1_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', uscaDeclineShares[0])}
            </div>
            {/* Decline 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('usca_decline2_reason', 'Decline Reason', 'text')}
              {renderInputField('usca_decline2_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', uscaDeclineShares[1])}
            </div>
            {/* Decline 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('usca_decline3_reason', 'Decline Reason', 'text')}
              {renderInputField('usca_decline3_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', uscaDeclineShares[2])}
            </div>
          </div>
        </div>
      </div>

      {/* Other Geos Card */}
      <div
        className={`rounded-lg border p-6 ${
          otherZeroVolume
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {getOtherHeaderText()}
            </h3>
            {otherZeroVolume && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                No volume
              </span>
            )}
          </div>
          {processors?.other && (
            <ProcessorSelector
              config={processors.other}
              value={processorSelections.other}
              onChange={(value) => onProcessorChange('other', value)}
              sectionKey="other"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Summary Section */}
          {renderInputField('other_reruns', 'Other Geos Re-runs', 'number', true)}
          {renderInputField('other_sales', 'Other Geos Sales', 'number', true)}
          {renderComputedField('Other Geos Approval Rate', otherApprovalRate)}

          {/* Visa Section */}
          {renderComputedField('Visa Approval %', otherVisaRate)}
          {renderInputField('other_visa_approvals', 'Visa Approvals', 'number')}
          {renderInputField('other_visa_txns', 'Visa Transactions', 'number')}

          {/* MC Section */}
          {renderComputedField('MC Approval %', otherMcRate)}
          {renderInputField('other_mc_approvals', 'MC Approvals', 'number')}
          {renderInputField('other_mc_txns', 'MC Transactions', 'number')}
        </div>

        {/* Common Declines Section */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Common Declines
          </h4>
          <div className="space-y-3">
            {/* Decline 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('other_decline1_reason', 'Decline Reason', 'text')}
              {renderInputField('other_decline1_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', otherDeclineShares[0])}
            </div>
            {/* Decline 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('other_decline2_reason', 'Decline Reason', 'text')}
              {renderInputField('other_decline2_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', otherDeclineShares[1])}
            </div>
            {/* Decline 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField('other_decline3_reason', 'Decline Reason', 'text')}
              {renderInputField('other_decline3_count', 'Count', 'number')}
              {renderComputedField('Share of Re-runs', otherDeclineShares[2])}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold text-base shadow-sm"
      >
        Generate Preview
      </button>
    </div>
  );
}
