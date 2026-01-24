'use client';

import React, { useState } from 'react';

interface PreviewProps {
  message: string;
  slug: string;
}

export default function Preview({ message, slug }: PreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${slug}-${date}.txt`;
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!message) {
    return (
      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
        <p className="text-gray-500 italic">Generate a report to see the preview here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
      <pre className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 mb-4">
        {message}
      </pre>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
        >
          💾 Download .txt
        </button>
      </div>
    </div>
  );
}
