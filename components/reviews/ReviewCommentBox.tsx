'use client';

// components/reviews/ReviewCommentBox.tsx
import { usePageContext } from '@/hooks/usePageContext';
import MentionTextarea from '@/components/mentions/MentionTextarea';
import type { Review } from '@/types';

interface ReviewCommentBoxProps {
  review: Review;
  onCommentSubmit: (content: string, mentionedIds: string[]) => Promise<void> | void;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  /**
   * Set when onCommentSubmit already persists a message whose mentions
   * notify server-side (e.g. via sendMessage) — avoids double-notifying.
   */
  skipMentionNotification?: boolean;
}

export default function ReviewCommentBox({
  review,
  onCommentSubmit,
  placeholder = 'Add a comment… (type @ to mention someone)',
  submitLabel = 'Comment',
  className = '',
  skipMentionNotification = false,
}: ReviewCommentBoxProps) {
  const { pageContext, contextLink } = usePageContext({
    resourceType: 'review',         // always 'review' — the comment lives on a review
    resourceId: review._id,         // the review itself is the resource
    label: review.title,
  });

  // organizationId is a populated object on this Review type
  const organizationId = review.organizationId._id;

  const handleSubmit = async (content: string, mentionedIds: string[]) => {
    await onCommentSubmit(content, mentionedIds);
  };

  return (
    <MentionTextarea
      organizationId={organizationId}
      pageContext={pageContext}
      contextLink={contextLink}
      placeholder={placeholder}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      skipMentionNotification={skipMentionNotification}
      className={className}
    />
  );
}