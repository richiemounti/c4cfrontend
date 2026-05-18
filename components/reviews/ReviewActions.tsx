// components/reviews/ReviewActions.tsx
'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import { 
  CheckCircle, 
  ArrowUpCircle, 
  UserPlus, 
  AlertCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';
import StatusUpdateModal from './modals/StatusUpdateModal';
import EscalateModal from './modals/EscalateModal';
import AddReviewerModal from './modals/AddReviewerModal';
import AddIssueModal from './modals/AddIssueModal';
import { AddCollaboratorModal } from './modals/AddCollaboratorModal';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewActionsProps {
  review: Review;
  onRefresh: () => void;
  onOpenChat?: () => void;
  isChatLoading?: boolean;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({ 
  review, 
  onRefresh,
  onOpenChat,
  isChatLoading
}) => {
  const { user } = useAuth();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);

  const isStaff = user?.isConnectGoStaff || false;

  // Client-only actions
  const canChangeStatus = !isStaff && review.status !== 'resolved' && review.status !== 'approved';
  const canEscalate = !isStaff && review.status !== 'escalated' && review.status !== 'resolved';
  const canAddReviewer = !isStaff && review.status !== 'resolved' && review.status !== 'approved';
  const canAddIssue = !isStaff && review.status !== 'resolved';

  // Staff can add collaborators only on escalated reviews
  const canAddCollaborator = isStaff && review.status === 'escalated';

  // Staff can add reviewers when review is still active
  const canAddReviewerStaff = isStaff && review.status !== 'resolved' && review.status !== 'approved';

  // Existing collaborator IDs derived from chatParticipants
  const existingCollaboratorIds: string[] = (review.chatParticipants ?? [])
    .map((p: any) => (typeof p === 'string' ? p : p._id?.toString()))
    .filter(Boolean);

  const handleSuccess = () => onRefresh();

  // ── Staff view ──────────────────────────────────────────────────────────────
  if (isStaff) {
    return (
      <div className="bg-white border border-concrete-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
          Staff Actions
        </h3>
        <p className="text-sm text-concrete-900 mb-4">
          As a staff member, you can view this review and participate in discussions via chat.
        </p>
        
        <div className="flex flex-wrap gap-3">
          {/* Open chat */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              disabled={isChatLoading}
              className="flex items-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChatLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Opening Chat...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Open Discussion</span>
                </>
              )}
            </button>
          )}

          {/* Add reviewer — visible on any active review */}
          {canAddReviewerStaff && (
            <button
              onClick={() => setShowAddReviewerModal(true)}
              className="flex items-center gap-2 px-4 py-3 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Add Reviewer</span>
            </button>
          )}

          {/* Add collaborator — only visible on escalated reviews */}
          {canAddCollaborator && (
            <button
              onClick={() => setShowAddCollaboratorModal(true)}
              className="flex items-center gap-2 px-4 py-3 border border-sky-200 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Add Collaborator</span>
            </button>
          )}
        </div>
        
        {/* Status info */}
        <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-lg">
          <p className="text-sm text-sky-900">
            <span className="font-medium">Current Status:</span>{' '}
            <span className="capitalize">{review.status.replace('_', ' ')}</span>
          </p>
          {review.escalatedTo && (
            <p className="text-sm text-sky-900 mt-1">
              <span className="font-medium">Escalated To:</span>{' '}
              {typeof review.escalatedTo === 'string' ? review.escalatedTo : review.escalatedTo.name}
            </p>
          )}
          {review.escalatedReason && (
            <p className="text-sm text-sky-900 mt-1 italic">
              <span className="font-medium">Reason:</span>{' '}
              {review.escalatedReason}
            </p>
          )}
          {existingCollaboratorIds.length > 0 && (
            <p className="text-sm text-sky-900 mt-1">
              <span className="font-medium">Collaborators:</span>{' '}
              {existingCollaboratorIds.length} staff member{existingCollaboratorIds.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Add Reviewer Modal (staff) */}
        {showAddReviewerModal && (
          <AddReviewerModal
            reviewId={review._id}
            currentReviewers={review.reviewers}
            onClose={() => setShowAddReviewerModal(false)}
            onSuccess={handleSuccess}
          />
        )}

        {/* Add Collaborator Modal */}
        {showAddCollaboratorModal && (
          <AddCollaboratorModal
            reviewId={review._id}
            existingCollaboratorIds={existingCollaboratorIds}
            onClose={() => setShowAddCollaboratorModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    );
  }

  // ── Client view ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-concrete-500 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
        Quick Actions
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {canChangeStatus && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Change Status</span>
          </button>
        )}

        {canEscalate && (
          <button
            onClick={() => setShowEscalateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sand-500 text-white rounded-lg hover:bg-sand-600 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Share with Account Manager</span>
          </button>
        )}

        {canAddReviewer && (
          <button
            onClick={() => setShowAddReviewerModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Reviewer</span>
          </button>
        )}

        {canAddIssue && (
          <button
            onClick={() => setShowAddIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Add Issue</span>
          </button>
        )}

        {onOpenChat && (
          <button
            onClick={onOpenChat}
            disabled={isChatLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isChatLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Open Discussion</span>
              </>
            )}
          </button>
        )}
      </div>

      {showStatusModal && (
        <StatusUpdateModal
          reviewId={review._id}
          currentStatus={review.status}
          onClose={() => setShowStatusModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showEscalateModal && (
        <EscalateModal
          reviewId={review._id}
          onClose={() => setShowEscalateModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showAddReviewerModal && (
        <AddReviewerModal
          reviewId={review._id}
          currentReviewers={review.reviewers}
          onClose={() => setShowAddReviewerModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showAddIssueModal && (
        <AddIssueModal
          reviewId={review._id}
          onClose={() => setShowAddIssueModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ReviewActions;