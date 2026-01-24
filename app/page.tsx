import React from 'react';
import Link from 'next/link';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">📊 AR Report Template Builder</h1>
          <p className="text-xl text-gray-600">Choose a report template to get started</p>
          
          <div className="mt-6">
            <Link
              href="/tasks"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 font-medium"
            >
              📋 View Tasks
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      </div>
    </main>
  );
}
