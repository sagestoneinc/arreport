import React from 'react';
import { TemplateType } from '@/lib/types';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Select Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onTemplateChange('template-a')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedTemplate === 'template-a'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
        >
          <div className="text-left">
            <div className="font-semibold text-gray-900 mb-1">Template A: Top/Worst</div>
            <div className="text-sm text-gray-600">
              Daily Summary + Hourly Update + Top/Worst MIDs
            </div>
          </div>
        </button>
        <button
          onClick={() => onTemplateChange('template-b')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedTemplate === 'template-b'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
        >
          <div className="text-left">
            <div className="font-semibold text-gray-900 mb-1">
              Template B: Threshold Performing/Low
            </div>
            <div className="text-sm text-gray-600">
              Threshold-based Performing/Low grouping (Sales/Declines)
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
