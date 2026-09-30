// components/reviews/modals/StatusUpdateModal.tsx
'use client';

import React, { useState } from 'react';
import { ReviewStatus } from '@/types';
import { updateReviewStatus } from '@/lib/api/reviews';
import { X, CheckCircle, Loader2 } from 'lucide-react';

interface StatusUpdateModalProps {
  reviewId: string;
  currentStatus: ReviewStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  reviewId,
  currentStatus,
  onClose,
  onSuccess,
}) => {
  const [newStatus, setNewStatus] = useState<ReviewStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available status transitions
  const getAvailableStatuses = (): { value: ReviewStatus; label: string; description: string }[] => {
    const allStatuses = [
      { 
        value: 'pending' as ReviewStatus, 
        label: 'Pending', 
        description: 'Review is waiting to be started'
      },
      { 
        value: 'in_review' as ReviewStatus, 
        label: 'In Review', 
        description: 'Review is currently being evaluated'
      },
      { 
        value: 'approved' as ReviewStatus, 
        label: 'Approved', 
        description: 'Review has been approved'
      },
      { 
        value: 'resolved' as ReviewStatus, 
        label: 'Resolved', 
        description: 'All issues have been resolved'
      },
    ];

    // Filter out current status
    return allStatuses.filter(status => status.value !== currentStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStatus === currentStatus) {
      setError('Please select a different status');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await updateReviewStatus(reviewId, {
        status: newStatus,
        reason: notes || undefined,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-c4c-rule">
          <h2 className="text-xl font-semibold text-black">
            Change Review Status
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-c4c-grey-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-c4c-petrol" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Status */}
          <div className="mb-6">
            <label className="text-sm font-medium text-c4c-petrol mb-2 block">
              Current Status
            </label>
            <div className="px-4 py-2 bg-c4c-grey-bg rounded-lg text-sm text-black capitalize">
              {currentStatus.replace('_', ' ')}
            </div>
          </div>

          {/* New Status */}
          <div className="mb-6">
            <label className="text-sm font-medium text-black mb-2 block">
              New Status <span className="text-c4c-burgundy">*</span>
            </label>
            <div className="space-y-2">
              {getAvailableStatuses().map((status) => (
                <label
                  key={status.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    newStatus === status.value
                      ? 'border-c4c-petrol bg-c4c-grey-bg'
                      : 'border-c4c-rule hover:bg-c4c-grey-bg'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={newStatus === status.value}
                    onChange={(e) => setNewStatus(e.target.value as ReviewStatus)}
                    className="mt-1 text-c4c-petrol focus:ring-c4c-petrol"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">
                      {status.label}
                    </p>
                    <p className="text-xs text-c4c-petrol mt-1">
                      {status.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-sm font-medium text-black mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              className="w-full px-3 py-2 border border-c4c-rule rounded-lg text-sm resize-none focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
              rows={4}
            />
            <p className="text-xs text-c4c-petrol mt-1">
              These notes will be visible in the activity timeline
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-c4c-tint-coral border border-c4c-pink rounded-lg text-sm text-c4c-burgundy">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-c4c-rule text-c4c-petrol rounded-lg hover:bg-c4c-grey-bg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || newStatus === currentStatus}
              className="flex-1 px-4 py-2 bg-c4c-coral text-black rounded-lg hover:bg-c4c-petrol hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;