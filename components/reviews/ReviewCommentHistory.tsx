'use client';

// components/reviews/ReviewCommentHistory.tsx
import React, { useEffect, useState } from 'react';
import { Review } from '@/types';
import { getMessages, type Message } from '@/lib/api/inbox';
import { useAuth } from '@/contexts/AuthContext';
import { useInboxStore } from '@/stores/useInboxStore';
import { MentionText } from '@/components/mentions/MentionChip';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, ArrowUpRight } from 'lucide-react';

interface ReviewCommentHistoryProps {
  review: Review;
  /** Bump this to force a refetch (e.g. after posting a new comment) */
  refreshSignal?: number;
  /** Max messages to show — default 5 */
  limit?: number;
}

// Pulls a window of the review's conversation and narrows it down to messages
// the current user sent or was @mentioned in — a quick "what's relevant to me"
// slice rather than the full thread.
const FETCH_WINDOW = 50;

export const ReviewCommentHistory: React.FC<ReviewCommentHistoryProps> = ({
  review,
  refreshSignal,
  limit = 5,
}) => {
  const { user } = useAuth();
  const openInboxPanel = useInboxStore((s) => s.openPanel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!review.conversationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMessages(review.conversationId, { limit: FETCH_WINDOW })
      .then((res) => {
        if (!cancelled) setMessages(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [review.conversationId, refreshSignal]);

  if (!review.conversationId) return null;

  const relevant = messages
    .filter(
      (m) =>
        m.sender._id === user?._id ||
        m.mentions.some((mentioned) => mentioned._id === user?._id)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div className="border-t border-concrete-500 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-stratosphere-900">Recent Activity</h4>
        <button
          type="button"
          onClick={() => openInboxPanel('notifications')}
          className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 transition-colors"
        >
          View all in Notifications
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
        </div>
      ) : relevant.length === 0 ? (
        <p className="text-xs text-concrete-900">
          Nothing sent by you or mentioning you yet on this review.
        </p>
      ) : (
        <div className="space-y-3">
          {relevant.map((message) => {
            const isSelf = message.sender._id === user?._id;
            return (
              <div key={message._id} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-stratosphere-100 text-stratosphere-700 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                  {message.sender.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-concrete-900">
                    <span className="font-medium text-stratosphere-900">
                      {isSelf ? 'You' : message.sender.name}
                    </span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                  </div>
                  <MentionText content={message.content} className="text-sm text-stratosphere-900 mt-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewCommentHistory;
