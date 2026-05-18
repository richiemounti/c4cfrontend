// components/reviews/ReviewDetailModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import ReviewDetail from '../ReviewDetail';

interface ReviewDetailModalProps {
  reviewId: string;
  onClose: () => void;
}

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ reviewId, onClose }) => {
  // Close modal on ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-concrete-50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-concrete-900" />
            </button>

            {/* Review Content */}
            <div className="p-6">
              <ReviewDetail reviewId={reviewId} embedded={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewDetailModal;