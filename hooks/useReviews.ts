// hooks/useReviews.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as reviewsApi from '@/lib/api/reviews';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewStatusRequest,
  EscalateReviewRequest,
  AddReviewerRequest,
  AddIssueRequest,
  ResolveIssueRequest,
  ReviewFilters,
  ReviewModule,
  ReviewStatus,
  ReviewPriority,
  ApiResponse,
  PaginatedApiResponse,
} from '@/types';

// ==================== QUERY KEYS ====================

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters?: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  statistics: () => [...reviewKeys.all, 'statistics'] as const,
  organizationStatistics: (organizationId: string) => [...reviewKeys.statistics(), organizationId] as const,
  projectReviews: (projectId: string, filters?: ReviewFilters) => 
    [...reviewKeys.lists(), 'project', projectId, filters] as const,
  moduleItemReviews: (module: ReviewModule, moduleItemId: string, nestedItemId?: string) =>
    [...reviewKeys.lists(), 'module', module, moduleItemId, nestedItemId] as const,
  escalated: () => [...reviewKeys.all, 'escalated'] as const,
};

// ==================== QUERIES ====================

/**
 * Hook to fetch all reviews with filtering
 */
export function useReviews(
  filters?: ReviewFilters,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.list(filters),
    queryFn: () => reviewsApi.getMyReviews(filters),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch a single review by ID
 */
export function useReview(
  reviewId: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => reviewsApi.getReviewById(reviewId),
    enabled: !!reviewId && (options?.enabled !== false),
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch reviews for a specific module item
 */
export function useModuleItemReviews(
  module: ReviewModule,
  moduleItemId: string,
  nestedItemId?: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.moduleItemReviews(module, moduleItemId, nestedItemId),
    queryFn: () => reviewsApi.getReviewsByModuleItem(module, moduleItemId, nestedItemId),
    enabled: !!module && !!moduleItemId && (options?.enabled !== false),
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch review statistics for an organization
 */
export function useReviewStatistics(
  organizationId: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.organizationStatistics(organizationId),
    queryFn: () => reviewsApi.getReviewStatistics(organizationId),
    enabled: !!organizationId && (options?.enabled !== false),
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch escalated reviews (staff only)
 */
export function useEscalatedReviews(
  filters?: ReviewFilters,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.escalated(),
    queryFn: () => reviewsApi.getEscalatedReviews(filters),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch project-specific reviews
 */
export function useProjectReviews(
  projectId: string,
  filters?: Omit<ReviewFilters, 'projectId'>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.projectReviews(projectId, filters),
    queryFn: () => reviewsApi.getProjectReviews(projectId, filters),
    enabled: !!projectId && (options?.enabled !== false),
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch reviews by status
 */
export function useReviewsByStatus(
  status: ReviewStatus,
  filters?: Omit<ReviewFilters, 'status'>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.list({ ...filters, status }),
    queryFn: () => reviewsApi.getReviewsByStatus(status, filters),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch reviews by priority
 */
export function useReviewsByPriority(
  priority: ReviewPriority,
  filters?: Omit<ReviewFilters, 'priority'>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.list({ ...filters, priority }),
    queryFn: () => reviewsApi.getReviewsByPriority(priority, filters),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

/**
 * Hook to fetch overdue reviews
 */
export function useOverdueReviews(
  filters?: Omit<ReviewFilters, 'isOverdue'>,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: reviewKeys.list({ ...filters, isOverdue: true }),
    queryFn: () => reviewsApi.getOverdueReviews(filters),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    staleTime: options?.staleTime,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: (data) => {
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      
      // Invalidate statistics if organizationId is available
      if (data.data) {
        const review = data.data;
        const orgId = typeof review.organizationId === 'string' 
          ? review.organizationId 
          : review.organizationId._id;
        queryClient.invalidateQueries({ 
          queryKey: reviewKeys.organizationStatistics(orgId) 
        });
        
        // Invalidate project reviews if projectId is available
        const projectId = typeof review.projectId === 'string'
          ? review.projectId
          : review.projectId._id;
        queryClient.invalidateQueries({
          queryKey: reviewKeys.projectReviews(projectId, undefined)
        });
      }
      
      toast.success('Review created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create review');
    },
  });
}

/**
 * Hook to update review status
 */
export function useUpdateReviewStatus(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReviewStatusRequest) => 
      reviewsApi.updateReviewStatus(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });
      toast.success('Review status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update review status');
    },
  });
}

/**
 * Hook to escalate review to staff
 */
export function useEscalateReview(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EscalateReviewRequest) => 
      reviewsApi.escalateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.escalated() });
      toast.success('Review escalated to staff successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to escalate review');
    },
  });
}

