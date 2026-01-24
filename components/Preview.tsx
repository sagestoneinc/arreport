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
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-gray-500 text-base">Generate a report to see the preview here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 sticky top-24">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">Preview</h2>
      </div>
      <div className="p-6">
        <pre className="bg-gray-50 p-5 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 mb-5 min-h-[300px] max-h-[600px] overflow-y-auto">
          {message}
        </pre>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-150 font-semibold shadow-sm hover:shadow"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-150 font-semibold shadow-sm hover:shadow"
          >
            💾 Download
          </button>
        </div>
      </div>
    </div>
  );
}
