// lib/api/reviewManagement.ts
import { apiClient } from './client';

interface ReviewFilters {
  status?: string;
  priority?: string;
  entityType?: string;
  assignedTo?: string;
  overdue?: boolean;
  projectId?: string;
  projectSiteId?: string;
}

interface CreateReviewData {
  entityType: 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'consultation_plan' | 'theory_of_change_stage';
  entityId: string;
  projectId: string;
  projectSiteId?: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
}

interface UpdateReviewStatusData {
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  completedTasks?: number;
  notes?: string;
}

interface AddCommentData {
  content: string;
  type?: 'comment' | 'approval' | 'rejection' | 'request_changes';
}

const reviewManagementApi = {
  // Get reviews with filters
  getReviews: async (filters: ReviewFilters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    return apiClient.get(`/adminDashboard/reviews?${queryParams}`);
  },

  // Get single review details
  getReviewDetails: async (reviewId: string) => {
    return apiClient.get(`/adminDashboard/reviews/${reviewId}`);
  },

  // Create a new review
  createReview: async (data: CreateReviewData) => {
    return apiClient.post('/adminDashboard/reviews', data);
  },

  // Update review status
  updateReviewStatus: async (reviewId: string, data: UpdateReviewStatusData) => {
    return apiClient.put(`/adminDashboard/reviews/${reviewId}/status`, data);
  },

  // Add comment to review
  addReviewComment: async (reviewId: string, data: AddCommentData) => {
    return apiClient.post(`/adminDashboard/reviews/${reviewId}/comments`, data);
  },

  // Generate reviews automatically (for setup tasks, stakeholder mapping, etc.)
  generateReviews: async () => {
    return apiClient.post('/adminDashboard/reviews/generate');
  },

  // Get reviews for specific project
  getProjectReviews: async (projectId: string) => {
    return apiClient.get(`/adminDashboard/reviews?projectId=${projectId}`);
  },

  // Get reviews for specific site
  getSiteReviews: async (siteId: string) => {
    return apiClient.get(`/adminDashboard/reviews?projectSiteId=${siteId}`);
  },

  // Assign review to user
  assignReview: async (reviewId: string, userId: string) => {
    return apiClient.put(`/adminDashboard/reviews/${reviewId}/assign`, { assignedTo: userId });
  },

  // Archive review
  archiveReview: async (reviewId: string) => {
    return apiClient.put(`/adminDashboard/reviews/${reviewId}/archive`);
  }
};

export default reviewManagementApi;