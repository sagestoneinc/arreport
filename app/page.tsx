import React from 'react';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Report Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose a template to start building your report
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      </div>
    </main>
  );
}
