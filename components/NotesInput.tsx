'use client';

import React from 'react';

interface NotesInputProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function NotesInput({ notes, onNotesChange }: NotesInputProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">📝 Notes / Action Taken</h2>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter optimization notes, routing changes, or monitoring actions here."
      />
    </div>
  );
}
