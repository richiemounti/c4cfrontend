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
    pending: 'bg-c4c-tint-gold text-black border-c4c-yellow',
    manager_review: 'bg-c4c-tint-cyan text-c4c-cobalt border-c4c-cobalt',
    manager_approved: 'bg-c4c-tint-sage text-black border-c4c-sage',
    manager_rejected: 'bg-c4c-tint-coral text-c4c-burgundy border-c4c-pink',
    staff_review: 'bg-c4c-tint-cyan text-black border-c4c-petrol',
    staff_approved: 'bg-c4c-tint-sage text-black border-c4c-sage',
    staff_rejected: 'bg-c4c-tint-coral text-c4c-burgundy border-c4c-pink',
    on_hold: 'bg-c4c-grey-bg text-black border-c4c-rule',
    cancelled: 'bg-c4c-grey-bg text-black border-c4c-rule'
  };
  return colors[status as keyof typeof colors] || 'bg-c4c-grey-bg text-black border-c4c-rule';
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-c4c-tint-sage text-black border-c4c-sage',
    medium: 'bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow',
    high: 'bg-c4c-tint-gold text-black border-c4c-yellow',
    critical: 'bg-c4c-tint-coral text-c4c-burgundy border-c4c-pink'
  };
  return colors[priority as keyof typeof colors] || 'bg-c4c-grey-bg text-c4c-petrol border-c4c-rule';
};

const getPhaseColor = (phase: string) => {
  const colors = {
    build: 'bg-c4c-tint-cyan text-c4c-petrol',
    measure: 'bg-c4c-tint-sage text-black',
    learn: 'bg-c4c-tint-gold text-c4c-petrol',
    tell: 'bg-c4c-tint-cyan text-c4c-cobalt'
  };
  return colors[phase as keyof typeof colors] || 'bg-c4c-grey-bg text-c4c-petrol';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'staff_approved':
    case 'manager_approved':
      return <CheckCircle2 className="h-5 w-5 text-c4c-sage" />;
    case 'staff_rejected':
    case 'manager_rejected':
      return <XCircle className="h-5 w-5 text-c4c-burgundy" />;
    case 'staff_review':
    case 'manager_review':
      return <Clock className="h-5 w-5 text-c4c-cobalt" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-c4c-yellow" />;
    default:
      return <Clock className="h-5 w-5 text-c4c-petrol" />;
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
      className="bg-white border border-c4c-rule rounded-lg p-5 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(review.status)}
            <h3 className="text-base font-semibold text-black">{review.title}</h3>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-c4c-burgundy" />
            )}
          </div>
          <p className="text-sm text-c4c-petrol line-clamp-2">{review.description}</p>
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-c4c-rule text-c4c-petrol">
          {getEntityTypeLabel(review.entityType)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-c4c-petrol mb-1">
          <span>Progress: {review.completedTasks}/{review.totalTasks} tasks</span>
          <span>{review.progress}%</span>
        </div>
        <div className="w-full bg-c4c-grey-bg rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              review.progress === 100 ? 'bg-c4c-sage' : 
              review.progress >= 75 ? 'bg-c4c-cobalt' : 
              review.progress >= 50 ? 'bg-c4c-yellow' : 
              'bg-c4c-yellow'
            }`}
            style={{ width: `${review.progress}%` }}
          />
        </div>
      </div>

      {/* Review Stage Info */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="bg-c4c-grey-bg rounded p-2">
          <div className="text-c4c-petrol mb-1">Manager Review</div>
          <div className="flex items-center gap-1">
            {review.managerReview.status === 'approved' && <CheckCircle2 className="h-3 w-3 text-c4c-sage" />}
            {review.managerReview.status === 'rejected' && <XCircle className="h-3 w-3 text-c4c-burgundy" />}
            {review.managerReview.status === 'in_progress' && <Clock className="h-3 w-3 text-c4c-cobalt" />}
            {review.managerReview.status === 'pending' && <Clock className="h-3 w-3 text-c4c-petrol" />}
            <span className="font-medium capitalize">{review.managerReview.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div className="bg-c4c-grey-bg rounded p-2">
          <div className="text-c4c-petrol mb-1">Staff Review</div>
          <div className="flex items-center gap-1">
            {review.staffReview.status === 'approved' && <CheckCircle2 className="h-3 w-3 text-c4c-sage" />}
            {review.staffReview.status === 'rejected' && <XCircle className="h-3 w-3 text-c4c-burgundy" />}
            {review.staffReview.status === 'in_progress' && <Clock className="h-3 w-3 text-c4c-petrol" />}
            {review.staffReview.status === 'pending' && <Clock className="h-3 w-3 text-c4c-petrol" />}
            <span className="font-medium capitalize">{review.staffReview.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-c4c-petrol pt-3 border-t border-c4c-rule">
        <div className="flex items-center gap-3">
          {typeof review.project === 'object' && review.project !== null && 'name' in review.project && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {review.project.name}
            </span>
          )}
          {review.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-c4c-burgundy font-medium' : ''}`}>
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
          <span className="text-c4c-petrol font-medium flex items-center gap-1">
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
        <div className="animate-spin h-8 w-8 border-4 border-c4c-petrol border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-black">{stats.total}</div>
          <div className="text-sm text-c4c-petrol">Total Reviews</div>
        </div>
        <div className="bg-c4c-tint-gold rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-c4c-petrol">{stats.pending}</div>
          <div className="text-sm text-black">Pending</div>
        </div>
        <div className="bg-c4c-tint-cyan rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-c4c-cobalt">{stats.managerReview}</div>
          <div className="text-sm text-c4c-cobalt">Manager Review</div>
        </div>
        <div className="bg-c4c-tint-cyan rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-c4c-petrol">{stats.staffReview}</div>
          <div className="text-sm text-black">Staff Review</div>
        </div>
        <div className="bg-c4c-tint-sage rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-black">{stats.approved}</div>
          <div className="text-sm text-black">Approved</div>
        </div>
        <div className="bg-c4c-tint-coral rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-c4c-burgundy">{stats.overdue}</div>
          <div className="text-sm text-black">Overdue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-c4c-petrol" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-c4c-rule rounded-lg focus:ring-2 focus:ring-c4c-cobalt focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-c4c-rule rounded-lg text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-grey-bg"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-c4c-rule">
            <div>
              <label className="block text-sm font-medium text-c4c-petrol mb-2">Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as any)}
                className="w-full px-3 py-2 border border-c4c-rule rounded-lg focus:ring-2 focus:ring-c4c-cobalt"
              >
                <option value="all">All Stages</option>
                <option value="manager">Manager Review</option>
                <option value="staff">Staff Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-c4c-petrol mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-c4c-rule rounded-lg focus:ring-2 focus:ring-c4c-cobalt"
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
              <label className="block text-sm font-medium text-c4c-petrol mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-c4c-rule rounded-lg focus:ring-2 focus:ring-c4c-cobalt"
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
        <div className="border-b border-c4c-rule">
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
                    ? 'border-c4c-petrol text-c4c-petrol'
                    : 'border-transparent text-c4c-petrol hover:text-c4c-petrol hover:border-c4c-rule'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-c4c-rule text-c4c-petrol">
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
              <FileText className="h-12 w-12 mx-auto text-c4c-petrol mb-4" />
              <p className="text-c4c-petrol">No reviews found</p>
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