// lib/api/surveyResponse.ts - UPDATED FOR NESTED ROUTES
import { apiClient } from './client';
import {
  SurveyResponse,
  QuestionResponse,
  StartSurveyResponseRequest,
  SubmitQuestionResponseRequest,
  SurveyStatistics
} from '@/types';

/**
 * Start a new survey response
 */
export const startSurveyResponse = async (
  surveyId: string,
  data?: StartSurveyResponseRequest
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/responses/start`, data);
    console.log('Start survey response:', response.data);
    
    // Make sure response.data has the structure: { success: true, data: { _id: '...', ... } }
    return response.data;
  } catch (error) {
    console.error(`Error starting survey response for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get all responses for a survey
 * UPDATED: Now uses nested route structure
 */
export const getSurveyResponses = async (
  surveyId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: 'started' | 'in_progress' | 'completed' | 'abandoned';
    startDate?: string;
    endDate?: string;
    respondent?: string;
  }
) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey responses for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get a single survey response by ID
 * UPDATED: Now uses nested route structure
 */
export const getSurveyResponse = async (surveyId: string, responseId: string, populate?: string) => {
  try {
    const params = populate ? { populate } : {};
    const response = await apiClient.get(`/surveys/${surveyId}/responses/${responseId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Submit an answer to a specific question
 * UPDATED: Now uses nested route structure
 */
export const submitQuestionResponse = async (
  surveyId: string,
  responseId: string,
  data: SubmitQuestionResponseRequest
) => {
  try {
    console.log('Submitting question response:', {
      surveyId,
      responseId,
      data
    });
    
    const response = await apiClient.post(
      `/surveys/${surveyId}/responses/${responseId}/answers`,
      {
        surveyQuestionId: data.surveyQuestionId,
        answer: data.answer,
        descriptorAnswers: data.descriptorAnswers,  // ← add
        metadata: data.metadata,
      }
    );
    
    console.log('Submit response result:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error submitting question response for ${responseId}:`, error);
    throw error;
  }
};

/**
 * Submit an answer with file upload support
 * UPDATED: Now supports file uploads for file-type questions
 */
