// lib/api/surveyQuestion.ts - UPDATED WITH CONDITIONAL LOGIC SUPPORT
import { apiClient } from './client';
import {
  SurveyQuestion,
  AddQuestionToSurveyRequest,
  ReorderItemsRequest,
  ConditionalLogic
} from '@/types';

/**
 * Add a question to a survey (NOW WITH AUTOMATIC CONDITIONAL LOGIC INHERITANCE)
 */
export const addQuestionToSurvey = async (
  surveyId: string,
  data: AddQuestionToSurveyRequest
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/questions`, data);
    return response.data;
  } catch (error) {
    console.error(`Error adding question to survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * NEW: Bulk add questions to survey with dependency resolution
 * Questions are automatically added in the correct order based on dependencies
 */
export const bulkAddQuestionsWithDependencies = async (
  surveyId: string,
  questionIds: string[],
  sectionId?: string
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/questions/bulk-add`, {
      questionIds,
      sectionId
    });
    return response.data;
  } catch (error) {
    console.error(`Error bulk adding questions to survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get all questions for a survey
 */
export const getSurveyQuestions = async (
  surveyId: string,
  params?: {
    section?: string;
    populate?: string;
  }
) => {
  try {
    // Default to populating conditional logic
    const defaultParams = {
      ...params,
      populate: params?.populate || 'question,conditionalLogic.conditions.questionId'
    };
    const response = await apiClient.get(`/surveys/${surveyId}/questions`, { params: defaultParams });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey questions for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get a single survey question by ID
 */
export const getSurveyQuestion = async (surveyId: string, questionId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Update a survey question
 */
export const updateSurveyQuestion = async (
  surveyId: string,
  questionId: string,
  data: Partial<AddQuestionToSurveyRequest>
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/questions/${questionId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Remove a question from a survey
 */
export const removeQuestionFromSurvey = async (surveyId: string, questionId: string) => {
  try {
    const response = await apiClient.delete(`/surveys/${surveyId}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Reorder survey questions
 */
export const reorderSurveyQuestions = async (
  surveyId: string,
  data: { questions: { id: string }[]; sectionId?: string | null }
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/questions/reorder`, data);
    return response.data;
  } catch (error) {
    console.error(`Error reordering survey questions for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Move question to different section
 */
export const moveQuestionToSection = async (
  surveyId: string,
  questionId: string,
  sectionId: string | null,
  newOrder?: number
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/questions/${questionId}/move`, {
      sectionId: sectionId,
      newOrder
    });
    return response.data;
  } catch (error) {
    console.error(`Error moving survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Duplicate a survey question
 */
export const duplicateSurveyQuestion = async (
  surveyId: string,
  questionId: string,
  customizations?: {
    customText?: string;
    customDescription?: string;
    sectionId?: string;
  }
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/questions/${questionId}/duplicate`, customizations);
    return response.data;
  } catch (error) {
    console.error(`Error duplicating survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Bulk add questions to survey (simple version without dependency resolution)
 */
export const bulkAddQuestionsToSurvey = async (
  surveyId: string,
  questions: Array<{
    questionId: string;
    sectionId?: string;
    required?: boolean;
    customText?: string;
    customDescription?: string;
    order?: number;
  }>
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/questions/bulk`, {
      questions
    });
    return response.data;
  } catch (error) {
    console.error(`Error bulk adding questions to survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * NEW: Update conditional logic for a survey question
 * This allows overriding inherited conditional logic or fixing broken references
 */
export const updateSurveyQuestionConditionalLogic = async (
  surveyId: string,
  questionId: string,
  conditionalLogic: ConditionalLogic | null
) => {
  try {
    const response = await apiClient.put(
      `/surveys/${surveyId}/questions/${questionId}/conditional-logic`,
      { conditionalLogic }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating conditional logic for survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * DEPRECATED: Use updateSurveyQuestionConditionalLogic instead
 * Kept for backward compatibility
 */
export const updateQuestionConditionalLogic = async (
  surveyId: string,
  questionId: string,
  conditionalLogic: {
    showIf?: Array<{
      questionId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
    hideIf?: Array<{
      questionId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
  }
) => {
  try {
    console.warn('updateQuestionConditionalLogic is deprecated. Use updateSurveyQuestionConditionalLogic instead.');
    const response = await apiClient.put(`/surveys/${surveyId}/questions/${questionId}/conditional-logic`, {
      conditionalLogic
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating conditional logic for question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get questions by section
 */
export const getQuestionsBySection = async (
  surveyId: string,
  sectionId: string
) => {
  try {
    const response = await getSurveyQuestions(surveyId, { section: sectionId });
    return response;
  } catch (error) {
    console.error(`Error fetching questions by section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Get questions without section (orphaned questions)
 */
export const getQuestionsWithoutSection = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/questions/orphaned`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching orphaned questions for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Set question as required/optional
 */
export const setQuestionRequired = async (
  surveyId: string,
  questionId: string,
  required: boolean
) => {
  try {
    const response = await updateSurveyQuestion(surveyId, questionId, { required });
    return response;
  } catch (error) {
    console.error(`Error setting question required status ${questionId}:`, error);
    throw error;
  }
};

/**
 * Add custom validation to survey question
 */
export const addQuestionValidation = async (
  surveyId: string,
  questionId: string,
  validation: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/questions/${questionId}/validation`, {
      validation
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding validation to question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Preview question in survey context
 */
export const previewSurveyQuestion = async (
  surveyId: string,
  questionId: string,
  customizations?: {
    customText?: string;
    customDescription?: string;
    customOptions?: any[];
  }
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/questions/${questionId}/preview`, customizations);
    return response.data;
  } catch (error) {
    console.error(`Error previewing survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get question usage statistics
 */
export const getSurveyQuestionStats = async (surveyId: string, questionId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/questions/${questionId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey question stats ${questionId}:`, error);
    throw error;
  }
};

/**
 * Export survey questions
 */
export const exportSurveyQuestions = async (
  surveyId: string,
  format: 'json' | 'csv' | 'pdf' = 'json'
) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/questions/export`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting survey questions for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Import questions from another survey
 */
export const importQuestionsFromSurvey = async (
  targetSurveyId: string,
  sourceSurveyId: string,
  questionIds?: string[],
  sectionMapping?: Record<string, string>
) => {
  try {
    const response = await apiClient.post(`/surveys/${targetSurveyId}/questions/import`, {
      sourceSurveyId,
      questionIds,
      sectionMapping
    });
    return response.data;
  } catch (error) {
    console.error(`Error importing questions to survey ${targetSurveyId}:`, error);
    throw error;
  }
};

// ==========================================
// NEW: CONDITIONAL LOGIC HELPER FUNCTIONS
// ==========================================

/**
 * Check if a survey question's conditional logic is valid
 * (all referenced questions exist in the survey)
 */
export const validateSurveyQuestionConditionalLogic = async (
  surveyId: string,
  questionId: string
): Promise<{
  isValid: boolean;
  missingDependencies: string[];
  warnings: string[];
}> => {
  try {
    // Get the survey question
    const sqResponse = await getSurveyQuestion(surveyId, questionId);
    const surveyQuestion = sqResponse.data;
    
    if (!surveyQuestion.conditionalLogic?.enabled) {
      return { isValid: true, missingDependencies: [], warnings: [] };
    }
    
    // Get all questions in the survey
    const allQuestionsResponse = await getSurveyQuestions(surveyId);
    const allQuestions = allQuestionsResponse.data;
    
    const questionIdsInSurvey = new Set(allQuestions.map((q: any) => q._id));
    const missingDependencies: string[] = [];
    const warnings: string[] = [];
    
    // Check each condition
    for (const condition of surveyQuestion.conditionalLogic.conditions) {
      if (!questionIdsInSurvey.has(condition.questionId)) {
        missingDependencies.push(condition.questionId);
        warnings.push(`Referenced question ${condition.questionId} is not in this survey`);
      }
    }
    
    return {
      isValid: missingDependencies.length === 0,
      missingDependencies,
      warnings
    };
  } catch (error) {
    console.error(`Error validating conditional logic for survey question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Get questions that can be used as dependencies for conditional logic
 * (questions that come before this question in the survey)
 */
export const getAvailableConditionQuestions = async (
  surveyId: string,
  currentQuestionId?: string
): Promise<SurveyQuestion[]> => {
  try {
    const response = await getSurveyQuestions(surveyId);
    const allQuestions = response.data || [];
    
    if (!currentQuestionId) {
      return allQuestions;
    }
    
    // Find the current question's order
    const currentQuestion = allQuestions.find((q: any) => q._id === currentQuestionId);
    if (!currentQuestion) {
      return allQuestions;
    }
    
    // Return only questions that come before (lower order number)
    return allQuestions.filter((q: any) => 
      q.order < currentQuestion.order && q._id !== currentQuestionId
    );
  } catch (error) {
    console.error('Error fetching available condition questions:', error);
    throw error;
  }
};

/**
 * Check if conditional logic will break when removing a question
 */
export const checkConditionalLogicImpact = async (
  surveyId: string,
  questionId: string
): Promise<{
  hasDependents: boolean;
  dependentQuestions: SurveyQuestion[];
  warning?: string;
}> => {
  try {
    const response = await getSurveyQuestions(surveyId);
    const allQuestions = response.data || [];
    
    // Find questions that depend on this one
    const dependentQuestions = allQuestions.filter((q: any) => {
      if (!q.conditionalLogic?.enabled) return false;
      
      return q.conditionalLogic.conditions.some(
        (cond: any) => cond.questionId === questionId
      );
    });
    
    return {
      hasDependents: dependentQuestions.length > 0,
      dependentQuestions,
      warning: dependentQuestions.length > 0
        ? `${dependentQuestions.length} question(s) have conditional logic that depends on this question. Removing it will break their conditional logic.`
        : undefined
    };
  } catch (error) {
    console.error('Error checking conditional logic impact:', error);
    throw error;
  }
};