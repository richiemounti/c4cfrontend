// types/review.types.ts

import { User, Project, ProjectSite, Organization } from './index';

// ==================== ENUMS & CONSTANTS ====================

export type ReviewStatus = 
  | 'pending' 
  | 'manager_review' 
  | 'manager_approved' 
  | 'manager_rejected'
  | 'staff_review' 
  | 'staff_approved' 
  | 'staff_rejected' 
  | 'on_hold' 
  | 'cancelled';

export type ReviewPhase = 'build' | 'measure' | 'learn' | 'tell';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical';

export type ReviewStage = 'manager' | 'staff' | 'completed' | 'cancelled';

export type ReviewEntityType = 
  | 'project_setup' 
  | 'site_setup' 
  | 'stakeholder_mapping' 
  | 'consultation_plan' 
  | 'theory_of_change_stage' 
  | 'survey' 
  | 'report';

export type CommentType = 
  | 'comment' 
  | 'manager_approval' 
  | 'manager_rejection' 
  | 'staff_approval' 
  | 'staff_rejection' 
  | 'request_changes' 
  | 'internal_note';

export type CommentStage = 'manager' | 'staff' | 'general';

export type AttachmentStage = 'manager' | 'staff' | 'general';

// ==================== SUB-INTERFACES ====================

export interface ReviewStageData {
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  startedAt?: string;
  completedAt?: string;
  reviewer?: string | User;
  comments?: string;
  decision?: string;
  requiresChanges: boolean;
}

export interface ReviewComment {
  _id?: string;
  author: string | User;
  content: string;
  type: CommentType;
  stage: CommentStage;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAttachment {
  _id?: string;
  filename: string;
  url: string;
  uploadedBy: string | User;
  uploadedAt: string;
  stage: AttachmentStage;
}

export interface TaskReview {
  isApproved: boolean;
  comment: string;
  requiresChanges: boolean;
  reviewedBy: string | User;
  reviewedAt: string;
  reviewStage: 'manager' | 'staff';
}

export interface ManagerReviewSummary {
  overallComment: string;
  score?: number;
  recommendations: string[];
  approvedTasks: string[];
  rejectedTasks: string[];
  tasksRequiringChanges: string[];
  reviewedBy: string | User;
  reviewedAt: string;
}

export interface StaffReviewSummary {
  finalComment: string;
  overallScore: number;
  complianceChecks: Record<string, boolean>;
  recommendations: string[];
  finalizedBy: string | User;
  finalizedAt: string;
}

export interface ChecklistItem {
  isCompleted: boolean;
  notes?: string;
  completedBy?: string | User;
  completedAt?: string;
  stage: 'manager' | 'staff';
}

export interface ReviewMetadata {
  taskReviews?: Record<string, TaskReview>;
  managerReviewSummary?: ManagerReviewSummary;
  staffReviewSummary?: StaffReviewSummary;
  checklist?: Record<string, ChecklistItem>;
  [key: string]: any;
}

export interface ApprovalConfig {
  requiresManagerApproval: boolean;
  requiresStaffApproval: boolean;
  autoProgressToStaff: boolean;
  allowManagerOverride: boolean;
}

export interface NotificationSettings {
  onAssignment: boolean;
  onStatusChange: boolean;
  onComment: boolean;
  reminderDays: number;
  lastReminderSent?: string;
}

export interface ChangeHistoryEntry {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string | User;
  changedAt: string;
  stage: 'manager' | 'staff' | 'general';
}

// ==================== MAIN REVIEW INTERFACE ====================

export interface Review {
  _id: string;
  
  // Entity being reviewed
  entityType: ReviewEntityType;
  entityId: string;
  
  // Context references
  project: string | Project;
  projectSite?: string | ProjectSite;
  organization: string | Organization;
  
  // Review details
  title: string;
  description?: string;
  phase: ReviewPhase;
  
  // Workflow
  status: ReviewStatus;
  priority: ReviewPriority;
  
  // Assignment
  assignedTo?: string | User;
  managerReviewer?: string | User;
  staffReviewer?: string | User;
  
  // Review stages
  managerReview: ReviewStageData;
  staffReview: ReviewStageData;
  
  // Progress
  progress: number;
  completedTasks: number;
  totalTasks: number;
  
  // Timeline
  dueDate?: string;
  managerDueDate?: string;
  staffDueDate?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Communication
  comments: ReviewComment[];
  attachments: ReviewAttachment[];
  
  // Enhanced metadata
  metadata: ReviewMetadata;
  
  // Configuration
  approvalConfig: ApprovalConfig;
  notifications: NotificationSettings;
  changeHistory: ChangeHistoryEntry[];
  
  // Tracking
  creator: string | User;
  lastUpdatedBy?: string | User;
  
  // Standard fields
  archived: boolean;
  archivedAt?: string;
  archivedBy?: string | User;
  createdAt: string;
  updatedAt: string;
  
