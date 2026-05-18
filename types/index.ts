// types/index.ts

import { Category, Theme, SubTheme, Indicator, ESGCategory, SDG, Standard, ResilienceDimension, TaxonomyStatus } from './taxonomy';


// Define role types
// types/index.ts (or wherever your types are defined)
export type ConnectGoRole = 'owner' | 'admin' | 'accountManager' | 'analyst';
export type ClientRole = 'manager' | 'projectCreator' | 'leadership' | 'hq' | 'communications' | 'fieldStaff' | 'fieldAgent';
export type RoleType = ConnectGoRole | ClientRole;

// Interface for a role as stored in the database
export interface Role {
  _id: string;
  role: RoleType;
  organization?: string;
  projects?: string[];
}

// User related types
export interface User {
  _id: string;
  userName: string;
  name: string;
  email: string;
  photo?: string;
  primaryRole: string;
  roles: Role[];
  isConnectGoStaff: boolean;
  // other user fields
  isTemporaryUser?: boolean;
  invitationAccepted?: boolean;
  invitedRole?: string;
  invitedBy?: { name: string; email: string };
  invitationExpires?: string;
  createdAt: string;
}
  
  // Organization related types
  export interface Organization {
    _id: string;
    name: string;
    country: string;
    city: string;
    creator: string | User;
    archived: boolean;
    archivedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Project related types
  // types/index.ts - Add these new type definitions
// (This is an addition to your existing types, not a complete replacement)

// Project with contacts
export interface ProjectContact {
  _id?: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contacts?: ProjectContact[];
  startDate: Date;
  endDate?: Date;
  status: string;
  creator: string | User;
  organization: Organization;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; // Used in frontend only
}

// Project Site model
export interface ProjectSite {
  _id: string;
  project: Project | string;
  name: string;
  description?: string;
  address?: string;
  region?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  size?: number;
  sizeUnit?: 'hectares' | 'sqkm' | 'acres' | 'sqmi';
  siteType?: 'forest' | 'wetland' | 'grassland' | 'coastal' | 'agricultural' | 'urban' | 'other';
  status?: 'active' | 'inactive' | 'planned';
  contacts?: ProjectContact[];
  notes?: string;
  startDate?: Date;
  creator: string | User;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
  
  // Stakeholder related types
  export interface Stakeholder {
    _id: string;
    project: string | Project;
    category: StakeholderCategory;
    name: string;
    connections: StakeholderAttribute[];
    connectionStrength?: number;
    tasks: StakeholderTask[];
    creator: string | User;
    lastUpdatedBy?: string | User;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type StakeholderCategory = 
    'Government' | 
    'Communities affected by the project' | 
    'Marginalized groups' | 
    'Partner Agencies' | 
    'Our Organisation';
  
  export interface StakeholderAttribute {
    attributeType: string;
    description: string;
  }
  
  export interface StakeholderTask {
    taskType: 'connections' | 'power' | 'wellbeing' | 'roles' | 'risks' | 'benefits';
    attributes: StakeholderAttribute[];
    rating?: number;
  }
  
  export interface CompletionStatus {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionPercentage: number;
    categoryCounts: Record<StakeholderCategory, {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
    }>;
  }
  
  // API response types
  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
  }
  
  export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    count: number;
    total: number;
    pagination: {
      next?: { page: number; limit: number };
      prev?: { page: number; limit: number };
    };
  }

  // Question related types
// types/index.ts - Add this complete QuestionType definition

export type QuestionType = 
  | 'text'          // Single line text input
  | 'textarea'      // Multi-line text input
  | 'number'        // Numeric input
  | 'date'          // Date picker
  | 'time'          // Time picker
  | 'datetime'      // Date and time picker
  | 'radio'         // Single choice (radio buttons)
  | 'checkbox'      // Multiple choice (checkboxes)
  | 'dropdown'      // Single choice (dropdown/select)
  | 'scale'         // Rating scale (1-5, 1-10, etc.)
  | 'matrix'        // Grid of questions
  | 'file'          // File upload
  | 'location';     // Location/GPS coordinates

// Question type metadata for form builders
export const QUESTION_TYPE_CONFIG = {
  text: {
    label: 'Single Line Text',
    description: 'Short text response',
    icon: '📝',
    requiresOptions: false,
    supportedValidation: ['min', 'max', 'pattern']
  },
  textarea: {
    label: 'Multi-line Text',
    description: 'Long text response',
    icon: '📄',
    requiresOptions: false,
    supportedValidation: ['min', 'max']
  },
  number: {
    label: 'Number',
    description: 'Numeric input',
    icon: '🔢',
    requiresOptions: false,
    supportedValidation: ['min', 'max']
  },
  date: {
    label: 'Date',
    description: 'Date selection',
    icon: '📅',
    requiresOptions: false,
    supportedValidation: ['min', 'max']
  },
  time: {
    label: 'Time',
    description: 'Time selection',
    icon: '🕐',
    requiresOptions: false,
    supportedValidation: []
  },
  datetime: {
    label: 'Date & Time',
    description: 'Date and time selection',
    icon: '📅🕐',
    requiresOptions: false,
    supportedValidation: ['min', 'max']
  },
  radio: {
    label: 'Single Choice',
    description: 'Choose one option',
    icon: '🔘',
    requiresOptions: true,
    supportedValidation: []
  },
  checkbox: {
    label: 'Multiple Choice',
    description: 'Choose multiple options',
    icon: '☑️',
    requiresOptions: true,
    supportedValidation: ['min', 'max']
  },
  dropdown: {
    label: 'Dropdown',
    description: 'Select from dropdown',
    icon: '📋',
    requiresOptions: true,
    supportedValidation: []
  },
  scale: {
    label: 'Rating Scale',
    description: 'Numeric rating scale',
    icon: '⭐',
    requiresOptions: false,
    supportedValidation: ['min', 'max']
  },
  matrix: {
    label: 'Matrix/Grid',
    description: 'Grid of questions',
    icon: '📊',
    requiresOptions: true,
    supportedValidation: []
  },
  file: {
    label: 'File Upload',
    description: 'Upload files',
    icon: '📎',
    requiresOptions: false,
    supportedValidation: []
  },
  location: {
    label: 'Location',
    description: 'GPS coordinates',
    icon: '📍',
    requiresOptions: false,
    supportedValidation: []
  }
} as const;

export interface QuestionOption {
  value: string;
  label: string;
  descriptor?: string;   // Prompt shown beneath the option asking respondent to elaborate
  placeholder?: string;  // Custom placeholder text for the descriptor input
}

export interface QuestionValidation {
minLength?: number;
maxLength?: number;
min?: number | string;
max?: number | string;
pattern?: string;
step?: number;
minSelections?: number;
maxSelections?: number;
maxSize?: number;
allowedTypes?: string;
errorMessage?: string;
}

export interface AvailableTagsResponse {
  subThemes: {
    _id: string;
    name: string;
  }[];
  availableTags: {
    indicators: Indicator[];
    sdgs: SDG[];
    resilience: ResilienceDimension[];
    esg: ESGCategory[];
    standards: Standard[];
  } | null;
}

/**
 * Conditional logic configuration
 */
export interface ConditionalLogic {
  enabled: boolean;
  conditions: ConditionalLogicCondition[];
  action: 'show' | 'hide';
  logicOperator?: 'AND' | 'OR'; // How to combine multiple conditions (default: AND)
}

/**
 * A single condition in conditional logic
 */
export interface ConditionalLogicCondition {
  questionId: string; // ID of the question to check
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  value: any; // The value to compare against
}

/**
 * Result of conditional logic validation
 */
export interface ConditionalLogicValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conditionalLogic?: ConditionalLogic;
}

/**
 * Response for question dependencies
 */
export interface QuestionDependenciesResponse {
  question: {
    id: string;
    text: string;
    conditionalLogic?: ConditionalLogic;
  };
  dependencies?: Question[]; // Questions this question depends on
  dependents?: Question[];   // Questions that depend on this question
}

// Scale question configuration (mirrors backend IScaleConfig)
export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  showNAOption?: boolean;
  // Frontend-only: per-point labels stored in `options` on save
  scaleOptions?: { value: number; label: string; description: string }[];
}

// Matrix question configuration (mirrors backend IMatrixConfig)
export interface MatrixConfig {
  rows: { label: string; description?: string }[];
  columns: { value: string; label: string; description?: string }[];
  allowMultiple?: boolean;
}


