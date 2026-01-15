'use client';

import React, { useState } from 'react';

interface TelegramSenderProps {
  message: string;
}

export default function TelegramSender({ message }: TelegramSenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sendToTelegram = async () => {
    if (!message) {
      setStatus({ type: 'error', message: 'No message to send' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          botToken:  botToken || undefined,
          chatId: chatId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully!' });
      } else {
        setStatus({ type: 'error', message:  data.error || 'Failed to send message' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-xl font-semibold text-gray-800">📱 Send to Telegram</h3>
        <span className="text-2xl text-gray-600">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">How to get credentials:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Bot Token:</strong> Message{' '}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  @BotFather
                </a>{' '}
                on Telegram, use <code>/newbot</code>
              </li>
              <li>
                <strong>Chat ID:</strong> Message your bot, then visit{' '}
                <code className="bg-white px-1 rounded">
                  api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
                </code>
              </li>
            </ol>
            <p className="mt-2 text-xs">
              💡 Leave fields empty to use environment variables (if configured)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot Token (optional)
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Leave empty to use env variable"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat ID (optional)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Leave empty to use env variable"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={sendToTelegram}
            disabled={loading || !message}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Sending...' :  '📤 Send Message'}
          </button>

          {status && (
            <div
              className={`p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}