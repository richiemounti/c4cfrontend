// components/reviews/modals/SpeakToAMModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { escalateReview } from '@/lib/api/reviews';
import { X, PhoneCall, Loader2 } from 'lucide-react';

interface SpeakToAMModalProps {
  reviewId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SpeakToAMModal: React.FC<SpeakToAMModalProps> = ({
  reviewId,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe what you need help with');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await escalateReview(reviewId, { reason: message.trim() });
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to contact Account Manager');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to contact Account Manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <PhoneCall className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Speak to Account Manager</h2>
              <p className="text-xs text-stone-700">Your AM will be notified and added to this review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-ink-900 mb-2 block">
              What do you need help with? <span className="text-burgundy-900">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or concern so your Account Manager can prepare before reaching out…"
              className="w-full px-3 py-2 border border-stone-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              rows={5}
              autoFocus
            />
            <p className="text-xs text-stone-700 mt-1">
              Be as specific as possible — this helps your AM respond quickly.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-burgundy-50 border border-burgundy-100 rounded-lg text-sm text-burgundy-900">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-stone-500 text-ink-900 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending…</span></>
              ) : (
                <><PhoneCall className="w-4 h-4" /><span>Contact Account Manager</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpeakToAMModal;
