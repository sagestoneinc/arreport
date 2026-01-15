'use client';

import React from 'react';

interface HeaderInputsProps {
  dateISO: string;
  timeHHMM: string;
  threshold: number;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onThresholdChange: (threshold: number) => void;
}

export default function HeaderInputs({
  dateISO,
  timeHHMM,
  threshold,
  onDateChange,
  onTimeChange,
  onThresholdChange,
}: HeaderInputsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">📅 Report Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Report Date
          </label>
          <input
            id="date"
            type="date"
            value={dateISO}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Hour (EST)
          </label>
          <input
            id="time"
            type="time"
            value={timeHHMM}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
            Performing AR Threshold (%)
          </label>
          <input
            id="threshold"
            type="number"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
