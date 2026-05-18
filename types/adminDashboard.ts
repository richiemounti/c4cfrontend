// types/adminDashboard.ts

export interface WorkloadItem {
  _id: string;
  type: 'project' | 'site';
  name: string;
  organization: {
    _id: string;
    name: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  status: string;
  stage: string;
  isCompleted: boolean;
  assignedTo?: {
    _id: string;
    name: string;
  };
  completionPercentage?: number;
  siteCount?: number; // For projects
  createdAt: string;
}

export interface WorkloadSummary {
  totalItems: number;
  activeProjects: number;
  activeSites: number;
  completedItems: number;
  capacityStatus: 'green' | 'orange' | 'red';
  capacityPercentage: number;
  itemsByStage: {
    onboarding: number;
    design: number;
    measure: number;
    learn: number;
    tell: number;
  };
  items: WorkloadItem[];
}

export interface SupportEscalation {
  category: 'chatbot_questions' | 'client_incidents' | 'satisfaction_surveys';
  count: number;
  satisfactionScore?: number; // For satisfaction surveys
  satisfactionPercentage?: number;
}

export interface SupportEscalationStats {
  chatbotQuestions: number;
  clientIncidents: number;
  satisfactionSurveys: number;
  overallSatisfaction: number; // 0-100 percentage
  categorizedSupport: SupportEscalation[];
}

export interface IncidentStats {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  recentIncidents: number; // Last 7 days
}

// Dashboard Overview Types - matches backend structure
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
  city: string;
  country: string;
  status: string;
  stage: string;
  projectCount: number;
  siteCount: number;
  progress: number;
}