'use client';

import React, { useState } from 'react';

interface TelegramPanelProps {
  message: string;
}

export default function TelegramPanel({ message }: TelegramPanelProps) {
  const [chatId, setChatId] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chatId: chatId || undefined }),
      });

      const data = await response.json();

      if (data.ok !== false) {
        setResult({ success: true, message: 'Message sent successfully!' });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send message' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (!message) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-2xl font-semibold text-gray-800">📱 Send to Telegram</h2>
        <span className="text-2xl">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="chatId" className="block text-sm font-medium text-gray-700 mb-2">
              Chat ID (optional - uses env default if empty)
            </label>
            <input
              id="chatId"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Leave empty to use TELEGRAM_CHAT_ID from env"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {sending ? '📤 Sending...' : '📤 Send Message'}
          </button>

          {result && (
            <div
              className={`p-4 rounded-md ${
                result.success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {result.message}
            </div>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
            <p className="font-semibold mb-2">ℹ️ Note:</p>
            <p>
              To use Telegram integration, set <code className="bg-gray-200 px-1 rounded">TELEGRAM_BOT_TOKEN</code> in your environment variables.
              You can optionally set a default <code className="bg-gray-200 px-1 rounded">TELEGRAM_CHAT_ID</code> or provide it above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
