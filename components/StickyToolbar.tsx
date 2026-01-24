'use client';

import React from 'react';

interface StickyToolbarProps {
  templateName: string;
  currentStep?: number;
  totalSteps?: number;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating?: boolean;
  onSendTelegram?: () => void;
  canSend?: boolean;
  isSending?: boolean;
  lastSentAt?: string | null;
}

export default function StickyToolbar({
  templateName,
  currentStep,
  totalSteps,
  onGenerate,
  onReset,
  isGenerating = false,
  onSendTelegram,
  canSend = false,
  isSending = false,
  lastSentAt,
}: StickyToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side: Template name and progress */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {templateName}
            </span>
            {currentStep && totalSteps && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-4 rounded-full transition-colors ${
                        i < currentStep
                          ? 'bg-primary-500 dark:bg-primary-400'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Last sent timestamp */}
            {lastSentAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400" aria-label={`Last sent to Telegram at ${lastSentAt}`}>
                Last sent: {lastSentAt}
              </span>
            )}
            
            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Reset
              </button>
              
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isGenerating ? 'Generating...' : '✨ Generate Report'}
              </button>
              
              {onSendTelegram && (
                <button
                  onClick={onSendTelegram}
                  disabled={!canSend || isSending}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-accent-600 to-accent-700 rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-500"
                  aria-label="Send report to Telegram"
                >
                  {isSending ? (
                    <span className="flex items-center gap-2" aria-live="polite" aria-label="Sending to Telegram">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Sending...
                    </span>
                  ) : (
                    '📱 Send to Telegram'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
