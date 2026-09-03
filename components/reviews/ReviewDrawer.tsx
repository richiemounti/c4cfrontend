// components/reviews/ReviewDrawer.tsx
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewDetail from './ReviewDetail';

interface ReviewDrawerProps {
  reviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  reviewId,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && reviewId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-concrete-200 flex-shrink-0 bg-white">
              <h2 className="text-base font-semibold text-stratosphere-900">Review Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-concrete-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-concrete-700" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <ReviewDetail reviewId={reviewId} embedded={true} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewDrawer;
