'use client';

import React, { useState } from 'react';
import HeaderInputs from '@/components/HeaderInputs';
import DailySummaryInputs from '@/components/DailySummaryInputs';
import MidTableEditor from '@/components/MidTableEditor';
import NotesInput from '@/components/NotesInput';
import OutputPanel from '@/components/OutputPanel';
import TelegramPanel from '@/components/TelegramPanel';
import { AppState } from '@/lib/types';
import { DEFAULT_STATE } from '@/lib/defaults';
import { formatTelegramMessage } from '@/lib/format';

export default function Home() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [generatedMessage, setGeneratedMessage] = useState('');

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