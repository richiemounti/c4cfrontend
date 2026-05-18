// lib/api/surveyBuilder.ts
import { apiClient } from './client';
import {
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

/**
 * Module 1: Get filtered questions for survey creation
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

    const response = await apiClient.get(`/survey-builder/questions/filtered?${queryParams}`);
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
    const response = await apiClient.get(`/survey-builder/context/${stakeholderGroupId}/${stageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching survey builder context:', error);
    throw error;
  }
};

/**
 * Module 2: Create a new categorized survey
 */
export const createCategorizedSurvey = async (data: CategorizedSurveyRequest) => {
  try {
    const response = await apiClient.post('/survey-builder/surveys', data);
    return response.data;
  } catch (error) {
    console.error('Error creating categorized survey:', error);
    throw error;
  }
};

/**
 * Get all surveys for a stakeholder group
 */
export const getSurveysByStakeholder = async (
  stakeholderGroupId: string,
  filters?: {
    stageId?: string;
    category?: string;
    status?: string;
  }
): Promise<{ data: SurveysByStakeholderResponse }> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const url = `/survey-builder/surveys/stakeholder/${stakeholderGroupId}${
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
 * Get surveys by project and stage
 */
export const getSurveysByProjectAndStage = async (
  projectId: string,
  stageId: string,
  projectSiteId?: string
): Promise<{ data: SurveysByProjectResponse }> => {
  try {
    const params = projectSiteId ? { projectSiteId } : {};
    const response = await apiClient.get(
      `/survey-builder/surveys/project/${projectId}/stage/${stageId}`,
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
    const response = await apiClient.put(`/survey-builder/surveys/${surveyId}/category`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating survey category:', error);
    throw error;
  }
};

/**
 * Clone survey with new category
 */
export const cloneSurveyWithCategory = async (
  surveyId: string,
  data: CloneSurveyRequest
) => {
  try {
    const response = await apiClient.post(`/survey-builder/surveys/${surveyId}/clone`, data);
    return response.data;
  } catch (error) {
    console.error('Error cloning survey with category:', error);
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
    const response = await apiClient.get(`/survey-builder/stats/stakeholder/${stakeholderGroupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stakeholder survey stats:', error);
    throw error;
  }
};

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
    
    // Return the most relevant questions
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
 * Validate survey creation data
 */
export const validateSurveyCreation = async (data: Partial<CategorizedSurveyRequest>) => {
  try {
    // Client-side validation
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
    // Get the filtered questions
    const questionsResponse = await getFilteredQuestionsForSurvey({
      stakeholderGroupId: params.stakeholderGroupId,
      stageId: params.stageId
    });
    
    // Filter to only selected questions
    const selectedQuestions = questionsResponse.data.filteredQuestions.filter(
      q => params.selectedQuestionIds.includes(q._id)
    );
    
    return {
      success: true,
      data: {
        surveyTitle: params.surveyTitle,
        surveyDescription: params.surveyDescription,
        totalQuestions: selectedQuestions.length,
        estimatedDuration: Math.ceil(selectedQuestions.length * 1.5), // 1.5 minutes per question estimate
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