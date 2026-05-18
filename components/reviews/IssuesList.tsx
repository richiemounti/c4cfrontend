'use client';

// components/reviews/IssuesList.tsx
import React, { useState } from 'react';
import { Review, ReviewIssue, IssueSeverity } from '@/types';
import { resolveIssue } from '@/lib/api/reviews';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReviewCommentBox from '@/components/reviews/ReviewCommentBox';
import { MentionText } from '@/components/mentions/MentionChip';

interface IssuesListProps {
  review: Review;
  onRefresh: () => void;
}

export const IssuesList: React.FC<IssuesListProps> = ({ review, onRefresh }) => {
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getSeverityColor = (severity: IssueSeverity): string => {
    const colors: Record<IssueSeverity, string> = {
      minor: 'bg-grass-50 text-grass-900 border-grass-100',
      major: 'bg-sand-50 text-sand-900 border-sand-100',
      critical: 'bg-clay-50 text-clay-900 border-clay-100',
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: IssueSeverity) => {
    const icons: Record<IssueSeverity, React.ReactNode> = {
      minor: <AlertCircle className="w-4 h-4" />,
      major: <AlertTriangle className="w-4 h-4" />,
      critical: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[severity];
  };

  const getIssueTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      validation: 'Validation',
      compliance: 'Compliance',
      quality: 'Quality',
      completeness: 'Completeness',
      accuracy: 'Accuracy',
      other: 'Other',
    };
    return types[type] || type;
  };

  const handleResolveIssue = async (issueId: string) => {
    try {
      setLoading(true);
      const response = await resolveIssue(review._id, issueId, {
        resolutionNotes: resolutionNotes || undefined,
      });
      if (response.success) {
        setResolvingIssueId(null);
        setResolutionNotes('');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error resolving issue:', error);
      alert(error.response?.data?.error || 'Failed to resolve issue');
    } finally {
      setLoading(false);
    }
  };

  const unresolvedIssues = review.issues?.filter((issue) => !issue.resolvedAt) || [];
  const resolvedIssues = review.issues?.filter((issue) => issue.resolvedAt) || [];

  return (
    <div className="space-y-6">
      {/* ── Unresolved Issues ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
          Open Issues ({unresolvedIssues.length})
        </h3>

        {unresolvedIssues.length === 0 ? (
          <div className="text-center py-8 bg-grass-50 border border-grass-100 rounded-lg">
            <CheckCircle2 className="w-12 h-12 text-grass-900 mx-auto mb-3" />
            <p className="text-sm text-grass-900 font-medium">No open issues</p>
            <p className="text-xs text-concrete-900 mt-1">
              All issues have been resolved
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unresolvedIssues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white border border-concrete-500 rounded-lg p-4"
              >
                {/* Issue Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(issue.severity)}`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <span>{issue.severity.toUpperCase()}</span>
                    </div>
                    <span className="px-2 py-1 bg-concrete-100 text-concrete-900 rounded text-xs font-medium">
                      {getIssueTypeDisplay(issue.issueType)}
                    </span>
                    {issue.field && (
                      <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs font-mono">
                        {issue.field}
                      </span>
                    )}
                  </div>
                </div>

                {/* Issue Description — @mentions rendered as chips */}
                <div className="mb-3">
                  <MentionText
                    content={issue.description}
                    className="text-sm text-stratosphere-900 mb-2"
                  />

                  {issue.suggestedFix && (
                    <div className="mt-2 p-3 bg-sky-50 rounded-lg">
                      <p className="text-xs text-sky-500 font-medium mb-1">
                        Suggested Fix:
                      </p>
                      <MentionText
                        content={issue.suggestedFix}
                        className="text-sm text-stratosphere-900"
                      />
                    </div>
                  )}
                </div>

                {/* Issue Metadata */}
                <div className="flex items-center gap-4 text-xs text-concrete-900 mb-3 pb-3 border-b border-concrete-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{issue.raisedBy.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(issue.raisedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Resolve Section */}
                {resolvingIssueId === issue._id ? (
                  <div className="space-y-3">
                    {/* Mention-aware resolution notes */}
                    <ReviewCommentBox
                      review={review}
                      onCommentSubmit={async (content) => {
                        // Store notes so handleResolveIssue can pick them up
                        setResolutionNotes(content);
                      }}
                      placeholder="Add resolution notes… (type @ to notify someone)"
                      submitLabel="Save Notes"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveIssue(issue._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-grass-500 text-white rounded-lg hover:bg-grass-900 transition-colors disabled:opacity-50 text-sm"
                      >
                        {loading ? 'Resolving...' : 'Confirm Resolution'}
                      </button>
                      <button
                        onClick={() => {
                          setResolvingIssueId(null);
                          setResolutionNotes('');
                        }}
                        disabled={loading}
                        className="px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingIssueId(issue._id)}
                    className="px-4 py-2 bg-grass-50 text-grass-900 border border-grass-100 rounded-lg hover:bg-grass-100 transition-colors text-sm font-medium"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Resolved Issues ─────────────────────────────────────────────── */}
      {resolvedIssues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
            Resolved Issues ({resolvedIssues.length})
          </h3>

          <div className="space-y-4">
            {resolvedIssues.map((issue) => (
              <div
                key={issue._id}
                className="bg-concrete-50 border border-concrete-500 rounded-lg p-4 opacity-75"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(issue.severity)}`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <span>{issue.severity.toUpperCase()}</span>
                    </div>
                    <span className="px-2 py-1 bg-concrete-100 text-concrete-900 rounded text-xs font-medium">
                      {getIssueTypeDisplay(issue.issueType)}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-grass-50 text-grass-900 rounded text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>RESOLVED</span>
                    </div>
                  </div>
                </div>

                {/* Description with @mention chips */}
                <MentionText
                  content={issue.description}
                  className="text-sm text-stratosphere-900 mb-3"
                />

                {/* Resolution info */}
                <div className="p-3 bg-grass-50 border border-grass-100 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-grass-900 mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-medium">
                      Resolved by {issue.resolvedBy?.name}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(issue.resolvedAt!), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {issue.resolutionNotes && (
                    <MentionText
                      content={issue.resolutionNotes}
                      className="text-sm text-stratosphere-900 mt-2"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── General review comment box ───────────────────────────────────── */}
      <div className="pt-4 border-t border-concrete-500">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-concrete-900" />
          <h3 className="text-sm font-semibold text-stratosphere">
            Add a Comment
          </h3>
        </div>
        <ReviewCommentBox
          review={review}
          onCommentSubmit={async (_content) => {
            // Wire to your comment API here, e.g.:
            // await addReviewComment(review._id, content);
            onRefresh();
          }}
          placeholder="Add a comment… (type @ to notify a colleague)"
          submitLabel="Comment"
        />
      </div>
    </div>
  );
};

export default IssuesList;