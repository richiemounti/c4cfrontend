// types/pulseSurvey.ts
/**
 * TypeScript types for Pulse Survey system
 * This file should be placed in your types directory
 */

export type ModuleType = 
  | 'setup_project'
  | 'setup_site'
  | 'theory_of_change_stage_1'
  | 'theory_of_change_stage_2'
  | 'survey_creation'
  | 'survey_analysis';

export type QuestionType = 'rating' | 'text' | 'multiple_choice' | 'yes_no';

export interface RatingScale {
  min: number;
  max: number;
  labels: {
    low: string;
    high: string;
  };
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface PulseSurveyQuestion {
  _id?: string;
  questionText: string;
  questionType: QuestionType;
  ratingScale?: RatingScale;
  options?: QuestionOption[];
  isRequired: boolean;
  order: number;
}

export interface PulseSurvey {
  _id: string;
  moduleType: ModuleType;
  title: string;
  description?: string;
  questions: PulseSurveyQuestion[];
  isActive: boolean;
  showToAllUsers: boolean;
  creator?: string;
  lastUpdatedBy?: string;
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  ratingValue?: number;
  textValue?: string;
  selectedOption?: string;
  skipped?: boolean;
}

export interface PulseSurveyResponsePayload {
  pulseSurveyId: string;
  moduleType: ModuleType;
  moduleReference: string;
  moduleReferenceModel: string;
  organizationId: string | undefined;
  projectId: string | undefined;
  projectSiteId?: string;
  responses: QuestionResponse[];
  additionalComments?: string;
  timeToComplete?: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
  };
}

export interface PulseSurveyResponse extends PulseSurveyResponsePayload {
  _id: string;
  respondent: string;
  averageRating?: number;
  completedAt: string;
  status: 'draft' | 'submitted';
  createdAt: string;
  updatedAt: string;
}

export interface PulseSurveyCheckResult {
  required: boolean;
  pulseSurvey?: PulseSurvey;
  moduleData?: {
    moduleType: ModuleType;
    moduleReference: string;
    moduleReferenceModel: string;
    organizationId: string;
    projectId: string;
    projectSiteId?: string;
  };
  reason?: string;
  completedAt?: string;
  alreadyCompleted?: boolean;
  message?: string;
}

export interface CompletionMessage {
  title: string;
  message: string;
  surveyTitle: string;
  estimatedTime: string;
}

export interface PulseSurveyAnalytics {
  overall: {
    totalResponses: number;
    averageRating: number;
    averageTimeToComplete: number;
  };
  byModule: Array<{
    _id: ModuleType;
    totalResponses: number;
    averageRating: number;
    averageTimeToComplete: number;
  }>;
  ratingDistribution: Array<{
    _id: number | string;
    count: number;
  }>;
  responsesTrend: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    averageRating: number;
  }>;
}

// Helper type for creating surveys
export interface CreatePulseSurveyPayload {
  moduleType: ModuleType;
  title: string;
  description?: string;
  questions: Omit<PulseSurveyQuestion, '_id'>[];
  isActive?: boolean;
  showToAllUsers?: boolean;
}

// Type guards for runtime type checking
export const isValidModuleType = (value: string): value is ModuleType => {
  return [
    'setup_project',
    'setup_site',
    'theory_of_change_stage_1',
    'theory_of_change_stage_2',
    'survey_creation',
    'survey_analysis'
  ].includes(value);
};

export const isValidQuestionType = (value: string): value is QuestionType => {
  return ['rating', 'text', 'multiple_choice', 'yes_no'].includes(value);
};

// Constants
export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  setup_project: 'Project Setup',
  setup_site: 'Site Setup',
  theory_of_change_stage_1: 'Theory of Change - Stage 1',
  theory_of_change_stage_2: 'Theory of Change - Stage 2',
  survey_creation: 'Survey Creation',
  survey_analysis: 'Survey Analysis'
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  rating: 'Rating Scale',
  text: 'Text Response',
  multiple_choice: 'Multiple Choice',
  yes_no: 'Yes/No'
};