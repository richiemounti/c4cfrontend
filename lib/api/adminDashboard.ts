// lib/api/adminDashboard.ts
import { DashboardOverview, OrganizationSummary, ReviewItem } from '@/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get dashboard overview data
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  try {
    const response = await apiClient.get('/overview');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch dashboard overview');
    }
    throw new Error('Failed to fetch dashboard overview. Please check your connection.');
  }
};

/**
 * Get organizations summary
 */
export const getOrganizationsSummary = async (filters: {
  stage?: string;
  country?: string;
  status?: string;
} = {}): Promise<OrganizationSummary[]> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await apiClient.get(`/organizations?${queryParams}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch organizations');
    }
    throw new Error('Failed to fetch organizations. Please check your connection.');
  }
};

/**
 * Get review queue
 */
export const getReviewQueue = async (filters: {
  status?: string;
  priority?: string;
  entityType?: string;
  assignedTo?: string;
  overdue?: boolean;
} = {}): Promise<ReviewItem[]> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    const response = await apiClient.get(`/reviews?${queryParams}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch reviews');
    }
    throw new Error('Failed to fetch reviews. Please check your connection.');
  }
};

/**
 * Generate review items automatically
 */
export const generateReviews = async (): Promise<{
  created: number;
  projectSetups: number;
  siteSetups: number;
  consultationPlans: number;
  stakeholderMappings: number;
}> => {
  try {
    const response = await apiClient.post('/reviews/generate');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to generate reviews');
    }
    throw new Error('Failed to generate reviews. Please check your connection.');
  }
};

/**
 * Get detailed review information with entity-specific tasks
 */
export const getDetailedReviewWithTasks = async (reviewId: string) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}/detailed`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch detailed review');
    }
    throw new Error('Failed to fetch detailed review. Please check your connection.');
  }
};

/**
 * Update task completion status in a review
 */
export const updateReviewTaskStatus = async (reviewId: string, taskId: string, data: {
  isApproved: boolean;
  comment?: string;
  requiresChanges?: boolean;
}) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}/tasks/${taskId}`, data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update task status');
    }
    throw new Error('Failed to update task status. Please check your connection.');
  }
};

/**
 * Add task-specific comment to review
 */
export const addReviewTaskComment = async (reviewId: string, taskId: string, data: {
  content: string;
  type?: 'comment' | 'approval' | 'rejection' | 'request_changes';
}) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/tasks/${taskId}/comments`, data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to add task comment');
    }
    throw new Error('Failed to add task comment. Please check your connection.');
  }
};

/**
 * Get stakeholder groups for stakeholder mapping review
 */
export const getStakeholderGroupsForReview = async (projectId: string, siteId?: string) => {
  try {
    const queryParams = new URLSearchParams();
    if (siteId) queryParams.append('siteId', siteId);
    
    const response = await apiClient.get(`/reviews/stakeholder-groups/${projectId}?${queryParams}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch stakeholder groups');
    }
    throw new Error('Failed to fetch stakeholder groups. Please check your connection.');
  }
};

/**
 * Get theory of change stages for ToC review
 */
export const getTheoryOfChangeStagesForReview = async (projectId: string, siteId?: string) => {
  try {
    const queryParams = new URLSearchParams();
    if (siteId) queryParams.append('siteId', siteId);
    
    const response = await apiClient.get(`/reviews/toc-stages/${projectId}?${queryParams}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch ToC stages');
    }
    throw new Error('Failed to fetch ToC stages. Please check your connection.');
  }
};

/**
 * Finalize review with overall approval/rejection
 */
export const finalizeReview = async (reviewId: string, data: {
  status: 'approved' | 'rejected';
  finalComment?: string;
  overallScore?: number;
}) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}/finalize`, data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to finalize review');
    }
    throw new Error('Failed to finalize review. Please check your connection.');
  }
};

/**
 * Get review checklist items based on entity type
 */
export const getReviewChecklist = async (entityType: string, entityId: string) => {
  try {
    const response = await apiClient.get(`/reviews/checklist/${entityType}/${entityId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch review checklist');
    }
    throw new Error('Failed to fetch review checklist. Please check your connection.');
  }
};

/**
 * Get detailed project information for dashboard
 */
export const getProjectDetail = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/project/${projectId}/detail`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch project details');
    }
    throw new Error('Failed to fetch project details. Please check your connection.');
  }
};

/**
 * Get detailed project site information for dashboard
 */
export const getProjectSiteDetail = async (siteId: string) => {
  try {
    const response = await apiClient.get(`/project-site/${siteId}/detail`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch site details');
    }
    throw new Error('Failed to fetch site details. Please check your connection.');
  }
};

/**
 * Get timeline for project or site
 */
export const getEntityTimeline = async (entityType: 'project' | 'projectSite', entityId: string) => {
  try {
    const response = await apiClient.get(`/timeline/${entityType}/${entityId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch timeline');
    }
    throw new Error('Failed to fetch timeline. Please check your connection.');
  }
};

/**
 * Get project setup tasks
 */
export const getProjectSetupTasks = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/project/${projectId}/setup-tasks`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch setup tasks');
    }
    throw new Error('Failed to fetch setup tasks. Please check your connection.');
  }
};

/**
 * Get site setup tasks
 */
export const getSiteSetupTasks = async (siteId: string) => {
  try {
    const response = await apiClient.get(`/project-site/${siteId}/setup-tasks`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch setup tasks');
    }
    throw new Error('Failed to fetch setup tasks. Please check your connection.');
  }
};

// Review Management Functions
export const createReview = async (data: any) => {
  try {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to create review');
    }
    throw new Error('Failed to create review. Please check your connection.');
  }
};

export const assignReview = async (reviewId: string, userId: string) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}/assign`, { assignedTo: userId });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to assign review');
    }
    throw new Error('Failed to assign review. Please check your connection.');
  }
};

/**
 * Get detailed review information
 */
export const getReviewDetails = async (reviewId: string) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch review details');
    }
    throw new Error('Failed to fetch review details. Please check your connection.');
  }
};

/**
 * Update review status
 */
export const updateReviewStatus = async (reviewId: string, data: {
  status: string;
  completedTasks?: number;
  notes?: string;
}) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}/status`, data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update review status');
    }
    throw new Error('Failed to update review status. Please check your connection.');
  }
};

/**
 * Add comment to review
 */
export const addReviewComment = async (reviewId: string, data: {
  content: string;
  type?: 'comment' | 'approval' | 'rejection' | 'request_changes';
}) => {
  try {
    const response = await apiClient.post(`/reviews/${reviewId}/comments`, data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to add comment');
    }
    throw new Error('Failed to add comment. Please check your connection.');
  }
};

/**
 * Get users for assignment dropdowns
 */
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data.data || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch users');
    }
    throw new Error('Failed to fetch users. Please check your connection.');
  }
};

export default {
  getDashboardOverview,
  getOrganizationsSummary,
  getReviewQueue,
  generateReviews,
  getProjectDetail,
  getProjectSiteDetail,
  getEntityTimeline,
  getProjectSetupTasks,
  getSiteSetupTasks,
  createReview,
  assignReview,
  getReviewDetails,
  updateReviewStatus,
  addReviewComment,
  getDetailedReviewWithTasks,
  updateReviewTaskStatus,
  addReviewTaskComment,
  getStakeholderGroupsForReview,
  getTheoryOfChangeStagesForReview,
  finalizeReview,
  getReviewChecklist,
  getUsers
};