'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HistoryEntry, getHistory, deleteHistoryEntry, clearHistory } from '@/lib/historyStorage';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHistory(getHistory());
  }, []);

  const handleCopy = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = (id: string) => {
    const updatedHistory = deleteHistoryEntry(id);
    setHistory(updatedHistory);
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
      setSelectedEntry(null);
    }
  };

  const handleSendToTelegram = async (message: string) => {
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
        alert('Message sent to Telegram successfully!');
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch {
      alert('Network error: Failed to send message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading history...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Report History
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              View and resend previously generated reports • {history.length} report
              {history.length !== 1 ? 's' : ''}
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-16 text-center">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No reports in history
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2 mb-6">
              Generated reports will appear here automatically
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:from-primary-700 hover:to-accent-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Create a Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="lg:col-span-1 space-y-3">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border transition-all p-4 ${
                    selectedEntry?.id === entry.id
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20'
                      : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {entry.templateName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(entry.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 font-mono">
                        {entry.message.substring(0, 100)}...
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              {selectedEntry ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 sticky top-24">
                  <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedEntry.templateName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(selectedEntry.createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/reports/${selectedEntry.slug}`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Open Template →
                    </Link>
                  </div>
                  <div className="p-6">
                    <pre className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg text-sm whitespace-pre-wrap font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 mb-5 min-h-[300px] max-h-[500px] overflow-y-auto text-gray-900 dark:text-gray-100">
                      {selectedEntry.message}
                    </pre>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(selectedEntry.message)}
                        className="flex-1 px-5 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-semibold shadow-sm hover:shadow"
                      >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                      <button
                        onClick={() => handleSendToTelegram(selectedEntry.message)}
                        className="flex-1 px-5 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-lg hover:from-accent-700 hover:to-accent-800 transition-all duration-150 font-semibold shadow-md hover:shadow-lg"
                      >
                        📱 Send to Telegram
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
                  <div className="text-5xl mb-4">👈</div>
                  <p className="text-gray-500 dark:text-gray-400 text-base">
                    Select a report from the list to preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
