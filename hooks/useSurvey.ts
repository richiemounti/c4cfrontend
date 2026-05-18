// hooks/useSurvey.ts - FIXED FOR UPDATED API SIGNATURES
import { useState, useCallback, useEffect } from 'react';
import {
  Survey,
  SurveyResponse,
  FilteredQuestionsRequest,
  CategorizedSurveyRequest,
  SurveyStatistics,
  BulkTranslateQuestionsRequest,
  CreateTranslationRequest,
  SurveyTranslation,
  TranslateQuestionRequest,
  TranslateSectionRequest,
  TranslationStatistics,
  UpdateTranslationRequest,
  BespokeQuestion,
  BespokeQuestionFilters,
  BespokeQuestionStatistics,
  CreateBespokeQuestionRequest,
  UpdateBespokeQuestionRequest
} from '@/types';
import * as surveyApi from '@/lib/api/survey'; // UNIFIED API - only import needed
import * as surveyResponseApi from '@/lib/api/surveyResponse';
import * as surveyQuestionApi from '@/lib/api/surveyQuestion';
import * as surveySectionApi from '@/lib/api/surveySection';
import * as questionApi from '@/lib/api/question';
import { getSurveyStatistics } from '@/lib/api/surveyResponse';
// ADD THIS LINE:
import * as surveyTranslationApi from '@/lib/api/surveyTranslation';

import * as consentFormApi from '@/lib/api/consentForm';


/**
 * Hook for managing survey operations
 */
