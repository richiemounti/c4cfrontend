// lib/api/question.ts (Enhanced with Conditional Logic Support)
import { apiClient } from './client';
import { 
  Question, 
  CreateQuestionRequest, 
  QuestionTagStatistics, 
  AvailableTagsResponse, 
  BulkToggleDemographicRequest, 
  ComplianceReport, 
  DemographicFilters, 
  ToggleDemographicRequest, 
  CreateBespokeQuestionRequest, 
  UpdateBespokeQuestionRequest, 
  BespokeQuestionFilters,
  // NEW: Conditional logic types
  ConditionalLogicValidationResult,
  QuestionDependenciesResponse
} from '@/types';

// ==========================================
// ENHANCED: BULK FETCHING FOR SURVEY BUILDER
// ==========================================

/**
 * Fetch questions by array of IDs (NEW - for survey builder)
 */
export const getQuestions = async (params: {
  ids?: string[];
  theme?: string;
  subTheme?: string;
  category?: string;
  type?: string;
  targetAudience?: string;
  status?: string;
  isTemplate?: boolean;
  hasConditionalLogic?: boolean; // NEW: Filter questions with conditional logic
  populate?: string;
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
} = {}) => {
  try {
    // Handle bulk ID fetching for survey builder
    if (params.ids && Array.isArray(params.ids)) {
      const response = await apiClient.get('/questions', { 
        params: {
          ...params,
          ids: params.ids.join(','),
        }
      });
      return response.data;
    }
    
    // Standard filtering
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Fetch questions by multiple IDs with specific population
 */
export const fetchQuestionsByIds = async (
  questionIds: string[], 
  populate: string = 'theme,subTheme,conditionalLogic' // NEW: Added conditionalLogic
) => {
  try {
    if (!questionIds || questionIds.length === 0) {
      return { data: [], success: true, count: 0 };
    }

    const response = await apiClient.get('/questions/bulk', {
      params: {
        ids: questionIds.join(','),
        populate,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by IDs:', error);
    throw error;
  }
};

/**
 * Fetch questions with enhanced filtering for survey builder
 */
export const fetchQuestionsForSurveyBuilder = async (filters: {
  stakeholderGroupId?: string;
  stageId?: string;
  projectId?: string;
  themeIds?: string[];
  subThemeIds?: string[];
  questionType?: string;
  targetAudience?: string;
  searchTerm?: string;
  includeFrequentlyAsked?: boolean;
  includeBespoke?: boolean; // NEW
  page?: number;
  limit?: number;
}) => {
  try {
    const params: any = { ...filters };
    
    // Handle array parameters
    if (filters.themeIds?.length) {
      params.themeIds = filters.themeIds.join(',');
    }
    if (filters.subThemeIds?.length) {
      params.subThemeIds = filters.subThemeIds.join(',');
    }
    
    const response = await apiClient.get('/questions/for-survey-builder', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions for survey builder:', error);
    throw error;
  }
};

// ==========================================
// EXISTING FUNCTIONS (MAINTAINED)
// ==========================================

/**
 * Fetch all questions with optional filtering
 */
export const fetchQuestions = async (params: {
  ids?: string | string[];
  populate?: string;
  [key: string]: any;
} = {}) => {
  try {
    // Handle bulk ID fetching
    if (params.ids) {
      const processedParams = { ...params };
      
      if (Array.isArray(params.ids)) {
        processedParams.ids = params.ids.join(',');
      }
      
      const response = await apiClient.get('/questions', { params: processedParams });
      return response.data;
    }
    
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Fetch a single question by ID with optional population
 */
export const fetchQuestion = async (id: string, populate?: string) => {
  try {
    // NEW: Default to populating conditional logic
    const defaultPopulate = populate || 'theme,subTheme,conditionalLogic';
    const params = { populate: defaultPopulate };
    const response = await apiClient.get(`/questions/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new question with selective tags and conditional logic
 */
export const createQuestion = async (questionData: CreateQuestionRequest) => {
  try {
    const response = await apiClient.post('/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

/**
 * Update an existing question with selective tags and conditional logic
 */
export const updateQuestion = async (id: string, questionData: Partial<CreateQuestionRequest>) => {
  try {
    const response = await apiClient.put(`/questions/${id}`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating question ${id}:`, error);
    throw error;
  }
};

/**
 * Archive a question (soft delete)
 */
export const archiveQuestion = async (id: string) => {
  try {
    const response = await apiClient.delete(`/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving question ${id}:`, error);
    throw error;
  }
};

/**
 * Restore an archived question
 */
export const restoreQuestion = async (id: string) => {
  try {
    const response = await apiClient.post(`/questions/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring question ${id}:`, error);
    throw error;
  }
};

/**
 * Permanently delete a question
 */
export const deleteQuestion = async (id: string) => {
  try {
    const response = await apiClient.delete(`/questions/${id}/permanent`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error);
    throw error;
  }
};

/**
 * Clone a question. Note: conditional logic is intentionally NOT cloned —
 * the cloned question starts clean so conditions can be wired up from scratch.
 */
export const cloneQuestion = async (id: string) => {
  try {
    const response = await apiClient.post(`/questions/${id}/clone`);
    return response.data;
  } catch (error) {
    console.error(`Error cloning question ${id}:`, error);
    throw error;
  }
};

/**
 * Get available tags for a specific question (based on its subtheme)
 */
export const getQuestionAvailableTags = async (questionId: string): Promise<{ data: AvailableTagsResponse }> => {
  try {
    const response = await apiClient.get(`/questions/${questionId}/available-tags`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available tags for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get available tags for a specific subtheme (for question creation)
 */
export const getSubthemeAvailableTags = async (subthemeId: string): Promise<{ data: AvailableTagsResponse }> => {
  try {
    const response = await apiClient.get(`/questions/subthemes/${subthemeId}/available-tags-for-questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available tags for subtheme ${subthemeId}:`, error);
    throw error;
  }
};

/**
 * Get question tag statistics
 */
export const getQuestionTagStatistics = async (filters = {}): Promise<{ data: QuestionTagStatistics }> => {
  try {
    const response = await apiClient.get('/questions/tag-statistics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching question tag statistics:', error);
    throw error;
  }
};

// ==========================================
// NEW: CONDITIONAL LOGIC APIs
// ==========================================

/**
 * Validate conditional logic for a question
 */
export const validateQuestionConditionalLogic = async (
  questionId: string
): Promise<{ data: ConditionalLogicValidationResult }> => {
  try {
    const response = await apiClient.post(`/questions/${questionId}/validate-conditional-logic`);
    return response.data;
  } catch (error) {
    console.error(`Error validating conditional logic for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get conditional dependencies for a question
 */
export const getQuestionConditionalDependencies = async (
  questionId: string
): Promise<{ data: QuestionDependenciesResponse }> => {
  try {
    const response = await apiClient.get(`/questions/${questionId}/conditional-dependencies`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching conditional dependencies for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get questions that depend on this question (reverse dependencies)
 */
export const getQuestionDependents = async (
  questionId: string
): Promise<{ data: QuestionDependenciesResponse }> => {
  try {
    const response = await apiClient.get(`/questions/${questionId}/dependents`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dependents for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Update only the conditional logic of a question.
 * Pass `null` to explicitly clear/remove the conditional logic from the question.
 */
export const updateQuestionConditionalLogic = async (
  questionId: string,
  conditionalLogic: {
    enabled: boolean;
    conditions: Array<{
      questionId: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
      value: any;
    }>;
    action: 'show' | 'hide';
    logicOperator?: 'AND' | 'OR';
  } | null
) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}/conditional-logic`, {
      conditionalLogic
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating conditional logic for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Bulk fetch questions with their dependencies
 */
export const getQuestionsWithDependencies = async (
  questionIds: string[]
): Promise<{
  data: {
    questions: Question[];
    dependencies: Question[];
    all: Question[];
  }
}> => {
  try {
    const response = await apiClient.post('/questions/with-dependencies', {
      questionIds
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions with dependencies:', error);
    throw error;
  }
};

/**
 * Check if a question can be safely archived (no dependents)
 */
export const canArchiveQuestion = async (questionId: string): Promise<{
  canArchive: boolean;
  dependents: Question[];
  warning?: string;
}> => {
  try {
    const response = await getQuestionDependents(questionId);
    const dependents = response.data.dependents || [];
    
    return {
      canArchive: dependents.length === 0,
      dependents,
      warning: dependents.length > 0 
        ? `${dependents.length} question(s) depend on this question. Archiving will break their conditional logic.`
        : undefined
    };
  } catch (error) {
    console.error(`Error checking if question ${questionId} can be archived:`, error);
    throw error;
  }
};

/**
 * Get questions available to reference in conditional logic.
 * Returns all non-archived questions (draft and published) so staff can
 * reference any question they're working on, not just already-published ones.
 * The backend already excludes archived documents, so no extra filter is needed.
 */
export const getQuestionsForConditionalLogic = async (
  excludeQuestionId?: string,
  filters?: {
    theme?: string;
    subTheme?: string;
    type?: string;
  }
) => {
  try {
    const params: any = {
      ...filters,
      populate: 'theme,subTheme',
      limit: 1000
    };

    const response = await apiClient.get('/questions', { params });

    // Exclude the question being edited so it can't reference itself
    let questions = response.data.data || [];
    if (excludeQuestionId) {
      questions = questions.filter((q: Question) => q._id !== excludeQuestionId);
    }

    return {
      ...response.data,
      data: questions
    };
  } catch (error) {
    console.error('Error fetching questions for conditional logic:', error);
    throw error;
  }
};

// ==========================================
// TAG FILTERING FUNCTIONS (MAINTAINED)
// ==========================================

export const fetchQuestionsByIndicatorTags = async (indicatorTagIds: string[], otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      selectedIndicatorTags: indicatorTagIds.join(','),
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by indicator tags:', error);
    throw error;
  }
};

export const fetchQuestionsBySDGTags = async (sdgTagIds: string[], otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      selectedSdgTags: sdgTagIds.join(','),
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by SDG tags:', error);
    throw error;
  }
};

export const fetchQuestionsByResilienceTags = async (resilienceTagIds: string[], otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      selectedResilienceTags: resilienceTagIds.join(','),
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by resilience tags:', error);
    throw error;
  }
};

export const fetchQuestionsByESGTags = async (esgTagIds: string[], otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      selectedEsgTags: esgTagIds.join(','),
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by ESG tags:', error);
    throw error;
  }
};

export const fetchQuestionsByStandardTags = async (standardTagIds: string[], otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      selectedStandardTags: standardTagIds.join(','),
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by standard tags:', error);
    throw error;
  }
};

export const fetchQuestionsWithTags = async (params = {}) => {
  try {
    const response = await apiClient.get('/questions', { 
      params: { 
        ...params, 
        populate: 'selectedTags,theme,subTheme,category,creator'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions with tags:', error);
    throw error;
  }
};

export const fetchQuestionsByTheoryOfChangeStage = async (stage: 'Stage 1 - Output' | 'Stage 2 - Outcome', otherParams = {}) => {
  try {
    const params = {
      ...otherParams,
      theoryOfChangeStage: stage,
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by theory of change stage:', error);
    throw error;
  }
};

export const searchQuestions = async (searchTerm: string, filters = {}) => {
  try {
    const params = {
      ...filters,
      search: searchTerm,
      populate: 'selectedTags,theme,subTheme,category'
    };
    const response = await apiClient.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
};

// ==========================================
// DEMOGRAPHIC QUESTION APIs (MAINTAINED)
// ==========================================

export const fetchStandardDemographics = async (filters: DemographicFilters = {}) => {
  try {
    const response = await apiClient.get('/questions/demographics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching standard demographics:', error);
    throw error;
  }
};

export const fetchDemographicsByCategory = async (category: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility') => {
  try {
    const response = await apiClient.get(`/questions/demographics/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching demographics by category ${category}:`, error);
    throw error;
  }
};

export const fetchRecommendedDemographics = async (audience: 'internal' | 'external' | 'both') => {
  try {
    const response = await apiClient.get(`/questions/demographics/recommended/${audience}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommended demographics for ${audience}:`, error);
    throw error;
  }
};

export const toggleStandardDemographic = async (questionId: string, config: ToggleDemographicRequest) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}/toggle-demographic`, config);
    return response.data;
  } catch (error) {
    console.error(`Error toggling demographic status for question ${questionId}:`, error);
    throw error;
  }
};

export const bulkToggleDemographic = async (request: BulkToggleDemographicRequest) => {
  try {
    const response = await apiClient.put('/questions/bulk-toggle-demographic', request);
    return response.data;
  } catch (error) {
    console.error('Error bulk toggling demographic status:', error);
    throw error;
  }
};

export const fetchDemographicComplianceReport = async (): Promise<{ data: ComplianceReport }> => {
  try {
    const response = await apiClient.get('/questions/demographics/compliance-report');
    return response.data;
  } catch (error) {
    console.error('Error fetching demographic compliance report:', error);
    throw error;
  }
};

export const fetchQuestionsWithDemographics = async (params = {}) => {
  try {
    const response = await apiClient.get('/questions', { 
      params: { 
        ...params, 
        populate: 'selectedTags,theme,subTheme,category,creator',
        includeDemographics: true
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions with demographics:', error);
    throw error;
  }
};

export const searchDemographicQuestions = async (searchTerm: string, filters: DemographicFilters = {}) => {
  try {
    const params = {
      ...filters,
      search: searchTerm,
      isStandardDemographic: true
    };
    const response = await apiClient.get('/questions/demographics', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching demographic questions:', error);
    throw error;
  }
};

export const fetchGlobalStandardDemographics = async () => {
  try {
    const response = await apiClient.get('/questions/demographics', { 
      params: { globalOnly: true } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching global standard demographics:', error);
    throw error;
  }
};

export const fetchGDPRDemographics = async () => {
  try {
    const response = await apiClient.get('/questions/demographics', { 
      params: { 
        complianceRelevant: true,
        populate: 'category,theme,subTheme'
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching GDPR-relevant demographics:', error);
    throw error;
  }
};

export const fetchDemographicsBySensitivity = async (sensitivityLevel: 'low' | 'medium' | 'high') => {
  try {
    const response = await apiClient.get('/questions/demographics', { 
      params: { 
        sensitivityLevel,
        populate: 'category,theme,subTheme'
      } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching demographics with ${sensitivityLevel} sensitivity:`, error);
    throw error;
  }
};

export const validateDemographicConfig = async (config: ToggleDemographicRequest) => {
  try {
    const requiredFields = ['demographicType', 'demographicCategory'];
    
    if (config.isStandardDemographic) {
      for (const field of requiredFields) {
        if (!config[field as keyof ToggleDemographicRequest]) {
          throw new Error(`${field} is required when enabling standard demographic`);
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Demographic configuration validation failed:', error);
    throw error;
  }
};

export const exportDemographicQuestions = async (format: 'json' | 'csv' = 'json', filters: DemographicFilters = {}) => {
  try {
    const response = await apiClient.get('/questions/demographics/export', { 
      params: { 
        ...filters, 
        format 
      },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting demographic questions:', error);
    throw error;
  }
};

// ==========================================
// BESPOKE QUESTION APIs (MAINTAINED)
// ==========================================

export const createBespokeQuestion = async (data: CreateBespokeQuestionRequest) => {
  try {
    const response = await apiClient.post('/questions/bespoke', data);
    return response.data;
  } catch (error) {
    console.error('Error creating bespoke question:', error);
    throw error;
  }
};

export const updateBespokeQuestion = async (
  id: string, 
  data: UpdateBespokeQuestionRequest
) => {
  try {
    const response = await apiClient.put(`/questions/bespoke/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating bespoke question ${id}:`, error);
    throw error;
  }
};

export const getBespokeQuestionsByProject = async (
  projectId: string,
  filters?: BespokeQuestionFilters
) => {
  try {
    const response = await apiClient.get(`/questions/bespoke/project/${projectId}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching bespoke questions for project ${projectId}:`, error);
    throw error;
  }
};

export const getBespokeQuestionsByOrganization = async (
  organizationId: string,
  filters?: {
    status?: string;
    project?: string;
  }
) => {
  try {
    const response = await apiClient.get(`/questions/bespoke/organization/${organizationId}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching bespoke questions for organization ${organizationId}:`, error);
    throw error;
  }
};

export const getAvailableBespokeQuestions = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/questions/bespoke/project/${projectId}/available`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available bespoke questions for project ${projectId}:`, error);
    throw error;
  }
};

export const approveBespokeQuestion = async (questionId: string) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving bespoke question ${questionId}:`, error);
    throw error;
  }
};

export const rejectBespokeQuestion = async (questionId: string, reason: string) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting bespoke question ${questionId}:`, error);
    throw error;
  }
};

export const elevateBespokeQuestion = async (questionId: string) => {
  try {
    const response = await apiClient.post(`/questions/${questionId}/elevate`);
    return response.data;
  } catch (error) {
    console.error(`Error elevating bespoke question ${questionId}:`, error);
    throw error;
  }
};

export const getBespokeQuestionStatistics = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/questions/bespoke/project/${projectId}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bespoke question statistics for project ${projectId}:`, error);
    throw error;
  }
};