// types/survey-creation.ts - UPDATED with frontend time estimation
import React from 'react';

// Base Question interface matching your actual database model
export interface Question {
  _id: string;
  text: string;
  description?: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime' | 'radio' | 'checkbox' | 'dropdown' | 'scale' | 'matrix' | 'file' | 'location';
  required: boolean;
  options?: Array<{
    value: string;
    label: string;
    descriptor?: string;
    placeholder?: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  creator?: string | {
    _id: string;
    name: string;
    email: string;
  };
  category?: {
    _id: string;
    name: string;
  };
  theme?: {
    _id: string;
    name: string;
  };
  subTheme?: {
    _id: string;
    name: string;
  };
  targetAudience?: 'internal' | 'external' | 'both';
  status?: 'draft' | 'published' | 'archived';
  isTemplate?: boolean;
  tags?: string[];
  
  // NEW: Bespoke Question Fields (matches backend model exactly)
  isBespoke?: boolean;
  bespokeMetadata?: {
    createdBy: string | {
      _id: string;
      name: string;
      email: string;
    };
    project: string; // ObjectId reference
    organization: string; // ObjectId reference
    status: 'pending' | 'approved' | 'rejected' | 'elevated';
    approvedBy?: string | {
      _id: string;
      name: string;
      email: string;
    };
    approvedAt?: string;
    elevatedBy?: string | {
      _id: string;
      name: string;
      email: string;
    };
    elevatedAt?: string;
    originalQuestionId?: string; // ObjectId reference to elevated question
    rejectionReason?: string;
  };
  
  // NEW: Standard Demographics Configuration (matches backend model)
  isStandardDemographic?: boolean;
  demographicType?: 'age' | 'gender' | 'education' | 'income' | 'location' | 'employment' | 'household_size' | 'marital_status' | 'ethnicity' | 'language' | 'disability' | 'other';
  demographicCategory?: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility';
  isGlobalStandard?: boolean;
  demographicMetadata?: {
    isRequired: boolean;
    recommendedForAudience: ('internal' | 'external' | 'both')[];
    complianceRelevant: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    dataRetentionPeriod?: number; // in months
    anonymizationRequired: boolean;
  };
  
  // Selected tags from subtheme
  selectedIndicatorTags?: Array<{
    _id: string;
    name: string;
  }>;
  selectedSdgTags?: Array<{
    _id: string;
    code: string;
    name: string;
  }>;
  selectedResilienceTags?: Array<{
    _id: string;
    code: string;
    name: string;
  }>;
  selectedEsgTags?: Array<{
    _id: string;
    code: string;
    name: string;
  }>;
  selectedStandardTags?: Array<{
    _id: string;
    code: string;
    name: string;
  }>;
  
  // NOTE: estimatedTime is NOT in the backend model
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Survey Section interface matching your actual database model
export interface SurveySection {
  _id?: string;
  title: string;
  description?: string;
  survey?: string; // Reference to survey (will be set by backend)
  order: number;
  archived?: boolean;
  archivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Frontend-only properties for UI management
  isExpanded?: boolean;
  questions: SurveyQuestionItem[]; // Questions assigned to this section
}

// Survey Question Item interface matching your actual database model
export interface SurveyQuestionItem {
  _id?: string;
  questionId: string;
  question?: Question;
  survey?: string;
  section?: string;
  sectionId?: string;
  order: number;
  required: boolean;
  customText?: string;
  customDescription?: string;
  customOptions?: Array<{
    value: string;
    label: string;
    descriptor?: string;
    placeholder?: string;
  }>;
  conditionalLogic?: {
    enabled: boolean;
    conditions: Array<{
      questionId: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';  // ✅ Changed to camelCase
      value: any;
    }>;
    action: 'show' | 'hide';
  };
  archived?: boolean;
  archivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Survey Form Data interface matching your CreateSurveyRequest expectations
export interface SurveyFormData {
  title: string;
  description: string;
  category: 'baseline' | 'monitoring' | 'evaluation' | 'impact_assessment' | 'feedback' | 'custom';
  customCategoryName: string;
  estimatedDuration: number;
  settings: {
    // Access settings
    isPublic: boolean;
    requiresAuth: boolean;
    allowAnonymous: boolean;
    
    // Date restrictions
    startDate?: string; // ISO string format
    endDate?: string; // ISO string format
    
    // Response settings
    allowMultipleResponses: boolean;
    maxResponses?: number;
    
    // Display settings
    showProgressBar: boolean;
    allowSaveAndContinue: boolean;
    randomizeQuestions: boolean;
    
    // Notification settings
    sendConfirmationEmail: boolean;
    notifyOnResponse: boolean;
  };
}

export interface BackendSurveyRequest {
  title: string;
  description?: string;
  projectId: string; // ✅ Backend expects this
  projectSiteId?: string;
  stakeholderGroupId: string; // ✅ Backend expects this (not stakeholderGroup)
  stageId: string; // ✅ Backend expects this (not theoryOfChangeStage)
  category?: string;
  customCategoryName?: string;
  settings?: {
    isPublic?: boolean;
    requiresAuth?: boolean;
    allowAnonymous?: boolean;
    startDate?: Date;
    endDate?: Date;
    allowMultipleResponses?: boolean;
    maxResponses?: number;
    showProgressBar?: boolean;
    allowSaveAndContinue?: boolean;
    randomizeQuestions?: boolean;
    sendConfirmationEmail?: boolean;
    notifyOnResponse?: boolean;
  };
  isTemplate?: boolean;
  templateCategory?: string;
  estimatedDuration?: number;
}

// Page params interface
export interface PageParams {
  id: string;
  stakeholderGroupId: string;
  stageId: string;
}

// Survey creation step type
export type SurveyCreationStep = 'details' | 'structure' | 'settings' | 'review';

// Context interface for survey creation
export interface SurveyCreationContextType {
  // Form data state
  formData: SurveyFormData;
  setFormData: React.Dispatch<React.SetStateAction<SurveyFormData>>;
  
  // Survey structure state
  sections: SurveySection[];
  setSections: React.Dispatch<React.SetStateAction<SurveySection[]>>;
  unassignedQuestions: SurveyQuestionItem[];
  setUnassignedQuestions: React.Dispatch<React.SetStateAction<SurveyQuestionItem[]>>;
  
  // Questions data
  questionsData: Question[]; // All available questions
  
  // Validation state
  validationErrors: Record<string, string>;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  
  // Helper functions
  getAllQuestions: () => SurveyQuestionItem[];
  moveQuestionToSection: (questionItem: SurveyQuestionItem, targetSectionId: string | null) => void;
  updateQuestionLogic: (questionItem: SurveyQuestionItem, logic: {
    enabled: boolean;
    conditions: Array<{
      questionId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
    action: 'show' | 'hide';
  }) => void;
  
  // Form handlers
  handleInputChange: (field: string, value: any) => void;
  handleSettingsChange: (field: string, value: any) => void;
}

// Category options for survey creation
export const categoryOptions = [
  { 
    value: 'baseline', 
    label: 'Baseline Survey', 
    description: 'Initial data collection before project implementation' 
  },
  { 
    value: 'monitoring', 
    label: 'Monitoring Survey', 
    description: 'Ongoing tracking during project implementation' 
  },
  { 
    value: 'evaluation', 
    label: 'Evaluation Survey', 
    description: 'Assessment of project outcomes and impacts' 
  },
  { 
    value: 'impact_assessment', 
    label: 'Impact Assessment', 
    description: 'Comprehensive evaluation of project impacts' 
  },
  { 
    value: 'feedback', 
    label: 'Feedback Survey', 
    description: 'Stakeholder feedback collection' 
  },
  { 
    value: 'custom', 
    label: 'Custom Category', 
    description: 'Create your own survey category' 
  }
];

// Question type configuration for UI
export const QUESTION_TYPE_LABELS = {
  text: 'Short Text',
  textarea: 'Long Text',
  number: 'Number',
  date: 'Date',
  time: 'Time',
  datetime: 'Date & Time',
  radio: 'Single Choice',
  checkbox: 'Multiple Choice',
  dropdown: 'Dropdown',
  scale: 'Scale',
  matrix: 'Matrix',
  file: 'File Upload',
  location: 'Location'
} as const;

// ==========================================
// FRONTEND TIME ESTIMATION (NO BACKEND DEPENDENCY)
// ==========================================

/**
 * Question type time estimates (in minutes)
 * Based on typical user completion times
 */
export const QUESTION_TIME_ESTIMATES: Record<Question['type'], number> = {
  // Quick questions (0.5 - 1 minute)
  text: 0.5,
  number: 0.5,
  date: 0.5,
  time: 0.5,
  dropdown: 0.5,
  
  // Medium questions (1 - 2 minutes)
  datetime: 1,
  radio: 1,
  checkbox: 1.5,
  scale: 1,
  
  // Longer questions (2 - 3 minutes)
  textarea: 2,
  matrix: 3,
  location: 2,
  file: 2
};

/**
 * Calculate estimated time for a single question
 * Considers question type, options count, and complexity
 */
export const estimateQuestionTime = (question: Question): number => {
  // Base time from question type
  let baseTime = QUESTION_TIME_ESTIMATES[question.type] || 1;
  
  // Adjust for number of options (choice questions take longer with more options)
  if (['radio', 'checkbox', 'dropdown'].includes(question.type) && question.options) {
    const optionCount = question.options.length;
    if (optionCount > 5) {
      baseTime += 0.5; // Add 30 seconds for many options
    }
    if (optionCount > 10) {
      baseTime += 0.5; // Add another 30 seconds for lots of options
    }
  }
  
  // Adjust for description (questions with descriptions take longer to read)
  if (question.description && question.description.length > 100) {
    baseTime += 0.3; // Add 18 seconds for long descriptions
  }
  
  // Adjust for validation (complex validation takes longer)
  if (question.validation) {
    if (question.validation.pattern) {
      baseTime += 0.2; // Add 12 seconds for pattern validation
    }
  }
  
  // Round to 1 decimal place
  return Math.round(baseTime * 10) / 10;
};

/**
 * Calculate total estimated time for survey
 * FRONTEND ONLY - No backend dependency
 */
export const calculateSurveyDuration = (
  sections: SurveySection[], 
  unassignedQuestions: SurveyQuestionItem[],
  questionsData: Question[]
): number => {
  // Create a map for quick question lookup
  const questionMap = new Map(questionsData.map(q => [q._id, q]));
  
  let totalTime = 0;
  
  // Calculate time for questions in sections
  sections.forEach(section => {
    section.questions.forEach(questionItem => {
      const question = questionMap.get(questionItem.questionId);
      if (question) {
        totalTime += estimateQuestionTime(question);
      } else {
        // Fallback if question not found
        totalTime += 1;
      }
    });
  });
  
  // Calculate time for unassigned questions
  unassignedQuestions.forEach(questionItem => {
    const question = questionMap.get(questionItem.questionId);
    if (question) {
      totalTime += estimateQuestionTime(question);
    } else {
      // Fallback if question not found
      totalTime += 1;
    }
  });
  
  // Add overhead time (10% for instructions, transitions, etc.)
  const overhead = totalTime * 0.1;
  totalTime += overhead;
  
  // Round up to nearest minute, minimum 1 minute
  return Math.max(1, Math.ceil(totalTime));
};

/**
 * Get time estimate display string
 */
export const formatDurationEstimate = (minutes: number): string => {
  if (minutes < 1) {
    return 'Less than 1 minute';
  } else if (minutes === 1) {
    return '1 minute';
  } else if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
  }
};

/**
 * Get completion rate warning based on duration
 */
export const getDurationWarning = (minutes: number): { 
  level: 'none' | 'info' | 'warning' | 'critical';
  message: string;
} | null => {
  if (minutes <= 10) {
    return null; // No warning for short surveys
  } else if (minutes <= 20) {
    return {
      level: 'info',
      message: 'Good length for most surveys'
    };
  } else if (minutes <= 30) {
    return {
      level: 'warning',
      message: 'Longer surveys may have lower completion rates'
    };
  } else {
    return {
      level: 'critical',
      message: 'Consider breaking into multiple shorter surveys'
    };
  }
};

// Survey creation result type
export interface SurveyCreationResult {
  success: boolean;
  surveyId?: string;
  sections: number;
  questions: number;
  errors: string[];
  error?: string;
}

// Helper types for API transformation
export interface CreateSectionPayload {
  title: string;
  description?: string;
  order: number;
}

export interface CreateQuestionPayload {
  questionId: string;
  sectionId?: string;
  order: number;
  required: boolean;
  customText?: string;
  customDescription?: string;
  customOptions?: Array<{
    value: string;
    label: string;
    descriptor?: string;
    placeholder?: string;
  }>;
  conditionalLogic?: {
    enabled: boolean;
    conditions: Array<{
      questionId: string;
      operator: string;
      value: any;
    }>;
    action: string;
  };
}

// Transformation function from frontend form data to backend API format
export const transformToBackendRequest = (
  formData: SurveyFormData,
  projectContext: {
    projectId: string;
    stakeholderGroupId?: string;
    stageId?: string;
  }
): BackendSurveyRequest => {
  return {
    title: formData.title,
    description: formData.description,
    projectId: projectContext.projectId,
    stakeholderGroupId: projectContext.stakeholderGroupId!, // Backend expects this field name
    stageId: projectContext.stageId!, // Backend expects this field name
    category: formData.category,
    customCategoryName: formData.customCategoryName || undefined,
    estimatedDuration: formData.estimatedDuration,
    settings: {
      isPublic: formData.settings.isPublic,
      requiresAuth: formData.settings.requiresAuth,
      allowAnonymous: formData.settings.allowAnonymous,
      allowMultipleResponses: formData.settings.allowMultipleResponses,
      maxResponses: formData.settings.maxResponses,
      startDate: formData.settings.startDate ? new Date(formData.settings.startDate) : undefined,
      endDate: formData.settings.endDate ? new Date(formData.settings.endDate) : undefined,
      showProgressBar: formData.settings.showProgressBar,
      allowSaveAndContinue: formData.settings.allowSaveAndContinue,
      randomizeQuestions: formData.settings.randomizeQuestions,
      sendConfirmationEmail: formData.settings.sendConfirmationEmail,
      notifyOnResponse: formData.settings.notifyOnResponse,
    }
  };
};

// Validation helpers
export const validateSurveyForm = (formData: SurveyFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.title.trim()) {
    errors.title = 'Survey title is required';
  } else if (formData.title.length > 200) {
    errors.title = 'Survey title must be less than 200 characters';
  }
  
  if (!formData.description.trim()) {
    errors.description = 'Survey description is required';
  } else if (formData.description.length > 1000) {
    errors.description = 'Survey description must be less than 1000 characters';
  }
  
  if (formData.category === 'custom' && !formData.customCategoryName.trim()) {
    errors.customCategoryName = 'Custom category name is required when using custom category';
  }
  
  if (formData.estimatedDuration < 1) {
    errors.estimatedDuration = 'Estimated duration must be at least 1 minute';
  } else if (formData.estimatedDuration > 480) {
    errors.estimatedDuration = 'Estimated duration should not exceed 8 hours (480 minutes)';
  }
  
  if (formData.settings.maxResponses && formData.settings.maxResponses < 1) {
    errors.maxResponses = 'Maximum responses must be at least 1';
  }
  
  if (formData.settings.startDate && formData.settings.endDate) {
    const startDate = new Date(formData.settings.startDate);
    const endDate = new Date(formData.settings.endDate);
    
    if (startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

// Survey structure validation
export const validateSurveyStructure = (
  sections: SurveySection[], 
  unassignedQuestions: SurveyQuestionItem[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0) + unassignedQuestions.length;
  
  if (totalQuestions === 0) {
    errors.questions = 'Survey must have at least one question';
  }
  
  // Validate section titles
  sections.forEach((section, index) => {
    if (!section.title.trim()) {
      errors[`section_${index}_title`] = 'Section title is required';
    } else if (section.title.length > 200) {
      errors[`section_${index}_title`] = 'Section title must be less than 200 characters';
    }
    
    if (section.description && section.description.length > 1000) {
      errors[`section_${index}_description`] = 'Section description must be less than 1000 characters';
    }
  });
  
  // Check for duplicate section titles
  const sectionTitles = sections.map(s => s.title.trim().toLowerCase());
  const duplicateTitles = sectionTitles.filter((title, index) => sectionTitles.indexOf(title) !== index);
  if (duplicateTitles.length > 0) {
    errors.duplicateSections = 'Section titles must be unique';
  }
  
  return errors;
};

// Helper function to get question display text
export const getQuestionDisplayText = (question: Question): string => {
  return question.text || 'Untitled Question';
};

// Helper function to get question type label
export const getQuestionTypeLabel = (type: Question['type']): string => {
  return QUESTION_TYPE_LABELS[type] || type;
};

// Helper function to check if survey is ready for creation
export const isSurveyReadyForCreation = (
  formData: SurveyFormData,
  sections: SurveySection[],
  unassignedQuestions: SurveyQuestionItem[]
): boolean => {
  const formErrors = validateSurveyForm(formData);
  const structureErrors = validateSurveyStructure(sections, unassignedQuestions);
  
  return Object.keys(formErrors).length === 0 && Object.keys(structureErrors).length === 0;
};