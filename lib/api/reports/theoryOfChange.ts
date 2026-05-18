// lib/api/reports/theoryOfChange.ts
import { apiClient } from '../client';
import { 
  ApiResponse, 
  TheoryOfChangeReportData, 
  ReportGenerationResponse,
  ReportFilters 
} from '@/types/reports';

// Generate work plan report (Stage 1 - Actions/Outputs only)
export const generateWorkPlanReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/theory-of-change/${projectId}/workplan`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate outcome report (Stage 2 - Impacts/Outcomes only)
export const generateOutcomeReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    frameworkFilter?: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards';
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(`/reports/theory-of-change/${projectId}/outcome`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate consultation plan report
export const generateConsultationPlanReport = async (
  projectId: string,
  siteId: string,
  options?: {
    saveReport?: boolean;
  }
) => {
  const response = await apiClient.post(`/reports/theory-of-change/${projectId}/site/${siteId}/consultation-plan`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

export const generateTheoryOfChangeReport = async (
  projectId: string,
  options?: {
    saveReport?: boolean;
    reportDimension?: 'full' | 'workplan' | 'outcome';
    frameworkFilter?: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards';
    filters?: ReportFilters;
    siteId?: string; // NEW: Optional site ID for consultation plan
    includeConsultationPlan?: boolean; // NEW: Flag to include consultation plan
  }
) => {
  // Route to appropriate endpoint based on dimension
  if (options?.reportDimension === 'workplan') {
    return generateWorkPlanReport(projectId, options);
  } else if (options?.reportDimension === 'outcome') {
    // Check if we should generate consultation plan instead
    if (options?.siteId && options?.includeConsultationPlan) {
      return generateConsultationPlanReport(projectId, options.siteId, {
        saveReport: options.saveReport
      });
    }
    return generateOutcomeReport(projectId, options);
  }
  
  // Full report
  const response = await apiClient.post(`/reports/theory-of-change/${projectId}/full`, options);
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Generate site-specific reports
export const generateSiteSpecificToCReport = async (
  projectId: string,
  siteId: string,
  reportType: 'full' | 'workplan' | 'outcome',
  options?: {
    saveReport?: boolean;
    frameworkFilter?: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards';
    filters?: ReportFilters;
  }
) => {
  const response = await apiClient.post(
    `/reports/theory-of-change/${projectId}/site/${siteId}/${reportType}`, 
    options
  );
  return response.data as ApiResponse<ReportGenerationResponse>;
};

// Get Gantt chart data (lightweight)
export const getGanttChartData = async (
  projectId: string,
  filters?: ReportFilters
) => {
  const response = await apiClient.get(`/reports/theory-of-change/${projectId}/gantt`, {
    params: filters
  });
  return response.data as ApiResponse<{
    ganttTimeline: any[];
    timelineAnalysis: any;
    workloadDistribution: any[];
  }>;
};