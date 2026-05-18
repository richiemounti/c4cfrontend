// components/reviews/ReviewDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { getReviewById } from '@/lib/api/reviews';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewHeader from './ReviewHeader';
import ReviewInfo from './ReviewInfo';
import ReviewActions from './ReviewActions';
import IssuesList from './IssuesList';
import ActivityTimeline from './ActivityTimeline';
import ReviewMetadata from './ReviewMetadata';
import { ReviewChatButton } from './ReviewChatButton';
import { ReviewChatModal } from './modals/ReviewChatModal';
import { useReviewChat } from '@/hooks/useReviewChat';

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
      setError(err.response?.data?.error || 'Failed to fetch review');
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
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !review) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-12 h-12 text-clay-900 mb-4" />
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
          Error Loading Review
        </h3>
        <p className="text-concrete-900 mb-4">{error || 'Review not found'}</p>
        <button
          onClick={fetchReview}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ✅ NOW: Only render the component with chat after review is loaded
  return <ReviewDetailContent 
    review={review} 
    embedded={embedded}
    onBack={handleBack}
    handleRefresh={handleRefresh}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  />;
};

// ✅ NEW: Separate component that receives non-null review
interface ReviewDetailContentProps {
  review: Review;
  embedded: boolean;
  onBack: () => void;
  handleRefresh: () => void;
  activeTab: 'issues' | 'activity' | 'metadata';
  setActiveTab: (tab: 'issues' | 'activity' | 'metadata') => void;
}

// components/reviews/ReviewDetail.tsx
// Update the ReviewDetailContent component:

const ReviewDetailContent: React.FC<ReviewDetailContentProps> = ({
  review,
  embedded,
  onBack,
  handleRefresh,
  activeTab,
  setActiveTab,
}) => {
  const { openChat, isChatOpen, closeChat, isCreating, channel, isChannelReady, error } = useReviewChat(review);

  return (
    <>
      <div className={`space-y-6 ${embedded ? '' : 'container mx-auto px-4 py-8'}`}>
        {/* Back Button and Chat Button Row - Only for non-embedded */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sky-500 hover:text-sky-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reviews</span>
            </button>

            <ReviewChatButton
              review={review}
              onClick={openChat}
              isLoading={isCreating}
              variant="primary"
              forceShow={true}
            />
          </div>
        )}

        {/* Header */}
        <ReviewHeader review={review} onRefresh={handleRefresh} />

        {/* Project/Site Info */}
        <ReviewInfo review={review} />

        {/* Action Buttons - PASS CHAT HANDLER HERE */}
        <ReviewActions 
          review={review} 
          onRefresh={handleRefresh}
          onOpenChat={openChat}  // ✅ Pass chat handler
          isChatLoading={isCreating}  // ✅ Pass loading state
        />

        {/* Tabs */}
        <div className="border-b border-concrete-500">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'issues'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-concrete-900 hover:text-stratosphere-900'
              }`}
            >
              Issues ({review.unresolvedIssuesCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-concrete-900 hover:text-stratosphere-900'
              }`}
            >
              Activity ({review.activityLog?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'metadata'
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-concrete-900 hover:text-stratosphere-900'
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

      {/* Chat Modal */}
      {isChatOpen && (
        <ReviewChatModal
          review={review}
          isOpen={isChatOpen}
          onClose={closeChat}
          channel={channel}
          isChannelReady={isChannelReady}
          error={error}
        />
      )}
    </>
  );
};

export default ReviewDetail;