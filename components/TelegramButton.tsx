'use client';

import React, { useState } from 'react';

interface TelegramButtonProps {
  message: string;
  disabled: boolean;
}

export default function TelegramButton({ message, disabled }: TelegramButtonProps) {
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      <button
        onClick={handleSend}
        disabled={disabled || sending}
        className={`fixed right-6 top-1/2 -translate-y-1/2 px-6 py-3 rounded-full shadow-lg font-semibold transition-all ${
          disabled || sending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
        }`}
        title={disabled ? 'Generate a report first' : 'Send to Telegram'}
      >
        {sending ? '📤 Sending...' : '📱 Send to Telegram'}
      </button>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl text-white font-semibold ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