// NEW: Interface for tag statistics
export interface QuestionTagStatistics {
  totalQuestions: number;
  taggedQuestions: {
    withIndicators: number;
    withSdgs: number;
    withResilience: number;
    withEsg: number;
    withStandards: number;
  };
  percentages: {
    withIndicators: number;
    withSdgs: number;
    withResilience: number;
    withEsg: number;
    withStandards: number;
  };
}

// QuestionLibrary related types
export interface QuestionLibrary {
_id: string;
name: string;
description?: string;
questions: Question[];
creator?: string | User;
status: 'draft' | 'published' | 'archived';
archived?: boolean;
archivedAt?: string;
createdAt: string;
updatedAt?: string;
}

// types/index.ts - ADD BESPOKE QUESTION TYPES

export interface BespokeQuestion extends Question {
  isBespoke: boolean;
  bespokeMetadata: {
    createdBy: string | User;
    project: string | {
      _id: string;
      name: string;
    };
    organization: string | {
      _id: string;
      name: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'elevated';
    approvedBy?: string | User;
    approvedAt?: Date;
    elevatedBy?: string | User;
    elevatedAt?: Date;
    originalQuestionId?: string;
    rejectionReason?: string;
  };
}

export interface Question {
  _id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  scaleConfig?: ScaleConfig;
  matrixConfig?: MatrixConfig;
  validation?: QuestionValidation;
  categories?: Category[];       // was: category?: Category
  theme?: Theme;
  subThemes?: SubTheme[];        // was: subTheme?: SubTheme
  targetAudience: 'internal' | 'external' | 'both';
  status: 'draft' | 'published' | 'archived';
  isTemplate?: boolean;
  tags: string[];
  selectedIndicatorTags?: Indicator[];
  selectedSdgTags?: SDG[];
  selectedResilienceTags?: ResilienceDimension[];
  selectedEsgTags?: ESGCategory[];
  selectedStandardTags?: Standard[];
  isStandardDemographic?: boolean;
  demographicType?: 'age' | 'gender' | 'education' | 'income' | 'location' | 'employment' | 'household_size' | 'marital_status' | 'ethnicity' | 'language' | 'disability' | 'other';
  demographicCategory?: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility';
  isGlobalStandard?: boolean;
  demographicMetadata?: {
    isRequired: boolean;
    recommendedForAudience: ('internal' | 'external' | 'both')[];
    complianceRelevant: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    dataRetentionPeriod?: number;
    anonymizationRequired: boolean;
  };
  conditionalLogic?: ConditionalLogic;
  creator?: string | User;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  usingProjectSites?: boolean;
}

export interface CreateQuestionRequest {
  text: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  scaleConfig?: Omit<ScaleConfig, 'scaleOptions'>;
  matrixConfig?: Omit<MatrixConfig, never>;
  validation?: QuestionValidation;
  categories?: string[];         // was: category: string
  theme: string;
  subThemes?: string[];          // was: subTheme?: string
  targetAudience?: 'internal' | 'external' | 'both';
  status?: 'draft' | 'published';
  isTemplate?: boolean;
  tags?: string[];
  selectedIndicatorTags?: string[];
  selectedSdgTags?: string[];
  selectedResilienceTags?: string[];
  selectedEsgTags?: string[];
  selectedStandardTags?: string[];
  isStandardDemographic?: boolean;
  demographicType?: 'age' | 'gender' | 'education' | 'income' | 'location' | 'employment' | 'household_size' | 'marital_status' | 'ethnicity' | 'language' | 'disability' | 'other';
  demographicCategory?: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility';
  isGlobalStandard?: boolean;
  demographicMetadata?: {
    isRequired?: boolean;
    recommendedForAudience?: ('internal' | 'external' | 'both')[];
    complianceRelevant?: boolean;
    sensitivityLevel?: 'low' | 'medium' | 'high';
    dataRetentionPeriod?: number;
    anonymizationRequired?: boolean;
  };
  conditionalLogic?: ConditionalLogic;
}

export interface CreateBespokeQuestionRequest {
  text: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  categories?: string[];         // was: category?: string
  projectId: string;
  targetAudience?: 'internal' | 'external' | 'both';
}

export interface UpdateBespokeQuestionRequest {
  text?: string;
  description?: string;
  type?: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  categories?: string[];         // was: category?: string
  targetAudience?: 'internal' | 'external' | 'both';
}

export interface BespokeQuestionFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'elevated';
  createdBy?: string;
  includeElevated?: boolean;
}

export interface BespokeQuestionStatistics {
  overview: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    elevated: number;
  };
  byCreator: Array<{
    creatorId: string;
    creatorName: string;
    creatorEmail: string;
    count: number;
  }>;
  recentActivity: Array<{
    _id: string;
    text: string;
    status: string;
    createdBy: {
      name: string;
      email: string;
    };
    updatedAt: Date;
  }>;
}

// API response types
export interface ApiResponse<T> {
success: boolean;
message?: string;
data: T;
}


// Stakeholder mapping related types
export interface StakeholderGroup {
  _id: string;
  project: string | Project;
  projectSite?: ProjectSite;
  category: string | Category;
  name: string;
  description?: string;
  themes: Array<{
    _id: string;
    name: string;
  }>;
  estimatedPopulation?: number; // NEW FIELD
  tasks: Task[];
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  creator: string;
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  taskType: 'connections' | 'power' | 'wellbeing' | 'roles' | 'risks' | 'benefits';
  responses: TaskResponse[];
  rating?: number;
  tags?: string[]; // NEW: Add tags field
  updatedAt: string;
}

export interface TaskResponse {
  optionId: string;
  description: string;
  isKeyInsight?: boolean; // NEW: Add key insights flag
}

export interface TaskOption {
  _id: string;
  category: string;
  taskType: string;
  optionId: string;
  label: string;
  requiresDescription: boolean;
  order: number;
}

export interface TaskPrompt {
  taskType: string;
  promptText: string;
  tooltipText: string;
  ratingPrompt: string;
  ratingMin: number;
  ratingMax: number;
  ratingMinLabel: string;
  ratingMaxLabel: string;
}

export interface CompletionStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercentage: number;
  byCategoryStats: Record<string, CategoryStats>;
}

export interface CategoryStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercentage: number;
}

export interface CreateStakeholderGroupDto {
  projectId: string;
  projectSiteId?: string;
  categoryId: string;
  name: string;
  description?: string;
  estimatedPopulation?: number; // NEW FIELD
}

export interface UpdateTaskDto {
  responses: TaskResponse[];
  rating: number;
  tags?: string[]; // NEW: Add tags field
}

// NEW: Add interface for key insights response
export interface KeyInsight {
  stakeholderGroup: {
    id: string;
    name: string;
    category: string;
  };
  taskType: 'connections' | 'power' | 'wellbeing' | 'roles' | 'risks' | 'benefits';
  rating?: number;
  tags?: string[];
  insights: TaskResponse[];
  updatedAt: string;
}


// NEW: Add interface for key insights API response
export interface KeyInsightsResponse {
  success: boolean;
  count: number;
  data: KeyInsight[];
}



// typ
// Report filter types
export interface ReportFilters {
  categories?: string[];
  connectionStrength?: {
    min?: number;
    max?: number;
  };
  risks?: string[];
  includeArchived?: boolean;
}

// Report generation request
export interface GenerateReportRequest {
  projectId: string;
  projectSiteId?: string;
  title: string;
  description?: string;
  filters?: ReportFilters;
}

// Report results
export interface ReportResults {
  totalStakeholders: number;
  stakeholdersByCategory: Record<string, StakeholderReportItem[]>;
  categorySummary: Record<string, number>;
  averageConnectionStrength: number;
  stakeholdersWithRisks: number;
  connectionTypes?: Record<string, number>;
  riskTypes?: Record<string, number>;
}

// Stakeholder item in report
export interface StakeholderReportItem {
  _id: string;
  name: string;
  category: StakeholderCategory;
  connectionStrength: number;
  connections: StakeholderAttribute[];
  tasks: StakeholderTask[];
  completionStatus: 'not_started' | 'in_progress' | 'completed';
}

// Report status type
export type ReportStatus = 'draft' | 'approved' | 'archived';

// Full report type
export interface StakeholderReport {
  _id: string;
  title: string;
  description?: string;
  project: string;
  projectSite?: {
    _id: string;
    name: string;
  };
  filters: ReportFilters;
  status: ReportStatus;
  results: ReportResults;
  creator: User;
  createdAt: string;
  updatedAt: string;
  approvedBy?: User;
  approvedAt?: string;
  archivedAt?: string;
}

