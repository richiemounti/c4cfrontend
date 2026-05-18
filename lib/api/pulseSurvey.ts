// lib/api/pulseSurvey.ts
import { apiClient } from './client';
import {
  PulseSurvey,
  PulseSurveyResponse,
  PulseSurveyResponsePayload,
  PulseSurveyCheckResult,
  PulseSurveyAnalytics,
  ModuleType
} from '@/types/pulseSurvey';

// ============ PULSE SURVEY TEMPLATE FUNCTIONS ============

/**
 * Create or update a pulse survey template
 * @param surveyData - Survey template data
 */
export const createOrUpdatePulseSurvey = async (surveyData: {
  moduleType: ModuleType;
  title: string;
  description?: string;
  questions: any[];
  isActive?: boolean;
  showToAllUsers?: boolean;
}) => {
  const response = await apiClient.post('/pulse-surveys', surveyData);
  return response.data.pulseSurvey as PulseSurvey;
};

/**
 * Get all pulse survey templates
 * @param includeArchived - Whether to include archived surveys
 */
export const getAllPulseSurveys = async (includeArchived: boolean = false) => {
  const response = await apiClient.get('/pulse-surveys', {
    params: { includeArchived }
  });
  return {
    pulseSurveys: response.data.pulseSurveys as PulseSurvey[],
    count: response.data.count as number
  };
};

/**
 * Get pulse survey template by module type
 * @param moduleType - The module type to get survey for
 */
export const getPulseSurveyByModule = async (moduleType: ModuleType) => {
  const response = await apiClient.get(`/pulse-surveys/${moduleType}`);
  return response.data.pulseSurvey as PulseSurvey;
};

/**
 * Archive a pulse survey template
 * @param surveyId - The survey ID to archive
 */
export const archivePulseSurvey = async (surveyId: string) => {
  const response = await apiClient.delete(`/pulse-surveys/${surveyId}`);
  return response.data.pulseSurvey as PulseSurvey;
};

// ============ PULSE SURVEY RESPONSE FUNCTIONS ============

/**
 * Submit a pulse survey response
 * @param responseData - The response payload
 */
export const submitPulseSurveyResponse = async (
  responseData: PulseSurveyResponsePayload
) => {
  const response = await apiClient.post('/pulse-surveys/responses', responseData);
  return response.data.response as PulseSurveyResponse;
};

/**
 * Get pulse survey responses with filters
 * @param filters - Filter options
 */
export const getPulseSurveyResponses = async (filters?: {
  organizationId?: string;
  projectId?: string;
  projectSiteId?: string;
  moduleType?: ModuleType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/pulse-surveys/responses', {
    params: filters
  });
  return {
    responses: response.data.responses as PulseSurveyResponse[],
    pagination: response.data.pagination as {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    }
  };
};

/**
 * Get pulse survey analytics
 * @param filters - Filter options for analytics
 */
export const getPulseSurveyAnalytics = async (filters?: {
  organizationId?: string;
  projectId?: string;
  projectSiteId?: string;
  moduleType?: ModuleType;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await apiClient.get('/pulse-surveys/analytics', {
    params: filters
  });
  return response.data as PulseSurveyAnalytics;
};

/**
 * Check if pulse survey is required for a module completion
 * @param moduleType - The module type
 * @param moduleReference - The module instance ID
 */
export const checkPulseSurveyRequired = async (
  moduleType: ModuleType,
  moduleReference: string
) => {
  const response = await apiClient.get(
    `/pulse-surveys/check-required/${moduleType}/${moduleReference}`
  );
  return response.data as PulseSurveyCheckResult;
};

// ============ HELPER FUNCTIONS ============

/**
 * Get module reference model name for a given module type
 * @param moduleType - The module type
 */
export const getModuleReferenceModel = (moduleType: ModuleType): string => {
  const modelMap: Record<ModuleType, string> = {
    'setup_project': 'ProjectSetup',
    'setup_site': 'ProjectSiteSetup',
    'theory_of_change_stage_1': 'TheoryOfChangeStage',
    'theory_of_change_stage_2': 'TheoryOfChangeStage',
    'survey_creation': 'Survey',
    'survey_analysis': 'Survey'
  };
  return modelMap[moduleType] || 'Unknown';
};

/**
 * Check if user has completed pulse survey for a module
 * @param moduleType - The module type
 * @param moduleReference - The module instance ID
 * @returns Promise<boolean>
 */
export const hasCompletedPulseSurvey = async (
  moduleType: ModuleType,
  moduleReference: string
): Promise<boolean> => {
  try {
    const result = await checkPulseSurveyRequired(moduleType, moduleReference);
    return result.alreadyCompleted === true;
  } catch (error) {
    console.error('Error checking pulse survey completion:', error);
    return false;
  }
};

/**
 * Get user's response for a specific module
 * @param moduleReference - The module instance ID
 * @param userId - The user ID (optional, defaults to current user)
 */
export const getUserModuleResponse = async (
  moduleReference: string,
  userId?: string
) => {
  // This would need to be implemented if you want to fetch a specific user's response
  // For now, you can use getPulseSurveyResponses with appropriate filters
  const responses = await getPulseSurveyResponses({
    // Add appropriate filters
  });
  
  return responses.responses.find(
    r => r.moduleReference === moduleReference
  );
};

// ============ DASHBOARD STATISTICS FUNCTION ============

/**
 * Get simplified pulse survey stats for dashboard display
 * Calculates metrics from analytics data for easy dashboard consumption
 * @param filters - Optional filters (organizationId, projectId, etc.)
 */
export const getPulseSurveyStats = async (filters?: {
  organizationId?: string;
  projectId?: string;
  projectSiteId?: string;
  moduleType?: ModuleType;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    // Fetch analytics data from the backend
    const analytics = await getPulseSurveyAnalytics(filters);
    
    // Calculate satisfaction percentage from average rating (1-5 scale)
    // Formula: (averageRating / 5) * 100
    const averageRating = analytics.overall.averageRating || 0;
    const satisfactionPercentage = averageRating > 0 
      ? Math.round((averageRating / 5) * 100) 
      : 0;
    
    // Calculate positive percentage (ratings 4 and 5 out of 5)
    // This shows how many responses were "good" or "excellent"
    const positiveCount = analytics.ratingDistribution
      .filter(dist => {
        const rating = typeof dist._id === 'number' ? dist._id : parseInt(dist._id);
        return rating >= 4;
      })
      .reduce((sum, dist) => sum + dist.count, 0);
    
    const positivePercentage = analytics.overall.totalResponses > 0
      ? Math.round((positiveCount / analytics.overall.totalResponses) * 100)
      : 0;
    
    // Return simplified stats object for dashboard
    return {
      totalResponses: analytics.overall.totalResponses || 0,
      averageRating: averageRating,
      satisfactionPercentage: satisfactionPercentage,
      positivePercentage: positivePercentage,
      averageTimeToComplete: analytics.overall.averageTimeToComplete || 0,
      byModule: analytics.byModule || [],
      ratingDistribution: analytics.ratingDistribution || [],
      responsesTrend: analytics.responsesTrend || []
    };
  } catch (error) {
    console.error('Error fetching pulse survey stats:', error);
    // Return default values if there's an error
    return {
      totalResponses: 0,
      averageRating: 0,
      satisfactionPercentage: 0,
      positivePercentage: 0,
      averageTimeToComplete: 0,
      byModule: [],
      ratingDistribution: [],
      responsesTrend: []
    };
  }
};