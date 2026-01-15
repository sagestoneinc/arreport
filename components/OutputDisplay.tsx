'use client';

import React, { useState } from 'react';

interface OutputDisplayProps {
  message: string;
}

export default function OutputDisplay({ message }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (! message) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Generated Message</h3>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md transition-colors ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover: bg-blue-600'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
        {message}
      </pre>
    </div>
  );
}