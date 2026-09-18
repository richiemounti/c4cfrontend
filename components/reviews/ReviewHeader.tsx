// components/reviews/ReviewHeader.tsx
'use client';

import React from 'react';
import { Review, ReviewStatus } from '@/types';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Building2,
  MapPin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getReviewDueBucket, DUE_BUCKET_LABELS, DUE_BUCKET_BADGE_STYLES } from '@/lib/utils/reviewDueBucket';
import { REVIEW_MODULE_LABELS } from '@/lib/utils/reviewModules';

interface ReviewHeaderProps {
  review: Review;
  onRefresh: () => void;
}

// ─── Description parser ───────────────────────────────────────────────────────

interface DescriptionPair { key: string; value: string }

function parseDescriptionPairs(text: string): DescriptionPair[] | null {
  const pairs: DescriptionPair[] = [];
  // Match **Key:** followed by value until the next ** or end of string
  const regex = /\*\*([^*:]+):\*\*\s*((?:(?!\*\*).)*)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const key = m[1].trim();
    // Strip italic markers _…_ from value
    const value = m[2].replace(/_([^_]+)_/g, '$1').trim();
    if (key && value) pairs.push({ key, value });
  }
  return pairs.length > 0 ? pairs : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending:   'bg-gold-50 text-gold-900 border-gold-200',
  in_review: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  approved:  'bg-sage-50 text-sage-900 border-sage-200',
  escalated: 'bg-coral-50 text-coral-900 border-coral-200',
  resolved:  'bg-stone-100 text-stone-900 border-stone-300',
};

const STATUS_ICONS: Record<ReviewStatus, React.ReactNode> = {
  pending:   <Clock className="w-3.5 h-3.5" />,
  in_review: <AlertCircle className="w-3.5 h-3.5" />,
  approved:  <CheckCircle className="w-3.5 h-3.5" />,
  escalated: <ArrowUpCircle className="w-3.5 h-3.5" />,
  resolved:  <CheckCircle className="w-3.5 h-3.5" />,
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending:   'Pending Approval',
  in_review: 'Pending Approval',
  approved:  'Approved',
  escalated: 'Sent to AM',
  resolved:  'Resolved',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({ review, onRefresh }) => {
  const descPairs = review.description ? parseDescriptionPairs(review.description) : null;
  const dueBucket = getReviewDueBucket(review);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">

      {/* ── Top bar: module + refresh ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full">
          {REVIEW_MODULE_LABELS[review.module] ?? review.module}
        </span>
        <button
          onClick={onRefresh}
          className="p-1.5 text-stone-900 hover:text-ink hover:bg-neutral-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Title ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <h1 className="text-lg font-bold text-ink leading-snug">
          {review.title}
        </h1>
      </div>

      {/* ── Status / Due Date chips ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[review.status]}`}>
          {STATUS_ICONS[review.status]}
          {STATUS_LABELS[review.status]}
        </span>
        {dueBucket && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${DUE_BUCKET_BADGE_STYLES[dueBucket]}`}>
            {dueBucket === 'overdue' && <AlertTriangle className="w-3 h-3" />}
            {DUE_BUCKET_LABELS[dueBucket]}
          </span>
        )}
      </div>

      {/* ── Description — structured key-value grid ───────────────── */}
      {descPairs ? (
        <div className="border-t border-stone-100 px-5 py-4">
          <dl className="grid grid-cols-1 gap-y-2.5">
            {descPairs.map(({ key, value }) => (
              <div key={key} className="grid grid-cols-[auto_1fr] gap-x-3 items-start min-w-0">
                <dt className="text-xs font-semibold text-stone-900 whitespace-nowrap pt-0.5">
                  {key}
                </dt>
                <dd className="text-sm text-ink break-words">
                  {value || <span className="italic text-stone-700">Not provided</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : review.description ? (
        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-sm text-stone-900 leading-relaxed">{review.description}</p>
        </div>
      ) : null}

      {/* ── Meta strip: submitter, project, site, date ────────────── */}
      <div className="border-t border-stone-100 px-5 py-3 bg-stone-50 flex flex-wrap gap-x-5 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-900">
          <User className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
          <span className="font-medium text-ink">{review.submittedBy.name}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-900">
          <Building2 className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
          {review.projectId.name}
        </span>
        {review.projectSiteId && (
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-900">
            <MapPin className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
            {review.projectSiteId.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-900 ml-auto">
          <Clock className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* ── Escalation banner ─────────────────────────────────────── */}
      {review.status === 'escalated' && review.escalatedTo && (
        <div className="border-t border-coral-200 bg-coral-50 px-5 py-3">
          <div className="flex items-start gap-2">
            <ArrowUpCircle className="w-4 h-4 text-coral-900 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-coral-900 space-y-0.5">
              <p className="font-medium">Sent to account manager</p>
              {typeof review.escalatedTo === 'object' && (
                <p className="text-xs">{review.escalatedTo.name} · {review.escalatedTo.email}</p>
              )}
              {review.escalatedReason && (
                <p className="text-xs italic">"{review.escalatedReason}"</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Due date warning ──────────────────────────────────────── */}
      {review.dueDate && (
        <div className={`border-t px-5 py-2.5 flex items-center gap-2 text-xs ${
          review.isOverdue
            ? 'border-burgundy-200 bg-burgundy-50 text-burgundy-900'
            : 'border-gold-100 bg-gold-50 text-gold-900'
        }`}>
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <span className="font-medium">{review.isOverdue ? 'Was due' : 'Due'}:</span>{' '}
            {new Date(review.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewHeader;
