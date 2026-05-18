// lib/api/review.ts
import { apiClient } from './client';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewStatusRequest,
  EscalateReviewRequest,
  AddReviewerRequest,
  AddIssueRequest,
  ResolveIssueRequest,
  ReviewStatistics,
  ReviewFilters,
  ReviewModule,
  PaginatedApiResponse,
  ApiResponse,
} from '@/types';

/**
 * Create a new review manually
 */
export const createReview = async (data: CreateReviewRequest) => {
  try {
    const response = await apiClient.post('/reviews', data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Get reviews for current user (as submitter, reviewer, or escalated to)
 */
export const getMyReviews = async (filters?: ReviewFilters) => {
  try {
    const response = await apiClient.get('/reviews/my-reviews', { params: filters });
    return response.data as PaginatedApiResponse<Review>;
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    throw error;
  }
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId: string) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Get reviews for a specific module item
 */
export const getReviewsByModuleItem = async (
  module: ReviewModule,
  moduleItemId: string,
  nestedItemId?: string
) => {
  try {
    const params = nestedItemId ? { nestedItemId } : undefined;
    const response = await apiClient.get(
      `/reviews/module/${module}/item/${moduleItemId}`,
      { params }
    );
    return response.data as ApiResponse<Review[]>;
  } catch (error) {
    console.error(`Error fetching reviews for ${module} item ${moduleItemId}:`, error);
    throw error;
  }
};

/**
 * Update review status
 */
export const updateReviewStatus = async (
  reviewId: string,
  data: UpdateReviewStatusRequest
) => {
  try {
    const response = await apiClient.patch(`/reviews/${reviewId}/status`, data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error updating review status ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Escalate review to staff
 */
export const escalateReview = async (
  reviewId: string,
  data: EscalateReviewRequest
) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/escalate`, data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error escalating review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Add a reviewer to a review
 */
export const addReviewer = async (
  reviewId: string,
  data: AddReviewerRequest
) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/reviewers`, data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error adding reviewer to review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Add an issue to a review
 */
export const addIssue = async (
  reviewId: string,
  data: AddIssueRequest
) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/issues`, data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error adding issue to review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Resolve an issue
 */
export const resolveIssue = async (
  reviewId: string,
  issueId: string,
  data?: ResolveIssueRequest
) => {
  try {
    const response = await apiClient.patch(
      `/reviews/${reviewId}/issues/${issueId}/resolve`,
      data
    );
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error resolving issue ${issueId}:`, error);
    throw error;
  }
};

/**
 * Get escalated reviews (staff only)
 */
export const getEscalatedReviews = async (filters?: ReviewFilters) => {
  try {
    const response = await apiClient.get('/reviews/escalated/all', { params: filters });
    return response.data as PaginatedApiResponse<Review>;
  } catch (error) {
    console.error('Error fetching escalated reviews:', error);
    throw error;
  }
};

/**
 * Get review statistics for an organization
 */
export const getReviewStatistics = async (organizationId: string) => {
  try {
    const response = await apiClient.get(`/reviews/statistics/${organizationId}`);
    return response.data as ApiResponse<{
      statistics: ReviewStatistics;
      criticalReviews: Review[];
      overdueReviews: Review[];
      myPendingCount: number;
    }>;
  } catch (error) {
    console.error(`Error fetching review statistics for org ${organizationId}:`, error);
    throw error;
  }
};

/**
 * Get eligible reviewers for a review
 * Returns users who have project access and review_management permission
 */
export const getEligibleReviewers = async (reviewId: string) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}/eligible-reviewers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching eligible reviewers:', error);
    throw error;
  }
};

/**
 * Helper: Get reviews by status
 */
export const getReviewsByStatus = async (
  status: ReviewFilters['status'],
  filters?: Omit<ReviewFilters, 'status'>
) => {
  return getMyReviews({ ...filters, status });
};

/**
 * Helper: Get overdue reviews
 */
export const getOverdueReviews = async (filters?: Omit<ReviewFilters, 'isOverdue'>) => {
  return getMyReviews({ ...filters, isOverdue: true });
};

/**
 * Helper: Get reviews by priority
 */
export const getReviewsByPriority = async (
  priority: ReviewFilters['priority'],
  filters?: Omit<ReviewFilters, 'priority'>
) => {
  return getMyReviews({ ...filters, priority });
};

/**
 * Helper: Get reviews for a project
 */
export const getProjectReviews = async (
  projectId: string,
  filters?: Omit<ReviewFilters, 'projectId'>
) => {
  return getMyReviews({ ...filters, projectId });
};

/**
 * Helper: Get reviews for a project site
 */
export const getProjectSiteReviews = async (
  projectSiteId: string,
  filters?: Omit<ReviewFilters, 'projectSiteId'>
) => {
  return getMyReviews({ ...filters, projectSiteId });
};

/**
 * Invite a staff member to collaborate on an escalated review.
 * @route POST /api/v1/reviews/:reviewId/staff-collaborators
 */
export const inviteStaffCollaborator = async (
  reviewId: string,
  data: { collaboratorId: string; message?: string }
) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/staff-collaborators`, data);
    return response.data as ApiResponse<Review>;
  } catch (error) {
    console.error(`Error inviting collaborator to review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Get staff members eligible to be added as collaborators.
 * Returns active ConnectGo staff excluding existing chatParticipants.
 * @route GET /api/v1/reviews/:reviewId/eligible-collaborators
 */
export const getEligibleStaffCollaborators = async (reviewId: string) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}/eligible-collaborators`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching eligible collaborators for review ${reviewId}:`, error);
    throw error;
  }
};

export default {
  createReview,
  getMyReviews,
  getReviewById,
  getReviewsByModuleItem,
  updateReviewStatus,
  escalateReview,
  addReviewer,
  addIssue,
  resolveIssue,
  getEscalatedReviews,
  getReviewStatistics,
  getEligibleReviewers,
  // Helpers
  getReviewsByStatus,
  getOverdueReviews,
  getReviewsByPriority,
  getProjectReviews,
  getProjectSiteReviews,
  inviteStaffCollaborator,
  getEligibleStaffCollaborators,
};