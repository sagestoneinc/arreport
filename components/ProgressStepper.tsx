'use client';

import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
}

export default function ProgressStepper({ currentStep, totalSteps, steps }: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors duration-200 ${
              i < currentStep
                ? 'bg-primary-500 dark:bg-primary-400'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            title={steps?.[i]}
          />
        ))}
      </div>
    </div>
  );
}