// Report list item (for listings with less detail)
export interface StakeholderReportListItem {
  _id: string;
  title: string;
  description?: string;
  project: string;
  projectSite?: {
    _id: string;
    name: string;
  };
  status: ReportStatus;
  creator: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}


// Documents interface
export interface Document {
  _id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  description?: string;
  uploadedBy: User
  project: string;
  site?: string | null;
  createdAt: string;
  updatedAt: string;
}


// Project and ProjectSite tasks interface

export interface Task {
  _id: string;
  fieldName: string;
  dataType: string;
  description?: string;
  userFacingCopy?: string;
  options?: string[];
  fieldLabel: string;
  helperText: string;
  hoverText: string;
  isRequired: boolean;
  sortOrder: number;
  step: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  responseData?: any;
}

export interface ProjectSetup {
  _id: string;
  project: string;
  tasks: Task[];
  progress: number;
  isComplete: boolean;
  completedAt?: Date;
  lastUpdatedBy?: string;
}

export interface ProjectSiteSetup {
  _id: string;
  projectSite: string;
  project: string;
  tasks: Task[];
  progress: number;
  isComplete: boolean;
  completedAt?: Date;
  lastUpdatedBy?: string;
}

export interface SetupResponse {
  isInitialized: boolean;
  progress: number;
  isComplete: boolean;
  completedAt?: Date;
  tasks: Task[];
  _id: string;
}

// types/help.ts
export interface HelpTopicMetadata {
  id: string;
  title: string;
  description: string;
  section: string;
  lastUpdated: string;
  relatedTopics?: string[];
}


// New consultation plan interfaces
export interface StakeholderGroupSelection {
  stakeholderGroup: string;
  isSelected: boolean;
  notes?: string;
}

export interface ConsultationQuestions {
  howManyPeople?: string;
  whoInvitedHow?: string;
  whereHow?: string;
  underRepresentedGroups?: string;
  costsPlanning?: string;
  permissions?: string;
}

export interface PlannedConsultationDates {
  startDate?: string;
  endDate?: string;
  dateDescription?: string;
}

export interface ConsultationPlanFormData {
  projectId: string;
  projectSiteId: string;
  stakeholderGroups?: StakeholderGroupSelection[];
  consultationQuestions?: ConsultationQuestions;
  plannedConsultationDates?: PlannedConsultationDates;
}

