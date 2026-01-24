'use client';

import React, { useState, useMemo } from 'react';
import { telegramToPreviewHtml, telegramToPlainText } from '@/lib/telegramMessageGenerator';

type PreviewMode = 'telegram' | 'plain';

interface PreviewProps {
  message: string;
  slug: string;
}

export default function Preview({ message, slug }: PreviewProps) {
  const [copied, setCopied] = useState<'readable' | 'payload' | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('telegram');

  // Generate preview HTML and plain text from the telegram message
  const { previewHtml, plainText } = useMemo(() => {
    if (!message) return { previewHtml: '', plainText: '' };
    return {
      previewHtml: telegramToPreviewHtml(message),
      plainText: telegramToPlainText(message)
    };
  }, [message]);

  const handleCopyReadable = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied('readable');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied('payload');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${slug}-${date}.txt`;
    // Download readable version by default
    const blob = new Blob([plainText], { type: 'text/plain' });
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Preview</h2>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            Generate a report to see the preview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 sticky top-24">
      {/* Header with toggle */}
      <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Preview</h2>
          {/* Preview mode toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              onClick={() => setPreviewMode('telegram')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                previewMode === 'telegram'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📱 Telegram
            </button>
            <button
              onClick={() => setPreviewMode('plain')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                previewMode === 'plain'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📝 Plain Text
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Preview content */}
        {previewMode === 'telegram' ? (
          <div 
            className="telegram-preview bg-gray-50 dark:bg-gray-900 p-5 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 mb-5 min-h-[300px] max-h-[600px] overflow-y-auto text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <pre className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 mb-5 min-h-[300px] max-h-[600px] overflow-y-auto text-gray-900 dark:text-gray-100">
            {plainText}
          </pre>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyReadable}
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-medium text-sm shadow-sm hover:shadow"
          >
            {copied === 'readable' ? '✓ Copied!' : '📋 Copy Readable'}
          </button>
          <button
            onClick={handleCopyPayload}
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-medium text-sm shadow-sm hover:shadow"
          >
            {copied === 'payload' ? '✓ Copied!' : '🔧 Copy Payload'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-medium text-sm shadow-sm hover:shadow"
          >
            💾 Download
          </button>
        </div>
      </div>
    </div>
  );
}
