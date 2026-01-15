'use client';

import React, { useState, useEffect } from 'react';
import TemplateSelector from '@/components/TemplateSelector';
import HeaderInputs from '@/components/HeaderInputs';
import DailySummaryInputs from '@/components/DailySummaryInputs';
import MidTableEditor from '@/components/MidTableEditor';
import NotesInput from '@/components/NotesInput';
import OutputPanel from '@/components/OutputPanel';
import TelegramPanel from '@/components/TelegramPanel';
import { AppState, TemplateType } from '@/lib/types';
import { DEFAULT_STATE_TEMPLATE_A, DEFAULT_STATE_TEMPLATE_B } from '@/lib/defaults';
import { formatTelegramMessage } from '@/lib/format';

const STORAGE_KEY_PREFIX = 'ar-generator-state-';

export default function Home() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE_TEMPLATE_A);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem(STORAGE_KEY_PREFIX + 'template-a');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY_PREFIX + state.templateType, JSON.stringify(state));
    }
  }, [state, isClient]);

  const handleTemplateChange = (templateType: TemplateType) => {
    // Load state for the new template from localStorage or use defaults
    const savedState = localStorage.getItem(STORAGE_KEY_PREFIX + templateType);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        setState(
          templateType === 'template-b' ? DEFAULT_STATE_TEMPLATE_B : DEFAULT_STATE_TEMPLATE_A
        );
      }
    } else {
      setState(templateType === 'template-b' ? DEFAULT_STATE_TEMPLATE_B : DEFAULT_STATE_TEMPLATE_A);
    }
    setGeneratedMessage('');
  };

  const handleGenerate = () => {
    const message = formatTelegramMessage(state);
    setGeneratedMessage(message);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 AR MID Optimization Generator
          </h1>
          <p className="text-gray-600">
            Generate Telegram-formatted Approval Rate updates for MID optimization
          </p>
        </div>

        <div className="space-y-6">
          <TemplateSelector
            selectedTemplate={state.templateType}
            onTemplateChange={handleTemplateChange}
          />

          <HeaderInputs
            dateISO={state.dateISO}
            timeHHMM={state.timeHHMM}
            threshold={state.threshold}
            onDateChange={(dateISO) => setState({ ...state, dateISO })}
            onTimeChange={(timeHHMM) => setState({ ...state, timeHHMM })}
            onThresholdChange={(threshold) => setState({ ...state, threshold })}
          />

          <DailySummaryInputs
            dailySummary={state.dailySummary}
            onDailySummaryChange={(dailySummary) => setState({ ...state, dailySummary })}
          />

          <MidTableEditor
            title="💳 VISA MIDs (up to 4)"
            mids={state.visaMids}
            threshold={state.threshold}
            maxRows={4}
            onMidsChange={(visaMids) => setState({ ...state, visaMids })}
          />

          <MidTableEditor
            title="💳 MASTERCARD MIDs (up to 5)"
            mids={state.mcMids}
            threshold={state.threshold}
            maxRows={5}
            onMidsChange={(mcMids) => setState({ ...state, mcMids })}
          />

          <NotesInput
            notes={state.notes}
            onNotesChange={(notes) => setState({ ...state, notes })}
          />

          <button
            onClick={handleGenerate}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            ✨ Generate Message
          </button>

          <OutputPanel
            message={generatedMessage}
            state={state}
            onImport={(importedState) => {
              setState(importedState);
              setGeneratedMessage('');
            }}
          />

          <TelegramPanel message={generatedMessage} />
        </div>
      </div>
    </main>
  );
}
