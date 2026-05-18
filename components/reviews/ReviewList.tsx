// components/reviews/ReviewList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Review, ReviewFilters as ReviewFiltersType, ReviewStatus } from '@/types';
import { getMyReviews } from '@/lib/api/reviews';
import ReviewCard from './ReviewCard';
import ReviewFilters from './ReviewFilters';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewListProps {
  projectId?: string;
  organizationId?: string;
  showFilters?: boolean;
  initialFilters?: Partial<ReviewFiltersType>;
  onReviewClick?: (review: Review) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  projectId,
  organizationId,
  showFilters = true,
  initialFilters = {},
  onReviewClick,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFiltersType>({
    ...initialFilters,
    projectId,
    organizationId,
    page: 1,
    limit: 10,
  });
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMyReviews(filters);
      
      if (response.success) {
        setReviews(response.data);
        setTotalReviews(response.total || 0);
        
        // Calculate total pages from total and limit
        const calculatedPages = Math.ceil((response.total || 0) / (filters.limit || 10));
        setTotalPages(calculatedPages || 1);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.error || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews when filters change
  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ReviewFiltersType) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      projectId,
      organizationId,
      page: 1,
      limit: 10,
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (filters.page && filters.page > 1) {
      setFilters({ ...filters, page: filters.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (filters.page && filters.page < totalPages) {
      setFilters({ ...filters, page: filters.page + 1 });
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Status change handler
  const handleStatusChange = (reviewId: string, status: ReviewStatus) => {
    // This will be implemented when we add status update functionality
    console.log('Status change:', reviewId, status);
  };

  // Escalate handler
  const handleEscalate = (reviewId: string) => {
    // This will be implemented when we add escalation functionality
    console.log('Escalate review:', reviewId);
  };

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-clay-900 mb-4" />
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
          Error Loading Reviews
        </h3>
        <p className="text-concrete-900 mb-4">{error}</p>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stratosphere-900">Reviews</h2>
          <p className="text-concrete-900 mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <ReviewFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Reviews List */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white border border-concrete-500 rounded-lg">
              <AlertCircle className="w-12 h-12 text-concrete-900 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
                No Reviews Found
              </h3>
              <p className="text-concrete-900">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Review Cards */}
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onStatusChange={handleStatusChange}
                  onEscalate={handleEscalate}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-concrete-500">
                  <div className="text-sm text-concrete-900">
                    Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
                    {Math.min((filters.page || 1) * (filters.limit || 10), totalReviews)} of{' '}
                    {totalReviews} reviews
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={filters.page === 1}
                      className="p-2 border border-concrete-500 rounded-lg hover:bg-concrete-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number;
                        
                        // Smart pagination: show pages around current page
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if ((filters.page || 1) <= 3) {
                          pageNum = i + 1;
                        } else if ((filters.page || 1) >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = (filters.page || 1) - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              filters.page === pageNum
                                ? 'bg-sky-500 text-white'
                                : 'border border-concrete-500 hover:bg-concrete-50 text-stratosphere-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      disabled={filters.page === totalPages}
                      className="p-2 border border-concrete-500 rounded-lg hover:bg-concrete-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay for filter changes */}
      {loading && reviews.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-sm text-concrete-900 mt-2">Loading reviews...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;