// lib/api/reports/admin.ts
import { apiClient } from '../client';
import { ApiResponse } from '@/types/reports';

// Get cache statistics (Admin only)
export const getCacheStats = async () => {
  const response = await apiClient.get('/reports/cache/stats');
  return response.data as ApiResponse<{
    layer: 'memory' | 'redis' | 'hybrid';
    memory: {
      keys: number;
      hits: number;
      misses: number;
      ksize: number;
      vsize: number;
    };
    redis: {
      connected: boolean;
      memory: number;
      keys: number;
    };
  }>;
};

// Clear report caches (Admin only)
export const clearCaches = async (options?: {
  scope?: 'all' | 'project' | 'report';
  projectId?: string;
  reportId?: string;
}) => {
  const response = await apiClient.delete('/reports/cache', { data: options });
  return response.data as ApiResponse<{ message: string }>;
};

// Build search indexes (Admin only)
export const buildSearchIndex = async () => {
  const response = await apiClient.post('/reports/search/build-index');
  return response.data as ApiResponse<{ message: string }>;
};

// Cleanup old data (Admin only)
export const cleanupOldData = async (options?: {
  snapshotRetentionDays?: number;
  activityRetentionDays?: number;
  maxSnapshotsPerReport?: number;
  reportId?: string;
}) => {
  const response = await apiClient.delete('/reports/history/cleanup', { data: options });
  return response.data as ApiResponse<{
    snapshots: {
      deleted: number;
      preserved: number;
    };
    activity: {
      activitiesDeleted: number;
      sessionsDeleted: number;
      collaborationEventsDeleted: number;
    };
    totalRecordsProcessed: number;
  }>;
};

// Get user activity summary
export const getUserActivitySummary = async (
  userId: string,
  params?: {
    reportId?: string;
    fromDate?: string;
    toDate?: string;
  }
) => {
  const response = await apiClient.get(`/reports/history/activity/user/${userId}/summary`, { params });
  return response.data as ApiResponse<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    recentActivities: any[];
    mostActiveReports: Array<{
      reportId: string;
      reportTitle: string;
      activityCount: number;
    }>;
    timeSpentByReport: Array<{
      reportId: string;
      reportTitle: string;
      totalTime: number;
    }>;
  }>;
};

// Track collaboration event
export const trackCollaboration = async (
  reportId: string,
  eventType: 'concurrent_edit' | 'comment_thread' | 'review_session' | 'approval_process',
  participants: Array<{
    userId: string;
    role: string;
  }>
) => {
  const response = await apiClient.post(`/reports/history/${reportId}/collaboration`, {
    eventType,
    participants
  });
  return response.data as ApiResponse<any>;
};

// End collaboration event
export const endCollaboration = async (
  collaborationEventId: string,
  summary?: string
) => {
  const response = await apiClient.put(`/reports/history/collaboration/${collaborationEventId}/end`, {
    summary
  });
  return response.data as ApiResponse<{ message: string }>;
};

// Get collaboration analytics
export const getCollaborationAnalytics = async (
  reportId: string,
  params?: {
    fromDate?: string;
    toDate?: string;
  }
) => {
  const response = await apiClient.get(`/reports/history/${reportId}/collaboration/analytics`, { params });
  return response.data as ApiResponse<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    activeCollaborators: Array<{
      userId: string;
      name: string;
      contributionScore: number;
      eventsParticipated: number;
    }>;
    collaborationTimeline: any[];
  }>;
};
