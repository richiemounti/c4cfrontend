// lib/api/reports/history.ts
import { apiClient } from '../client';
import { ApiResponse } from '@/types/reports';

// Create manual snapshot of a report
export const createReportSnapshot = async (
  reportId: string,
  reason: string,
  forceSnapshot?: boolean
) => {
  const response = await apiClient.post(`/reports/history/${reportId}/snapshots`, {
    reason,
    forceSnapshot
  });
  return response.data as ApiResponse<any>;
};

// Get snapshots for a report
export const getReportSnapshots = async (
  reportId: string,
  params?: {
    page?: number;
    limit?: number;
    snapshotType?: string;
    fromDate?: string;
    toDate?: string;
  }
) => {
  const response = await apiClient.get(`/reports/history/${reportId}/snapshots`, { params });
  return response.data as ApiResponse<{
    snapshots: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
};

// Get specific snapshot by ID
export const getSnapshotById = async (snapshotId: string) => {
  const response = await apiClient.get(`/reports/history/snapshots/${snapshotId}`);
  return response.data as ApiResponse<any>;
};

// Compare two snapshots
export const compareSnapshots = async (
  fromSnapshotId: string,
  toSnapshotId: string
) => {
  const response = await apiClient.get(`/reports/history/snapshots/${fromSnapshotId}/compare/${toSnapshotId}`);
  return response.data as ApiResponse<any>;
};

// Restore report from snapshot
export const restoreFromSnapshot = async (
  snapshotId: string,
  createBackup?: boolean
) => {
  const response = await apiClient.post(`/reports/history/snapshots/${snapshotId}/restore`, {
    createBackup
  });
  return response.data as ApiResponse<{
    reportId: string;
    restoredAt: string;
    backupCreated: boolean;
  }>;
};

// Get report activity history
export const getReportActivity = async (
  reportId: string,
  params?: {
    userId?: string;
    activityTypes?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }
) => {
  const response = await apiClient.get(`/reports/history/${reportId}/activity`, { params });
  return response.data as ApiResponse<{
    activities: any[];
    pagination: any;
    summary: any;
  }>;
};

// Get report version history (snapshots with comparison data)
export const getReportVersionHistory = async (
  reportId: string,
  limit?: number
) => {
  const response = await apiClient.get(`/reports/history/${reportId}/versions`, {
    params: { limit }
  });
  return response.data as ApiResponse<{
    versions: any[];
    pagination: any;
  }>;
};

// Start user session tracking
export const startUserSession = async (
  reportId: string,
  sessionId: string
) => {
  const response = await apiClient.post(`/reports/history/${reportId}/session/start`, {
    sessionId
  });
  return response.data as ApiResponse<any>;
};

// End user session
export const endUserSession = async (sessionId: string) => {
  const response = await apiClient.post(`/reports/history/session/${sessionId}/end`);
  return response.data as ApiResponse<{ message: string }>;
};

// Log custom user activity
export const logCustomActivity = async (
  reportId: string,
  activityType: 'view' | 'edit' | 'export' | 'share' | 'approve' | 'comment' | 'restore',
  action: string,
  options?: {
    description?: string;
    metadata?: any;
    duration?: number;
    sessionId?: string;
  }
) => {
  const response = await apiClient.post(`/reports/history/${reportId}/activity/log`, {
    activityType,
    action,
    ...options
  });
  return response.data as ApiResponse<any>;
};