/**
 * Hook to add a reviewer to a review
 */
export function useAddReviewer(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddReviewerRequest) => 
      reviewsApi.addReviewer(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success('Reviewer added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add reviewer');
    },
  });
}

/**
 * Hook to add an issue to a review
 */
export function useAddIssue(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddIssueRequest) => 
      reviewsApi.addIssue(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      toast.success('Issue added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add issue');
    },
  });
}

/**
 * Hook to resolve an issue
 */
export function useResolveIssue(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data?: ResolveIssueRequest }) => 
      reviewsApi.resolveIssue(reviewId, issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      toast.success('Issue resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve issue');
    },
  });
}

// ==================== COMBINED HOOKS ====================

/**
 * Hook to get review with loading and error states
 * Returns the review data with computed helper properties
 */
export function useReviewWithHelpers(reviewId: string) {
  const { data, isLoading, error, refetch } = useReview(reviewId);
  
  const review = data?.data;
  
  return {
    review,
    isLoading,
    error,
    refetch,
    // Helper computed properties based on current review system
    isPending: review?.status === 'pending',
    isInReview: review?.status === 'in_review',
    isApproved: review?.status === 'approved',
    isEscalated: review?.status === 'escalated',
    isResolved: review?.status === 'resolved',
    isOverdue: review?.isOverdue,
    hasUnresolvedIssues: (review?.unresolvedIssuesCount ?? 0) > 0,
    hasCriticalIssues: (review?.criticalIssuesCount ?? 0) > 0,
  };
}

/**
 * Hook to manage review workflow
 * Combines all mutations needed for review management
 */
export function useReviewWorkflow(reviewId: string) {
  const updateStatus = useUpdateReviewStatus(reviewId);
  const escalate = useEscalateReview(reviewId);
  const addReviewer = useAddReviewer(reviewId);
  const addIssue = useAddIssue(reviewId);
  const resolveIssue = useResolveIssue(reviewId);
  
  return {
    // Status updates
    startReview: (reason?: string) => 
      updateStatus.mutate({ status: 'in_review', reason }),
    approveReview: (reason?: string) => 
      updateStatus.mutate({ status: 'approved', reason }),
    resolveReview: (reason?: string) => 
      updateStatus.mutate({ status: 'resolved', reason }),
    
    // Escalation
    escalateToStaff: (data: EscalateReviewRequest) => escalate.mutate(data),
    
    // Reviewer management
    addReviewer: (reviewerId: string) => 
      addReviewer.mutate({ reviewerId }),
    
    // Issue management
    addIssue: (data: AddIssueRequest) => addIssue.mutate(data),
    resolveIssue: (issueId: string, resolutionNotes?: string) => 
      resolveIssue.mutate({ issueId, data: { resolutionNotes } }),
    
    // Loading states
    isUpdatingStatus: updateStatus.isPending,
    isEscalating: escalate.isPending,
    isAddingReviewer: addReviewer.isPending,
    isAddingIssue: addIssue.isPending,
    isResolvingIssue: resolveIssue.isPending,
  };
}

/**
 * Hook for review statistics with organization context
 */
export function useReviewDashboardData(organizationId: string) {
  const stats = useReviewStatistics(organizationId);
  const pendingReviews = useReviewsByStatus('pending');
  const escalatedReviews = useEscalatedReviews({ organizationId });
  const overdueReviews = useOverdueReviews({ organizationId });
  
  return {
    statistics: stats.data?.data?.statistics,
    criticalReviews: stats.data?.data?.criticalReviews,
    overdueReviews: overdueReviews.data?.data,
    pendingReviews: pendingReviews.data?.data,
    escalatedReviews: escalatedReviews.data?.data,
    myPendingCount: stats.data?.data?.myPendingCount,
    
    isLoading: stats.isLoading || pendingReviews.isLoading || escalatedReviews.isLoading || overdueReviews.isLoading,
    error: stats.error || pendingReviews.error || escalatedReviews.error || overdueReviews.error,
    
    refetch: () => {
      stats.refetch();
      pendingReviews.refetch();
      escalatedReviews.refetch();
      overdueReviews.refetch();
    },
  };
}