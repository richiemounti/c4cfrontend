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
      setError(err.response?.data?.error || 'Failed to escalate review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-concrete-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sand-50 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-sand-900" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900">
              Escalate to Staff
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-concrete-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-concrete-900" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Notice */}
          <div className="mb-6 p-4 bg-sand-50 border border-sand-100 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-sand-900 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-sand-900 mb-1">
                  Important Notice
                </p>
                <p className="text-sm text-stratosphere-900">
                  This review will be escalated to your Account Manager. 
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Reason for Escalation <span className="text-clay-900">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why this review needs to be escalated to staff..."
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={5}
              required
            />
            <p className="text-xs text-concrete-900 mt-1">
              Be specific about the issues that require staff attention
            </p>
          </div>

          {/* Common Reasons (Quick Select) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
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
                  className="px-3 py-2 text-xs border border-concrete-500 rounded-lg hover:bg-concrete-50 transition-colors text-left"
                >
                  {quickReason}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-clay-50 border border-clay-100 rounded-lg text-sm text-clay-900">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-sand-500 text-white rounded-lg hover:bg-sand-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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