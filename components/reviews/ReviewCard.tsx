// components/reviews/ReviewCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Review, ReviewStatus } from '@/types';
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
import { getReviewDueBucket, DUE_BUCKET_LABELS, DUE_BUCKET_BADGE_STYLES } from '@/lib/utils/reviewDueBucket';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Status color mapping using brand colors
  const getStatusColor = (status: ReviewStatus): string => {
    const colors: Record<ReviewStatus, string> = {
      pending: 'bg-c4c-tint-gold text-black border-c4c-yellow',
      in_review: 'bg-c4c-tint-cyan text-c4c-cobalt border-c4c-cobalt',
      approved: 'bg-c4c-tint-sage text-c4c-sage border-c4c-sage',
      escalated: 'bg-c4c-tint-coral text-c4c-burgundy border-c4c-burgundy',
      resolved: 'bg-c4c-grey-bg text-c4c-petrol border-c4c-rule',
    };
    return colors[status] || 'bg-c4c-grey-bg text-c4c-petrol border-c4c-rule';
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
  const dueBucket = getReviewDueBucket(review);

  // ✅ Handle chat click
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openChat();
  };

  return (
    <>
      <div className="bg-white border border-c4c-rule rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              href={`/dashboard/project/${review.projectId._id}/review/${review._id}`}
              className="text-lg font-semibold text-black hover:text-c4c-petrol transition-colors"
            >
              {review.title}
            </Link>

            {/* Module badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-c4c-petrol bg-c4c-grey-bg px-2 py-1 rounded">
                {getModuleDisplayName(review.module)}
              </span>
              {/* ← ADD THIS ADMIN BADGE */}
              {isAdminView && (
                <span className="text-xs text-white bg-c4c-cobalt px-2 py-1 rounded font-medium">
                  STAFF REVIEW
                </span>
              )}
              {review.nestedPath && (
                <span className="text-xs text-c4c-petrol">
                  • {review.nestedPath}
                </span>
              )}
            </div>
          </div>

          {/* Due date badge */}
          {dueBucket && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${DUE_BUCKET_BADGE_STYLES[dueBucket]}`}>
              {DUE_BUCKET_LABELS[dueBucket]}
            </span>
          )}
        </div>

        {/* Description */}
        {review.description && (
          <p className="text-sm text-c4c-petrol mb-4 line-clamp-2">
            {review.description}
          </p>
        )}

        {/* Project & Organization info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-c4c-petrol">
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
        <div className="flex items-center justify-between pt-4 border-t border-c4c-rule">
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
              <div className="flex items-center gap-2 text-sm text-c4c-petrol">
                <Users className="w-4 h-4" />
                <span>{review.reviewers.length}</span>
              </div>
            )}

            {/* Issues */}
            {hasUnresolvedIssues && (
              <div className={`flex items-center gap-2 text-sm ${hasCriticalIssues ? 'text-c4c-burgundy' : 'text-c4c-petrol'}`}>
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
                className="flex items-center gap-2 text-sm text-c4c-petrol hover:text-black transition-colors px-2 py-1 rounded hover:bg-c4c-grey-bg"
                title="Open discussion"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Chat</span>
              </button>
            )}
          </div>

          {/* Time info */}
          <div className="flex items-center gap-2 text-xs text-c4c-petrol">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Overdue warning */}
        {review.isOverdue && (
          <div className="mt-4 p-3 bg-c4c-tint-coral border border-c4c-burgundy rounded-lg flex items-center gap-2 text-sm text-c4c-burgundy">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Overdue</span>
            {review.dueDate && (
              <span className="text-c4c-burgundy">
                (Due: {new Date(review.dueDate).toLocaleDateString()})
              </span>
            )}
          </div>
        )}

        {/* Escalation info */}
        {review.status === 'escalated' && review.escalatedTo && (
          <div className="mt-4 p-3 bg-c4c-tint-coral border border-c4c-burgundy rounded-lg text-sm">
            <div className="flex items-center gap-2 text-c4c-burgundy font-medium mb-1">
              <ArrowUpCircle className="w-4 h-4" />
              <span>Escalated to Staff</span>
            </div>
            <p className="text-c4c-burgundy">
              {typeof review.escalatedTo === 'object' ? review.escalatedTo.name : review.escalatedTo} • {formatDistanceToNow(new Date(review.escalatedAt!), { addSuffix: true })}
            </p>
            {review.escalatedReason && (
              <p className="text-c4c-burgundy text-xs mt-2 italic">
                "{review.escalatedReason}"
              </p>
            )}
          </div>
        )}
      </div>

      {isChatOpen && (
        <ReviewChatModal
          review={review}
          isOpen={isChatOpen}
          onClose={closeChat}
        />
      )}
    </>
  );
};

export default ReviewCard;