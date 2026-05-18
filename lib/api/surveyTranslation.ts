// lib/api/surveyTranslation.ts
import { apiClient } from './client';
import {
  SurveyTranslation,
  CreateTranslationRequest,
  UpdateTranslationRequest,
  TranslateSectionRequest,
  TranslateQuestionRequest,
  BulkTranslateQuestionsRequest,
  TranslationStatistics,
  PublishedTranslationsResponse
} from '@/types';

/**
 * Create a new survey translation
 */
export const createSurveyTranslation = async (
  surveyId: string,
  data: CreateTranslationRequest
) => {
  try {
    const response = await apiClient.post(`/surveys/${surveyId}/translations`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating translation for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get all translations for a survey
 */
export const getSurveyTranslations = async (
  surveyId: string,
  filters?: {
    status?: 'draft' | 'pending_review' | 'approved' | 'published';
    language?: string;
  }
) => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/translations`, { params: filters });
    return response.data;
  } catch (error) {
    console.error(`Error fetching translations for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get published translations (public endpoint)
 */
export const getPublishedTranslations = async (
  surveyId: string
): Promise<{ data: PublishedTranslationsResponse }> => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/translations/published`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching published translations for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Get a single translation by ID
 */
export const getTranslation = async (translationId: string) => {
  try {
    const response = await apiClient.get(`/translations/${translationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Get full translation with all content (for respondents)
 */
export const getFullTranslation = async (translationId: string) => {
  try {
    const response = await apiClient.get(`/translations/${translationId}/full`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching full translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Update translation metadata
 */
export const updateTranslation = async (
  translationId: string,
  data: UpdateTranslationRequest
) => {
  try {
    const response = await apiClient.put(`/translations/${translationId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Translate a section
 */
export const updateTranslatedSection = async (
  translationId: string,
  sectionId: string,
  data: TranslateSectionRequest
) => {
  try {
    const response = await apiClient.put(
      `/translations/${translationId}/sections/${sectionId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error translating section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Translate a question
 */
export const updateTranslatedQuestion = async (
  translationId: string,
  questionId: string,
  data: TranslateQuestionRequest
) => {
  try {
    const response = await apiClient.put(
      `/translations/${translationId}/questions/${questionId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error translating question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Bulk translate questions
 */
export const bulkUpdateTranslatedQuestions = async (
  translationId: string,
  data: BulkTranslateQuestionsRequest
) => {
  try {
    const response = await apiClient.put(
      `/translations/${translationId}/questions/bulk`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error bulk translating questions for ${translationId}:`, error);
    throw error;
  }
};

/**
 * Submit translation for review
 */
export const submitTranslationForReview = async (translationId: string) => {
  try {
    const response = await apiClient.put(`/translations/${translationId}/submit`);
    return response.data;
  } catch (error) {
    console.error(`Error submitting translation ${translationId} for review:`, error);
    throw error;
  }
};

/**
 * Approve translation
 */
export const approveTranslation = async (translationId: string) => {
  try {
    const response = await apiClient.put(`/translations/${translationId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Publish translation
 */
export const publishTranslation = async (translationId: string) => {
  try {
    const response = await apiClient.put(`/translations/${translationId}/publish`);
    return response.data;
  } catch (error) {
    console.error(`Error publishing translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Archive translation
 */
export const archiveTranslation = async (translationId: string) => {
  try {
    const response = await apiClient.delete(`/translations/${translationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving translation ${translationId}:`, error);
    throw error;
  }
};

/**
 * Get translation statistics
 */
export const getTranslationStatistics = async (
  surveyId: string
): Promise<{ data: TranslationStatistics }> => {
  try {
    const response = await apiClient.get(`/surveys/${surveyId}/translations/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching translation statistics for survey ${surveyId}:`, error);
    throw error;
  }
};