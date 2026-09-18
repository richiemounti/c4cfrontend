// lib/utils/reviewDueBucket.ts
import type { Review, ReviewDueBucket } from '@/types';

/**
 * Derives a date-friendly urgency bucket from a review's dueDate (set via Seek
 * Input's response deadline), mirroring buildDueBucketCondition in the backend
 * review controller and the byDueBucket aggregation in reviewHelpers.ts.
 * Returns null for closed reviews (approved/resolved) — they have no urgency.
 */
export function getReviewDueBucket(
  review: Pick<Review, 'dueDate' | 'status'>
): ReviewDueBucket | null {
  if (review.status === 'approved' || review.status === 'resolved') return null;
  if (!review.dueDate) return 'no_deadline';

  const due = new Date(review.dueDate);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  if (due < now) return 'overdue';
  if (due < startOfTomorrow) return 'due_today';
  if (due < endOfWeek) return 'due_this_week';
  return 'due_later';
}

export const DUE_BUCKET_LABELS: Record<ReviewDueBucket, string> = {
  overdue: 'Overdue',
  due_today: 'Due Today',
  due_this_week: 'Due This Week',
  due_later: 'Due Later',
  no_deadline: 'No Deadline',
};

export const DUE_BUCKET_BADGE_STYLES: Record<ReviewDueBucket, string> = {
  overdue: 'bg-burgundy-100 text-burgundy-900',
  due_today: 'bg-coral-50 text-coral-900',
  due_this_week: 'bg-gold-50 text-gold-900',
  due_later: 'bg-sage-50 text-sage-900',
  no_deadline: 'bg-stone-100 text-stone-900',
};
