// components/stakeholders/ReviewStatusBadge.tsx - FULLY ENHANCED
'use client';

import React, { useState } from 'react';
import { ReviewStatus } from '@/types';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface ReviewStatusBadgeProps {
  status: ReviewStatus | null;
  loading?: boolean;
  compact?: boolean;
  showIcon?: boolean;
  onClick?: (e:any) => void;
  showTooltip?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  unresolvedIssuesCount?: number;
  reviewId?: string;
}

const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({ 
  status, 
  loading = false,
  compact = false,
  showIcon = true,
  onClick,
  showTooltip = true,
  priority,
  unresolvedIssuesCount = 0,
  reviewId
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-concrete-100 rounded text-xs">
        <Loader2 className="w-3 h-3 animate-spin text-concrete-900" />
        {!compact && <span className="text-concrete-900">Loading...</span>}
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusConfig = (status: ReviewStatus) => {
    const configs: Record<ReviewStatus, {
      color: string;
      hoverColor: string;
      icon: React.ReactNode;
      label: string;
      description: string;
    }> = {
      pending: {
        color: 'bg-ochre-50 text-ochre-900 border border-ochre-100',
        hoverColor: 'hover:bg-ochre-100 hover:border-ochre-200',
        icon: <Clock className="w-3 h-3" />,
        label: 'Pending',
        description: 'Waiting for review to start'
      },
      in_review: {
        color: 'bg-sky-50 text-sky-500 border border-sky-100',
        hoverColor: 'hover:bg-sky-100 hover:border-sky-200',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'In Review',
        description: 'Currently being reviewed'
      },
      approved: {
        color: 'bg-grass-50 text-grass-900 border border-grass-100',
        hoverColor: 'hover:bg-grass-100 hover:border-grass-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Approved',
        description: 'Review has been approved'
      },
      escalated: {
        color: 'bg-sand-50 text-sand-900 border border-sand-100',
        hoverColor: 'hover:bg-sand-100 hover:border-sand-200',
        icon: <ArrowUpCircle className="w-3 h-3" />,
        label: 'Escalated',
        description: 'Escalated to staff for review'
      },
      resolved: {
        color: 'bg-grass-50 text-grass-900 border border-grass-100',
        hoverColor: 'hover:bg-grass-100 hover:border-grass-200',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Resolved',
        description: 'All issues resolved'
      }
    };
    return configs[status];
  };

  const config = getStatusConfig(status);

  const BadgeContent = (
    <div 
      className={`
        relative flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium 
        ${config.color} 
        ${onClick ? `${config.hoverColor} cursor-pointer transition-all duration-200` : ''}
        ${isHovered && onClick ? 'shadow-md scale-105' : ''}
      `}
      onMouseEnter={() => showTooltip && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {showIcon && config.icon}
      {!compact && <span>{config.label}</span>}
      
      {/* Show issue count if present */}
      {unresolvedIssuesCount > 0 && (
        <span className="ml-1 flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span className="text-xs">{unresolvedIssuesCount}</span>
        </span>
      )}
      
      {/* Priority indicator for critical reviews */}
      {priority === 'critical' && (
        <span className="ml-1 w-1.5 h-1.5 bg-clay-900 rounded-full animate-pulse" />
      )}
      
      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl max-w-xs">
            <div className="font-semibold mb-1">{config.label}</div>
            <div className="text-gray-300">{config.description}</div>
            
            {unresolvedIssuesCount > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-700 text-clay-300">
                {unresolvedIssuesCount} unresolved issue{unresolvedIssuesCount !== 1 ? 's' : ''}
              </div>
            )}
            
            {priority && (
              <div className="mt-1 pt-1 border-t border-gray-700">
                Priority: <span className="font-semibold capitalize">{priority}</span>
              </div>
            )}
            
            {onClick && (
              <div className="mt-1 pt-1 border-t border-gray-700 text-sky-300">
                Click to view review
              </div>
            )}
            
            {/* Arrow pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return BadgeContent;
};

export default ReviewStatusBadge;