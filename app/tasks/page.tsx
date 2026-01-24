'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/taskTypes';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');
  const [chatFilter, setChatFilter] = useState<string>('all');
  const [chats, setChats] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, chatFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (chatFilter !== 'all') {
        params.append('chat_id', chatFilter);
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
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'open' ? 'done' : 'open';
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const exportOpenTasks = () => {
    const openTasks = tasks.filter((task) => task.status === 'open');
    const text = openTasks.map((task) => `- ${task.description}`).join('\n');

    navigator.clipboard.writeText(text);
    alert('Open tasks copied to clipboard!');
  };

  const downloadOpenTasks = () => {
    const openTasks = tasks.filter((task) => task.status === 'open');
    const text = openTasks.map((task) => `- ${task.description}`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openTasksCount = tasks.filter((task) => task.status === 'open').length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Tasks</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Collected from Telegram • {openTasksCount} open{' '}
            {tasks.length > openTasksCount && `• ${tasks.length - openTasksCount} done`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'done')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              >
                <option value="all">All Tasks</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Chat
              </label>
              <select
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
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
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Export
              </label>
              <div className="flex gap-3">
                <button
                  onClick={exportOpenTasks}
                  disabled={openTasksCount === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition-all duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOpenTasks}
                  disabled={openTasksCount === 0}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No tasks found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Tasks will appear here when you post them in Telegram
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all ${
                  task.status === 'done' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-150 ${
                          task.status === 'done'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.status === 'done' && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === 'done'
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {task.description}
                      </h3>
                    </div>

                    <div className="ml-9 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-semibold">From:</span>{' '}
                        {task.name || task.username || 'Unknown'}
                        {task.username && ` (@${task.username})`}
                      </p>
                      <p>
                        <span className="font-semibold">Chat:</span>{' '}
                        {task.chat_title || `Chat ${task.chat_id}`}
                      </p>
                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                    title="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
