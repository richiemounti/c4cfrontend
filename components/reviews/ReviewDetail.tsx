// components/reviews/ReviewDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { getReviewById } from '@/lib/api/reviews';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewHeader from './ReviewHeader';
import ReviewActions from './ReviewActions';
import IssuesList from './IssuesList';
import ActivityTimeline from './ActivityTimeline';
import ReviewMetadata from './ReviewMetadata';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewDetailProps {
  reviewId: string;
  onBack?: () => void;
  embedded?: boolean;
}

export const ReviewDetail: React.FC<ReviewDetailProps> = ({
  reviewId,
  onBack,
  embedded = false,
}) => {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'activity' | 'metadata'>('issues');

  // Fetch review details
  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getReviewById(reviewId);

      if (response.success) {
        setReview(response.data);
      } else {
        setError(response.message || 'Failed to fetch review');
      }
    } catch (err: any) {
      console.error('Error fetching review:', err);
      setError(err.message || 'Failed to fetch review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  // Refresh review after actions
  const handleRefresh = () => {
    fetchReview();
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-c4c-petrol animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !review) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-12 h-12 text-c4c-burgundy mb-4" />
        <h3 className="text-lg font-semibold text-black mb-2">
          Error Loading Review
        </h3>
        <p className="text-c4c-petrol mb-4">{error || 'Review not found'}</p>
        <button
          onClick={fetchReview}
          className="px-4 py-2 bg-c4c-petrol text-white rounded-lg hover:bg-black transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <ReviewDetailContent
    review={review}
    embedded={embedded}
    onBack={handleBack}
    handleRefresh={handleRefresh}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  />;
};

interface ReviewDetailContentProps {
  review: Review;
  embedded: boolean;
  onBack: () => void;
  handleRefresh: () => void;
  activeTab: 'issues' | 'activity' | 'metadata';
  setActiveTab: (tab: 'issues' | 'activity' | 'metadata') => void;
}

const ReviewDetailContent: React.FC<ReviewDetailContentProps> = ({
  review,
  embedded,
  onBack,
  handleRefresh,
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const isStaff = user?.isConnectGoStaff || false;
  const [viewAs, setViewAs] = useState<'staff' | 'client'>('staff');

  return (
    <>
      <div className={`space-y-6 ${embedded ? 'px-5 py-5' : 'container mx-auto px-4 py-8'}`}>
        {/* Back Button - Only for non-embedded */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-c4c-petrol hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reviews</span>
            </button>
          </div>
        )}

        {/* Staff view toggle */}
        {isStaff && (
          <div className="flex items-center gap-2 p-3 bg-c4c-grey-bg border border-c4c-rule rounded-lg">
            <span className="text-xs font-medium text-black mr-1">View as:</span>
            <div className="flex rounded-md border border-c4c-rule overflow-hidden text-xs font-medium">
              <button
                onClick={() => setViewAs('staff')}
                className={`px-3 py-1.5 transition-colors ${
                  viewAs === 'staff'
                    ? 'bg-c4c-petrol text-white'
                    : 'bg-white text-c4c-petrol hover:bg-c4c-grey-bg'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setViewAs('client')}
                className={`px-3 py-1.5 transition-colors border-l border-c4c-rule ${
                  viewAs === 'client'
                    ? 'bg-c4c-petrol text-white'
                    : 'bg-white text-c4c-petrol hover:bg-c4c-grey-bg'
                }`}
              >
                Client
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <ReviewHeader review={review} onRefresh={handleRefresh} />

        {/* Action Buttons */}
        <ReviewActions
          review={review}
          onRefresh={handleRefresh}
          viewAs={isStaff ? viewAs : undefined}
        />

        {/* Tabs */}
        <div className="border-b border-c4c-rule">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'issues'
                  ? 'border-c4c-petrol text-c4c-petrol'
                  : 'border-transparent text-c4c-petrol hover:text-black'
              }`}
            >
              Issues ({review.unresolvedIssuesCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-c4c-petrol text-c4c-petrol'
                  : 'border-transparent text-c4c-petrol hover:text-black'
              }`}
            >
              Activity ({review.activityLog?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'metadata'
                  ? 'border-c4c-petrol text-c4c-petrol'
                  : 'border-transparent text-c4c-petrol hover:text-black'
              }`}
            >
              Details
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'issues' && (
            <IssuesList review={review} onRefresh={handleRefresh} />
          )}
          {activeTab === 'activity' && (
            <ActivityTimeline review={review} />
          )}
          {activeTab === 'metadata' && (
            <ReviewMetadata review={review} />
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewDetail;
