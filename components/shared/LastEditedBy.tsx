// components/shared/LastEditedBy.tsx
'use client';

import React from 'react';
import { User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LastEditedByProps {
  name?: string | null;
  timestamp?: string | Date | null;
  className?: string;
}

export const LastEditedBy: React.FC<LastEditedByProps> = ({ name, timestamp, className = '' }) => {
  if (!name) return null;

  let relativeTime: string | null = null;
  if (timestamp) {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      relativeTime = formatDistanceToNow(date, { addSuffix: true });
    }
  }

  return (
    <div className={`flex items-center gap-3 text-xs text-concrete-900 ${className}`}>
      <div className="flex items-center gap-1">
        <User className="w-3.5 h-3.5" />
        <span>Last edited by {name}</span>
      </div>
      {relativeTime && (
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{relativeTime}</span>
        </div>
      )}
    </div>
  );
};

export default LastEditedBy;
