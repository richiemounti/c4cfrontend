// components/reviews/ReviewChatButton.tsx
'use client';

import React from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { ReviewWithChat } from '@/types';

interface ReviewChatButtonProps {
  review: ReviewWithChat;
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'outline' | 'compact';
  className?: string;
  showLabel?: boolean;
  forceShow?: boolean; // ✅ NEW: Option to always show button
}

/**
 * Reusable chat button component for reviews
 */
export const ReviewChatButton: React.FC<ReviewChatButtonProps> = ({
  review,
  onClick,
  isLoading = false,
  variant = 'primary',
  className = '',
  showLabel = true,
  forceShow = true, // ✅ CHANGED: Default to true to always show
}) => {
  // ✅ UPDATED: Only hide if explicitly disabled
  if (!review.streamChannelCreated && !forceShow) {
    return null;
  }

  // Variant styles using custom color scheme
  const variantStyles = {
    primary: review.streamChannelCreated 
        ? 'bg-sky-500 text-white hover:bg-sky-600 border-sky-500'
        : 'bg-concrete-100 text-concrete-900 hover:bg-concrete-200 border-concrete-500',
    outline: 'border-sky-500 text-sky-500 hover:bg-sky-50 bg-white',
    compact: 'border-sky-100 text-sky-500 hover:bg-sky-50 bg-sky-50',
  };

  const sizeStyles = {
    primary: 'px-4 py-2',
    outline: 'px-4 py-2',
    compact: 'px-3 py-1.5',
  };

  const iconSizeStyles = {
    primary: 'w-4 h-4',
    outline: 'w-4 h-4',
    compact: 'w-3.5 h-3.5',
  };

  const textSizeStyles = {
    primary: 'text-sm',
    outline: 'text-sm',
    compact: 'text-xs',
  };

  // ✅ NEW: Dynamic label based on channel status
  const getButtonLabel = () => {
    if (isLoading) return 'Opening...';
    if (review.streamChannelCreated) return '💬 Discuss';
    return '💬 Start Chat';
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        flex items-center gap-2 
        ${sizeStyles[variant]}
        ${variantStyles[variant]}
        rounded-lg 
        transition-colors 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        font-medium
        border
        ${className}
      `.trim()}
      title={isLoading ? 'Opening chat...' : review.streamChannelCreated ? 'Open discussion' : 'Start new discussion'}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizeStyles[variant]} animate-spin`} />
      ) : (
        <MessageSquare className={iconSizeStyles[variant]} />
      )}
      
      {showLabel && (
        <span className={textSizeStyles[variant]}>
          {getButtonLabel()}
        </span>
      )}
    </button>
  );
};

export default ReviewChatButton;