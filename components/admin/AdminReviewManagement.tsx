// components/admin/AdminReviewManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import type { Review } from '@/types/review.types';

interface AdminReviewManagementProps {
  projectId?: string;
  onReviewClick?: (reviewId: string) => void;
}

// Utility functions
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    manager_review: 'bg-blue-100 text-blue-800 border-blue-200',
    manager_approved: 'bg-green-100 text-green-800 border-green-200',
    manager_rejected: 'bg-red-100 text-red-800 border-red-200',
    staff_review: 'bg-purple-100 text-purple-800 border-purple-200',
    staff_approved: 'bg-green-100 text-green-800 border-green-200',
    staff_rejected: 'bg-red-100 text-red-800 border-red-200',
    on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getPhaseColor = (phase: string) => {
  const colors = {
    build: 'bg-blue-50 text-blue-700',
    measure: 'bg-green-50 text-green-700',
    learn: 'bg-orange-50 text-orange-700',
    tell: 'bg-purple-50 text-purple-700'
  };
  return colors[phase as keyof typeof colors] || 'bg-gray-50 text-gray-700';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'staff_approved':
    case 'manager_approved':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'staff_rejected':
    case 'manager_rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'staff_review':
    case 'manager_review':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getEntityTypeLabel = (entityType: string) => {
  const labels: Record<string, string> = {
    project_setup: 'Project Setup',
    site_setup: 'Site Setup',
    stakeholder_mapping: 'Stakeholder Mapping',
    consultation_plan: 'Consultation Plan',
    theory_of_change_stage: 'Theory of Change Stage',
    survey: 'Survey',
    report: 'Report'
  };
  return labels[entityType] || entityType;
};

// Review Card Component
const ReviewCard: React.FC<{ review: Review; onClick: () => void }> = ({ review, onClick }) => {
  const isOverdue = review.dueDate && new Date(review.dueDate) < new Date() && 
                   !['staff_approved', 'staff_rejected', 'cancelled'].includes(review.status);
  
  const currentStageLabel = () => {
    if (['staff_approved', 'staff_rejected'].includes(review.status)) return 'Completed';
    if (review.status === 'cancelled') return 'Cancelled';
    if (['staff_review', 'manager_approved'].includes(review.status)) return 'Staff Review';
    return 'Manager Review';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(review.status)}
            <h3 className="text-base font-semibold text-gray-900">{review.title}</h3>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{review.description}</p>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
          {review.status.replace(/_/g, ' ')}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(review.priority)}`}>
          {review.priority}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPhaseColor(review.phase)}`}>
          {review.phase}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {getEntityTypeLabel(review.entityType)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress: {review.completedTasks}/{review.totalTasks} tasks</span>
          <span>{review.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              review.progress === 100 ? 'bg-green-500' : 
              review.progress >= 75 ? 'bg-blue-500' : 
              review.progress >= 50 ? 'bg-yellow-500' : 
              'bg-orange-500'
            }`}
            style={{ width: `${review.progress}%` }}
          />
        </div>
      </div>

      {/* Review Stage Info */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-500 mb-1">Manager Review</div>
          <div className="flex items-center gap-1">
            {review.managerReview.status === 'approved' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            {review.managerReview.status === 'rejected' && <XCircle className="h-3 w-3 text-red-500" />}
            {review.managerReview.status === 'in_progress' && <Clock className="h-3 w-3 text-blue-500" />}
            {review.managerReview.status === 'pending' && <Clock className="h-3 w-3 text-gray-400" />}
            <span className="font-medium capitalize">{review.managerReview.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-500 mb-1">Staff Review</div>
          <div className="flex items-center gap-1">
            {review.staffReview.status === 'approved' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            {review.staffReview.status === 'rejected' && <XCircle className="h-3 w-3 text-red-500" />}
            {review.staffReview.status === 'in_progress' && <Clock className="h-3 w-3 text-purple-500" />}
            {review.staffReview.status === 'pending' && <Clock className="h-3 w-3 text-gray-400" />}
            <span className="font-medium capitalize">{review.staffReview.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {typeof review.project === 'object' && review.project !== null && 'name' in review.project && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {review.project.name}
            </span>
          )}
          {review.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              <Calendar className="h-3 w-3" />
              {formatDate(review.dueDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {review.comments && review.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {review.comments.length}
            </span>
          )}
          <span className="text-blue-600 font-medium flex items-center gap-1">
            View Details
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const AdminReviewManagement: React.FC<AdminReviewManagementProps> = ({ 
  projectId,
  onReviewClick 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<'all' | 'manager' | 'staff'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [projectId, selectedStage, selectedStatus, selectedPriority]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Use your existing API
      const response = await fetch(`/api/v1/reviews?${new URLSearchParams({
        ...(projectId && { projectId }),
        ...(selectedStage !== 'all' && { stage: selectedStage }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedPriority !== 'all' && { priority: selectedPriority })
      })}`);
      const data = await response.json();
      
      // Your API returns { success, count, total, page, pages, data }
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews based on search
  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.title.toLowerCase().includes(query) ||
      review.description?.toLowerCase().includes(query) ||
      (typeof review.project === 'object' && review.project.name.toLowerCase().includes(query))
    );
  });

  // Group reviews by stage
  const reviewsByStage = {
    manager: filteredReviews.filter(r => 
      ['pending', 'manager_review', 'manager_approved', 'manager_rejected'].includes(r.status)
    ),
    staff: filteredReviews.filter(r => 
      ['staff_review', 'staff_approved', 'staff_rejected', 'manager_approved'].includes(r.status)
    ),
    completed: filteredReviews.filter(r => 
      ['staff_approved', 'staff_rejected', 'cancelled'].includes(r.status)
    )
  };

  // Statistics
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    managerReview: reviews.filter(r => r.status === 'manager_review').length,
    staffReview: reviews.filter(r => r.status === 'staff_review').length,
    approved: reviews.filter(r => r.status === 'staff_approved').length,
    overdue: reviews.filter(r => r.isOverdue).length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-sm text-yellow-800">Pending</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.managerReview}</div>
          <div className="text-sm text-blue-800">Manager Review</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-700">{stats.staffReview}</div>
          <div className="text-sm text-purple-800">Staff Review</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          <div className="text-sm text-green-800">Approved</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
          <div className="text-sm text-red-800">Overdue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                <option value="manager">Manager Review</option>
                <option value="staff">Staff Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="manager_review">Manager Review</option>
                <option value="manager_approved">Manager Approved</option>
                <option value="staff_review">Staff Review</option>
                <option value="staff_approved">Staff Approved</option>
                <option value="staff_rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reviews by Stage Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'all', label: 'All Reviews', count: filteredReviews.length },
              { id: 'manager', label: 'Manager Stage', count: reviewsByStage.manager.length },
              { id: 'staff', label: 'Staff Stage', count: reviewsByStage.staff.length },
              { id: 'completed', label: 'Completed', count: reviewsByStage.completed.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  (selectedStage === tab.id || (selectedStage === 'all' && tab.id === 'all'))
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Reviews Grid */}
        <div className="p-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedStage === 'all' ? filteredReviews : 
                selectedStage === 'manager' ? reviewsByStage.manager :
                selectedStage === 'staff' ? reviewsByStage.staff :
                reviewsByStage.completed
              ).map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onClick={() => onReviewClick?.(review._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewManagement;