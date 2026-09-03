// components/reviews/ReviewActions.tsx
'use client';

import React, { useState } from 'react';
import type { Review } from '@/types';
import { CheckCircle, Users, PhoneCall, UserPlus, Loader2 } from 'lucide-react';
import SpeakToAMModal from './modals/SpeakToAMModal';
import SeekInputModal from './modals/SeekInputModal';
import { AddCollaboratorModal } from './modals/AddCollaboratorModal';
import { AddReviewerModal } from './modals/AddReviewerModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateReviewStatus } from '@/lib/api/reviews';

interface ReviewActionsProps {
  review: Review;
  onRefresh: () => void;
  viewAs?: 'staff' | 'client';
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({
  review,
  onRefresh,
  viewAs,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [showSpeakToAMModal, setShowSpeakToAMModal] = useState(false);
  const [showSeekInputModal, setShowSeekInputModal] = useState(false);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] = useState(false);
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);

  const isStaff = viewAs !== undefined ? viewAs === 'staff' : (user?.isConnectGoStaff || false);
  const isResolved = review.status === 'resolved' || review.status === 'approved';

  const handleSuccess = () => onRefresh();

  const handleApprove = async () => {
    if (isApproving) return;
    try {
      setIsApproving(true);
      const response = await updateReviewStatus(review._id, { status: 'approved' });
      if (response.success) {
        toast({ title: 'Review approved', description: 'The submission has been marked as complete.' });
        handleSuccess();
      } else {
        toast({
          title: 'Failed to approve review',
          description: response.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Failed to approve review',
        description: err.response?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  // ── Staff view ──────────────────────────────────────────────────────────────
  if (isStaff) {
    const canAddCollaborator = review.status === 'escalated';
    const canAddReviewer = !isResolved;

    return (
      <div className="bg-white border border-concrete-500 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-stratosphere-900 mb-3">Staff Actions</h3>

        <div className="flex flex-wrap gap-2">
          {canAddReviewer && (
            <button
              onClick={() => setShowAddReviewerModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Reviewer
            </button>
          )}
          {canAddCollaborator && (
            <button
              onClick={() => setShowAddCollaboratorModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Collaborator
            </button>
          )}
        </div>

        {/* Status info strip */}
        <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-lg text-sm text-sky-900">
          <span className="font-medium">Status:</span>{' '}
          <span className="capitalize">{review.status.replace('_', ' ')}</span>
          {review.escalatedTo && (
            <span className="ml-3">
              <span className="font-medium">Escalated to:</span>{' '}
              {typeof review.escalatedTo === 'string' ? review.escalatedTo : review.escalatedTo.name}
            </span>
          )}
        </div>

        {showAddReviewerModal && (
          <AddReviewerModal
            reviewId={review._id}
            currentReviewers={review.reviewers}
            onClose={() => setShowAddReviewerModal(false)}
            onSuccess={handleSuccess}
          />
        )}
        {showAddCollaboratorModal && (
          <AddCollaboratorModal
            reviewId={review._id}
            onClose={() => setShowAddCollaboratorModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    );
  }

  // ── Client view — 3 actions ─────────────────────────────────────────────────
  const canSeekInput = !isResolved && review.status !== 'escalated';
  const canSpeakToAM = !isResolved && review.status !== 'escalated';
  const canApprove = !isResolved;

  if (!canSeekInput && !canSpeakToAM && !canApprove) return null;

  return (
    <div className="bg-white border border-concrete-500 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-stratosphere-900 mb-3">Actions</h3>

      <div className="flex flex-wrap gap-2">
        {canSeekInput && (
          <button
            onClick={() => setShowSeekInputModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            Seek Input
          </button>
        )}

        {canSpeakToAM && (
          <button
            onClick={() => setShowSpeakToAMModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-700 rounded-lg hover:bg-sky-50 transition-colors text-sm font-medium"
          >
            <PhoneCall className="w-4 h-4" />
            Speak to AM
          </button>
        )}

        {canApprove && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="flex items-center gap-2 px-4 py-2 bg-grass-500 text-white rounded-lg hover:bg-grass-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isApproving ? 'Approving…' : 'Approve'}
          </button>
        )}
      </div>

      {showSpeakToAMModal && (
        <SpeakToAMModal
          reviewId={review._id}
          onClose={() => setShowSpeakToAMModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showSeekInputModal && (
        <SeekInputModal
          review={review}
          onClose={() => setShowSeekInputModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ReviewActions;
