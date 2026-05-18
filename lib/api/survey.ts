// lib/api/survey.ts - UNIFIED VERSION
import { apiClient } from './client';
import {
  Survey,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  SurveyStatistics,
  FilteredQuestionsRequest,
  FilteredQuestionsResponse,
  SurveyCreationContext,
  CategorizedSurveyRequest,
  SurveysByStakeholderResponse,
  SurveysByProjectResponse,
  UpdateSurveyCategoryRequest,
  CloneSurveyRequest,
  SurveyStatsResponse
} from '@/types';

// ===============================
// CORE SURVEY CRUD OPERATIONS
// ===============================

/**
 * Create a new survey (supports both simple and enhanced creation)
 */
export const createSurvey = async (data: CreateSurveyRequest | CategorizedSurveyRequest) => {
  try {
    const response = await apiClient.post('/surveys', data);
    return response.data;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

/**
 * Get all surveys with filtering and pagination
 */
export const getSurveys = async (params: {
  page?: number;
  limit?: number;
  project?: string;
  stakeholderGroup?: string;
  theoryOfChangeStage?: string;
  projectSite?: string;
  status?: string;
  category?: string;
  isTemplate?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  try {
    const response = await apiClient.get('/surveys', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

/**
 * Get a single survey by ID
 */
export const getSurvey = async (id: string, populate?: string) => {
  try {
    const params = populate ? { populate } : {};
    const response = await apiClient.get(`/surveys/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey ${id}:`, error);
    throw error;
  }
};

/**
 * Update a survey
 */
export const updateSurvey = async (id: string, data: UpdateSurveyRequest) => {
  try {
    const response = await apiClient.put(`/surveys/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    throw error;
  }
};

/**
 * Archive a survey (soft delete)
 */
export const archiveSurvey = async (id: string) => {
  try {
    const response = await apiClient.delete(`/surveys/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving survey ${id}:`, error);
    throw error;
  }
};

/**
 * Restore an archived survey
 */
export const restoreSurvey = async (id: string) => {
  try {
    const response = await apiClient.post(`/surveys/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring survey ${id}:`, error);
    throw error;
  }
};

/**
 * Permanently delete a survey (ConnectGo staff only)
 */
export const deleteSurvey = async (id: string) => {
  try {
    const response = await apiClient.delete(`/surveys/${id}/permanent`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    throw error;
  }
};

/**
 * Clone a survey
 */
export const cloneSurvey = async (id: string, options?: {
  title?: string;
  projectId?: string;
  stakeholderGroupId?: string;
}) => {
  try {
    const response = await apiClient.post(`/surveys/${id}/clone`, options);
    return response.data;
  } catch (error) {
    console.error(`Error cloning survey ${id}:`, error);
    throw error;
  }
};

// ===============================
// SURVEY STRUCTURE OPERATIONS
// ===============================

/**
 * Get survey structure (sections and questions)
 */
export const getSurveyStructure = async (id: string) => {
  try {
    const response = await apiClient.get(`/surveys/${id}/structure`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey structure ${id}:`, error);
    throw error;
  }
};

/**
 * Get survey sections
 */
export const getSurveySections = async (id: string) => {
  try {
    const response = await apiClient.get(`/surveys/${id}/sections`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey sections ${id}:`, error);
    throw error;
  }
};

/**
 * Get survey questions
 */
export const getSurveyQuestions = async (id: string, params?: {
  section?: string;
  populate?: string;
}) => {
  try {
    const response = await apiClient.get(`/surveys/${id}/questions`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey questions ${id}:`, error);
    throw error;
  }
};

// ===============================
// SURVEY RESPONSE OPERATIONS
// ===============================

/**
 * Get survey responses
 */
export const getSurveyResponses = async (id: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const response = await apiClient.get(`/surveys/${id}/responses`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey responses ${id}:`, error);
    throw error;
  }
};

/**
 * Get survey statistics
 */
export const getSurveyStatistics = async (id: string): Promise<{ data: SurveyStatistics }> => {
  try {
    const response = await apiClient.get(`/surveys/${id}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey statistics ${id}:`, error);
    throw error;
  }
};

/**
 * Export survey responses
 */
export const exportSurveyResponses = async (id: string, format: 'csv' | 'excel' | 'json' = 'csv') => {
  try {
    const response = await apiClient.get(`/surveys/${id}/export`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting survey responses ${id}:`, error);
    throw error;
  }
};

// ===============================
// ENHANCED SURVEY MANAGEMENT
// ===============================

/**
 * Get surveys by stakeholder group
 */
export const getSurveysByStakeholder = async (
  stakeholderGroupId: string,
  filters?: {
    stageId?: string;
    category?: string;
    status?: string;
    includeArchived?: boolean;
  }
): Promise<{ data: SurveysByStakeholderResponse }> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/surveys/stakeholder/${stakeholderGroupId}${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys by stakeholder:', error);
    throw error;
  }
};

/**
 * Get surveys by project and theory of change stage
 */
export const getSurveysByProjectAndStage = async (
  projectId: string,
  stageId: string,
  filters?: {
    includeArchived?: boolean;
  }
): Promise<{ data: SurveysByProjectResponse }> => {
  try {
    const params = filters || {};
    const response = await apiClient.get(
      `/surveys/project/${projectId}/stage/${stageId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys by project and stage:', error);
    throw error;
  }
};

/**
 * Update survey category and naming
 */
export const updateSurveyCategory = async (
  surveyId: string,
  data: UpdateSurveyCategoryRequest
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/category`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating survey category:', error);
    throw error;
  }
};

/**
 * Get survey statistics for stakeholder group
 */
export const getStakeholderSurveyStats = async (
  stakeholderGroupId: string
): Promise<{ data: SurveyStatsResponse }> => {
  try {
    const response = await apiClient.get(`/surveys/stats/stakeholder/${stakeholderGroupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stakeholder survey stats:', error);
    throw error;
  }
};

// ===============================
// SURVEY BUILDER OPERATIONS
// ===============================

/**
 * Get filtered questions for survey creation
 */
export const getFilteredQuestionsForSurvey = async (
  params: FilteredQuestionsRequest
): Promise<{ data: FilteredQuestionsResponse; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/surveys/builder/questions/filtered?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered questions:', error);
    throw error;
  }
};

/**
 * Get survey creation context (themes, subthemes, categories)
 */
export const getSurveyBuilderContext = async (
  stakeholderGroupId: string,
  stageId: string
): Promise<{ data: SurveyCreationContext }> => {
  try {
    const response = await apiClient.get(`/surveys/builder/context/${stakeholderGroupId}/${stageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching survey builder context:', error);
    throw error;
  }
};

// ===============================
// SAMPLING CALCULATOR OPERATIONS
// ===============================

/**
 * Calculate sample size for survey
 */
export const calculateSampleSize = async (
  id: string,
  data: {
    populationSize: number;
    confidenceLevel?: number;
    marginOfError?: number;
  }
) => {
  try {
    const response = await apiClient.post(`/surveys/${id}/calculate-sample-size`, data);
    return response.data;
  } catch (error) {
    console.error(`Error calculating sample size for survey ${id}:`, error);
    throw error;
  }
};

/**
 * Get sample size calculation for survey
 */
export const getSampleSizeCalculation = async (id: string) => {
  try {
    const response = await apiClient.get(`/surveys/${id}/sample-size`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sample size calculation for survey ${id}:`, error);
    throw error;
  }
};

// ===============================
// CONVENIENCE FUNCTIONS
// ===============================

/**
 * Publish a survey (change status to published)
 */
export const publishSurvey = async (id: string) => {
  try {
    const response = await updateSurvey(id, { status: 'published' });
    return response;
  } catch (error) {
    console.error(`Error publishing survey ${id}:`, error);
    throw error;
  }
};

/**
 * Close a survey (change status to closed)
 */
export const closeSurvey = async (id: string) => {
  try {
    const response = await updateSurvey(id, { status: 'closed' });
    return response;
  } catch (error) {
    console.error(`Error closing survey ${id}:`, error);
    throw error;
  }
};

/**
 * Get surveys by project
 */
export const getSurveysByProject = async (projectId: string, projectSiteId?: string, params?: {
  status?: string;
  category?: string;
  stakeholderGroup?: string;
  theoryOfChangeStage?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = {
      ...params,
      project: projectId,
      ...(projectSiteId && { projectSite: projectSiteId })
    };
    const response = await apiClient.get('/surveys', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error(`Error fetching surveys for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get survey templates
 */
export const getSurveyTemplates = async (params?: {
  templateCategory?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = {
      ...params,
      isTemplate: true
    };
    const response = await apiClient.get('/surveys', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching survey templates:', error);
    throw error;
  }
};

/**
 * Search surveys
 */
export const searchSurveys = async (searchTerm: string, filters?: {
  project?: string;
  projectSite?: string;
  stakeholderGroup?: string;
  theoryOfChangeStage?: string;
  status?: string;
  category?: string;
}) => {
  try {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await apiClient.get('/surveys', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching surveys:', error);
    throw error;
  }
};

// ===============================
// ADVANCED FEATURES
// ===============================

/**
 * Advanced question filtering with multiple criteria
 */
export const getAdvancedFilteredQuestions = async (params: {
  stakeholderGroupId: string;
  stageId: string;
  questionCategory?: 'stakeholder_specific' | 'frequently_asked' | 'demographic' | 'all';
  themes?: string[];
  subThemes?: string[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  targetAudience?: 'internal' | 'external' | 'both';
  searchTerm?: string;
  sortBy?: 'relevance' | 'name' | 'created' | 'usage';
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await getFilteredQuestionsForSurvey({
      stakeholderGroupId: params.stakeholderGroupId,
      stageId: params.stageId,
      themeIds: params.themes,
      subThemeIds: params.subThemes,
      searchTerm: params.searchTerm,
      page: params.page,
      limit: params.limit,
      includeFrequentlyAsked: params.questionCategory === 'frequently_asked' || params.questionCategory === 'all'
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching advanced filtered questions:', error);
    throw error;
  }
};

/**
 * Get question recommendations based on stakeholder and stage
 */
export const getQuestionRecommendations = async (
  stakeholderGroupId: string,
  stageId: string,
  limit: number = 10
) => {
  try {
    const response = await getFilteredQuestionsForSurvey({
      stakeholderGroupId,
      stageId,
      includeFrequentlyAsked: true,
      limit
    });
    
    return {
      ...response,
      data: {
        ...response.data,
        recommendedQuestions: response.data.filteredQuestions.slice(0, limit)
      }
    };
  } catch (error) {
    console.error('Error fetching question recommendations:', error);
    throw error;
  }
};

/**
 * Preview survey with filtered questions
 */
export const previewSurveyWithQuestions = async (params: {
  stakeholderGroupId: string;
  stageId: string;
  selectedQuestionIds: string[];
  surveyTitle: string;
  surveyDescription?: string;
}) => {
  try {
    const questionsResponse = await getFilteredQuestionsForSurvey({
      stakeholderGroupId: params.stakeholderGroupId,
      stageId: params.stageId
    });
    
    const selectedQuestions = questionsResponse.data.filteredQuestions.filter(
      q => params.selectedQuestionIds.includes(q._id)
    );
    
    return {
      success: true,
      data: {
        surveyTitle: params.surveyTitle,
        surveyDescription: params.surveyDescription,
        totalQuestions: selectedQuestions.length,
        estimatedDuration: Math.ceil(selectedQuestions.length * 1.5),
        questions: selectedQuestions,
        stakeholderInfo: questionsResponse.data.stakeholderInfo,
        stageInfo: questionsResponse.data.stageInfo
      }
    };
  } catch (error) {
    console.error('Error previewing survey with questions:', error);
    throw error;
  }
};

// ===============================
// VALIDATION HELPERS
// ===============================

/**
 * Validate survey creation data
 */
export const validateSurveyCreation = async (data: Partial<CategorizedSurveyRequest>) => {
  try {
    const errors: string[] = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Survey title is required');
    }
    
    if (!data.projectId) {
      errors.push('Project is required');
    }
    
    if (!data.stakeholderGroupId) {
      errors.push('Stakeholder group is required');
    }
    
    if (!data.stageId) {
      errors.push('Theory of change stage is required');
    }
    
    if (data.category === 'custom' && (!data.customCategoryName || data.customCategoryName.trim().length === 0)) {
      errors.push('Custom category name is required when category is custom');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating survey creation:', error);
    throw error;
  }
};

/**
 * Get survey category options
 */
export const getSurveyCategoryOptions = () => {
  return [
    { key: 'baseline', label: 'Baseline Survey', description: 'Initial data collection before project implementation' },
    { key: 'monitoring', label: 'Monitoring Survey', description: 'Ongoing tracking during project implementation' },
    { key: 'evaluation', label: 'Evaluation Survey', description: 'Assessment of project outcomes and impacts' },
    { key: 'impact_assessment', label: 'Impact Assessment', description: 'Comprehensive evaluation of project impacts' },
    { key: 'feedback', label: 'Feedback Survey', description: 'Stakeholder feedback collection' },
    { key: 'custom', label: 'Custom Category', description: 'Create your own survey category' }
  ];
};

/**
 * Attach consent form to survey
 */
export const attachConsentFormToSurvey = async (
  surveyId: string,
  data: {
    consentFormId?: string | null;
    consentRequired?: boolean;
  }
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/consent-form`, data);
    return response.data;
  } catch (error) {
    console.error(`Error attaching consent form to survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Remove consent form from survey
 */
export const removeConsentFormFromSurvey = async (surveyId: string) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/consent-form`, {
      consentFormId: null,
      consentRequired: false
    });
    return response.data;
  } catch (error) {
    console.error(`Error removing consent form from survey ${surveyId}:`, error);
    throw error;
  }
};

// ADD THESE TO THE END OF lib/api/survey.ts

// ===============================
// CONSENT FORM OPERATIONS (ADD THESE)
// ===============================

/**
 * Get consent form for survey (public access)
 */
export const getPublicSurveyConsentForm = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/consent-form/public`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public consent form for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get public survey data without authentication (for public survey page)
 * Works for published surveys - returns requiresAuth:true for private ones
 */
export const getPublicSurveyData = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/public-data`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public survey data for ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get consent form for survey (authenticated)
 */
export const getSurveyConsentForm = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/consent-form`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching consent form for survey ${surveyId}:`, error);
    throw error;
  }
};