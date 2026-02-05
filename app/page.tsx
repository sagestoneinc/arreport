'use client';

import React, { useMemo, useState } from 'react';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';

export default function Home() {
  const [query, setQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return TEMPLATES;
    return TEMPLATES.filter((template) => {
      const haystack = `${template.name} ${template.description}`.toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100">
              Templates
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Build, preview, and send ops reports with a consistent format.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-200 dark:border-gray-700 p-10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No templates match that search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
