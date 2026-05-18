// components/setup/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  label?: string;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  label
}: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Define height based on size
  const getHeight = (): string => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'md': return 'h-4';
      case 'lg': return 'h-6';
      default: return 'h-4';
    }
  };
  
  // Define color classes
  const getColorClass = (): string => {
    switch (color) {
      case 'primary': return 'bg-primary-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-primary-500';
    }
  };

  // Define text size
  const getTextSize = (): string => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={`${getTextSize()} font-medium text-gray-700`}>{label}</span>
          {showPercentage && (
            <span className={`${getTextSize()} text-gray-500`}>{Math.round(normalizedProgress)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full ${getHeight()} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`${getColorClass()} ${getHeight()} rounded-full transition-all duration-300 ease-in-out`} 
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      
      {!label && showPercentage && (
        <div className="mt-1 text-right">
          <span className={`${getTextSize()} text-gray-500`}>{Math.round(normalizedProgress)}%</span>
        </div>
      )}
    </div>
  );
}