export const submitQuestionResponseWithFile = async (
  surveyId: string,
  responseId: string,
  data: {
    surveyQuestionId: string;
    answer?: any;
    file?: File;
    descriptorAnswers?: Record<string, string>;  // ← add
    metadata?: Record<string, any>;
  }
) => {
  try {
    // If there's a file, use FormData
    if (data.file) {
      const formData = new FormData();
      formData.append('surveyQuestionId', data.surveyQuestionId);
      formData.append('file', data.file, data.file.name);
      if (data.metadata) {
        formData.append('metadata', JSON.stringify(data.metadata));
      }

      console.log('Submitting question response:', {
        surveyId,
        responseId,
        data
      });

      const response = await apiClient.post(
        `/surveys/${surveyId}/responses/${responseId}/answers`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Submit response result:', response.data);
      return response.data;
    }

    // Otherwise, regular JSON
    const response = await apiClient.post(
      `/surveys/${surveyId}/responses/${responseId}/answers`,
      {
        surveyQuestionId: data.surveyQuestionId,
        answer: data.answer,
        metadata: data.metadata,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error submitting question response:`, error);
    throw error;
  }
};

/**
 * Update an existing question response
 * UPDATED: Now uses nested route structure
 */
export const updateQuestionResponse = async (
  surveyId: string,
  responseId: string,
  questionResponseId: string,
  data: Partial<SubmitQuestionResponseRequest>
) => {
  try {
    const response = await apiClient.put(
      `/surveys/${surveyId}/responses/${responseId}/answers/${questionResponseId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating question response ${questionResponseId}:`, error);
    throw error;
  }
};

/**
 * Complete a survey response
 * UPDATED: Now uses nested route structure
 */
export const completeSurveyResponse = async (
  surveyId: string,
  responseId: string,
  finalData?: {
    metadata?: Record<string, any>;
    feedback?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/responses/${responseId}/complete`, finalData);
    return response.data;
  } catch (error) {
    console.error(`Error completing survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Save and pause survey response (for "save and continue later" functionality)
 * UPDATED: Now uses nested route structure
 */
export const saveSurveyResponse = async (
  surveyId: string,
  responseId: string,
  data?: {
    metadata?: Record<string, any>;
    note?: string;
  }
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/save`, data);
    return response.data;
  } catch (error) {
    console.error(`Error saving survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Resume a saved survey response
 * UPDATED: Now uses nested route structure
 */
export const resumeSurveyResponse = async (surveyId: string, responseId: string) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/resume`);
    return response.data;
  } catch (error) {
    console.error(`Error resuming survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Abandon a survey response
 * UPDATED: Now uses nested route structure
 */
export const abandonSurveyResponse = async (
  surveyId: string,
  responseId: string,
  reason?: string
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/abandon`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Error abandoning survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Delete a survey response (admin only)
 * UPDATED: Now uses nested route structure
 */
export const deleteSurveyResponse = async (surveyId: string, responseId: string) => {
  try {
    const response = await apiClient.delete(`/surveys/${surveyId}/responses/${responseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey response ${responseId}:`, error);
    throw error;
  }
};

/**
 * Get survey statistics
 * UPDATED: Now uses nested route structure
 */
export const getSurveyStatistics = async (
  surveyId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    detailed?: boolean;
  }
): Promise<{ data: SurveyStatistics }> => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses/statistics`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey statistics for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Export survey responses
 * UPDATED: Now uses nested route structure
 */
export const exportSurveyResponses = async (
  surveyId: string,
  format: 'csv' | 'excel' | 'json' | 'pdf' = 'csv',
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    includeMetadata?: boolean;
  }
) => {
  try {
    const params = {
      format,
      ...filters
    };
    const response = await apiClient.get(`/surveys/${surveyId}/responses/export`, {
      params,
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting survey responses for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get response analytics
 * UPDATED: Now uses nested route structure
 */
export const getSurveyResponseAnalytics = async (
  surveyId: string,
  timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses/analytics`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey response analytics for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get real-time response tracking
 * UPDATED: Now uses nested route structure
 */
export const getRealtimeResponseTracking = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses/realtime`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching realtime tracking for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Update response progress
 * UPDATED: Now uses nested route structure
 */
export const updateProgress = async (
  surveyId: string,
  responseId: string,
  progress: number,
  currentSection?: string,
  metadata?: Record<string, any>
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/responses/${responseId}/progress`, {
      progress,
      currentSection,
      metadata
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating response progress ${responseId}:`, error);
    throw error;
  }
};

/**
 * Anonymous survey response submission (for public surveys)
 */
export const submitAnonymousResponse = async (
  surveyId: string,
  responses: Array<{
    questionId: string;
    surveyQuestionId: string;
    answer: any;
  }>,
  metadata?: Record<string, any>
) => {
  try {
    // Start anonymous response
    const startResponse = await startSurveyResponse(surveyId, { metadata });
    const responseId = startResponse.data._id;

    // Submit all answers
    for (const questionResponse of responses) {
      await submitQuestionResponse(surveyId, responseId, questionResponse);
    }

    // Complete the response
    const completedResponse = await completeSurveyResponse(surveyId, responseId);
    
    return completedResponse;
  } catch (error) {
    console.error(`Error submitting anonymous response for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get responses by respondent
 */
export const getResponsesByRespondent = async (
  respondentId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    surveyId?: string;
  }
) => {
  try {
    const response = await apiClient.get(`/respondents/${respondentId}/responses`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching responses for respondent ${respondentId}:`, error);
    throw error;
  }
};

/**
 * Get response progress
 * UPDATED: Now uses nested route structure
 */
export const getSurveyResponseProgress = async (surveyId: string, responseId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses/${responseId}/progress`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching response progress ${responseId}:`, error);
    throw error;
  }
};

/**
 * Update response metadata
 * UPDATED: Now uses nested route structure
 */
export const updateResponseMetadata = async (
  surveyId: string,
  responseId: string,
  metadata: Record<string, any>
) => {
  try {
    const response = await apiClient.put(`/surveys/${surveyId}/responses/${responseId}/metadata`, { metadata });
    return response.data;
  } catch (error) {
    console.error(`Error updating response metadata ${responseId}:`, error);
    throw error;
  }
};

/**
 * Get question response statistics
 */
export const getQuestionResponseStats = async (
  surveyId: string,
  questionId: string
) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/questions/${questionId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question response stats:`, error);
    throw error;
  }
};

/**
 * Validate response data before submission
 */
export const validateResponseData = async (
  surveyId: string,
  responses: Array<{
    questionId: string;
    answer: any;
  }>
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/validate-responses`, { responses });
    return response.data;
  } catch (error) {
    console.error(`Error validating response data for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get survey completion funnel
 * UPDATED: Now uses nested route structure
 */
export const getSurveyCompletionFunnel = async (surveyId: string) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/responses/funnel`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching completion funnel for survey ${surveyId}:`, error);
    throw error;
  }
};


// ADD THIS NEW FUNCTION
export const recordConsentDeclined = async (
  surveyId: string,
  data: {
    consentFormId: string;
    metadata?: any;
  }
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/responses/consent-declined`, data);
    return response.data;
  } catch (error) {
    console.error('Error recording consent declined:', error);
    throw error;
  }
};