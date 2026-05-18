// components/stakeholders/RatingScale.tsx
'use client';

import { useState } from 'react';

interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  prompt: string;
  min?: number;
  max?: number;
}

const RatingScale = ({ 
  value, 
  onChange, 
  minLabel, 
  maxLabel, 
  prompt,
  min = 1,
  max = 5 
}: RatingScaleProps) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  const displayValue = hoveredValue !== null ? hoveredValue : value;
  const percentage = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-stratosphere">
        {prompt}
      </label>
      
      {/* Scale Container */}
      <div className="relative px-2 py-6">
        {/* Background Track */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 bg-concrete-100 rounded-full">
          {/* Active Track */}
          <div 
            className="absolute h-full bg-gradient-to-r from-clay-400 via-ochre-400 to-grass-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Rating Points */}
        <div className="relative flex justify-between items-center">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((pointValue) => {
            const isActive = pointValue <= displayValue;
            const isCurrent = pointValue === displayValue;
            
            return (
              <button
                key={pointValue}
                type="button"
                onClick={() => onChange(pointValue)}
                onMouseEnter={() => setHoveredValue(pointValue)}
                onMouseLeave={() => setHoveredValue(null)}
                className={`
                  relative z-10 w-10 h-10 rounded-full transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-gradient-to-br from-stratosphere to-sky-500 shadow-lg scale-110' 
                    : 'bg-white border-2 border-concrete-300 hover:border-sky-400'
                  }
                  ${isCurrent ? 'ring-4 ring-sky-200 scale-125' : 'hover:scale-110'}
                  focus:outline-none focus:ring-4 focus:ring-sky-200
                `}
                aria-label={`Rate ${pointValue} out of ${max}`}
              >
                {isActive && (
                  <span className="text-white font-semibold text-sm">
                    {pointValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Current Value Display */}
        <div 
          className="absolute -top-12 transition-all duration-300 ease-out"
          style={{ 
            left: `${percentage}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-stratosphere text-white px-4 py-2 rounded-lg shadow-lg font-bold text-lg">
            {displayValue}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-stratosphere" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-600 px-2 mt-2">
        <span className="text-left max-w-[40%]">{minLabel}</span>
        <span className="text-right max-w-[40%]">{maxLabel}</span>
      </div>
    </div>
  );
};

export default RatingScale;