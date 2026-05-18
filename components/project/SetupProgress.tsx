// components/project/SetupProgress.tsx
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface SetupProgressProps {
  progress: number;
  isComplete: boolean;
}

const SetupProgress: React.FC<SetupProgressProps> = ({ progress, isComplete }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Setup Progress</h3>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {isComplete && (
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Setup complete
        </div>
      )}
    </div>
  );
};

export default SetupProgress;