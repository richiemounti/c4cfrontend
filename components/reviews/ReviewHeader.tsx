// components/reviews/ReviewHeader.tsx
'use client';

import React from 'react';
import { Review, ReviewStatus, ReviewPriority } from '@/types';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewHeaderProps {
  review: Review;
  onRefresh: () => void;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({ review, onRefresh }) => {
  // Status color mapping
  const getStatusColor = (status: ReviewStatus): string => {
    const colors: Record<ReviewStatus, string> = {
      pending: 'bg-ochre-50 text-ochre-900 border-ochre-100',
      in_review: 'bg-sky-50 text-sky-500 border-sky-100',
      approved: 'bg-grass-50 text-grass-900 border-grass-100',
      escalated: 'bg-sand-50 text-sand-900 border-sand-100',
      resolved: 'bg-concrete-50 text-concrete-900 border-concrete-500',
    };
    return colors[status] || 'bg-concrete-50 text-concrete-900 border-concrete-500';
  };

  // Priority color mapping
  const getPriorityColor = (priority: ReviewPriority): string => {
    const colors: Record<ReviewPriority, string> = {
      low: 'bg-grass-50 text-grass-900',
      medium: 'bg-ochre-50 text-ochre-900',
      high: 'bg-sand-50 text-sand-900',
      critical: 'bg-clay-100 text-clay-900',
    };
    return colors[priority] || 'bg-concrete-50 text-concrete-900';
  };

  // Status icon mapping
  const getStatusIcon = (status: ReviewStatus) => {
    const icons: Record<ReviewStatus, React.ReactNode> = {
      pending: <Clock className="w-5 h-5" />,
      in_review: <AlertCircle className="w-5 h-5" />,
      approved: <CheckCircle className="w-5 h-5" />,
      escalated: <ArrowUpCircle className="w-5 h-5" />,
      resolved: <CheckCircle className="w-5 h-5" />,
    };
    return icons[status];
  };

  // Module display name
  const getModuleDisplayName = (module: string): string => {
    const names: Record<string, string> = {
      stakeholder_group: 'Stakeholder Group',
      project_setup: 'Project Setup',
      project_site_setup: 'Project Site Setup',
      stakeholder_action: 'Stakeholder Action',
      social_impact: 'Social Impact',
      toc_consultation_plan: 'ToC Consultation Plan',
      survey: 'Survey',
      survey_question: 'Survey Question',
    };
    return names[module] || module;
  };

  return (
    <div className="bg-white border border-concrete-500 rounded-lg p-6">
      {/* Top Row: Title and Refresh */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stratosphere-900 mb-2">
            {review.title}
          </h1>
          
          {/* Module Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-concrete-900 bg-concrete-100 px-2 py-1 rounded">
              {getModuleDisplayName(review.module)}
            </span>
            {review.nestedPath && (
              <span className="text-xs text-concrete-900">
                • {review.nestedPath}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {review.description && (
        <p className="text-concrete-900 mb-4">
          {review.description}
        </p>
      )}

      {/* Status and Priority Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(review.status)}`}>
          {getStatusIcon(review.status)}
          <span className="text-sm font-medium capitalize">
            {review.status.replace('_', ' ')}
          </span>
        </div>

        {/* Priority Badge */}
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(review.priority)}`}>
          {review.priority.toUpperCase()} PRIORITY
        </div>

        {/* Overdue Warning */}
        {review.isOverdue && (
          <div className="flex items-center gap-2 px-4 py-2 bg-clay-50 border border-clay-100 rounded-full text-sm text-clay-900">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Overdue</span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-concrete-900 ml-auto">
          <Clock className="w-4 h-4" />
          <span>
            Created {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Escalation Banner */}
      {review.status === 'escalated' && review.escalatedTo && (
        <div className="mt-4 p-4 bg-sand-50 border border-sand-100 rounded-lg">
          <div className="flex items-center gap-2 text-sand-900 font-medium mb-2">
            <ArrowUpCircle className="w-5 h-5" />
            <span>Escalated to Staff</span>
          </div>
          <div className="text-sm text-sand-900">
            <p className="mb-1">
              <span className="font-medium">Assigned to:</span>{' '}
              {typeof review.escalatedTo === 'object'
                ? `${review.escalatedTo.name} (${review.escalatedTo.email})`
                : review.escalatedTo}
            </p>
            <p className="mb-1">
              <span className="font-medium">Escalated:</span>{' '}
              {formatDistanceToNow(new Date(review.escalatedAt!), { addSuffix: true })}
            </p>
            {review.escalatedReason && (
              <p className="mt-2 italic">
                <span className="font-medium">Reason:</span> "{review.escalatedReason}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Due Date Warning */}
      {review.dueDate && (
        <div className={`mt-4 p-4 rounded-lg border ${
          review.isOverdue 
            ? 'bg-clay-50 border-clay-100' 
            : 'bg-ochre-50 border-ochre-100'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={review.isOverdue ? 'text-clay-900' : 'text-ochre-900'}>
              <span className="font-medium">Due Date:</span>{' '}
              {new Date(review.dueDate).toLocaleDateString()} at{' '}
              {new Date(review.dueDate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHeader;