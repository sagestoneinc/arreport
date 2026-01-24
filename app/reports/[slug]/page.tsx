'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTemplateBySlug, MidRowData } from '@/lib/templates';
import { formatMessage } from '@/lib/formatters';
import ReportForm from '@/components/ReportForm';
import BatchRerunsForm, {
  BatchRerunsFormData,
  ProcessorSelections,
} from '@/components/BatchRerunsForm';
import ManualRebillsForm, { ManualRebillsFormData } from '@/components/ManualRebillsForm';
import Preview from '@/components/Preview';
import StickyToolbar from '@/components/StickyToolbar';
import { saveToHistory } from '@/lib/historyStorage';

const STORAGE_KEY_PREFIX = 'ar-report-';
const PROCESSOR_STORAGE_KEY_PREFIX = 'ar-processor-';

type FormDataValue = string | number | MidRowData[];

export default function ReportBuilderPage() {
  const params = useParams();
  const slug = params.slug as string;

  const template = getTemplateBySlug(slug);

  const [formData, setFormData] = useState<Record<string, FormDataValue>>({});
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Processor selections state (for batch-reruns)
  const [processorSelections, setProcessorSelections] = useState<ProcessorSelections>({
    usca: 'Revolv3',
    other: 'NS',
  });

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

    // Load lastSentAt for all templates
    const savedLastSentAt = localStorage.getItem(`lastSentAt:${slug}`);
    if (savedLastSentAt) {
      setLastSentAt(savedLastSentAt);
    }

    // Load processor selections from localStorage (for batch-reruns)
    if (slug === 'batch-reruns') {
      const savedUscaProcessor = localStorage.getItem(
        `${PROCESSOR_STORAGE_KEY_PREFIX}${slug}:processor_usca`
      );
      const savedOtherProcessor = localStorage.getItem(
        `${PROCESSOR_STORAGE_KEY_PREFIX}${slug}:processor_other`
      );

      // Initialize from template defaults if available
      const uscaDefault = template.processors?.usca?.defaultProcessor ?? 'Revolv3';
      const otherDefault = template.processors?.other?.defaultProcessor ?? 'NS';

      setProcessorSelections({
        usca: savedUscaProcessor || uscaDefault,
        other: savedOtherProcessor || otherDefault,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, template]);

  const initializeDefaults = () => {
    if (!template) return;
    const defaults: Record<string, FormDataValue> = {};
    template.fields.forEach((field) => {
      defaults[field.name] =
        field.defaultValue ?? (field.type === 'number' ? 0 : field.type === 'table' ? [] : '');
    });
    setFormData(defaults);
  };

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (isClient && Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEY_PREFIX + slug, JSON.stringify(formData));
    }
  }, [formData, slug, isClient]);

  // Save processor selections to localStorage
  useEffect(() => {
    if (isClient && slug === 'batch-reruns') {
      localStorage.setItem(
        `${PROCESSOR_STORAGE_KEY_PREFIX}${slug}:processor_usca`,
        processorSelections.usca
      );
      localStorage.setItem(
        `${PROCESSOR_STORAGE_KEY_PREFIX}${slug}:processor_other`,
        processorSelections.other
      );
    }
  }, [processorSelections, slug, isClient]);

  const handleFieldChange = (name: string, value: FormDataValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcessorChange = (sectionKey: string, value: string) => {
    setProcessorSelections((prev) => ({
      ...prev,
      [sectionKey]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!template) return;

    let message: string;
    // For batch-reruns, pass processor config
    if (slug === 'batch-reruns') {
      message = formatMessage(slug, formData, {
        mode: 'telegram',
        processorConfig: {
          uscaLabel: template.processors?.usca?.label ?? 'US/CA Declines',
          uscaProcessor: processorSelections.usca,
          otherLabel: template.processors?.other?.label ?? 'All Other Geos',
          otherProcessor: processorSelections.other,
        },
      });
    } else {
      message = formatMessage(slug, formData);
    }
    
    setGeneratedMessage(message);
    saveToHistory(slug, message);
    
    // Log to audit
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'GENERATE_REPORT',
          report_slug: slug,
          report_title: template.name,
          telegram_payload: message,
          status: 'SUCCESS',
          metadata: { formFieldCount: Object.keys(formData).length }
        })
      });
    } catch (err) {
      console.error('Failed to log audit:', err);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      initializeDefaults();
      setGeneratedMessage('');

      // Reset processor selections to defaults
      if (slug === 'batch-reruns' && template?.processors) {
        setProcessorSelections({
          usca: template.processors.usca?.defaultProcessor ?? 'Revolv3',
          other: template.processors.other?.defaultProcessor ?? 'NS',
        });
      }
    }
  };

  const handleSendTelegram = async () => {
    if (!generatedMessage) return;

    setIsSending(true);
    let success = false;
    let errorMsg: string | null = null;
    
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: generatedMessage }),
      });

      const data = await response.json();

      if (data.ok) {
        const now = new Date().toLocaleString();
        setLastSentAt(now);
        localStorage.setItem(`lastSentAt:${slug}`, now);
        setToast({ type: 'success', message: 'Sent to Telegram' });
        success = true;
      } else {
        errorMsg = data.error || 'Failed to send message';
        setToast({ type: 'error', message: errorMsg || 'Unknown error' });
      }
    } catch (error) {
      console.error('Failed to send to Telegram:', error);
      errorMsg = 'Network error: Failed to send message';
      setToast({ type: 'error', message: errorMsg });
    } finally {
      // Log to audit
      try {
        await fetch('/api/audit/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_type: 'SEND_TELEGRAM',
            report_slug: slug,
            report_title: template?.name,
            // Chat ID is obtained server-side in the audit log route
            telegram_payload: generatedMessage,
            status: success ? 'SUCCESS' : 'FAIL',
            error_message: errorMsg,
            metadata: { messageLength: generatedMessage.length }
          })
        });
      } catch (err) {
        console.error('Failed to log audit:', err);
      }
      
      setIsSending(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setToast({ type: 'success', message: 'Copied to clipboard' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setToast({ type: 'error', message: 'Failed to copy to clipboard' });
      setTimeout(() => setToast(null), 3000);
    }
  }, [generatedMessage]);

  const handleDownload = useCallback(() => {
    if (!generatedMessage) return;
    const date = new Date().toISOString().split('T')[0];
    const filename = `${slug}-${date}.txt`;
    const blob = new Blob([generatedMessage], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ type: 'success', message: `Downloaded ${filename}` });
    setTimeout(() => setToast(null), 3000);
  }, [generatedMessage, slug]);

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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:px-6 lg:px-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Templates
          </Link>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{template.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
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
                  processors={template.processors}
                  processorSelections={processorSelections}
                  onProcessorChange={handleProcessorChange}
                />
              ) : slug === 'manual-rebills' ? (
                <ManualRebillsForm
                  formData={formData as unknown as ManualRebillsFormData}
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
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white font-semibold max-w-md ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Unified Sticky Toolbar for all templates */}
      <StickyToolbar
        templateName={template.name}
        generatedMessage={generatedMessage}
        lastSentAt={lastSentAt}
        onReset={handleReset}
        onGenerate={handleGenerate}
        onSendTelegram={handleSendTelegram}
        onCopy={handleCopy}
        onDownload={handleDownload}
        isSendingTelegram={isSending}
      />
    </main>
  );
}
