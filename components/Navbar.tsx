'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl transition-transform duration-150 group-hover:scale-110">
              📊
            </div>
            <span className="text-xl font-bold text-gray-900">AR Report Builder</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/')
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Templates
            </Link>
            <Link
              href="/tasks"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/tasks')
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Tasks
            </Link>
          </div>

          {/* Profile Icon */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
