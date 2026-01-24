'use client';

import React, { useState } from 'react';

interface TelegramButtonProps {
  message: string;
  disabled: boolean;
}

export default function TelegramButton({ message, disabled }: TelegramButtonProps) {
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSend = async () => {
    if (disabled || !message) return;

    setSending(true);
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.ok) {
        setToast({ type: 'success', message: 'Message sent to Telegram successfully!' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to send message' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error: Failed to send message' });
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !disabled && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap">
              Send to Telegram
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-900"></div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={disabled || sending}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`w-16 h-16 rounded-full shadow-lg font-semibold transition-all duration-150 flex items-center justify-center ${
              disabled || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-accent-600 to-accent-700 text-white hover:shadow-xl hover:scale-110'
            }`}
            title={disabled ? 'Generate a report first' : 'Send to Telegram'}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
              <span className="text-2xl">📱</span>
            )}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white font-semibold max-w-md ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
