'use client';

import React from 'react';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Templates
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Build, preview, and send ops reports with a consistent format.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      </div>
    </main>
  );
}
