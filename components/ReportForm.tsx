'use client';

import React from 'react';
import { TemplateField, MidRowData } from '@/lib/templates';
import DynamicTableInput from './DynamicTableInput';

interface ReportFormProps {
  fields: TemplateField[];
  formData: Record<string, string | number | MidRowData[]>;
  onChange: (name: string, value: string | number | MidRowData[]) => void;
  onGenerate: () => void;
}

export default function ReportForm({ fields, formData, onChange, onGenerate }: ReportFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      // For number inputs, keep as string while typing, convert on blur
      onChange(name, value === '' ? 0 : parseFloat(value) || 0);
    } else {
      onChange(name, value);
    }
  };

  const getInputValue = (field: TemplateField) => {
    const value = formData[field.name];
    if (field.type === 'number') {
      // Show empty string for default 0 values from field definition
      // But show actual 0 if user explicitly set it
      return value === field.defaultValue && value === 0 ? '' : String(value || '');
    }
    return value ?? '';
  };

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type === 'table' ? (
            <DynamicTableInput
              label={field.label}
              rows={(formData[field.name] as MidRowData[]) || []}
              onChange={(rows) => onChange(field.name, rows)}
            />
          ) : (
            <>
              <label
                htmlFor={field.name}
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={(formData[field.name] as string) || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm transition-all duration-150 resize-y"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={getInputValue(field) as string}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
                />
              )}
              {field.helpText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.helpText}</p>
              )}
            </>
          )}
        </div>
      ))}
      <button
        onClick={onGenerate}
        className="w-full mt-8 px-6 py-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold text-base shadow-sm"
      >
        Generate Preview
      </button>
    </div>
  );
}
