'use client';

import React from 'react';
import { ProcessorConfig } from '@/lib/templates';

export interface ProcessorSelectorProps {
  config: ProcessorConfig;
  value: string;
  onChange: (value: string) => void;
  sectionKey: string;
}

export default function ProcessorSelector({
  config,
  value,
  onChange,
  sectionKey,
}: ProcessorSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={`processor-${sectionKey}`}
        className="text-sm font-medium text-gray-600 dark:text-gray-400"
      >
        Route to:
      </label>
      <select
        id={`processor-${sectionKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {config.processorOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
