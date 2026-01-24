'use client';

import React from 'react';
import Link from 'next/link';
import { TemplateDefinition } from '@/lib/templates';

interface TemplateCardProps {
  template: TemplateDefinition;
}

const iconMap: Record<string, string> = {
  'batch-reruns': '🔄',
  'manual-rebills': '💳',
  'mint-additional-sales': '💰',
  'hourly-approval-rate': '📈',
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const icon = iconMap[template.slug] || '📄';

  return (
    <Link
      href={`/reports/${template.slug}`}
      className="group block bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-150 ease-in-out p-8 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-4xl mb-4">{icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-accent-600 transition-colors">
            {template.name}
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">{template.description}</p>
        </div>
        <div className="ml-4 text-gray-400 group-hover:text-accent-500 transition-all duration-150 group-hover:translate-x-1">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
