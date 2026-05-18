// lib/api/reports/workflow.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  ReportStatus,
  ReportType,
  WorkflowHistoryEntry 
} from '@/types/reports';

// Transition report status
export const transitionReportStatus = async (
  reportId: string,
  status: ReportStatus,
  options?: {
    notes?: string;
    force?: boolean;
  }
) => {
  const response = await apiClient.put(`/reports/workflow/${reportId}/status`, {
    status,
    ...options
  });
  return response.data as ApiResponse<{ message: string }>;
};

// Check if report needs regeneration
export const checkRegenerationStatus = async (reportId: string) => {
  const response = await apiClient.get(`/reports/workflow/${reportId}/regeneration-status`);
  return response.data as ApiResponse<{
    needsRegeneration: boolean;
    reasons: string[];
    lastDataUpdate?: string;
    reportGeneratedAt?: string;
  }>;
};

// Trigger report regeneration
export const regenerateReport = async (
  reportId: string,
  options?: {
    force?: boolean;
  }
) => {
  const response = await apiClient.post(`/reports/workflow/${reportId}/regenerate`, options);
  return response.data as ApiResponse<{
    regenerated: boolean;
    report?: any;
  }>;
};

// Get workflow history for a report
export const getWorkflowHistory = async (reportId: string) => {
  const response = await apiClient.get(`/reports/workflow/${reportId}/workflow-history`);
  return response.data as ApiResponse<{
    reportId: string;
    workflowHistory: WorkflowHistoryEntry[];
  }>;
};

// Get workflow configuration and available transitions
export const getWorkflowConfig = async (reportId: string) => {
  const response = await apiClient.get(`/reports/workflow/${reportId}/workflow-config`);
  return response.data as ApiResponse<{
    reportId: string;
    currentStatus: ReportStatus;
    availableTransitions: ReportStatus[];
    userPermissions: {
      canEdit: boolean;
      canApprove: boolean;
      canPublish: boolean;
      canArchive: boolean;
    };
    workflowSteps: Record<ReportStatus, string>;
  }>;
};

// Get report expiration status
export const getExpirationStatus = async (reportId: string) => {
  const response = await apiClient.get(`/reports/workflow/${reportId}/expiration-status`);
  return response.data as ApiResponse<{
    reportId: string;
    reportType: ReportType;
    createdAt: string;
    ageInDays: number;
    maxAgeInDays: number;
    warningPeriodDays: number;
    isExpired: boolean;
    isNearingExpiration: boolean;
    daysUntilExpiration: number | null;
    recommendedAction: 'immediate_regeneration' | 'schedule_regeneration' | 'no_action_needed';
  }>;
};

// Schedule automatic report regeneration
export const scheduleRegeneration = async (
  reportId: string,
  scheduledDate: string,
  options?: {
    recurring?: boolean;
    frequency?: string;
  }
) => {
  const response = await apiClient.post(`/reports/workflow/${reportId}/schedule-regeneration`, {
    scheduledDate,
    ...options
  });
  return response.data as ApiResponse<{
    reportId: string;
    scheduledDate: string;
    recurring?: boolean;
    frequency?: string;
  }>;
};

// Auto-regenerate stale reports (Admin only)
export const autoRegenerateReports = async (
  organizationId?: string,
  reportType?: ReportType,
  maxReports?: number
) => {
  const response = await apiClient.post('/reports/workflow/auto-regenerate', {
    organizationId,
    reportType,
    maxReports
  });
  return response.data as ApiResponse<{
    regenerated: number;
    failed: number;
    results: Array<{
      reportId: string;
      success: boolean;
      error?: string;
    }>;
  }>;
};

// Bulk status transition
export const bulkStatusTransition = async (
  reportIds: string[],
  status: ReportStatus,
  notes?: string
) => {
  const response = await apiClient.put('/reports/workflow/bulk-status', {
    reportIds,
    status,
    notes
  });
  return response.data as ApiResponse<{
    successful: string[];
    failed: Array<{ reportId: string; error: string }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }>;
};

// Get reports requiring attention
export const getReportsRequiringAttention = async (organizationId?: string) => {
  const response = await apiClient.get('/reports/workflow/attention-required', {
    params: { organizationId }
  });
  return response.data as ApiResponse<{
    expired: any[];
    pendingApproval: any[];
    nearingExpiration: any[];
    failedRegeneration: any[];
  }>;
};
