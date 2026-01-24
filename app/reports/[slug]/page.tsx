'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTemplateBySlug, MidRowData } from '@/lib/templates';
import { formatMessage } from '@/lib/formatters';
import ReportForm from '@/components/ReportForm';
import BatchRerunsForm, { BatchRerunsFormData } from '@/components/BatchRerunsForm';
import Preview from '@/components/Preview';
import TelegramButton from '@/components/TelegramButton';

const STORAGE_KEY_PREFIX = 'ar-report-';

type FormDataValue = string | number | MidRowData[];

export default function ReportBuilderPage() {
  const params = useParams();
  const slug = params.slug as string;

  const template = getTemplateBySlug(slug);

  const [formData, setFormData] = useState<Record<string, FormDataValue>>({});
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Initialize form data with defaults
  useEffect(() => {
    if (!template) return;

    setIsClient(true);

    // Try to load from localStorage
    const savedData = localStorage.getItem(STORAGE_KEY_PREFIX + slug);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, template]);

  const initializeDefaults = () => {
    if (!template) return;
    const defaults: Record<string, FormDataValue> = {};
    template.fields.forEach((field) => {
      defaults[field.name] = field.defaultValue ?? (field.type === 'number' ? 0 : field.type === 'table' ? [] : '');
    });
    setFormData(defaults);
  };

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (isClient && Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEY_PREFIX + slug, JSON.stringify(formData));
    }
  }, [formData, slug, isClient]);

  const handleFieldChange = (name: string, value: FormDataValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = () => {
    if (!template) return;
    const message = formatMessage(slug, formData);
    setGeneratedMessage(message);
  };

  if (!template) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-6xl mb-6">😞</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Template Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            The requested template does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:from-primary-700 hover:to-accent-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Templates
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {template.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{template.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              {slug === 'batch-reruns' ? (
                <BatchRerunsForm
                  formData={formData as unknown as BatchRerunsFormData}
                  onChange={handleFieldChange}
                  onGenerate={handleGenerate}
                />
              ) : (
                <ReportForm
                  fields={template.fields}
                  formData={formData}
                  onChange={handleFieldChange}
                  onGenerate={handleGenerate}
                />
              )}
            </div>
          </div>

          {/* Preview Section - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <Preview message={generatedMessage} slug={slug} />
          </div>
        </div>

        <TelegramButton message={generatedMessage} disabled={!generatedMessage} />
      </div>
    </main>
  );
}
