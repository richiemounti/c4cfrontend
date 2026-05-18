// components/dashboard/SetupProgressCard.tsx
import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

interface SetupProgressCardProps {
  title: string;
  progress: number;
  isComplete: boolean;
  href: string;
  description?: string;
}

const SetupProgressCard: React.FC<SetupProgressCardProps> = ({
  title,
  progress,
  isComplete,
  href,
  description
}) => {
  return (
    <Link href={href}>
      <div className="border border-sky rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg mb-1 text-stratosphere">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mb-3">{description}</p>
            )}
          </div>
          {isComplete && (
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <div className="text-blue-600 text-sm font-medium flex items-center text-sky">
            {isComplete ? 'View Details' : 'Continue Setup'}
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SetupProgressCard;