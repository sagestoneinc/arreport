'use client';

import React, { useEffect, useState } from 'react';
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
  'xshield-hourly-approval': '🛡️',
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const icon = iconMap[template.slug] || '📄';
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`lastSentAt:${template.slug}`);
    if (stored) setLastSentAt(stored);
  }, [template.slug]);

  return (
    <div className="group flex h-full flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-card transition-all duration-150 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-2xl">{icon}</div>
          <div className="min-w-0">
            <Link
              href={`/reports/${template.slug}`}
              className="block text-lg font-semibold text-gray-900 dark:text-gray-100 truncate hover:text-gray-700 dark:hover:text-gray-200"
            >
              {template.name}
            </Link>
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Template
            </span>
          </div>
        </div>
        <Link
          href={`/reports/${template.slug}`}
          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Open
        </Link>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {template.description}
      </p>

      {lastSentAt && (
        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Last sent: {lastSentAt}
        </p>
      )}
    </div>
  );
}
