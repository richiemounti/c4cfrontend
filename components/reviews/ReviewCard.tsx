// components/reviews/ReviewCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Review, ReviewStatus, ReviewPriority } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpCircle, 
  Users,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { ReviewChatModal } from './modals/ReviewChatModal';
import { useReviewChat } from '@/hooks/useReviewChat';

interface ReviewCardProps {
  review: Review;
  onStatusChange?: (reviewId: string, status: ReviewStatus) => void;
  onEscalate?: (reviewId: string) => void;
  enableQuickChat?: boolean;
  isAdminView?: boolean;  // ← ADD THIS
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onStatusChange,
  onEscalate,
  enableQuickChat = true,
  isAdminView = false,
}) => {
  // ✅ UPDATED: Get all hook data including channel state
  const { openChat, isChatOpen, closeChat, channel, isChannelReady, error } = useReviewChat(review);

  // Status color mapping using brand colors
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

  // Priority color mapping using brand colors
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
      pending: <Clock className="w-4 h-4" />,
      in_review: <AlertCircle className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      escalated: <ArrowUpCircle className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  // Module display name mapping
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

  const hasUnresolvedIssues = (review.unresolvedIssuesCount || 0) > 0;
  const hasCriticalIssues = (review.criticalIssuesCount || 0) > 0;

  // ✅ Handle chat click
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openChat();
  };

  return (
    <>
      <div className="bg-white border border-concrete-500 rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              href={`/reviews/${review._id}`}
              className="text-lg font-semibold text-stratosphere-900 hover:text-sky-500 transition-colors"
            >
              {review.title}
            </Link>
            
            {/* Module badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-concrete-900 bg-concrete-100 px-2 py-1 rounded">
                {getModuleDisplayName(review.module)}
              </span>
              {/* ← ADD THIS ADMIN BADGE */}
              {isAdminView && (
                <span className="text-xs text-white bg-sand-500 px-2 py-1 rounded font-medium">
                  STAFF REVIEW
                </span>
              )}
              {review.nestedPath && (
                <span className="text-xs text-concrete-900">
                  • {review.nestedPath}
                </span>
              )}
            </div>
          </div>

          {/* Priority badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(review.priority)}`}>
            {review.priority.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        {review.description && (
          <p className="text-sm text-concrete-900 mb-4 line-clamp-2">
            {review.description}
          </p>
        )}

        {/* Project & Organization info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-concrete-900">
          <div className="flex items-center gap-1">
            <span className="font-medium">Project:</span>
            <span>{review.projectId.name}</span>
          </div>
          {review.projectSiteId && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">Site:</span>
                <span>{review.projectSiteId.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Status and metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-concrete-500">
          <div className="flex items-center gap-4">
            {/* Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(review.status)}`}>
              {getStatusIcon(review.status)}
              <span className="text-xs font-medium capitalize">
                {review.status.replace('_', ' ')}
              </span>
            </div>

            {/* Reviewers */}
            {review.reviewers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-concrete-900">
                <Users className="w-4 h-4" />
                <span>{review.reviewers.length}</span>
              </div>
            )}

            {/* Issues */}
            {hasUnresolvedIssues && (
              <div className={`flex items-center gap-2 text-sm ${hasCriticalIssues ? 'text-clay-900' : 'text-sand-900'}`}>
                {hasCriticalIssues ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{review.unresolvedIssuesCount} issue{review.unresolvedIssuesCount !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* ✅ Chat button */}
            {enableQuickChat && (
              <button
                onClick={handleChatClick}
                className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 transition-colors px-2 py-1 rounded hover:bg-sky-50"
                title="Open discussion"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Chat</span>
              </button>
            )}
          </div>

          {/* Time info */}
          <div className="flex items-center gap-2 text-xs text-concrete-900">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Overdue warning */}
        {review.isOverdue && (
          <div className="mt-4 p-3 bg-clay-50 border border-clay-100 rounded-lg flex items-center gap-2 text-sm text-clay-900">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Overdue</span>
            {review.dueDate && (
              <span className="text-clay-900">
                (Due: {new Date(review.dueDate).toLocaleDateString()})
              </span>
            )}
          </div>
        )}

        {/* Escalation info */}
        {review.status === 'escalated' && review.escalatedTo && (
          <div className="mt-4 p-3 bg-sand-50 border border-sand-100 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-sand-900 font-medium mb-1">
              <ArrowUpCircle className="w-4 h-4" />
              <span>Escalated to Staff</span>
            </div>
            <p className="text-sand-900">
              {typeof review.escalatedTo === 'object' ? review.escalatedTo.name : review.escalatedTo} • {formatDistanceToNow(new Date(review.escalatedAt!), { addSuffix: true })}
            </p>
            {review.escalatedReason && (
              <p className="text-sand-900 text-xs mt-2 italic">
                "{review.escalatedReason}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* ✅ UPDATED: Pass channel state to modal */}
      {isChatOpen && (
        <ReviewChatModal
          review={review}
          isOpen={isChatOpen}
          onClose={closeChat}
          channel={channel}
          isChannelReady={isChannelReady}
          error={error}
        />
      )}
    </>
  );
};

export default ReviewCard;