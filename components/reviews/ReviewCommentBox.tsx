'use client';

// components/reviews/ReviewCommentBox.tsx
import { usePageContext } from '@/hooks/usePageContext';
import MentionTextarea from '@/components/mentions/MentionTextarea';
import type { Review } from '@/types';

interface ReviewCommentBoxProps {
  review: Review;
  onCommentSubmit: (content: string) => Promise<void> | void;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
}

export default function ReviewCommentBox({
  review,
  onCommentSubmit,
  placeholder = 'Add a comment… (type @ to mention someone)',
  submitLabel = 'Comment',
  className = '',
}: ReviewCommentBoxProps) {
  const { pageContext, contextLink } = usePageContext({
    resourceType: 'review',         // always 'review' — the comment lives on a review
    resourceId: review._id,         // the review itself is the resource
    label: review.title,
  });

  // organizationId is a populated object on this Review type
  const organizationId = review.organizationId._id;

  const handleSubmit = async (content: string, _mentionedIds: string[]) => {
    await onCommentSubmit(content);
  };

  return (
    <MentionTextarea
      organizationId={organizationId}
      pageContext={pageContext}
      contextLink={contextLink}
      placeholder={placeholder}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      className={className}
    />
  );
}