export const useSurvey = (surveyId?: string) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurvey = useCallback(async (id?: string) => {
    const targetId = id || surveyId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyApi.getSurvey(targetId, 'project,projectSite,theoryOfChangeStage,stakeholderGroup');
      setSurvey(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch survey');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const updateSurvey = useCallback(async (data: any) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyApi.updateSurvey(surveyId, data);
      setSurvey(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const deleteSurvey = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveyApi.archiveSurvey(surveyId);
      setSurvey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const updateCategory = useCallback(async (category: string, customCategoryName?: string) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyApi.updateSurveyCategory(surveyId, {
        category,
        customCategoryName
      });
      setSurvey(prev => prev ? { 
        ...prev, 
        category: category as Survey['category'], 
        customCategoryName 
      } : null);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId, fetchSurvey]);

  // ADD THIS METHOD
  const attachConsentForm = useCallback(async (
    consentFormId: string | null,
    consentRequired: boolean = true
  ) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyApi.attachConsentFormToSurvey(surveyId, {
        consentFormId,
        consentRequired
      });
      setSurvey(prev => prev ? {
        ...prev,
        consentForm: consentFormId || undefined,
        consentRequired
      } : null);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to attach consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // ADD THIS METHOD
  const removeConsentForm = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyApi.removeConsentFormFromSurvey(surveyId);
      setSurvey(prev => prev ? {
        ...prev,
        consentForm: undefined,
        consentRequired: false
      } : null);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove consent form');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);


  return {
    survey,
    loading,
    error,
    fetchSurvey,
    updateSurvey,
    deleteSurvey,
    updateCategory,
    attachConsentForm,    
    removeConsentForm,
    refetch: fetchSurvey
  };
};

/**
 * Hook for survey builder functionality - NOW USING UNIFIED API
 */
export const useSurveyBuilder = () => {
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demographicQuestions, setDemographicQuestions] = useState<any[]>([]);


  const loadFilteredQuestions = useCallback(async (params: FilteredQuestionsRequest) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getFilteredQuestionsForSurvey(params);
      
      // Sanitize the questions data to ensure all fields are the correct types
      const sanitizedQuestions = response.data.filteredQuestions.map((question: any) => ({
        ...question,
        // Ensure targetAudience is always a string
        targetAudience: typeof question.targetAudience === 'object' 
          ? question.targetAudience?.name || question.targetAudience?.label || 'Unknown'
          : question.targetAudience || 'Unknown',
        
        // Ensure type is always a string
        type: typeof question.type === 'object'
          ? question.type?.name || question.type?.label || question.type?.value || 'text'
          : question.type || 'text',
          
        // Ensure theme and subTheme are properly structured
        theme: question.theme && typeof question.theme === 'object' 
          ? {
              _id: question.theme._id || question.theme.value || '',
              name: question.theme.name || question.theme.label || 'Unknown Theme'
            }
          : question.theme,
          
        subThemes: Array.isArray(question.subThemes)
          ? question.subThemes.map((st: any) =>
              typeof st === 'object'
                ? { _id: st._id || st.value || '', name: st.name || st.label || 'Unknown SubTheme' }
                : { _id: st, name: 'Unknown SubTheme' }
            )
          : question.subTheme
            ? [typeof question.subTheme === 'object'
                ? { _id: question.subTheme._id || '', name: question.subTheme.name || 'Unknown SubTheme' }
                : { _id: question.subTheme, name: 'Unknown SubTheme' }]
            : [],
        
        // Add estimated time if not present
        estimatedTime: question.estimatedTime || 2
      }));
      
      console.log('Sanitized questions:', sanitizedQuestions);
      setFilteredQuestions(sanitizedQuestions);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filtered questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContext = useCallback(async (stakeholderGroupId: string, stageId: string) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveyBuilderContext(stakeholderGroupId, stageId);
      setContext(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load context');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSurvey = useCallback(async (data: CategorizedSurveyRequest) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.createSurvey(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced function to get questions by IDs using your existing question API
  const getQuestionsByIds = useCallback(async (questionIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.fetchQuestions({
        ids: questionIds.join(','),
        populate: 'theme,subTheme'
      });
      
      const questions = response.data || [];
      
      // Sanitize and add estimated time
      const sanitizedQuestions = questions.map((question: any) => ({
        ...question,
        estimatedTime: question.estimatedTime || 2,
        theme: typeof question.theme === 'object' 
          ? question.theme 
          : { _id: question.theme, name: 'Unknown Theme' },
        subTheme: question.subTheme && typeof question.subTheme === 'object'
          ? question.subTheme
          : question.subTheme 
            ? { _id: question.subTheme, name: 'Unknown SubTheme' }
            : undefined
      }));
      
      return sanitizedQuestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // NEW: Advanced question filtering
  const getAdvancedFilteredQuestions = useCallback(async (params: {
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
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getAdvancedFilteredQuestions(params);
      setFilteredQuestions(response.data.filteredQuestions);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load advanced filtered questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // NEW: Get question recommendations
  const getQuestionRecommendations = useCallback(async (
    stakeholderGroupId: string,
    stageId: string,
    limit: number = 10
  ) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getQuestionRecommendations(stakeholderGroupId, stageId, limit);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get question recommendations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add this new function to the hook:
  const loadDemographicQuestions = useCallback(async (audience: 'internal' | 'external' | 'both') => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.fetchRecommendedDemographics(audience);
      
      // Sanitize demographic questions
      const sanitized = response.data.all.map((q: any) => ({
        ...q,
        estimatedTime: q.estimatedTime || 1,
        isStandardDemographic: true
      }));
      
      setDemographicQuestions(sanitized);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load demographic questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    filteredQuestions,
    context,
    loading,
    error,
    loadFilteredQuestions,
    loadContext,
    createSurvey,
    getQuestionsByIds,
    getAdvancedFilteredQuestions,
    getQuestionRecommendations,
    demographicQuestions, // ADD THIS
    loadDemographicQuestions
  };
};

/**
 * Hook for managing surveys by stakeholder
 */
export const useSurveysByStakeholder = (stakeholderGroupId?: string) => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [surveysByCategory, setSurveysByCategory] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveysByStakeholder = useCallback(async (
    stakeholderGroupId: string,
    filters?: {
      stageId?: string;
      category?: string;
      status?: string;
      includeArchived?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveysByStakeholder(stakeholderGroupId, filters);
      setSurveys(response.data.surveys);
      setSurveysByCategory(response.data.surveysByCategory);
      setCategories(response.data.categories);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch surveys by stakeholder');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStakeholderStats = useCallback(async (stakeholderGroupId: string) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getStakeholderSurveyStats(stakeholderGroupId);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stakeholder stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stakeholderGroupId) {
      fetchSurveysByStakeholder(stakeholderGroupId);
    }
  }, [stakeholderGroupId, fetchSurveysByStakeholder]);

  return {
    surveys,
    surveysByCategory,
    categories,
    loading,
    error,
    fetchSurveysByStakeholder,
    getStakeholderStats,
    refetch: () => stakeholderGroupId && fetchSurveysByStakeholder(stakeholderGroupId)
  };
};

/**
 * Hook for managing surveys by project and stage
 */
export const useSurveysByProjectAndStage = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [surveysByStakeholder, setSurveysByStakeholder] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveysByProjectAndStage = useCallback(async (
    projectId: string,
    stageId: string,
    filters?: {
      includeArchived?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveysByProjectAndStage(projectId, stageId, filters);
      setSurveys(response.data.surveys);
      setSurveysByStakeholder(response.data.surveysByStakeholder);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch surveys by project and stage');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    surveys,
    surveysByStakeholder,
    loading,
    error,
    fetchSurveysByProjectAndStage
  };
};

/**
 * Hook for managing survey responses
 */
export const useSurveyResponse = (surveyId?: string) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async (params?: any) => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyResponseApi.getSurveyResponses(surveyId, params);
      setResponses(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch responses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const fetchStatistics = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await getSurveyStatistics(surveyId);
      setStatistics(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const startResponse = useCallback(async (data?: any) => {
    if (!surveyId) return;

    try {
      const response = await surveyResponseApi.startSurveyResponse(surveyId, data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start response');
      throw err;
    }
  }, [surveyId]);

  const exportResponses = useCallback(async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    if (!surveyId) return;

    try {
      // USING UNIFIED API
      const response = await surveyApi.exportSurveyResponses(surveyId, format);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export responses');
      throw err;
    }
  }, [surveyId]);

  useEffect(() => {
    if (surveyId) {
      fetchResponses();
      fetchStatistics();
    }
  }, [surveyId, fetchResponses, fetchStatistics]);

  return {
    responses,
    statistics,
    loading,
    error,
    fetchResponses,
    fetchStatistics,
    startResponse,
    exportResponses,
    refetch: () => {
      fetchResponses();
      fetchStatistics();
    }
  };
};

/**
 * Hook for managing survey questions
 */
export const useSurveyQuestions = (surveyId?: string) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (params?: any) => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveyQuestions(surveyId, params);
      setQuestions(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const addQuestion = useCallback(async (data: any) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyQuestionApi.addQuestionToSurvey(surveyId, data);
      await fetchQuestions(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchQuestions]);

  // FIXED: Now passes surveyId and questionId
  const removeQuestion = useCallback(async (questionId: string) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveyQuestionApi.removeQuestionFromSurvey(surveyId, questionId);
      await fetchQuestions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchQuestions]);

  const reorderQuestions = useCallback(async (items: Array<{ id: string; order: number }>) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveyQuestionApi.reorderSurveyQuestions(surveyId, {
        questions: items.map(({ id }) => ({ id })),
      });
      await fetchQuestions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchQuestions]);

  useEffect(() => {
    if (surveyId) {
      fetchQuestions();
    }
  }, [surveyId, fetchQuestions]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    addQuestion,
    removeQuestion,
    reorderQuestions,
    refetch: fetchQuestions
  };
};

/**
 * Hook for managing survey sections
 */
export const useSurveySections = (surveyId?: string) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveySections(surveyId);
      setSections(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const createSection = useCallback(async (data: any) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveySectionApi.createSurveySection(surveyId, data);
      await fetchSections(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchSections]);

  // FIXED: Now passes surveyId and sectionId
  const deleteSection = useCallback(async (sectionId: string) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveySectionApi.deleteSurveySection(surveyId, sectionId);
      await fetchSections(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchSections]);

  const reorderSections = useCallback(async (items: Array<{ id: string; order: number }>) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveySectionApi.reorderSurveySections(surveyId, items.map(i => i.id));
      await fetchSections(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder sections');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchSections]);

  useEffect(() => {
    if (surveyId) {
      fetchSections();
    }
  }, [surveyId, fetchSections]);

  return {
    sections,
    loading,
    error,
    fetchSections,
    createSection,
    deleteSection,
    reorderSections,
    refetch: fetchSections
  };
};

/**
 * Hook for survey taking (respondent side)
 */
export const useSurveyTaking = (surveyId: string) => {
  const [currentResponse, setCurrentResponse] = useState<SurveyResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSurvey = useCallback(async (respondentInfo?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await surveyResponseApi.startSurveyResponse(surveyId, { respondentInfo });
      
      console.log('Start survey API response:', response);
      
      // ✅ FIX: Handle both _id and responseId
      const responseData = {
        ...response.data,
        _id: response.data._id || response.data.responseId // Use _id if available, fallback to responseId
      };
      
      console.log('Setting current response:', responseData);
      setCurrentResponse(responseData as any);
      setCurrentQuestion(0);
      setAnswers({});
      return response;
    } catch (err) {
      console.error('Start survey error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const submitAnswer = useCallback(async (
    questionId: string,
    surveyQuestionId: string,
    answer: any,
    descriptorAnswers?: Record<string, string>   // ← add
  ) => {
    if (!currentResponse) {
      console.error('No current response available');
      throw new Error('No active survey response. Please start the survey first.');
    }

    const responseId = currentResponse._id || (currentResponse as any).responseId;

    if (!responseId) {
      console.error('Response ID missing:', currentResponse);
      throw new Error('Response ID is missing');
    }

    console.log('Submitting answer:', {
      surveyId,
      responseId,
      questionId,
      surveyQuestionId,
      answer: answer instanceof File ? `File: ${answer.name}` : answer,
      answerType: answer instanceof File ? 'File' : typeof answer,
      descriptorAnswers
    });

    try {
      if (answer instanceof File) {
        console.log('Uploading file:', answer.name, answer.size, 'bytes');
        const response = await surveyResponseApi.submitQuestionResponseWithFile(
          surveyId,
          responseId,
          {
            surveyQuestionId,
            file: answer,
            descriptorAnswers: descriptorAnswers && Object.keys(descriptorAnswers).some(k => descriptorAnswers[k])
              ? descriptorAnswers
              : undefined,
          }
        );
        console.log('File upload response:', response);
      } else {
        console.log('Submitting regular answer');
        const response = await surveyResponseApi.submitQuestionResponse(
          surveyId,
          responseId,
          {
            questionId,
            surveyQuestionId,
            answer,
            descriptorAnswers: descriptorAnswers && Object.keys(descriptorAnswers).some(k => descriptorAnswers[k])
              ? descriptorAnswers
              : undefined,
          }
        );
        console.log('Answer submission response:', response);
      }

      setAnswers(prev => {
        const updated = { ...prev, [questionId]: answer };
        console.log('Updated answers state:', updated);
        return updated;
      });
    } catch (err) {
      console.error('Submit answer error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      throw err;
    }
  }, [surveyId, currentResponse]);

  const completeSurvey = useCallback(async () => {
    if (!currentResponse) return;

    // ✅ Get the response ID
    const responseId = currentResponse._id || (currentResponse as any).responseId;
    
    if (!responseId) {
      throw new Error('Response ID is missing');
    }

    setLoading(true);
    try {
      const response = await surveyResponseApi.completeSurveyResponse(
        surveyId, 
        responseId
      );
      setCurrentResponse(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, currentResponse]);

  const saveDraft = useCallback(async () => {
    if (!currentResponse) return;

    // ✅ Get the response ID
    const responseId = currentResponse._id || (currentResponse as any).responseId;
    
    if (!responseId) {
      throw new Error('Response ID is missing');
    }

    try {
      await surveyResponseApi.saveSurveyResponse(surveyId, responseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
      throw err;
    }
  }, [surveyId, currentResponse]);

  return {
    currentResponse,
    currentQuestion,
    answers,
    loading,
    error,
    startSurvey,
    submitAnswer,
    completeSurvey,
    saveDraft,
    nextQuestion: () => {
      console.log('Moving to next question from:', currentQuestion);
      setCurrentQuestion(prev => prev + 1);
    },
    previousQuestion: () => {
      console.log('Moving to previous question from:', currentQuestion);
      setCurrentQuestion(prev => Math.max(0, prev - 1));
    },
    goToQuestion: setCurrentQuestion
  };
};


/**
 * Hook for survey structure management (sections + questions)
 */
export const useSurveyStructure = (surveyId?: string) => {
  const [structure, setStructure] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStructure = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.getSurveyStructure(surveyId);
      setStructure(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch survey structure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const addQuestionToSection = useCallback(async (questionData: any, sectionId?: string) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyQuestionApi.addQuestionToSurvey(surveyId, {
        ...questionData,
        sectionId
      });
      await fetchStructure(); // Refresh structure
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question to section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchStructure]);

  // FIXED: Now passes surveyId and questionId
  const moveQuestionToSection = useCallback(async (surveyQuestionId: string, targetSectionId?: string | null) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyQuestionApi.updateSurveyQuestion(surveyId, surveyQuestionId, {
        sectionId: targetSectionId || undefined
      });
      await fetchStructure(); // Refresh structure
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchStructure]);

  // FIXED: Now passes surveyId and questionId
  const updateQuestionLogic = useCallback(async (surveyQuestionId: string, conditionalLogic: any) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      const response = await surveyQuestionApi.updateSurveyQuestion(surveyId, surveyQuestionId, {
        conditionalLogic
      });
      await fetchStructure(); // Refresh structure
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question logic');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchStructure]);

  const reorderQuestions = useCallback(async (sectionId: string | null, questionOrders: Array<{ id: string; order: number }>) => {
    if (!surveyId) return;

    setLoading(true);
    try {
      await surveyQuestionApi.reorderSurveyQuestions(surveyId, {
        questions: questionOrders.map(({ id }) => ({ id })),
        sectionId,
      });
      await fetchStructure(); // Refresh structure
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchStructure]);

  useEffect(() => {
    if (surveyId) {
      fetchStructure();
    }
  }, [surveyId, fetchStructure]);

  return {
    structure,
    loading,
    error,
    fetchStructure,
    addQuestionToSection,
    moveQuestionToSection,
    updateQuestionLogic,
    reorderQuestions,
    refetch: fetchStructure
  };
};

/**
 * Hook for bulk question management
 */
export const useBulkQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMultipleQuestions = useCallback(async (surveyId: string, questionData: Array<{
    questionId: string;
    sectionId?: string;
    order: number;
    required?: boolean;
    customText?: string;
    customDescription?: string;
    conditionalLogic?: any;
  }>) => {
    setLoading(true);
    setError(null);
    
    const results = [];
    const errors = [];

    try {
      // Process questions sequentially to maintain order
      for (const qData of questionData) {
        try {
          const response = await surveyQuestionApi.addQuestionToSurvey(surveyId, qData);
          results.push(response);
        } catch (err) {
          errors.push({
            questionId: qData.questionId,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      if (errors.length > 0) {
        console.warn('Some questions failed to add:', errors);
      }

      return {
        success: results.length > 0,
        results,
        errors,
        addedCount: results.length,
        failedCount: errors.length
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSurveyWithStructure = useCallback(async (surveyData: CategorizedSurveyRequest, structure: {
    sections: Array<{
      title: string;
      description?: string;
      questions: Array<{
        questionId: string;
        required?: boolean;
        customText?: string;
        customDescription?: string;
        conditionalLogic?: any;
      }>;
    }>;
    unassignedQuestions: Array<{
      questionId: string;
      required?: boolean;
      customText?: string;
      customDescription?: string;
      conditionalLogic?: any;
    }>;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create the survey using unified API
      const surveyResponse = await surveyApi.createSurvey(surveyData);
      const surveyId = surveyResponse.data._id;

      // 2. Create sections and add questions
      for (let sIndex = 0; sIndex < structure.sections.length; sIndex++) {
        const section = structure.sections[sIndex];
        
        try {
          const sectionResponse = await surveySectionApi.createSurveySection(surveyId, {
            title: section.title,
            description: section.description,
            order: sIndex + 1
          });
          
          const sectionId = sectionResponse.data._id;
          
          // Add questions to this section
          for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
            const questionData = section.questions[qIndex];
            try {
              await surveyQuestionApi.addQuestionToSurvey(surveyId, {
                questionId: questionData.questionId,
                sectionId,
                order: qIndex + 1,
                required: questionData.required || false,
                customText: questionData.customText,
                customDescription: questionData.customDescription,
                conditionalLogic: questionData.conditionalLogic
              });
            } catch (qErr) {
              console.error(`Failed to add question ${questionData.questionId} to section ${sectionId}:`, qErr);
            }
          }
        } catch (sErr) {
          console.error(`Failed to create section ${section.title}:`, sErr);
        }
      }

      // 3. Add unassigned questions
      for (let qIndex = 0; qIndex < structure.unassignedQuestions.length; qIndex++) {
        const questionData = structure.unassignedQuestions[qIndex];
        try {
          await surveyQuestionApi.addQuestionToSurvey(surveyId, {
            questionId: questionData.questionId,
            order: qIndex + 1,
            required: questionData.required || false,
            customText: questionData.customText,
            customDescription: questionData.customDescription,
            conditionalLogic: questionData.conditionalLogic
          });
        } catch (qErr) {
          console.error(`Failed to add unassigned question ${questionData.questionId}:`, qErr);
        }
      }

      return {
        success: true,
        survey: surveyResponse.data,
        surveyId
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey with structure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addMultipleQuestions,
    createSurveyWithStructure
  };
};

/**
 * Hook for survey validation and preview
 */
export const useSurveyValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSurveyCreation = useCallback(async (data: Partial<CategorizedSurveyRequest>) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.validateSurveyCreation(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewSurveyWithQuestions = useCallback(async (params: {
    stakeholderGroupId: string;
    stageId: string;
    selectedQuestionIds: string[];
    surveyTitle: string;
    surveyDescription?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // USING UNIFIED API
      const response = await surveyApi.previewSurveyWithQuestions(params);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    validateSurveyCreation,
    previewSurveyWithQuestions
  };
};


// hooks/useSurvey.ts - ADD TRANSLATION HOOKS

/**
 * Hook for managing survey translations
 */
export const useSurveyTranslations = (surveyId?: string) => {
  const [translations, setTranslations] = useState<SurveyTranslation[]>([]);
  const [publishedTranslations, setPublishedTranslations] = useState<any>(null);
  const [statistics, setStatistics] = useState<TranslationStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useCallback(async (filters?: {
    status?: 'draft' | 'pending_review' | 'approved' | 'published';
    language?: string;
  }) => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.getSurveyTranslations(surveyId, filters);
      setTranslations(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const fetchPublishedTranslations = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.getPublishedTranslations(surveyId);
      setPublishedTranslations(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch published translations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const fetchStatistics = useCallback(async () => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.getTranslationStatistics(surveyId);
      setStatistics(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translation statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const createTranslation = useCallback(async (data: CreateTranslationRequest) => {
    if (!surveyId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.createSurveyTranslation(surveyId, data);
      await fetchTranslations(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, fetchTranslations]);

  useEffect(() => {
    if (surveyId) {
      fetchTranslations();
      fetchPublishedTranslations();
    }
  }, [surveyId, fetchTranslations, fetchPublishedTranslations]);

  return {
    translations,
    publishedTranslations,
    statistics,
    loading,
    error,
    fetchTranslations,
    fetchPublishedTranslations,
    fetchStatistics,
    createTranslation,
    refetch: () => {
      fetchTranslations();
      fetchPublishedTranslations();
    }
  };
};

/**
 * Hook for managing a single translation
 */
export const useTranslation = (translationId?: string) => {
  const [translation, setTranslation] = useState<SurveyTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslation = useCallback(async (id?: string) => {
    const targetId = id || translationId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.getTranslation(targetId);
      setTranslation(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  const updateTranslation = useCallback(async (data: UpdateTranslationRequest) => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.updateTranslation(translationId, data);
      setTranslation(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  const translateSection = useCallback(async (
    sectionId: string, 
    data: TranslateSectionRequest
  ) => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.updateTranslatedSection(translationId, sectionId, data);
      await fetchTranslation(); // Refresh
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId, fetchTranslation]);

  const translateQuestion = useCallback(async (
    questionId: string,
    data: TranslateQuestionRequest
  ) => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.updateTranslatedQuestion(translationId, questionId, data);
      await fetchTranslation(); // Refresh
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId, fetchTranslation]);

  const bulkTranslateQuestions = useCallback(async (data: BulkTranslateQuestionsRequest) => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.bulkUpdateTranslatedQuestions(translationId, data);
      await fetchTranslation(); // Refresh
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk translate questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId, fetchTranslation]);

  const submitForReview = useCallback(async () => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.submitTranslationForReview(translationId);
      setTranslation(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit translation for review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  const approveTranslation = useCallback(async () => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.approveTranslation(translationId);
      setTranslation(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  const publishTranslation = useCallback(async () => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await surveyTranslationApi.publishTranslation(translationId);
      setTranslation(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  const archiveTranslation = useCallback(async () => {
    if (!translationId) return;

    setLoading(true);
    setError(null);
    try {
      await surveyTranslationApi.archiveTranslation(translationId);
      setTranslation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive translation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  useEffect(() => {
    if (translationId) {
      fetchTranslation();
    }
  }, [translationId, fetchTranslation]);

  return {
    translation,
    loading,
    error,
    fetchTranslation,
    updateTranslation,
    translateSection,
    translateQuestion,
    bulkTranslateQuestions,
    submitForReview,
    approveTranslation,
    publishTranslation,
    archiveTranslation,
    refetch: fetchTranslation
  };
};

/**
 * Hook for taking a survey in a specific language
 */
export const useSurveyTakingWithTranslation = (surveyId: string, language?: string) => {
  const [currentResponse, setCurrentResponse] = useState<SurveyResponse | null>(null);
  const [translation, setTranslation] = useState<SurveyTranslation | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available translations when component mounts
  useEffect(() => {
    const fetchAvailableLanguages = async () => {
      try {
        const response = await surveyTranslationApi.getPublishedTranslations(surveyId);
        setAvailableLanguages(response.data.translations || []);
      } catch (err) {
        console.error('Failed to fetch available languages:', err);
      }
    };

    fetchAvailableLanguages();
  }, [surveyId]);

  // Fetch translation if language is specified
  useEffect(() => {
    const fetchTranslation = async () => {
      if (!language) return;

      try {
        const translationToUse = availableLanguages.find(t => t.language === language);
        if (translationToUse) {
          const response = await surveyTranslationApi.getFullTranslation(translationToUse._id);
          setTranslation(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch translation:', err);
      }
    };

    if (availableLanguages.length > 0) {
      fetchTranslation();
    }
  }, [language, availableLanguages]);

  const startSurvey = useCallback(async (respondentInfo?: any) => {
    setLoading(true);
    setError(null);
    try {
      const translationId = translation?._id;
      const response = await surveyResponseApi.startSurveyResponse(surveyId, { 
        respondentInfo,
        translationId,
        language
      });
      setCurrentResponse(response.data);
      setCurrentQuestion(0);
      setAnswers({});
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, translation, language]);

  const submitAnswer = useCallback(async (
    questionId: string,
    surveyQuestionId: string,
    answer: any,
    descriptorAnswers?: Record<string, string>   // ← add
  ) => {
    if (!currentResponse) return;

    try {
      await surveyResponseApi.submitQuestionResponse(surveyId, currentResponse._id, {
        questionId,
        surveyQuestionId,
        answer,
        descriptorAnswers: descriptorAnswers && Object.keys(descriptorAnswers).some(k => descriptorAnswers[k])
          ? descriptorAnswers
          : undefined,
      });
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      throw err;
    }
  }, [surveyId, currentResponse]);

  const completeSurvey = useCallback(async () => {
    if (!currentResponse) return;

    setLoading(true);
    try {
      const response = await surveyResponseApi.completeSurveyResponse(
        surveyId, 
        currentResponse._id
      );
      setCurrentResponse(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId, currentResponse]);

  return {
    currentResponse,
    translation,
    availableLanguages,
    currentQuestion,
    answers,
    loading,
    error,
    startSurvey,
    submitAnswer,
    completeSurvey,
    nextQuestion: () => setCurrentQuestion(prev => prev + 1),
    previousQuestion: () => setCurrentQuestion(prev => Math.max(0, prev - 1)),
    goToQuestion: setCurrentQuestion
  };
};

// hooks/useSurvey.ts - ADD BESPOKE QUESTION HOOKS

/**
 * Hook for managing bespoke questions in a project
 */
export const useBespokeQuestions = (projectId?: string) => {
  const [questions, setQuestions] = useState<BespokeQuestion[]>([]);
  const [statistics, setStatistics] = useState<BespokeQuestionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBespokeQuestions = useCallback(async (filters?: BespokeQuestionFilters) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.getBespokeQuestionsByProject(projectId, filters);
      setQuestions(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bespoke questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchStatistics = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.getBespokeQuestionStatistics(projectId);
      setStatistics(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createBespokeQuestion = useCallback(async (data: CreateBespokeQuestionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.createBespokeQuestion(data);
      await fetchBespokeQuestions(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bespoke question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBespokeQuestions]);

  const updateBespokeQuestion = useCallback(async (
    questionId: string,
    data: UpdateBespokeQuestionRequest
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.updateBespokeQuestion(questionId, data);
      await fetchBespokeQuestions(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bespoke question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBespokeQuestions]);

  const approveBespokeQuestion = useCallback(async (questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.approveBespokeQuestion(questionId);
      await fetchBespokeQuestions(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve bespoke question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBespokeQuestions]);

  const rejectBespokeQuestion = useCallback(async (questionId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.rejectBespokeQuestion(questionId, reason);
      await fetchBespokeQuestions(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject bespoke question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBespokeQuestions]);

  const elevateBespokeQuestion = useCallback(async (questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionApi.elevateBespokeQuestion(questionId);
      await fetchBespokeQuestions(); // Refresh list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to elevate bespoke question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBespokeQuestions]);

  useEffect(() => {
    if (projectId) {
      fetchBespokeQuestions();
      fetchStatistics();
    }
  }, [projectId, fetchBespokeQuestions, fetchStatistics]);

  return {
    questions,
    statistics,
    loading,
    error,
    fetchBespokeQuestions,
    fetchStatistics,
    createBespokeQuestion,
    updateBespokeQuestion,
    approveBespokeQuestion,
    rejectBespokeQuestion,
    elevateBespokeQuestion,
    refetch: () => {
      fetchBespokeQuestions();
      fetchStatistics();
    }
  };
};