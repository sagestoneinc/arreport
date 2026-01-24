'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskSource } from '@/lib/taskTypes';

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {message}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: TaskStatus }) {
  const styles = {
    open: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    done: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  };

  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    done: 'Done',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Source icon component
function SourceIcon({ source }: { source: TaskSource }) {
  if (source === 'telegram') {
    return (
      <span className="text-sm" title="From Telegram">
        📱
      </span>
    );
  }
  return (
    <span className="text-sm" title="From Web">
      🌐
    </span>
  );
}

// Task card component
function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onDelete: (task: Task) => void;
}) {
  const createdTime = new Date(task.created_at);
  const formattedTime = createdTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-700 p-5 transition-all duration-150 ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Status checkbox/button */}
        <div className="flex-shrink-0 pt-0.5">
          <button
            onClick={() => onStatusChange(task, task.status === 'done' ? 'open' : 'done')}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
              task.status === 'done'
                ? 'bg-green-500 border-green-500'
                : task.status === 'in_progress'
                  ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            }`}
            title={task.status === 'done' ? 'Mark as open' : 'Mark as done'}
          >
            {task.status === 'done' && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {task.status === 'in_progress' && (
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`text-base font-semibold leading-snug ${
                task.status === 'done'
                  ? 'text-gray-500 dark:text-gray-400 line-through'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={task.status} />
              <SourceIcon source={task.source} />
            </div>
          </div>

          {task.description && task.description !== task.title && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{formattedTime}</span>
            <span>by {task.created_by || task.username || task.name || 'Unknown'}</span>
            {task.chat_title && <span className="hidden sm:inline">• {task.chat_title}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {task.status !== 'in_progress' && task.status !== 'done' && (
            <button
              onClick={() => onStatusChange(task, 'in_progress')}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150"
              title="Mark In Progress"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => onStatusChange(task, 'done')}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-150"
              title="Mark Done"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(task)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Date group header component
function DateGroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{label}</h2>
      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
        {count}
      </span>
    </div>
  );
}

// Group tasks by date
function groupTasksByDate(tasks: Task[]): { today: Task[]; yesterday: Task[]; older: Task[] } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const today: Task[] = [];
  const yesterday: Task[] = [];
  const older: Task[] = [];

  for (const task of tasks) {
    const taskDate = new Date(task.created_at);
    if (taskDate >= todayStart) {
      today.push(task);
    } else if (taskDate >= yesterdayStart) {
      yesterday.push(task);
    } else {
      older.push(task);
    }
  }

  return { today, yesterday, older };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | TaskSource>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chats, setChats] = useState<Array<{ id: string; title: string }>>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (chatFilter !== 'all') {
        params.append('chat_id', chatFilter);
      }
      if (sourceFilter !== 'all') {
        params.append('source', sourceFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();

      if (data.ok) {
        setTasks(data.tasks);

        // Extract unique chats
        const uniqueChats = new Map<string, string>();
        data.tasks.forEach((task: Task) => {
          if (!uniqueChats.has(task.chat_id)) {
            uniqueChats.set(task.chat_id, task.chat_title || `Chat ${task.chat_id}`);
          }
        });

        setChats(Array.from(uniqueChats.entries()).map(([id, title]) => ({ id, title })));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, chatFilter, sourceFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounced search - fetchTasks is stable due to useCallback with its deps
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const updateTaskStatus = useCallback(async (task: Task, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const statusLabels: Record<TaskStatus, string> = {
          open: 'Reopened',
          in_progress: 'In progress',
          done: 'Completed',
        };
        showToast(`Task ${statusLabels[newStatus].toLowerCase()}`, 'success');
      } else {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
        );
        showToast('Failed to update task', 'error');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      showToast('Failed to update task', 'error');
    }
  }, [showToast]);

  const deleteTask = useCallback(async (task: Task) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Task deleted', 'success');
      } else {
        // Revert on failure
        setTasks((prev) => [...prev, task].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
        showToast('Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert on failure
      setTasks((prev) => [...prev, task].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      showToast('Failed to delete task', 'error');
    }
  }, [showToast]);

  const exportOpenTasks = useCallback(() => {
    const openTasks = tasks.filter((task) => task.status === 'open');
    const text = openTasks.map((task) => `- ${task.title}`).join('\n');

    navigator.clipboard.writeText(text);
    showToast('Open tasks copied to clipboard!', 'success');
  }, [tasks, showToast]);

  const downloadOpenTasks = useCallback(() => {
    const openTasks = tasks.filter((task) => task.status === 'open');
    const text = openTasks.map((task) => `- ${task.title}`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  const groupedTasks = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const openTasksCount = useMemo(() => tasks.filter((task) => task.status === 'open').length, [tasks]);
  const inProgressCount = useMemo(() => tasks.filter((task) => task.status === 'in_progress').length, [tasks]);
  const doneCount = useMemo(() => tasks.filter((task) => task.status === 'done').length, [tasks]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tasks</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {openTasksCount} open
            </span>
            {inProgressCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {inProgressCount} in progress
              </span>
            )}
            {doneCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {doneCount} done
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as 'all' | TaskSource)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              >
                <option value="all">All</option>
                <option value="telegram">📱 Telegram</option>
                <option value="web">🌐 Web</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Chat
              </label>
              <select
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              >
                <option value="all">All Chats</option>
                {chats.map((chat) => (
                  <option key={chat.id} value={chat.id}>
                    {chat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Export
              </label>
              <div className="flex gap-2">
                <button
                  onClick={exportOpenTasks}
                  disabled={openTasksCount === 0}
                  className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOpenTasks}
                  disabled={openTasksCount === 0}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
              {statusFilter === 'open' ? 'No open tasks!' : 'No tasks found'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {statusFilter === 'open'
                ? "You're all caught up. Great job!"
                : 'Tasks will appear here when you post them in Telegram'}
            </p>
          </div>
        ) : (
          <div>
            {groupedTasks.today.length > 0 && (
              <div>
                <DateGroupHeader label="Today" count={groupedTasks.today.length} />
                <div className="space-y-3">
                  {groupedTasks.today.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.yesterday.length > 0 && (
              <div>
                <DateGroupHeader label="Yesterday" count={groupedTasks.yesterday.length} />
                <div className="space-y-3">
                  {groupedTasks.yesterday.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedTasks.older.length > 0 && (
              <div>
                <DateGroupHeader label="Older" count={groupedTasks.older.length} />
                <div className="space-y-3">
                  {groupedTasks.older.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
