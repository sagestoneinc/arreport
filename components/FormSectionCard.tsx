'use client';

import React from 'react';

interface FormSectionCardProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  icon?: string;
}

export default function FormSectionCard({ title, children, description, icon }: FormSectionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}
