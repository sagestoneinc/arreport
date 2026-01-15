'use client';

import React from 'react';
import MIDRow from './MIDRow';
import { MIDData } from '@/lib/types';

interface MIDSectionProps {
  title: string;
  mids: MIDData[];
  onMidsChange: (mids: MIDData[]) => void;
}

export default function MIDSection({ title, mids, onMidsChange }: MIDSectionProps) {
  const addMID = () => {
    const newMID: MIDData = {
      id: `mid-${Date.now()}`,
      midName: '',
      sales:  0,
      declines:  0,
    };
    onMidsChange([...mids, newMID]);
  };

  const updateMID = (index: number, updatedMID: MIDData) => {
    const newMids = [...mids];
    newMids[index] = updatedMID;
    onMidsChange(newMids);
  };

  const removeMID = (index: number) => {
    onMidsChange(mids.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <button
          onClick={addMID}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add MID
        </button>
      </div>
      <div className="space-y-3">
        {mids.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No MIDs added. Click &quot;Add MID&quot; to get started.
          </div>
        ) : (
          mids.map((mid, index) => (
            <MIDRow
              key={mid.id}
              mid={mid}
              onUpdate={(updatedMID) => updateMID(index, updatedMID)}
              onRemove={() => removeMID(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}