// lib/api/reports/background.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  BackgroundJob,
  BackgroundJobOptions,
  JobStatus,
  QueueStats,
  ReportType 
} from '@/types/reports';

// Queue single report generation
export const queueReportGeneration = async (
  reportType: ReportType,
  entityType: 'project' | 'project_site',
  entityId: string,
  options?: BackgroundJobOptions
) => {
  const response = await apiClient.post('/reports/generate/background', {
    reportType,
    entityType,
    entityId,
    options
  });
  return response.data as ApiResponse<BackgroundJob>;
};

// Queue batch report generation
export const queueBatchGeneration = async (
  reports: Array<{
    reportType: ReportType;
    entityType: 'project' | 'project_site';
    entityId: string;
    filters?: any;
  }>,
  organizationId: string,
  options?: {
    saveReports?: boolean;
    cacheResults?: boolean;
    priority?: 'low' | 'normal' | 'high';
  }
) => {
  const response = await apiClient.post('/reports/generate/batch', {
    reports,
    organizationId,
    options
  });
  return response.data as ApiResponse<BackgroundJob & {
    reportCount: number;
  }>;
};

// Get background job status
export const getJobStatus = async (
  jobId: string,
  queueType?: 'report' | 'batch' | 'regeneration'
) => {
  const response = await apiClient.get(`/reports/jobs/${jobId}/status`, {
    params: { queueType }
  });
  return response.data as ApiResponse<JobStatus>;
};

// Cancel background job
export const cancelJob = async (
  jobId: string,
  queueType?: 'report' | 'batch' | 'regeneration'
) => {
  const response = await apiClient.delete(`/reports/jobs/${jobId}`, {
    params: { queueType }
  });
  return response.data as ApiResponse<{ message: string }>;
};

// Get queue statistics (Admin only)
export const getQueueStats = async () => {
  const response = await apiClient.get('/reports/queues/stats');
  return response.data as ApiResponse<QueueStats>;
};