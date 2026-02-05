'use client';

import React, { useState } from 'react';
import { AppState } from '@/lib/types';
import { validateAppState } from '@/lib/validate';

interface OutputPanelProps {
  message: string;
  state: AppState;
  onImport: (state: AppState) => void;
}

export default function OutputPanel({ message, state, onImport }: OutputPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ar-update.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validated = validateAppState(json);
        if (validated) {
          onImport(validated);
          setImportError('');
        } else {
          setImportError('Invalid JSON structure. Please check the file format.');
        }
      } catch {
        setImportError('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  if (!message) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Generated Message
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export JSON
          </button>
          <label className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg transition-colors ${
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {copySuccess ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {importError}
        </div>
      )}

      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
        {message}
      </pre>
    </div>
  );
}