export interface ConsultationPlan {
  _id: string;
  project: string;
  projectSite: string;
  stakeholderGroups: StakeholderGroupSelection[];
  consultationQuestions: ConsultationQuestions;
  plannedConsultationDates: PlannedConsultationDates;
  status: 'draft' | 'completed';
  isCompleted: boolean;
  completedAt?: string;
  completionPercentage: number;
  selectedStakeholderCount: number;
  creator: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Stage status interfaces
export interface StageAccessibility {
  canInitialize: boolean;
  exists: boolean;
  status: string | null;
  progress: number;
}

export interface ConsultationPlanStatus {
  exists: boolean;
  isCompleted: boolean;
  completionPercentage: number;
  canProceedToStage1: boolean;
}

export interface StageStatusResponse {
  project: {
    _id: string;
    name: string;
    location: string;
  };
  projectSite?: {
    _id: string;
    name: string;
  };
  consultationPlan: ConsultationPlanStatus;
  stageAccessibility: {
    stage1: StageAccessibility;
    stage2: StageAccessibility;
  };
  stages: any[];
  overallProgress: {
    consultationPlanCompleted: boolean;
    stage1Completed: boolean;
    stage2Completed: boolean;
    canProceedToStage1: boolean;
    canProceedToStage2: boolean;
  };
}


// Dashboard Overview Types
export interface DashboardOverview {
  summary: {
    totalOrganizations: number;
    totalProjects: number;
    totalSites: number;
    totalUsers: number;
    pendingReviews: number;
    overdueItems: number;
    highRiskItems: number;
  };
  projectsByStage: {
    onboarding: number;
    design: number;
    measure: number;
    learn: number;
    tell: number;
  };
  projectsByStatus: Record<string, number>;
  setupProgress: {
    projectsWithSetup: number;
    sitesWithSetup: number;
    projectsWithToC: number;
  };
  reviewBreakdown: {
    pending: number;
    inReview: number;
    overdue: number;
    byPriority: Record<string, number>;
    byEntityType: Record<string, number>;
  };
  riskBreakdown: {
    total: number;
    high: number;
    medium: number;
    low: number;
    reviewOverdue: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    organization: string;
    date: string;
    status: string;
  }>;
}

export interface OrganizationSummary {
  _id: string;
  name: string;
  country: string;
  city: string;
  projectCount: number;
  siteCount: number;
  stage: string;
  progress: number;
  lastActivity: string;
  status: string;
}

// types/review.ts - Enhanced interface definitions

export interface ReviewItem {
  _id: string;
  entityType: 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'consultation_plan' | 'theory_of_change_stage' | 'survey' | 'report';
  entityId: string;
  title: string;
  description: string;
  organization: Organization;
  project: Project;
  site?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  completedTasks: number;
  totalTasks: number;
  assignedTo?: User;
  dueDate?: string;
  isOverdue: boolean;
  lastUpdated: string;
  commentCount: number;
}

export interface DetailedReview extends ReviewItem {
  project: Project;
  projectSite?: {
    _id: string;
    name: string;
    status: string;
  };
  organization: Organization;
  assignedTo?: User;
  reviewer?: {
    _id: string;
    name: string;
    email: string;
  };
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  comments: ReviewComment[];
  attachments: ReviewAttachment[];
  metadata: ReviewMetadata;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAttachment {
  filename: string;
  url: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
  uploadedAt: string;
}

export interface ReviewMetadata {
  taskReviews?: Record<string, TaskReview>;
  finalReview?: FinalReview;
  checklist?: Record<string, ChecklistItem>;
  [key: string]: any;
}

export interface TaskReview {
  isApproved: boolean;
  comment: string;
  requiresChanges: boolean;
  reviewedBy: string;
  reviewedAt: string;
}

export interface FinalReview {
  finalComment: string;
  overallScore: number;
  finalizedBy: string;
  finalizedAt: string;
}

export interface ChecklistItem {
  isCompleted: boolean;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface ReviewableTask {
  _id: string;
  name: string;
  description?: string;
  type: 'setup_task' | 'stakeholder_group' | 'toc_stage' | 'consultation_task';
  isRequired?: boolean;
  isCompleted?: boolean;
  status?: string;
  progress?: number;
  responseData?: any;
  category?: string;
  // Review-specific fields
  isApproved?: boolean;
  reviewComment?: string;
  requiresChanges?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface StakeholderGroupForReview {
  _id: string;
  name: string;
  description?: string;
  category: {
    _id: string;
    name: string;
  };
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  tasks: any[];
  progress: number;
  creator: {
    _id: string;
    name: string;
  };
  lastUpdatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TheoryOfChangeStageForReview {
  _id: string;
  stageNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  actionCount?: number;
  impactCount?: number;
  creator: {
    _id: string;
    name: string;
  };
  lastUpdatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewChecklistTemplate {
  id: string;
  name: string;
  description: string;
  isRequired?: boolean;
  category?: string;
}

export interface ReviewUpdateRequest {
  status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  completedTasks?: number;
  notes?: string;
  assignedTo?: string;
}

export interface TaskReviewUpdateRequest {
  isApproved: boolean;
  comment?: string;
  requiresChanges?: boolean;
}

export interface FinalReviewRequest {
  status: 'approved' | 'rejected';
  finalComment?: string;
  overallScore?: number;
}


// Risk Management Functions
// types/index.ts - Add these risk-related types

// types/risk.types.ts - Risk-related type definitions

// Updated RiskItem type with comments system
// Updated RiskItem type with reviewFrequency

export interface RiskComment {
  _id?: string;
  text: string;
  author: {
    _id: string;
    name: string;
    email?: string;
  };
  isKeyInsight: boolean;
  starredBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  starredAt?: string;
  createdAt: string;
}

export interface RiskItem {
  _id: string;
  
  // Context references
  project: {
    _id: string;
    name: string;
    status?: string;
  };
  projectSite?: {
    _id: string;
    name: string;
    status?: string;
  };
  organization: {
    _id: string;
    name: string;
    country?: string;
    city?: string;
  };
  
  // Risk identification
  name: string;
  riskType: 'operational' | 'financial' | 'strategic' | 'compliance' | 'environmental' | 'social' | 'technical' | 'reputational' | 'political' | 'market' | 'legal';
  riskDescription: string;
  
  // Risk source tracking
  riskSource: 'manual' | 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'toc_stage1' | 'toc_stage2';
  sourceReference?: string;
  riskSourceLabel?: string; // Computed field from backend
  
  // Risk assessment
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  consequences: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: 'low' | 'medium' | 'high';
  
  // Risk ownership and management
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  mitigationStrategy: string;
  
  // Additional risk details
  category: 'inherent' | 'residual' | 'current';
  impactArea: Array<'timeline' | 'budget' | 'scope' | 'quality' | 'stakeholders' | 'compliance' | 'reputation'>;
  
  // Timeline and tracking
  identifiedDate: string;
  reviewDate: string;
  reviewFrequency: 'quarterly' | 'half_yearly' | 'yearly'; // ✅ NEW: Review frequency
  status: 'open' | 'monitoring' | 'closed' | 'transferred';
  
  // Mitigation actions
  mitigationActions: Array<{
    _id?: string;
    action: string;
    responsible?: {
      _id: string;
      name: string;
      email?: string;
    };
    dueDate?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
    completedAt?: string;
    notes?: string;
  }>;
  
  // Risk monitoring
  riskHistory: Array<{
    date: string;
    probability: string;
    consequences: string;
    riskScore: string;
    notes?: string;
    updatedBy?: {
      _id: string;
      name: string;
    };
  }>;
  
  // Documentation
  attachments: Array<{
    filename: string;
    url: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
    uploadedAt: string;
  }>;
  
  // Comments system
  comments: RiskComment[];
  
  // User tracking
  creator: {
    _id: string;
    name: string;
    email?: string;
  };
  lastUpdatedBy?: {
    _id: string;
    name: string;
  };
  
  // Standard fields
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Calculated fields
  isReviewOverdue?: boolean;
  daysUntilReview?: number;
  mitigationProgress?: number;
}

export interface RiskStats {
  total: number;
  byScore: {
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    monitoring: number;
    closed: number;
    transferred: number;
  };
  byType: Record<string, number>;
  bySource: Record<string, number>;
  reviewOverdue: number;
  dueForReviewSoon: number;
}

export interface RiskRegisterSummary {
  stats: RiskStats;
  risks: RiskItem[];
}

export interface RiskFilters {
  projectId?: string;
  projectSiteId?: string;
  organizationId?: string;
  riskScore?: string;
  riskSource?: string;
  status?: string;
  owner?: string;
  reviewDateFrom?: string;
  reviewDateTo?: string;
}

export interface CreateRiskData {
  projectId: string;
  projectSiteId?: string;
  organizationId: string;
  name: string;
  riskType: string;
  riskDescription: string;
  riskSource?: string;
  sourceReference?: string;
  probability: string;
  consequences: string;
  owner: string;
  mitigationStrategy: string;
  category?: string;
  impactArea?: string[];
  reviewDate: string;
  reviewFrequency?: 'quarterly' | 'half_yearly' | 'yearly'; // ✅ NEW: Review frequency
  comment?: string;
}

export interface UpdateRiskData {
  name?: string;
  riskType?: string;
  riskDescription?: string;
  riskSource?: string;
  sourceReference?: string;
  probability?: string;
  consequences?: string;
  owner?: string;
  mitigationStrategy?: string;
  category?: string;
  impactArea?: string[];
  reviewDate?: string;
  reviewFrequency?: 'quarterly' | 'half_yearly' | 'yearly'; // ✅ NEW: Review frequency
  status?: string;
}

// Risk change tracking interfaces (for future implementation)
export interface RiskChangeLog {
  _id: string;
  riskId: string;
  changeType: 'status' | 'assessment' | 'mitigation' | 'review' | 'ownership';
  changedBy: {
    _id: string;
    name: string;
  };
  changedAt: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description?: string;
}

export interface RiskTrendData {
  date: string;
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  openRisks: number;
  closedRisks: number;
}

export interface RiskAnalytics {
  riskTrends: RiskTrendData[];
  statusChanges: {
    date: string;
    fromStatus: string;
    toStatus: string;
    count: number;
  }[];
  mitigationEffectiveness: {
    riskId: string;
    riskName: string;
    initialScore: string;
    currentScore: string;
    daysTracked: number;
    actionsCompleted: number;
    totalActions: number;
  }[];
  overdueRisks: {
    count: number;
    byOwner: Record<string, number>;
    averageDaysOverdue: number;
  };
}


export interface TourStep {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaSrc: string;
  duration?: number; // for videos, in seconds
}

export interface TourConfig {
  tourId: string;
  tourTitle: string;
  tourDescription?: string;
  steps: TourStep[];
  autoShowForNewUsers?: boolean;
  showTourButton?: boolean;
  buttonText?: string;
}

export interface TourProgress {
  seen: boolean;
  timestamp: string;
  completedSteps?: string[];
  lastStepViewed?: number;
}



// 3. ADD: Constants for UI components (add these after your existing constants)

export const DEMOGRAPHIC_TYPES = {
  age: 'Age',
  gender: 'Gender Identity',
  education: 'Education Level',
  income: 'Income Level',
  location: 'Location',
  employment: 'Employment Status',
  household_size: 'Household Size',
  marital_status: 'Marital Status',
  ethnicity: 'Ethnicity',
  language: 'Language',
  disability: 'Disability Status',
  other: 'Other'
} as const;

export const DEMOGRAPHIC_CATEGORIES = {
  basic: 'Basic Demographics',
  socioeconomic: 'Socioeconomic Status',
  cultural: 'Cultural Background',
  accessibility: 'Accessibility Needs'
} as const;

export const SENSITIVITY_LEVELS = {
  low: {
    label: 'Low Sensitivity',
    description: 'General information with minimal privacy concerns',
    color: 'green'
  },
  medium: {
    label: 'Medium Sensitivity',
    description: 'Personal information requiring standard privacy protection',
    color: 'yellow'
  },
  high: {
    label: 'High Sensitivity',
    description: 'Highly sensitive information requiring enhanced protection',
    color: 'red'
  }
} as const;

export const TARGET_AUDIENCES = {
  internal: 'Internal Stakeholders',
  external: 'External Communities',
  both: 'Both Internal & External'
} as const;

// NEW: Types for Demographics
export interface DemographicQuestion extends Question {
  isStandardDemographic: boolean;
  demographicType?: 'age' | 'gender' | 'education' | 'income' | 'location' | 'employment' | 'household_size' | 'marital_status' | 'ethnicity' | 'language' | 'disability' | 'other';
  demographicCategory?: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility';
  isGlobalStandard: boolean;
  demographicMetadata?: {
    isRequired: boolean;
    recommendedForAudience: ('internal' | 'external' | 'both')[];
    complianceRelevant: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    dataRetentionPeriod?: number;
    anonymizationRequired: boolean;
  };
}

export interface DemographicFilters {
  demographicType?: keyof typeof DEMOGRAPHIC_TYPES;
  category?: keyof typeof DEMOGRAPHIC_CATEGORIES;
  audience?: keyof typeof TARGET_AUDIENCES;
  globalOnly?: boolean;
  complianceRelevant?: boolean;
  sensitivityLevel?: keyof typeof SENSITIVITY_LEVELS;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ToggleDemographicRequest {
  isStandardDemographic: boolean;
  demographicType?: keyof typeof DEMOGRAPHIC_TYPES;
  demographicCategory?: keyof typeof DEMOGRAPHIC_CATEGORIES;
  isGlobalStandard?: boolean;
  demographicMetadata?: {
    isRequired?: boolean;
    recommendedForAudience?: (keyof typeof TARGET_AUDIENCES)[];
    complianceRelevant?: boolean;
    sensitivityLevel?: keyof typeof SENSITIVITY_LEVELS;
    dataRetentionPeriod?: number;
    anonymizationRequired?: boolean;
  };
}

export interface BulkToggleDemographicRequest extends ToggleDemographicRequest {
  questionIds: string[];
}

export interface ComplianceReport {
  totalDemographics: number;
  byCategory: Record<keyof typeof DEMOGRAPHIC_CATEGORIES, number>;
  bySensitivity: Record<keyof typeof SENSITIVITY_LEVELS, number>;
  complianceRelevant: number;
  requiresAnonymization: number;
  withRetentionPeriods: number;
  globalStandards: number;
  byAudience: Record<keyof typeof TARGET_AUDIENCES, number>;
}





// 4. ADD: Helper types for forms and API responses (add these after your existing interfaces)

export interface DemographicAPIResponse<T = DemographicQuestion[]> {
  success: boolean;
  count?: number;
  total?: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: T;
  message?: string;
}

export interface GroupedDemographics {
  all: DemographicQuestion[];
  byCategory: Record<string, DemographicQuestion[]>;
}

export interface DemographicFormData {
  questionId?: string;
  isStandardDemographic: boolean;
  demographicType: string;
  demographicCategory: string;
  isGlobalStandard: boolean;
  demographicMetadata: {
    isRequired: boolean;
    recommendedForAudience: ('internal' | 'external' | 'both')[];
    complianceRelevant: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    dataRetentionPeriod?: number;
    anonymizationRequired: boolean;
  };
}

export interface DemographicFormErrors {
  demographicType?: string;
  demographicCategory?: string;
  dataRetentionPeriod?: string;
  general?: string;
}

// 5. ADD: Type guards and utility functions (add these at the end of your file)

// Type guards for demographic questions
export const isDemographicQuestion = (question: Question): question is DemographicQuestion => {
  return question.isStandardDemographic === true;
};

export const isGlobalDemographic = (question: Question): boolean => {
  return question.isStandardDemographic === true && question.isGlobalStandard === true;
};

export const isComplianceRelevant = (question: Question): boolean => {
  return question.isStandardDemographic === true && 
         question.demographicMetadata?.complianceRelevant === true;
};

export const getQuestionSensitivityLevel = (question: Question): 'low' | 'medium' | 'high' => {
  return question.demographicMetadata?.sensitivityLevel || 'medium';
};

export const demographicValidationRules = {
  isStandardDemographic: {
    type: 'boolean',
    default: false
  },
  demographicType: {
    type: 'string',
    enum: Object.keys(DEMOGRAPHIC_TYPES),
    required: (data: any) => data.isStandardDemographic,
    message: 'Demographic type is required when marking as standard demographic'
  },
  demographicCategory: {
    type: 'string',
    enum: Object.keys(DEMOGRAPHIC_CATEGORIES),
    required: (data: any) => data.isStandardDemographic,
    message: 'Demographic category is required when marking as standard demographic'
  },
  isGlobalStandard: {
    type: 'boolean',
    default: false
  },
  demographicMetadata: {
    type: 'object',
    properties: {
      isRequired: { type: 'boolean', default: false },
      recommendedForAudience: { 
        type: 'array', 
        items: { enum: Object.keys(TARGET_AUDIENCES) },
        default: ['both']
      },
      complianceRelevant: { type: 'boolean', default: false },
      sensitivityLevel: { 
        type: 'string', 
        enum: Object.keys(SENSITIVITY_LEVELS),
        default: 'medium'
      },
      dataRetentionPeriod: { 
        type: 'number', 
        min: 1, 
        max: 120,
        optional: true,
        message: 'Data retention period must be between 1 and 120 months'
      },
      anonymizationRequired: { type: 'boolean', default: false }
    }
  }
} as const;



// Types for better type safety
// types/index.ts  — relevant excerpt
// Replace your existing CreateActionData with this:

type ActionStatus   = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
type ActionPriority = 'low' | 'medium' | 'high' | 'critical';
type RepeatCycle    = 'monthly' | 'quarterly' | 'yearly' | 'no_repeat';

export interface CreateActionData {
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  stakeholderGroupId: string;
  themeIds: string[];       // array — UI sends [selectedThemeId]
  subThemeIds: string[];    // array — one or more selected
  action: string;
  responsibility?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
  };
  timeframe?: {
    startDate?: string;     // ISO string
    endDate?: string;       // ISO string
  };
  repeatCycle?: RepeatCycle;  // defaults to 'no_repeat' in model
  status?: ActionStatus;      // defaults to 'not_started' in model
  priority?: ActionPriority;  // defaults to 'medium' in model
  notes?: string;
}

export interface CreateImpactData {
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  stakeholderGroupId: string;
  themeIds: string[];      // CHANGED: Now array of theme IDs
  subThemeIds: string[];   // CHANGED: Now array of subtheme IDs
  outcome: string;
  notes?: string;
}

export interface Risk {
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface UpdateRisksData {
  risks: Risk[];
}

// types/consentForm.ts
export interface ConsentForm {
  _id: string;
  name: string;
  description: string;
  agreementLabel: string;
  version: string;
  versionHistory?: Array<{
    version: string;
    description: string;
    updatedBy: string;
    updatedAt: string;
  }>;
  organization?: {
    _id: string;
    name: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  isTemplate: boolean;
  templateCategory?: 'community_engagement' | 'data_collection' | 'environmental_study' | 'carbon_project' | 'gdpr_compliance' | 'custom';
  defaultLanguage: string;
  translations: Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel: string;
  }>;
  usageCount?: number;
  lastUsedAt?: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
}

export interface CreateConsentFormRequest {
  name: string;
  description: string;
  agreementLabel?: string;
  version?: string;
  organizationId?: string;
  projectId?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  defaultLanguage?: string;
  translations?: Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel: string;
  }>;
}

export interface UpdateConsentFormRequest {
  name?: string;
  description?: string;
  agreementLabel?: string;
  isActive?: boolean;
  defaultLanguage?: string;
  translations?: Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel: string;
  }>;
}

export interface ConsentFormFilters {
  organization?: string;
  project?: string;
  isTemplate?: boolean;
  isActive?: boolean;
  templateCategory?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CloneConsentFormRequest {
  name?: string;
  projectId?: string;
  organizationId?: string;
}

export interface AvailableConsentFormsResponse {
  all: ConsentForm[];
  grouped: {
    projectSpecific: ConsentForm[];
    organizationWide: ConsentForm[];
    globalTemplates: ConsentForm[];
  };
}

export interface ConsentFormUsageResponse {
  consentForm: {
    id: string;
    name: string;
    version: string;
    usageCount: number;
    lastUsedAt?: string;
  };
  surveys: {
    count: number;
    list: Array<{
      _id: string;
      title: string;
      status: string;
      totalQuestions: number;
    }>;
  };
  responses: {
    totalResponses: number;
    consentGiven: number;
    consentDeclined: number;
  };
}



// types/survey.ts - Add these to your @/types file

// Updated Survey interface with better type handling
// Update in your types file - ADD THESE TWO FIELDS
export interface Survey {
  _id: string;
  title: string;
  description?: string;
  project: PopulatedField<{
    _id: string;
    name: string;
  }>;
  projectSite?: PopulatedField<{
    _id: string;
    name: string;
  }>;
  theoryOfChangeStage?: PopulatedField<{
    _id: string;
    stageNumber: number;
    name: string;
  }>;
  stakeholderGroup?: PopulatedField<{
    _id: string;
    name: string;
    category: string;
  }>;
  
  // ============ ADD THESE TWO FIELDS ============
  consentForm?: PopulatedField<ConsentForm> | string; // Can be populated or just ID
  consentRequired?: boolean;
  // ==============================================
  
  category: 'baseline' | 'monitoring' | 'evaluation' | 'impact_assessment' | 'feedback' | 'custom';
  customCategoryName?: string;
  sequenceNumber: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  settings: SurveySettings;
  isTemplate: boolean;
  templateCategory?: 'organizational' | 'community' | 'environmental' | 'social' | 'economic';
  estimatedDuration: number;
  totalQuestions: number;
  creator: PopulatedField<{
    _id: string;
    name: string;
    email: string;
  }>;
  lastUpdatedBy?: PopulatedField<{
    _id: string;
    name: string;
  }>;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Update Survey settings to handle Date types properly
export interface SurveySettings {
  isPublic: boolean;
  requiresAuth: boolean;
  allowAnonymous: boolean;
  startDate?: Date | string; // Can be either Date object or ISO string
  endDate?: Date | string; // Can be either Date object or ISO string
  allowMultipleResponses: boolean;
  maxResponses?: number;
  showProgressBar: boolean;
  allowSaveAndContinue: boolean;
  randomizeQuestions: boolean;
  sendConfirmationEmail: boolean;
  notifyOnResponse: boolean;
}

// Survey Section Types
export interface SurveySection {
  _id: string;
  survey: string;
  title: string;
  description?: string;
  order: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Survey Question Types
export interface SurveyQuestion {
  _id: string;
  question: string | Question;
  survey: string;
  section?: string;
  order: number;
  required: boolean;
  customText?: string;
  customDescription?: string;
  customOptions?: any[];
  // NEW: Conditional logic (inherited from Question or customized)
  conditionalLogic?: ConditionalLogic;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Survey Response Types
export interface SurveyResponse {
  _id: string;
  survey: string | Survey;
  respondent?: string | {
    _id: string;
    name: string;
    email: string;
  };
  respondentInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    metadata?: Record<string, any>;
  };
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  responses: QuestionResponse[];
  completionPercentage: number;
  timeSpent: number; // in seconds
  startedAt: Date;
  completedAt?: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionResponse {
  _id: string;
  surveyResponse: string;
  question: string;
  surveyQuestion: string;
  answer: any;
  descriptorAnswers?: Record<string, string>;  // ← add
  timeSpent?: number;
  skipped: boolean;
  metadata?: Record<string, any>;
  translationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Survey Builder Types
export interface FilteredQuestionsRequest {
  stakeholderGroupId: string;
  stageId: string;
  projectId?: string;
  projectSiteId?: string;
  includeFrequentlyAsked?: boolean;
  themeIds?: string[];
  subThemeIds?: string[];
  questionType?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface FilteredQuestionsResponse {
  filteredQuestions: any[];
  availableThemes: any[];
  availableSubThemes: any[];
  stageInfo: {
    _id: string;
    stageNumber: number;
    stageType: string;
    name: string;
  };
  stakeholderInfo: {
    _id: string;
    name: string;
    category: string;
    themes: any[];
  };
  totalCount: number;
}

export interface SurveyCreationContext {
  stakeholderGroup: any;
  stage: {
    _id: string;
    stageNumber: number;
    stageType: string;
    name: string;
  };
  availableThemesWithSubThemes: Array<{
    theme: any;
    subThemes: any[];
  }>;
  questionCategories: Array<{
    key: string;
    label: string;
  }>;
}

// Request/Response Types
export interface CreateSurveyRequest {
  title: string;
  description?: string;
  projectId: string;
  projectSite?: string;
  settings?: Partial<SurveySettings>;
  isTemplate?: boolean;
  templateCategory?: string;
  // Survey Builder specific fields
  theoryOfChangeStage?: string;
  stakeholderGroup?: string;
  category?: string;
  customCategoryName?: string;
  estimatedDuration?: number;
}

// Helper type for handling both populated and unpopulated references
export type PopulatedField<T> = string | T;

export interface UpdateSurveyRequest extends Partial<CreateSurveyRequest> {
  status?: 'draft' | 'published' | 'closed';
}

export interface CreateSurveySectionRequest {
  title: string;
  description?: string;
  order?: number;
}

export interface AddQuestionToSurveyRequest {
  questionId: string;
  sectionId?: string;
  required?: boolean;
  customText?: string;
  customDescription?: string;
  customOptions?: any[];
  conditionalLogic?: ConditionalLogic;
  order?: number;
}

export interface ReorderItemsRequest {
  items: Array<{
    id: string;
    order: number;
  }>;
}

export interface StartSurveyResponseRequest {
  respondentInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    metadata?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  // ADD THESE FIELDS:
  translationId?: string;
  language?: string;
  consentGiven?: boolean;      // ADD THIS
  consentFormId?: string;
}

export interface SubmitQuestionResponseRequest {
  questionId: string;
  surveyQuestionId: string;
  answer: any;
  descriptorAnswers?: Record<string, string>;  // ← add
  timeSpent?: number;
  metadata?: Record<string, any>;
  translationId?: string;
}

// types/surveyStatistics.ts - CORRECTED TO MATCH BACKEND

/**
 * Survey Statistics Interface - Matches Backend Response
 * Based on surveyResponse_controller.ts getStatistics() method
 */
export interface SurveyStatistics {
  // Total count of all responses
  totalResponses: number;
  
  // Response counts grouped by status
  responsesByStatus: {
    started?: number;
    in_progress?: number;
    completed?: number;
    abandoned?: number;
  };
  
  // Completion rate as a percentage (0-100)
  completionRate: number;
  
  // Time statistics for completed responses (null if no completed responses)
  timeStatistics: {
    averageTimeSeconds: number;
    minTimeSeconds: number;
    maxTimeSeconds: number;
  } | null;
  
  // Response counts by day
  responsesPerDay: Array<{
    date: string; // Format: "YYYY-MM-DD"
    count: number;
  }>;

  // ADD THIS
  consentStatistics?: {
    consentGivenCount: number;
    consentGivenPercentage: number;
    consentDeclinedCount: number;
    consentDeclinedPercentage: number;
    consentPendingCount: number;
    consentPendingPercentage: number;
  };
}

/**
 * Get valid operators for a question type
 */
export const getValidOperatorsForQuestionType = (
  questionType: QuestionType
): ConditionalLogicCondition['operator'][] => {
  const operatorMap: Record<QuestionType, ConditionalLogicCondition['operator'][]> = {
    text: ['equals', 'notEquals', 'contains', 'notContains'],
    textarea: ['equals', 'notEquals', 'contains', 'notContains'],
    number: ['equals', 'notEquals', 'greaterThan', 'lessThan'],
    date: ['equals', 'notEquals', 'greaterThan', 'lessThan'],
    time: ['equals', 'notEquals', 'greaterThan', 'lessThan'],
    datetime: ['equals', 'notEquals', 'greaterThan', 'lessThan'],
    radio: ['equals', 'notEquals'],
    checkbox: ['contains', 'notContains'],
    dropdown: ['equals', 'notEquals'],
    scale: ['equals', 'notEquals', 'greaterThan', 'lessThan'],
    matrix: ['equals', 'notEquals'],
    file: ['equals', 'notEquals'],
    location: ['equals', 'notEquals']
  };
  
  return operatorMap[questionType] || ['equals', 'notEquals'];
};

/**
 * Human-readable operator labels
 */
export const operatorLabels: Record<ConditionalLogicCondition['operator'], string> = {
  equals: 'is equal to',
  notEquals: 'is not equal to',
  contains: 'contains',
  notContains: 'does not contain',
  greaterThan: 'is greater than',
  lessThan: 'is less than'
};

/**
 * Validate if an operator is compatible with a question type
 */
export const isOperatorCompatible = (
  operator: ConditionalLogicCondition['operator'],
  questionType: QuestionType
): boolean => {
  const validOperators = getValidOperatorsForQuestionType(questionType);
  return validOperators.includes(operator);
};

// ==========================================
// CONDITIONAL LOGIC UI HELPERS
// ==========================================

/**
 * Get the display text for a condition
 */
export const getConditionDisplayText = (
  condition: ConditionalLogicCondition,
  referencedQuestion?: Question
): string => {
  // questionId may arrive as a populated object if normalisation was missed upstream
  const resolvedId = typeof condition.questionId === 'object' && condition.questionId !== null
    ? (condition.questionId as any)._id ?? ''
    : condition.questionId;

  const questionText = referencedQuestion?.text
    ?? (typeof condition.questionId === 'object' && condition.questionId !== null
        ? (condition.questionId as any).text
        : undefined)
    ?? `Question ${resolvedId}`;

  const operatorText = operatorLabels[condition.operator];
  const valueText = typeof condition.value === 'object'
    ? JSON.stringify(condition.value)
    : String(condition.value);

  return `"${questionText}" ${operatorText} "${valueText}"`;
};

/**
 * Check if a question has conditional logic configured
 */
export const hasConditionalLogic = (question: Question | SurveyQuestion): boolean => {
  return Boolean(question.conditionalLogic?.enabled && question.conditionalLogic.conditions.length > 0);
};

/**
 * Get a summary of conditional logic dependencies
 */
export const getConditionalLogicSummary = (
  conditionalLogic?: ConditionalLogic
): string => {
  if (!conditionalLogic?.enabled || !conditionalLogic.conditions.length) {
    return 'No conditional logic';
  }
  
  const action = conditionalLogic.action === 'show' ? 'Show' : 'Hide';
  const conditionCount = conditionalLogic.conditions.length;
  const logic = conditionalLogic.logicOperator || 'AND';
  
  if (conditionCount === 1) {
    return `${action} when condition is met`;
  }
  
  return `${action} when ${logic === 'AND' ? 'all' : 'any'} of ${conditionCount} conditions are met`;
};


/**
 * Helper function to get individual status counts
 */
export function getStatusCount(stats: SurveyStatistics, status: 'started' | 'in_progress' | 'completed' | 'abandoned'): number {
  return stats.responsesByStatus?.[status] || 0;
}

/**
 * Helper function to get completion rate as a formatted string
 */
export function getFormattedCompletionRate(stats: SurveyStatistics): string {
  return `${Math.round(stats.completionRate)}%`;
}

/**
 * Helper function to format time in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}



export interface CategorizedSurveyRequest extends CreateSurveyRequest {
  stakeholderGroupId: string;
  stageId: string;
  category: string;
  customCategoryName?: string;
}

export interface SurveysByStakeholderResponse {
  surveys: Survey[];
  surveysByCategory: Record<string, any[]>;
  categories: string[];
}

export interface SurveysByProjectResponse {
  surveys: Survey[];
  surveysByStakeholder: Array<{
    stakeholderGroup: any;
    surveys: any[];
  }>;
}

export interface UpdateSurveyCategoryRequest {
  category: string;
  customCategoryName?: string;
}

export interface CloneSurveyRequest {
  newTitle?: string;
  category?: string;
  customCategoryName?: string;
}

export interface SurveyStatsResponse {
  stakeholderGroup: {
    _id: string;
    name: string;
    project: any;
  };
  stats: {
    totalSurveys: number;
    draftSurveys: number;
    publishedSurveys: number;
    closedSurveys: number;
    surveysByCategory: Array<{
      category: string;
      count: number;
      customNames: string[];
    }>;
  };
}


// Survey Translation Types
export interface SurveyTranslation {
  _id: string;
  survey: string | Survey;
  language: string; // ISO 639-1 code (e.g., "en", "sw", "fr")
  languageName: string; // Display name (e.g., "English", "Swahili")
  title: string;
  description?: string;
  translatedSections: TranslatedSection[];
  translatedQuestions: TranslatedQuestion[];
  translator?: string | {
    _id: string;
    name: string;
    email: string;
  };
  translationMethod: 'human' | 'machine' | 'hybrid';
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  completionPercentage: number;
  reviewer?: string | {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: Date;
  publishedAt?: Date;
  notes?: string;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslatedSection {
  section: string | SurveySection;
  title: string;
  description?: string;
}

export interface TranslatedQuestion {
  surveyQuestion: string | SurveyQuestion;
  translatedText: string;
  translatedDescription?: string;
  translatedOptions?: Array<{
    value: string;
    label: string;
  }>;
}

// Translation Request/Response Types
export interface CreateTranslationRequest {
  language: string;
  languageName: string;
  title: string;
  description?: string;
  translationMethod?: 'human' | 'machine' | 'hybrid';
  notes?: string;
}

export interface UpdateTranslationRequest {
  title?: string;
  description?: string;
  languageName?: string;
  translationMethod?: 'human' | 'machine' | 'hybrid';
  notes?: string;
}

export interface TranslateSectionRequest {
  title: string;
  description?: string;
}

export interface TranslateQuestionRequest {
  translatedText: string;
  translatedDescription?: string;
  translatedOptions?: Array<{
    value: string;
    label: string;
  }>;
}

export interface BulkTranslateQuestionsRequest {
  questions: Array<{
    surveyQuestion: string;
    translatedText: string;
    translatedDescription?: string;
    translatedOptions?: Array<{
      value: string;
      label: string;
    }>;
  }>;
}

export interface TranslationStatistics {
  overview: {
    total: number;
    draft: number;
    pendingReview: number;
    approved: number;
    published: number;
  };
  byLanguage: Array<{
    _id: string;
    languageName: string;
    status: string;
    completionPercentage: number;
  }>;
  completion: {
    avgCompletion: number;
    minCompletion: number;
    maxCompletion: number;
  };
}

export interface PublishedTranslationsResponse {
  defaultLanguage: string;
  availableLanguages: string[];
  translations: Array<{
    _id: string;
    language: string;
    languageName: string;
    title: string;
    description?: string;
  }>;
}

// Helper functions for type checking and extraction
export const getSurveyPropertyName = (field: PopulatedField<{ name: string }> | undefined): string => {
  if (!field) return 'Unknown';
  if (typeof field === 'string') return 'Unknown'; // Just ID, not populated
  return field.name || 'Unknown';
};

export const getSurveyPropertyId = (field: PopulatedField<{ _id: string }> | undefined): string | undefined => {
  if (!field) return undefined;
  if (typeof field === 'string') return field; // Just ID
  return field._id;
};

export const formatSurveyDate = (date: Date | string | undefined): string => {
  if (!date) return 'Not specified';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Use your existing PaginatedApiResponse instead of creating new ones
// These type aliases use your existing interfaces:
export type SurveyListResponse = PaginatedApiResponse<Survey>;
export type SurveyDetailResponse = ApiResponse<Survey>;
export type SurveyStatisticsResponse = ApiResponse<SurveyStatistics>;

// Template-specific types
export interface SurveyTemplate extends Omit<Survey, 'project' | 'projectSite'> {
  isTemplate: true;
  templateCategory: 'organizational' | 'community' | 'environmental' | 'social' | 'economic';
  usageCount?: number;
  previewUrl?: string;
}

export type TemplateListResponse = PaginatedApiResponse<SurveyTemplate> & {
  categories: string[];
  featuredTemplates?: SurveyTemplate[];
};

// Survey builder specific types
export interface QuestionFilterParams {
  stakeholderGroupId: string;
  stageId: string;
  themeIds?: string[];
  subThemeIds?: string[];
  searchTerm?: string;
  questionType?: string;
  includeFrequentlyAsked?: boolean;
  page?: number;
  limit?: number;
}

export interface FilteredQuestion {
  _id: string;
  text: string;
  description?: string;
  type: string | { // Handle both string and object types
    _id?: string;
    name?: string;
    label?: string;
    value?: string;
  };
  options?: string[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  theme?: {
    _id: string;
    name: string;
  };
  subTheme?: {
    _id: string;
    name: string;
  };
  targetAudience: string | { // Handle both string and object types
    _id?: string;
    name?: string;
    label?: string;
    value?: string;
  };
  isFrequentlyAsked?: boolean;
  usageCount?: number;
  estimatedTime?: number;
}


// Error types for better error handling
export interface SurveyError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ValidationError extends SurveyError {
  field: string;
  expectedType?: string;
  actualValue?: any;
}

// Helper functions to safely extract values
export const getQuestionType = (type: FilteredQuestion['type']): string => {
  if (typeof type === 'string') return type;
  if (typeof type === 'object' && type) {
    return type.name || type.label || type.value || 'text';
  }
  return 'text';
};

export const getTargetAudience = (audience: FilteredQuestion['targetAudience']): string => {
  if (typeof audience === 'string') return audience;
  if (typeof audience === 'object' && audience) {
    return audience.name || audience.label || audience.value || 'Unknown';
  }
  return 'Unknown';
};


// ==========================================
// REVIEW SYSTEM TYPES
// ==========================================

export type ReviewModule =
  | 'stakeholder_group'
  | 'project_setup'
  | 'project_site_setup'
  | 'stakeholder_action'
  | 'social_impact'
  | 'toc_consultation_plan'
  | 'survey'
  | 'survey_question'
  | 'survey_translation';

export type ReviewStatus = 
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'escalated'
  | 'resolved';

export type ReviewPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type IssueType = 
  | 'validation'
  | 'compliance'
  | 'quality'
  | 'completeness'
  | 'accuracy'
  | 'other';

export type IssueSeverity = 
  | 'minor'
  | 'major'
  | 'critical';

export interface ReviewIssue {
  _id: string;
  field?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  description: string;
  suggestedFix?: string;
  raisedBy: {
    _id: string;
    name: string;
    email: string;
  };
  raisedAt: string;
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ReviewAttachment {
  filename: string;
  fileUrl: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
  uploadedAt: string;
}

export interface ReviewActivityLog {
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  performedAt: string;
  details?: string;
  fromValue?: string;
  toValue?: string;
}

export interface Review {
  _id: string;
  
  // Core identification
  organizationId: {
    _id: string;
    name: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  projectSiteId?: {
    _id: string;
    name: string;
  };
  
  // Module identification
  module: ReviewModule;
  moduleItemId: string;
  nestedPath?: string;
  nestedItemId?: string;
  
  // Review metadata
  title: string;
  description?: string;
  status: ReviewStatus;
  priority: ReviewPriority;
  
  // Workflow tracking
  submittedBy: {
    _id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  
  reviewers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  currentReviewer?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewStartedAt?: string;
  reviewCompletedAt?: string;
  
  // Escalation
  escalatedTo?: ReviewEscalationFields['escalatedTo'];
  escalatedAt?: ReviewEscalationFields['escalatedAt'];
  escalatedReason?: ReviewEscalationFields['escalatedReason'];
  escalatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  
  // Resolution
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  resolvedAt?: string;
  resolutionNotes?: string;
  
  // Stream Chat integration
  streamChannelId?: string;
  streamChannelType?: string;
  streamChannelCreated?: boolean;
  streamChannelCreatedAt?: string;
  chatParticipants: ReviewEscalationFields['chatParticipants'];
  
  // Review findings
  issues: ReviewIssue[];
  
  // Additional data
  tags: string[];
  attachments: ReviewAttachment[];
  activityLog: ReviewActivityLog[];
  
  // Metadata
  dueDate?: string;
  reminderSent?: boolean;
  archived: boolean;
  archivedAt?: string;
  archivedBy?: {
    _id: string;
    name: string;
  };
  
  createdAt: string;
  updatedAt: string;
  
  // Virtual fields (calculated on backend)
  unresolvedIssuesCount?: number;
  resolvedIssuesCount?: number;
  totalIssuesCount?: number;
  criticalIssuesCount?: number;
  reviewDuration?: number;
  isOverdue?: boolean;
}

// Request types
export interface CreateReviewRequest {
  module: ReviewModule;
  moduleItemId: string;
  organizationId: string;
  projectId: string;
  projectSiteId?: string;
  title: string;
  description?: string;
  priority?: ReviewPriority;
  reviewers?: string[];
  nestedPath?: string;
  nestedItemId?: string;
  dueDate?: string;
}

export interface UpdateReviewStatusRequest {
  status: ReviewStatus;
  reason?: string;
}

export interface EscalateReviewRequest {
  staffAccountManagerId?: string;
  reason: string;
}

/**
 * Request body for inviting a staff collaborator to an escalated review.
 */
export interface InviteCollaboratorRequest {
  /** _id of the ConnectGo staff member to invite */
  collaboratorId: string;
  /** Optional context message sent via Stream Chat */
  message?: string;
}

export interface ReviewEscalationFields {
  /** The account manager this review was escalated to */
  escalatedTo?: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  } | string;
  /** When the review was escalated */
  escalatedAt?: string | Date;
  /** Why the review was escalated */
  escalatedReason?: string;
  /**
   * All users who can participate in the review's Stream Chat channel.
   * Includes the escalatedTo AM plus any invited staff collaborators.
   */
  chatParticipants?: Array<
    | {
        _id: string;
        name: string;
        email: string;
        photo?: string;
        primaryRole?: string;
      }
    | string
  >;
}

export interface AddReviewerRequest {
  reviewerId: string;
}

export interface AddIssueRequest {
  field?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  description: string;
  suggestedFix?: string;
}

export interface ResolveIssueRequest {
  resolutionNotes?: string;
}

// Review statistics
export interface ReviewStatistics {
  byStatus: {
    pending: number;
    in_review: number;
    approved: number;
    escalated: number;
    resolved: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byModule: Record<ReviewModule, number>;
  totalReviews: number;
  averageResolutionTime?: number;
  overdueCount: number;
}

// Filters for review queries
export interface ReviewFilters {
  status?: ReviewStatus;
  priority?: ReviewPriority;
  module?: ReviewModule;
  organizationId?: string;
  projectId?: string;
  projectSiteId?: string;
  submittedBy?: string;
  assignedTo?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
}

// types/streamChat.ts

/**
 * Stream Chat Frontend Types
 * Extends the review types with Stream Chat specific fields
 */

// ==========================================
// STREAM CHAT USER
// ==========================================

export interface StreamChatUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  online?: boolean;
  created_at?: string;
  updated_at?: string;
  last_active?: string;
}

// ==========================================
// STREAM CHAT CHANNEL
// ==========================================

export interface StreamChatChannel {
  id: string;
  type: string;
  cid: string; // Combined channel type and id (e.g., "messaging:review-123")
  name?: string;
  image?: string;
  created_at: string;
  updated_at: string;
  created_by?: StreamChatUser;
  members: StreamChatChannelMember[];
  memberCount?: number;
  reviewId?: string; // Custom field for review channels
}

export interface StreamChatChannelMember {
  user: StreamChatUser;
  role: 'member' | 'moderator' | 'admin' | 'owner';
  created_at: string;
  updated_at: string;
  is_moderator?: boolean;
}

// ==========================================
// STREAM CHAT MESSAGE
// ==========================================

export interface StreamChatMessage {
  id: string;
  text: string;
  html?: string;
  type: 'regular' | 'system' | 'error' | 'reply' | 'ephemeral';
  user?: StreamChatUser;
  attachments?: StreamChatAttachment[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  mentioned_users?: StreamChatUser[];
  parent_id?: string; // For threaded messages
  show_in_channel?: boolean;
  silent?: boolean;
  pinned?: boolean;
  pinned_at?: string;
  pinned_by?: StreamChatUser;
}

export interface StreamChatAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  title?: string;
  title_link?: string;
  text?: string;
  image_url?: string;
  thumb_url?: string;
  asset_url?: string;
  file_size?: number;
  mime_type?: string;
}

// ==========================================
// STREAM CHAT EVENTS
// ==========================================

export type StreamChatEventType =
  | 'message.new'
  | 'message.updated'
  | 'message.deleted'
  | 'member.added'
  | 'member.removed'
  | 'typing.start'
  | 'typing.stop'
  | 'user.watching.start'
  | 'user.watching.stop';

export interface StreamChatEvent {
  type: StreamChatEventType;
  user?: StreamChatUser;
  message?: StreamChatMessage;
  channel?: StreamChatChannel;
  created_at: string;
}

// ==========================================
// STREAM CHAT CONTEXT
// ==========================================

export interface StreamChatContextValue {
  client: any; // StreamChat client instance
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  user: StreamChatUser | null;
  connectUser: (userData: StreamChatUser) => Promise<void>;
  disconnectUser: () => Promise<void>;
}

// ==========================================
// CHANNEL CONTEXT
// ==========================================

export interface ChannelContextValue {
  channel: any; // Channel instance from Stream Chat
  messages: StreamChatMessage[];
  members: StreamChatChannelMember[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string, attachments?: StreamChatAttachment[]) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

// ==========================================
// REVIEW CHAT INTEGRATION
// ==========================================

/**
 * Extended Review type with Stream Chat info
 */
export interface ReviewWithChat {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  
  // Stream Chat fields
  streamChannelId?: string;
  streamChannelType?: string;
  streamChannelCreated?: boolean;
  streamChannelCreatedAt?: string;
  chatParticipants?: ({ _id: string; name: string; email: string; photo?: string; primaryRole?: string; } | string)[];
  
  // Other review fields...
  [key: string]: any;
}

/**
 * Props for ReviewChatButton component
 */
export interface ReviewChatButtonProps {
  review: ReviewWithChat;
  onChatOpen?: () => void;
  className?: string;
}

/**
 * Props for ReviewChatModal component
 */
export interface ReviewChatModalProps {
  review: ReviewWithChat;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props for ReviewChatPanel component
 */
export interface ReviewChatPanelProps {
  reviewId: string;
  channelId: string;
  channelType?: string;
  onClose?: () => void;
}

// ==========================================
// HOOK RETURN TYPES
// ==========================================

/**
 * Return type for useStreamChat hook
 */
export interface UseStreamChatReturn {
  client: any;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  user: StreamChatUser | null;
}

/**
 * Return type for useReviewChat hook
 */
export interface UseReviewChatReturn {
  channel: any;
  isChannelReady: boolean;
  isCreating: boolean;
  error: Error | null;
  createChannel: () => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  isChatOpen: boolean;
}

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

export interface GetStreamTokenResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface CreateChannelRequest {
  channelId: string;
  channelType?: string;
  members: string[];
  channelData?: Record<string, any>;
}

export interface CreateChannelResponse {
  channelId: string;
  channelType: string;
  members: string[];
  createdAt: string;
}

export interface AddMembersRequest {
  members: string[];
}

export interface AddMembersResponse {
  channelId: string;
  addedMembers: string[];
}

export interface SendMessageRequest {
  text: string;
  attachments?: StreamChatAttachment[];
}

export interface SendMessageResponse {
  messageId: string;
  channelId: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

export interface StreamChatConfig {
  apiKey: string;
  appId?: string;
  options?: {
    timeout?: number;
    logger?: (level: string, message: string, extraData?: any) => void;
  };
}


// Define custom types for Stream
export type StreamChatGenerics = {
  attachmentType: any;
  channelType: any;
  commandType: string;
  eventType: any;
  messageType: any;
  reactionType: any;
  userType: {
    email?: string; // Add your custom email field here
    role?: string;  // Add role if it's your custom app role
  };
};

export interface StreamChatContextValue {
  client: any; // Keep this as any or 'StreamChat' (no <>)
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  user: StreamChatUser | null;
  connectUser: (userData: StreamChatUser) => Promise<void>;
  disconnectUser: () => Promise<void>;
}