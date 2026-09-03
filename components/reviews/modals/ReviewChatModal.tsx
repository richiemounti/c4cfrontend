// components/reviews/modals/ReviewChatModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import type { Review } from '@/types';
import { useInboxStore } from '@/stores/useInboxStore';
import ConversationView from '@/components/inbox/ConversationView';

interface ReviewChatModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewChatModal: React.FC<ReviewChatModalProps> = ({
  review,
  isOpen,
  onClose,
}) => {
  const openConversation = useInboxStore((s) => s.openConversation);
  const closeConversation = useInboxStore((s) => s.closeConversation);

  // Open conversation when modal mounts; clean up store state on unmount.
  useEffect(() => {
    if (review.conversationId) {
      openConversation(review.conversationId);
    }
    return () => {
      closeConversation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.conversationId]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-2xl h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-concrete-200 bg-gradient-to-r from-stratosphere-50 to-sky-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-xl">
                <MessageSquare className="w-4 h-4 text-sky-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-stratosphere-900">Review Discussion</h2>
                <p className="text-xs text-concrete-700 truncate max-w-xs">{review.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-concrete-100 rounded-full transition-all flex-shrink-0"
            >
              <X className="w-4 h-4 text-concrete-700" />
            </button>
          </div>

          {/* Conversation — fills remaining height */}
          <div className="flex-1 min-h-0">
            {!review.conversationId ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-10 h-10 text-concrete-400 mb-3" />
                <p className="text-sm text-concrete-700">
                  No conversation linked to this review yet.
                </p>
                <p className="text-xs text-concrete-500 mt-1">
                  The conversation is created automatically when the review is submitted.
                </p>
              </div>
            ) : (
              // onBack wires the ConversationView's back arrow to close the modal too
              <ConversationView onBack={onClose} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewChatModal;
