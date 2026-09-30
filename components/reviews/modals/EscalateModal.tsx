// components/reviews/modals/EscalateModal.tsx
'use client';

import React, { useState } from 'react';
import { escalateReview } from '@/lib/api/reviews';
import { X, ArrowUpCircle, Loader2, AlertTriangle } from 'lucide-react';

interface EscalateModalProps {
  reviewId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EscalateModal: React.FC<EscalateModalProps> = ({
  reviewId,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for escalation');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await escalateReview(reviewId, {
        reason: reason.trim(),
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to escalate review');
      }
    } catch (err: any) {
      console.error('Error escalating review:', err);
      setError(err.message || 'Failed to escalate review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-c4c-rule">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-c4c-tint-coral rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-xl font-semibold text-black">
              Escalate to Staff
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-c4c-grey-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-c4c-petrol" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Notice */}
          <div className="mb-6 p-4 bg-c4c-tint-coral border border-c4c-pink rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-black mb-1">
                  Important Notice
                </p>
                <p className="text-sm text-black">
                  This review will be escalated to your Account Manager.
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="text-sm font-medium text-black mb-2 block">
              Reason for Escalation <span className="text-c4c-burgundy">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why this review needs to be escalated to staff..."
              className="w-full px-3 py-2 border border-c4c-rule rounded-lg text-sm resize-none focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
              rows={5}
              required
            />
            <p className="text-xs text-c4c-petrol mt-1">
              Be specific about the issues that require staff attention
            </p>
          </div>

          {/* Common Reasons (Quick Select) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-black mb-2 block">
              Quick Select Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Compliance concern',
                'Technical complexity',
                'Urgent deadline',
                'Resource limitation',
                'Policy clarification',
                'Multiple critical issues',
              ].map((quickReason) => (
                <button
                  key={quickReason}
                  type="button"
                  onClick={() => setReason(reason ? `${reason}\n\n${quickReason}` : quickReason)}
                  className="px-3 py-2 text-xs border border-c4c-rule rounded-lg hover:bg-c4c-grey-bg transition-colors text-left"
                >
                  {quickReason}
                </button>
              ))}
            </div>
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
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-c4c-burgundy text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Escalating...</span>
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Escalate Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscalateModal;