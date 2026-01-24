'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-soft backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl transition-transform duration-150 group-hover:scale-110">
              📊
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">AR Report Builder</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/')
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Templates
            </Link>
            <Link
              href="/tasks"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/tasks')
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Tasks
            </Link>
          </div>

          {/* Right Side: Theme Toggle + Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
