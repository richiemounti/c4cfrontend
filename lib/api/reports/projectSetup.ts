// lib/api/reports/projectSetup.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  ProjectSetupReportData, 
  ReportGenerationResponse,
  ReportFilters 
} from '@/types/reports';

// Generate project setup report
export const generateProjectSetupReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
  }
) => {
  const response = await apiClient.post(`/reports/project-setup/${projectId}`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Get project setup summary stats
export const getProjectSetupSummary = async (projectId: string) => {
  const response = await apiClient.get(`/reports/project-setup/${projectId}/summary`);
  return response.data as ApiResponse<{
    totalTasks: number;
    completedTasks: number;
    requiredTasks: number;
    completedRequiredTasks: number;
    completionPercentage: number;
    isComplete: boolean;
    tasksByStep: Record<number, { total: number; completed: number }>;
    lastUpdated: string;
  }>;
};