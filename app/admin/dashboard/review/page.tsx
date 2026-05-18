'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Review, ReviewStatus, ReviewPriority } from '@/types';
import { getEscalatedReviews } from '@/lib/api/reviews';
import ReviewCard from '@/components/reviews/ReviewCard';
import { useAuth } from '@/contexts/AuthContext';

const AdminReviewsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReviewPriority | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch escalated reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page,
        limit: 20,
      };

      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (searchQuery) filters.search = searchQuery;

      const response = await getEscalatedReviews(filters);

      if (response.success) {
        setReviews(response.data);
        // ✅ CORRECTED: Calculate total pages from response.total
        const totalCount = response.total || 0;
        const limit = 20;
        setTotalPages(Math.ceil(totalCount / limit));
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching escalated reviews:', err);
      setError(err.response?.data?.error || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    
    if (user && !user.isConnectGoStaff) {
      router.push('/dashboard');
      return;
    }

    fetchReviews();
  }, [authLoading, isAuthenticated, user, page, statusFilter, priorityFilter]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        fetchReviews();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleReviewClick = (reviewId: string) => {
    router.push(`/admin/dashboard/review/${reviewId}`);
  };

  const getStatusStats = () => {
    return {
      escalated: reviews.filter(r => r.status === 'escalated').length,
      in_review: reviews.filter(r => r.status === 'in_review').length,
      resolved: reviews.filter(r => r.status === 'resolved').length,
      overdue: reviews.filter(r => r.isOverdue).length,
    };
  };

  const stats = getStatusStats();

  if (loading && reviews.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stratosphere-900">
              Escalated Reviews
            </h1>
            <p className="text-concrete-900 mt-1">
              Reviews requiring staff approval
            </p>
          </div>
        </div>
        
        <button
          onClick={() => fetchReviews()}
          className="mt-4 sm:mt-0 p-2 rounded-full hover:bg-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-concrete-900" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-concrete-900">Escalated</p>
              <p className="text-2xl font-bold text-sand-900">{stats.escalated}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-sand-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-concrete-900">In Review</p>
              <p className="text-2xl font-bold text-sky-500">{stats.in_review}</p>
            </div>
            <Clock className="w-8 h-8 text-sky-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-concrete-900">Resolved</p>
              <p className="text-2xl font-bold text-grass-900">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-grass-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-concrete-900">Overdue</p>
              <p className="text-2xl font-bold text-clay-900">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-clay-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-concrete-900" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="escalated">Escalated</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-4 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-clay-50 border border-clay-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-clay-900">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-grass-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">
            No Escalated Reviews
          </h3>
          <p className="text-concrete-900">
            All reviews are currently being handled by project teams
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              onClick={() => handleReviewClick(review._id)}
              className="cursor-pointer"
            >
              <ReviewCard
                review={review}
                onStatusChange={() => fetchReviews()}
                enableQuickChat={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-concrete-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-concrete-900">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-concrete-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;