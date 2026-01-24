'use client';

import React from 'react';
import Link from 'next/link';
import { TemplateDefinition } from '@/lib/templates';

interface TemplateCardProps {
  template: TemplateDefinition;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      href={`/reports/${template.slug}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
      <p className="text-gray-600">{template.description}</p>
      <div className="mt-4 text-blue-600 font-semibold flex items-center">
        Open Builder
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
