'use client';

import React, { useState, useEffect } from 'react';
import MetricRow from './MetricRow';
import MIDSection from './MIDSection';
import OutputDisplay from './OutputDisplay';
import TelegramSender from './TelegramSender';
import { ARUpdateData, MIDData } from '@/lib/types';
import { formatMessage } from '@/lib/formatters';

const TIMEZONES = ['EST', 'CST', 'MST', 'PST', 'UTC'];

function getInitialData(): ARUpdateData {
  return {
    date: '01/15/2026',
    time: '1:00 AM',
    timezone: 'EST',
    keyAction: 'Example:  shifted traffic away from low AR MIDs',
    dailySummary: {
      overall: { sales: 0, declines:  0 },
      visa: { sales: 0, declines: 0 },
      mc: { sales: 0, declines: 0 },
    },
    hourlyUpdate: {
      overall: { sales: 0, declines: 0 },
      visa: { sales: 0, declines:  0 },
      mc:  { sales: 0, declines: 0 },
    },
    visaTopMids: [
      { id: 'vtm1', midName: 'CS_395', sales: 49, declines: 10 },
      { id: 'vtm2', midName:  'CS_394', sales: 100, declines: 29 },
    ],
    visaWorstMids: [
      { id: 'vwm1', midName: 'CS_394', sales: 100, declines: 29 },
      { id: 'vwm2', midName: 'CS_395', sales: 49, declines: 10 },
    ],
    mastercardTopMids: [],
    mastercardWorstMids: [],
  };
}

export default function ARUpdateForm() {
  const [data, setData] = useState<ARUpdateData>(getInitialData());
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Format date for input field (YYYY-MM-DD)
  const getDateInputValue = () => {
    const [month, day, year] = data. date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Format time for input field (HH:mm)
  const getTimeInputValue = () => {
    const [time, period] = data.time.split(' ');
    let [hours, minutes] = time. split(':');
    let hourNum = parseInt(hours);

    if (period === 'PM' && hourNum !== 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;

    return `${hourNum.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleDateChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e. target.value.split('-');
    setData({ ...data, date: `${month}/${day}/${year}` });
  };

  const handleTimeChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target. value.split(':');
    let hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';

    if (hourNum === 0) hourNum = 12;
    else if (hourNum > 12) hourNum -= 12;

    setData({ ...data, time: `${hourNum}:${minutes} ${period}` });
  };

  const handleGenerate = () => {
    const message = formatMessage(data);
    setGeneratedMessage(message);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data and reset to demo values?')) {
      setData(getInitialData());
      setGeneratedMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📅 Update Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={getDateInputValue()}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={getTimeInputValue()}
              onChange={handleTimeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={data.timezone}
              onChange={(e) => setData({ ...data, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Key Action</label>
          <textarea
            value={data.keyAction}
            onChange={(e) => setData({ ...data, keyAction: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the key action taken..."
          />
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📊 Daily Summary</h2>
        <div className="space-y-4">
          <MetricRow
            label="Overall"
            sales={data.dailySummary. overall.sales}
            declines={data.dailySummary. overall.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                dailySummary: {
                  ...data.dailySummary,
                  overall: { ...data.dailySummary.overall, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                dailySummary: {
                  ...data.dailySummary,
                  overall:  { ...data.dailySummary.overall, declines: value },
                },
              })
            }
            isOverall
          />
          <MetricRow
            label="VISA"
            sales={data. dailySummary.visa.sales}
            declines={data. dailySummary.visa.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                dailySummary: {
                  ...data.dailySummary,
                  visa: { ... data.dailySummary.visa, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                dailySummary: {
                  ...data.dailySummary,
                  visa: { ...data.dailySummary.visa, declines: value },
                },
              })
            }
          />
          <MetricRow
            label="MC"
            sales={data.dailySummary. mc.sales}
            declines={data.dailySummary. mc.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                dailySummary:  {
                  ...data.dailySummary,
                  mc: { ...data.dailySummary.mc, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                dailySummary: {
                  ...data.dailySummary,
                  mc: { ... data.dailySummary.mc, declines: value },
                },
              })
            }
          />
        </div>
      </div>

      {/* Hourly Update */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">⏰ Hourly Update</h2>
        <div className="space-y-4">
          <MetricRow
            label="Overall"
            sales={data.hourlyUpdate.overall.sales}
            declines={data. hourlyUpdate.overall.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ... data.hourlyUpdate,
                  overall: { ...data.hourlyUpdate.overall, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ...data.hourlyUpdate,
                  overall: { ...data.hourlyUpdate.overall, declines: value },
                },
              })
            }
            isOverall
          />
          <MetricRow
            label="VISA"
            sales={data. hourlyUpdate.visa.sales}
            declines={data.hourlyUpdate.visa.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ...data.hourlyUpdate,
                  visa: { ...data.hourlyUpdate.visa, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ...data.hourlyUpdate,
                  visa: { ...data. hourlyUpdate.visa, declines: value },
                },
              })
            }
          />
          <MetricRow
            label="MC"
            sales={data.hourlyUpdate.mc.sales}
            declines={data. hourlyUpdate.mc.declines}
            onSalesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ... data.hourlyUpdate,
                  mc: { ...data.hourlyUpdate.mc, sales: value },
                },
              })
            }
            onDeclinesChange={(value) =>
              setData({
                ...data,
                hourlyUpdate: {
                  ...data.hourlyUpdate,
                  mc: { ...data.hourlyUpdate.mc, declines: value },
                },
              })
            }
          />
        </div>
      </div>

      {/* MID Sections */}
      <MIDSection
        title="VISA — Top MIDs"
        mids={data.visaTopMids}
        onMidsChange={(mids) => setData({ ...data, visaTopMids: mids })}
      />

      <MIDSection
        title="VISA — Worst MIDs"
        mids={data.visaWorstMids}
        onMidsChange={(mids) => setData({ ...data, visaWorstMids:  mids })}
      />

      <MIDSection
        title="MASTERCARD — Top MIDs"
        mids={data.mastercardTopMids}
        onMidsChange={(mids) => setData({ ...data, mastercardTopMids: mids })}
      />

      <MIDSection
        title="MASTERCARD — Worst MIDs"
        mids={data. mastercardWorstMids}
        onMidsChange={(mids) => setData({ ...data, mastercardWorstMids: mids })}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleGenerate}
          className="flex-1 min-w-[200px] px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
        >
          ✨ Generate Message
        </button>
        <button
          onClick={handleClear}
          className="px-8 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-lg shadow-lg"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Output */}
      {generatedMessage && (
        <>
          <OutputDisplay message={generatedMessage} />
          <TelegramSender message={generatedMessage} />
        </>
      )}
    </div>
  );
}