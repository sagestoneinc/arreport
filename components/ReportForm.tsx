'use client';

import React from 'react';
import { TemplateField } from '@/lib/templates';

interface ReportFormProps {
  fields: TemplateField[];
  formData: Record<string, string | number>;
  onChange: (name: string, value: string | number) => void;
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
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Fields</h2>
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={getInputValue(field)}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {field.helpText && (
            <p className="text-xs text-gray-500">{field.helpText}</p>
          )}
        </div>
      ))}
      <button
        onClick={onGenerate}
        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md"
      >
        ✨ Generate Report
      </button>
    </div>
  );
}
