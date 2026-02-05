'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry, AuditActionType, AuditStatus } from '@/lib/auditTypes';

// Status badge component
function StatusBadge({ status }: { status: AuditStatus }) {
  const styles = {
    SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    FAIL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

// Action type badge component
function ActionBadge({ action }: { action: AuditActionType }) {
  const styles: Record<AuditActionType, string> = {
    GENERATE_REPORT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    SEND_TELEGRAM: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    TASK_CREATE: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    TASK_UPDATE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  };
  
  const labels: Record<AuditActionType, string> = {
    GENERATE_REPORT: '📄 Generate',
    SEND_TELEGRAM: '📱 Telegram',
    TASK_CREATE: '✨ Task Create',
    TASK_UPDATE: '📝 Task Update',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${styles[action]}`}>
      {labels[action]}
    </span>
  );
}

// Payload modal component
function PayloadModal({ 
  entry, 
  onClose 
}: { 
  entry: AuditLogEntry; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (entry.telegram_payload_full) {
      await navigator.clipboard.writeText(entry.telegram_payload_full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Payload Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Metadata */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Action:</span>
              <ActionBadge action={entry.action_type} />
            </div>
            {entry.report_slug && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Report: </span>
                <span className="text-gray-900 dark:text-gray-100">{entry.report_title || entry.report_slug}</span>
              </div>
            )}
            {entry.telegram_chat_id && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Chat ID: </span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{entry.telegram_chat_id}</span>
              </div>
            )}
            {entry.payload_hash && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Hash: </span>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{entry.payload_hash.substring(0, 16)}...</span>
              </div>
            )}
          </div>
          
          {/* Preview */}
          {entry.telegram_message_preview && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                {entry.telegram_message_preview}
              </div>
            </div>
          )}
          
          {/* Full Payload */}
          {entry.telegram_payload_full && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Payload</h4>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                {entry.telegram_payload_full}
              </div>
            </div>
          )}
          
          {/* Error message */}
          {entry.error_message && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Error</h4>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
                {entry.error_message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [reportFilter, setReportFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Filter options
  const [users, setUsers] = useState<string[]>([]);
  const [reportSlugs, setReportSlugs] = useState<string[]>([]);

  // Fetch filter options
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [usersRes, slugsRes] = await Promise.all([
          fetch('/api/audit?meta=users'),
          fetch('/api/audit?meta=report_slugs')
        ]);
        
        const usersData = await usersRes.json();
        const slugsData = await slugsRes.json();
        
        if (usersData.ok) setUsers(usersData.users);
        if (slugsData.ok) setReportSlugs(slugsData.reportSlugs);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthRequired(false);
    setTimedOut(false);
    
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action_type', actionFilter);
      if (userFilter) params.set('user_email', userFilter);
      if (reportFilter) params.set('report_slug', reportFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      
      const response = await fetch(`/api/audit?${params.toString()}`);

      if (response.status === 401 || response.status === 403) {
        setAuthRequired(true);
        setLogs([]);
        return;
      }

      const data = await response.json();

      if (data.ok) {
        setLogs(data.logs);
      } else {
        setError(data.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, userFilter, reportFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Audit Log
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track who sent what reports, when, and to which channels.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Actions</option>
                <option value="GENERATE_REPORT">Generate Report</option>
                <option value="SEND_TELEGRAM">Send to Telegram</option>
                <option value="TASK_CREATE">Task Create</option>
                <option value="TASK_UPDATE">Task Update</option>
              </select>
            </div>
            
            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User
              </label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            
            {/* Report Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report
              </label>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Reports</option>
                {reportSlugs.map(slug => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAIL">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading audit logs...</p>
              {timedOut && (
                <div className="mt-6 inline-flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Taking longer than usual.
                  </p>
                  <button
                    onClick={fetchLogs}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ) : authRequired ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <p className="text-gray-600 dark:text-gray-300 text-base font-medium mb-2">
                Sign in to view audit logs
              </p>
              <button
                onClick={() => (window.location.href = '/login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Sign in
              </button>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={fetchLogs}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 dark:text-gray-400 text-base">No audit logs found.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Logs will appear here when reports are generated or sent to Telegram.
              </p>
            </div>
          ) : (
            <div>
              <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(log.created_at)}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionBadge action={log.action_type} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {log.report_slug || '—'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {log.user_email || '—'}
                    </div>
                    {(log.telegram_message_preview || log.telegram_payload_full) && (
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        View Payload
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Report</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Chat ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {log.user_email || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ActionBadge action={log.action_type} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {log.report_slug || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {log.telegram_chat_id || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {(log.telegram_message_preview || log.telegram_payload_full) && (
                            <button
                              onClick={() => setSelectedEntry(log)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              View Payload
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payload Modal */}
      {selectedEntry && (
        <PayloadModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </main>
  );
}
