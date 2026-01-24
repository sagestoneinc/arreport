'use client';

import React from 'react';

interface FormSectionCardProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export default function FormSectionCard({ title, children, description }: FormSectionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}
