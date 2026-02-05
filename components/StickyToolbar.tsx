'use client';

import React from 'react';

interface StickyToolbarProps {
  templateName: string;
  stepLabel?: string; // e.g. "Step 2 of 3"
  completionPct?: number; // e.g. 67
  lastGeneratedAt?: string | null;
  lastSentAt?: string | null;
  generatedMessage?: string | null;

  onReset: () => void;
  onGenerate: () => void | Promise<void>;
  onSendTelegram: () => Promise<void>;

  isGenerating?: boolean;
  isSendingTelegram?: boolean;
}

export default function StickyToolbar({
  templateName,
  stepLabel,
  completionPct,
  lastGeneratedAt,
  lastSentAt,
  generatedMessage,
  onReset,
  onGenerate,
  onSendTelegram,
  onCopy,
  onDownload,
  isGenerating = false,
  isSendingTelegram = false,
}: StickyToolbarProps) {
  const canSendTelegram = !!generatedMessage;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side: Template name and progress */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {templateName}
            </span>
            {stepLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {stepLabel}
              </span>
            )}
            {completionPct !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 dark:bg-primary-400 transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {completionPct}%
                </span>
              </div>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex flex-col items-end gap-0.5">
              {lastGeneratedAt && (
                <span
                  className="text-xs text-gray-500 dark:text-gray-400"
                  aria-label={`Last generated at ${lastGeneratedAt}`}
                >
                  Generated: {lastGeneratedAt}
                </span>
              )}
              {lastSentAt && (
                <span
                  className="text-xs text-gray-500 dark:text-gray-400"
                  aria-label={`Last sent to Telegram at ${lastSentAt}`}
                >
                  Sent: {lastSentAt}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {/* Reset button - secondary */}
              <button
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Reset
              </button>
              
              {/* Generate Report button - primary indigo */}
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-6 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate Preview'
                )}
              </button>
              
              {/* Send to Telegram button - primary teal */}
              <button
                onClick={onSendTelegram}
                disabled={!canSendTelegram || isSendingTelegram}
                className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Send report to Telegram"
              >
                {isSendingTelegram ? (
                  <span className="flex items-center gap-2" aria-live="polite" aria-label="Sending to Telegram">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </span>
                ) : (
                  'Send to Telegram'
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
