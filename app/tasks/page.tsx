'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        
        setChats(
          Array.from(uniqueChats.entries()).map(([id, title]) => ({ id, title }))
        );
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
    const text = openTasks
      .map((task) => `- ${task.description}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    alert('Open tasks copied to clipboard!');
  };

  const downloadOpenTasks = () => {
    const openTasks = tasks.filter((task) => task.status === 'open');
    const text = openTasks
      .map((task) => `- ${task.description}`)
      .join('\n');
    
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Tasks</h1>
            <p className="text-gray-600">
              Collected from Telegram • {openTasksCount} open{' '}
              {tasks.length > openTasksCount && `• ${tasks.length - openTasksCount} done`}
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'done')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chat
              </label>
              <select
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export
              </label>
              <div className="flex gap-2">
                <button
                  onClick={exportOpenTasks}
                  disabled={openTasksCount === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy Open
                </button>
                <button
                  onClick={downloadOpenTasks}
                  disabled={openTasksCount === 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 mt-2">
              Tasks will appear here when you post them in Telegram
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  task.status === 'done' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
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
                        className={`text-lg font-medium ${
                          task.status === 'done'
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.description}
                      </h3>
                    </div>

                    <div className="ml-9 space-y-1 text-sm text-gray-500">
                      <p>
                        <span className="font-medium">From:</span> {task.name || task.username || 'Unknown'}
                        {task.username && ` (@${task.username})`}
                      </p>
                      <p>
                        <span className="font-medium">Chat:</span> {task.chat_title || `Chat ${task.chat_id}`}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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