  // Virtual fields (computed on backend)
  isOverdue?: boolean;
  isManagerOverdue?: boolean;
  isStaffOverdue?: boolean;
  currentStage?: ReviewStage;
}

// ==================== REQUEST INTERFACES ====================

export interface CreateReviewRequest {
  entityType: ReviewEntityType;
  entityId: string;
  projectId: string;
  projectSiteId?: string;
  organizationId: string;
  title: string;
  description?: string;
  priority?: ReviewPriority;
  assignedTo?: string;
  managerReviewer?: string;
  staffReviewer?: string;
  dueDate?: string;
  managerDueDate?: string;
  staffDueDate?: string;
  approvalConfig?: Partial<ApprovalConfig>;
}

export interface UpdateReviewRequest {
  title?: string;
  description?: string;
  priority?: ReviewPriority;
  dueDate?: string;
  managerDueDate?: string;
  staffDueDate?: string;
  metadata?: Partial<ReviewMetadata>;
}

export interface AssignReviewersRequest {
  managerReviewer?: string;
  staffReviewer?: string;
  assignedTo?: string;
}

export interface UpdateStatusRequest {
  status: ReviewStatus;
  comment?: string;
}

export interface CancelReviewRequest {
  reason: string;
}

export interface CompleteManagerReviewRequest {
  approved: boolean;
  comments: string;
  decision?: string;
  overallScore?: number;
  recommendations?: string[];
}

export interface CompleteStaffReviewRequest {
  approved: boolean;
  comments: string;
  decision?: string;
  overallScore?: number;
  complianceChecks?: Record<string, boolean>;
  recommendations?: string[];
}

export interface UpdateTaskReviewRequest {
  isApproved: boolean;
  comment: string;
  requiresChanges: boolean;
}

export interface AddCommentRequest {
  content: string;
  type?: CommentType;
  stage?: CommentStage;
  isInternal?: boolean;
}

export interface AddAttachmentRequest {
  filename: string;
  url: string;
  stage?: AttachmentStage;
}

// ==================== RESPONSE INTERFACES ====================

export interface ReviewResponse {
  success: boolean;
  message?: string;
  data: Review;
}

export interface ReviewListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Review[];
}

export interface ReviewDetailResponse {
  success: boolean;
  data: {
    review: Review;
    entityDetails: any;
  };
}

export interface TaskReviewResponse {
  success: boolean;
  message: string;
  data: {
    taskReview: TaskReview;
    overallProgress: number;
    completedTasks: number;
    totalTasks: number;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    comment: ReviewComment;
    totalComments: number;
  };
}

export interface AttachmentResponse {
  success: boolean;
  message: string;
  data: {
    attachment: ReviewAttachment;
    totalAttachments: number;
  };
}

export interface ReviewStatistics {
  overview: {
    total: number;
    pending: number;
    managerReview: number;
    managerApproved: number;
    managerRejected: number;
    staffReview: number;
    staffApproved: number;
    staffRejected: number;
    cancelled: number;
    onHold: number;
    avgProgress: number;
  };
  overdueCount: number;
  byPhase: Array<{
    _id: ReviewPhase;
    count: number;
  }>;
  byPriority: Array<{
    _id: ReviewPriority;
    count: number;
  }>;
}

export interface ReviewStatisticsResponse {
  success: boolean;
  data: ReviewStatistics;
}

// ==================== QUERY INTERFACES ====================

export interface ReviewQueryParams {
  status?: ReviewStatus;
  phase?: ReviewPhase;
  priority?: ReviewPriority;
  entityType?: ReviewEntityType;
  projectId?: string;
  organizationId?: string;
  assignedTo?: string;
  stage?: 'manager' | 'staff';
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface ReviewStatisticsQueryParams {
  organizationId?: string;
  projectId?: string;
}

// ==================== UTILITY TYPES ====================

export interface ReviewCardProps {
  review: Review;
  onViewDetails?: (reviewId: string) => void;
  onStartReview?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
}

export interface ReviewFilterOptions {
  statuses: ReviewStatus[];
  phases: ReviewPhase[];
  priorities: ReviewPriority[];
  entityTypes: ReviewEntityType[];
}

// ==================== STATUS HELPERS ====================

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending',
  manager_review: 'Manager Review',
  manager_approved: 'Manager Approved',
  manager_rejected: 'Manager Rejected',
  staff_review: 'Staff Review',
  staff_approved: 'Staff Approved',
  staff_rejected: 'Staff Rejected',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: 'gray',
  manager_review: 'blue',
  manager_approved: 'green',
  manager_rejected: 'red',
  staff_review: 'purple',
  staff_approved: 'green',
  staff_rejected: 'red',
  on_hold: 'yellow',
  cancelled: 'gray',
};

export const PRIORITY_LABELS: Record<ReviewPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const PRIORITY_COLORS: Record<ReviewPriority, string> = {
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

export const PHASE_LABELS: Record<ReviewPhase, string> = {
  build: 'Build',
  measure: 'Measure',
  learn: 'Learn',
  tell: 'Tell',
};

export const ENTITY_TYPE_LABELS: Record<ReviewEntityType, string> = {
  project_setup: 'Project Setup',
  site_setup: 'Site Setup',
  stakeholder_mapping: 'Stakeholder Mapping',
  consultation_plan: 'Consultation Plan',
  theory_of_change_stage: 'Theory of Change Stage',
  survey: 'Survey',
  report: 'Report',
};

// ==================== VALIDATION HELPERS ====================

export const isManagerStage = (status: ReviewStatus): boolean => {
  return ['pending', 'manager_review', 'manager_approved', 'manager_rejected'].includes(status);
};

export const isStaffStage = (status: ReviewStatus): boolean => {
  return ['staff_review', 'staff_approved', 'staff_rejected', 'manager_approved'].includes(status);
};

export const isCompleted = (status: ReviewStatus): boolean => {
  return ['staff_approved', 'staff_rejected', 'cancelled'].includes(status);
};

export const canStartManagerReview = (status: ReviewStatus): boolean => {
  return status === 'pending';
};

export const canCompleteManagerReview = (status: ReviewStatus): boolean => {
  return status === 'manager_review';
};

export const canStartStaffReview = (status: ReviewStatus): boolean => {
  return status === 'manager_approved' || status === 'staff_review';
};

export const canCompleteStaffReview = (status: ReviewStatus): boolean => {
  return status === 'staff_review';
};