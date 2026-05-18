// types/reports.ts

// Base report interfaces
export interface BaseReportData {
  id: string;
  title: string;
  description?: string;
  reportType: ReportType;
  entityType: 'project' | 'project_site';
  entityId: string;
  status: ReportStatus;
  visibility: 'private' | 'organization' | 'public';
  version: number;
  creator: UserInfo;
  organization: OrganizationInfo;
  project: ProjectInfo;
  projectSite?: ProjectSiteInfo;
  approvedBy?: UserInfo;
  approvedAt?: string;
  lastUpdatedBy?: UserInfo;
  filters?: ReportFilters;
  metadata: ReportMetadata;
  createdAt: string;
  updatedAt: string;
}

// Report types
export type ReportType = 
  | 'project_setup'
  | 'project_site_setup' 
  | 'stakeholder_mapping'
  | 'theory_of_change'
  | 'risk_register';

export type ReportStatus = 
  | 'draft'
  | 'generated'
  | 'approved'
  | 'published'
  | 'archived';

// User and entity info interfaces
export interface UserInfo {
  id: string;
  name: string;
  email?: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  country?: string;
  city?: string;
}

export interface ProjectInfo {
  _id?: string;
  id?: string;
  name: string;
  status: string;
  description?: string;
}

export interface ProjectSiteInfo {
  id: string;
  name: string;
  status?: string;
  region?: string;
  city?: string;
}

// Report metadata
export interface ReportMetadata {
  generatedAt: string;
  generatedBy: string;
  dataVersion: string;
  totalRecords: number;
  projectInfo?: ProjectInfo;
  siteInfo?: ProjectSiteInfo;
  summary?: {
    totalItems: number;
    completedItems: number;
    completionPercentage: number;
  };
  tags?: string[];
  exportHistory?: ExportRecord[];
  workflowHistory?: WorkflowHistoryEntry[];
  regenerationAttempts?: number;
  lastRegenerationError?: string;
}

export interface ExportRecord {
  format: 'pdf' | 'excel' | 'csv';
  exportedAt: string;
  exportedBy: UserInfo;
  fileSize?: number;
}

export interface WorkflowHistoryEntry {
  fromStatus: ReportStatus;
  toStatus: ReportStatus;
  transitionedBy: UserInfo;
  transitionedAt: string;
  notes?: string;
}

// NEW: Key Insights Interfaces
export interface KeyInsightAnalysis {
  stakeholder: {
    _id: string;
    name: string;
    category: string;
  };
  taskType: string;
  optionId: string;
  description: string;
  rating?: number;
  tags?: string[];
  scope: 'project' | 'site';
  siteName?: string;
}

export interface KeyInsightsData {
  totalKeyInsights: number;
  stakeholdersWithKeyInsights: number;
  averageKeyInsightsPerStakeholder: number;
  percentageOfStakeholdersWithKeyInsights: number;
  
  byTaskType: Record<string, {
    count: number;
    stakeholders: number;
    insights: KeyInsightAnalysis[];
  }>;
  
  byCategory: Record<string, {
    count: number;
    stakeholders: number;
    insights: KeyInsightAnalysis[];
  }>;
  
  topStakeholders: Array<{
    stakeholder: {
      _id: string;
      name: string;
      category: string;
    };
    keyInsightCount: number;
    keyInsightsByTask: Record<string, number>;
    averageRating: number;
  }>;
  
  ratingDistribution: Record<string, number>;
  
  byScope: {
    project: number;
    site: number;
  };
  
  allInsights: KeyInsightAnalysis[];
  recentInsights: KeyInsightAnalysis[];
}

// Specific report data interfaces
export interface ProjectSetupReportData extends BaseReportData {
  reportType: 'project_setup';
  reportData: {
    projectInfo: ProjectInfo;
    organizationInfo: OrganizationInfo;
    setupProgress: {
      totalTasks: number;
      completedTasks: number;
      requiredTasks: number;
      completedRequiredTasks: number;
      overallProgress: number;
      isComplete: boolean;
      completedAt?: string;
      lastUpdatedBy?: UserInfo;
    };
    projectMetadata: {
      certificationStandard: string[];
      projectName: string;
    };
    locationContext: {
      country: string;
      adminLevel1: string;
      adminLevel2: string;
      adminLevel3: string;
      villages: string;
      gpsCoordinates: string;
      hectareCoverage: number;
      ecologicalZone: string[];
    };
    governance: {
      approvalGrantedBy: string[];
      implementingOrganisations: string[];
      oversightAuthorities: string[];
      partnershipType: string[];
      customaryInstitutionsInvolved: boolean;
      customaryInstitutionsDetails?: string;
      governanceNotes: string;
    };
    landTenure: {
      landTenureNotes?: string;
      customaryRightsHolder: string[];
      formalRightsHolder: string[];
      overlappingClaims: boolean;
      landAgreementsUploaded: any;
    };
    riskAssessment: {
      conflictHistory: boolean;
      conflictNotes?: string;
      politicalRisk: boolean;
      accessIssues: boolean;
      accessNotes?: string;
      previousProjectFailures: boolean;
      previousFailureNotes?: string;
    };
    projectSites: ProjectSiteInfo[];
    taskDetails: TaskDetail[];
  };
}

export interface ProjectSiteSetupReportData extends BaseReportData {
  reportType: 'project_site_setup';
  reportData: {
    siteInfo: ProjectSiteInfo & {
      coordinates?: any;
      size?: number;
      sizeUnit?: string;
      siteType?: string;
    };
    projectInfo: ProjectInfo;
    organizationInfo: OrganizationInfo;
    setupProgress: {
      totalTasks: number;
      completedTasks: number;
      requiredTasks: number;
      completedRequiredTasks: number;
      overallProgress: number;
      isComplete: boolean;
      completedAt?: string;
      lastUpdatedBy?: UserInfo;
    };
    siteMetadata: {
      siteName: string;
      projectName: string;
      siteLocationDescription: string;
    };
    location: {
      adminLevel1: string;
      adminLevel2: string;
      adminLevel3: string;
      gpsCoordinates: string;
      siteHectareCoverage: number;
      siteEcologicalZone: string[];
    };
    demographics: {
      estimatedPopulation: number;
      genderDistribution: any;
      ageDistribution: any;
      ethnicGroupsPresent: string[];
      vulnerableGroupsPresent: boolean;
      vulnerabilityIndicators: string[];
    };
    education: {
      educationSummary: string;
    };
    livelihoods: {
      primaryIncomeSources: string[];
      secondaryIncomeSources: string[];
      cultivatedLandSize: any;
      cropsGrown: string[];
      livestockProfile: any[];
    };
    wildlifeConflict: {
      wildlifeConflictPresent: boolean;
      wildlifeConflictSummary: any[];
    };
    taskDetails: TaskDetail[];
  };
}

export interface StakeholderMappingReportData extends BaseReportData {
  reportType: 'stakeholder_mapping';
  reportData: {
    projectInfo: ProjectInfo;
    organizationInfo: OrganizationInfo;
    summary: {
      totalStakeholders: number;
      completedStakeholders: number;
      inProgressStakeholders: number;
      notStartedStakeholders: number;
      completionPercentage: number;
      stakeholdersByCategory: Record<string, {
        total: number;
        completed: number;
        averageRating: number;
      }>;
      stakeholdersByScope: {
        project: number;
        site: number;
      };
      stakeholdersBySite: Record<string, number>;
      averageRatings: {
        overall: number;
        byTaskType: Record<string, number>;
      };
      // NEW: Key insights summary
      totalKeyInsights: number;
      stakeholdersWithKeyInsights: number;
      averageKeyInsightsPerStakeholder: number;
    };
    stakeholderData: ProcessedStakeholder[];
    stakeholdersByCategory: Record<string, ProcessedStakeholder[]>;
    influenceMatrix: InfluenceMatrixEntry[];
    availableSites: SiteWithCount[];
    // Keep tag insights for backward compatibility
    tagInsights?: {
      totalUniqueTags: number;
      mostCommonTags: Array<{ tag: string; count: number; stakeholders: string[] }>;
      tagsByCategory: Record<string, Array<{ tag: string; count: number }>>;
      tagsByTaskType: Record<string, string[]>;
      tagFrequencyDistribution: Record<string, number>;
    };
    // NEW: Key insights
    keyInsights: KeyInsightsData;
  };
}

// types/reports.ts

export interface Stage1Action {
  _id: string;
  action: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  repeatCycle: 'monthly' | 'quarterly' | 'yearly' | 'no_repeat';
  stakeholderGroup: {
    _id: string;
    name: string;
    description?: string;
    estimatedPopulation?: number;
    completionStatus: string;
    category: {
      _id: string;
      name: string;
    };
  };
  themes: Array<{ _id: string; name: string }>;
  subThemes: Array<{ _id: string; name: string }>;
  timeframe: {
    startDate?: string;
    endDate?: string;
  };
  responsibility?: {
    name: string;
    role?: string;
    email?: string;
  };
}

export interface Stage1ReportData {
  reportType: 'toc_stage1';
  projectInfo: ProjectInfo;
  organizationInfo: OrganizationInfo;
  scope: 'project' | 'site' | 'all_sites';
  reportMetadata: {
    generatedAt: string;
    generatedBy: string;
    version: string;
    appliedFilters: any;
  };
  stage1Data: {
    totalActions: number;
    actions: Stage1Action[];
    progressSummary: {
      averageProgress: number;
      completedActions: number;
      inProgressActions: number;
      notStartedActions: number;
    };
    timelineSummary: {
      earliestStartDate?: string;
      latestEndDate?: string;
      totalDuration: number;
    };
  };
}

export interface TheoryOfChangeReportData extends BaseReportData {
  reportType: 'theory_of_change';
  // reportData is polymorphic — discriminated by reportData.reportType
  reportData: Stage1ReportData | any;
}


export interface RiskRegisterReportData extends BaseReportData {
  reportType: 'risk_register';
  reportData: {
    projectInfo: ProjectInfo;
    organizationInfo: OrganizationInfo;
    executiveSummary: {
      totalRisks: number;
      risksByScore: {
        high: number;
        medium: number;
        low: number;
      };
      risksByStatus: {
        open: number;
        monitoring: number;
        closed: number;
        transferred: number;
      };
      risksByType: Record<string, number>;
      risksByCategory: Record<string, number>;
      reviewMetrics: {
        reviewOverdue: number;
        dueForReviewSoon: number;
        averageDaysToReview: number;
      };
      mitigationMetrics: {
        averageProgress: number;
        totalActions: number;
        completedActions: number;
      };
      risksByScope: {
        project: number;
        site: number;
      };
      risksBySite: Record<string, number>;
    };
    riskDetails: ProcessedRiskItem[];
    risksByCategory: Record<string, ProcessedRiskItem[]>;
    risksByType: Record<string, ProcessedRiskItem[]>;
    risksByOwner: Record<string, ProcessedRiskItem[]>;
    overdueRisks: ProcessedRiskItem[];
    highPriorityRisks: ProcessedRiskItem[];
    availableSites: SiteWithCount[];
  };
}

// Supporting interfaces
export interface TaskDetail {
  fieldName: string;
  fieldLabel: string;
  dataType: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: UserInfo;
  responseData: any;
  step: number;
  sortOrder: number;
}

export interface ProcessedStakeholder {
  _id: string;
  name: string;
  description?: string;
  category: {
    _id: string;
    name: string;
  };
  project: ProjectInfo;
  projectSite?: ProjectSiteInfo;
  completionStatus: string;
  tasks: Array<{
    taskType: string;
    responses: Array<{
      optionId: string;
      description: string;
      isKeyInsight?: boolean; // NEW
    }>;
    rating?: number;
    tags?: string[];
    updatedAt: string;
  }>;
  themes: any[];
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  taskCompletionCount: number;
  scope: 'project' | 'site';
  // Tags
  allTags: string[];
  tagsByTask: Record<string, string[]>;
  // NEW: Key insights fields
  keyInsights: Array<{
    taskType: string;
    optionId: string;
    description: string;
    rating?: number;
  }>;
  keyInsightCount: number;
  hasKeyInsights: boolean;
  keyInsightsByTask: Record<string, number>;
}

export interface InfluenceMatrixEntry {
  stakeholder: ProcessedStakeholder;
  ratings: {
    power: number;
    connections: number;
    risks: number;
    roles: number;
    benefits: number;
    wellbeing: number;
  };
  averageInfluence: number;
}

export interface ProcessedRiskItem {
  _id: string;
  project: ProjectInfo;
  projectSite?: ProjectSiteInfo;
  organization: OrganizationInfo;
  name: string;
  riskType: string;
  riskDescription: string;
  probability: string;
  consequences: string;
  riskScore: string;
  owner: UserInfo;
  mitigationStrategy: string;
  category: string;
  impactArea: string[];
  identifiedDate: string;
  reviewDate?: string;
  status: string;
  mitigationActions: any[];
  riskHistory: any[];
  attachments: any[];
  notes?: string;
  creator: UserInfo;
  lastUpdatedBy?: UserInfo;
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  isReviewOverdue: boolean;
  daysUntilReview: number | null;
  mitigationProgress: number;
  scope: 'project' | 'site';
}

export interface StagesSummary {
  exists: boolean;
  status: string;
  progress: number;
  actionCount?: number;
  impactCount?: number;
  stakeholderCount: number;
  themeCount: number;
  riskCount?: number;
}

export interface GanttTimelineItem {
  id: string;
  name: string;
  type: 'action' | 'impact';
  stakeholder: {
    _id: string;
    name: string;
  };
  themes: Array<{
    _id: string;
    name: string;
  }>;
  startDate?: string | null;
  endDate?: string | null;
  duration?: number;
  progress: number;
  dependencies?: string[];
  responsibility?: {
    name: string;
    role: string;
    email?: string;
  };
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'planned' | 'achieved' | 'at_risk';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  milestones?: Array<{
    date: string;
    description: string;
    completed?: boolean;
  }>;
  isEstimated?: boolean;
  estimationMethod?: string;
}

export interface StakeholderWorkload {
  stakeholder: {
    _id: string;
    name: string;
  };
  activities: GanttTimelineItem[];
  totalDuration: number;
  activityCount: number;
  completionRate: number;
  averageProgress: number;
  upcomingDeadlines: number;
  workloadScore?: number;
}

export interface FrameworkOutcome {
  framework: {
    type: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards';
    item: {
      _id: string;
      name: string;
      code?: string;
      description?: string;
      capacityTypes?: string[];
      category?: string;
      issuingBody?: string;
    };
  };
  stage1Actions: any[];
  stage2Impacts: any[];
  indicators?: any[];
  metrics: {
    totalActions: number;
    totalImpacts: number;
    completionRate: number;
    riskCount: number;
  };
}

export interface SiteWithCount {
  _id: string;
  name: string;
  stakeholderCount?: number;
  actionCount?: number;
  impactCount?: number;
  riskCount?: number;
  keyInsightCount?: number; // NEW
}

// Filter interfaces
export interface ReportFilters {
  scope?: 'all' | 'project' | 'site';
  siteIds?: string[];
  stageNumbers?: number[];
  stakeholderIds?: string[];
  themeIds?: string[];
  frameworkFilter?: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards';
  includeArchived?: boolean;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  // Risk-specific filters
  status?: string[];
  riskScore?: string[];
  riskType?: string[];
  category?: string[];
  reviewDateFrom?: string;
  reviewDateTo?: string;
  ownerIds?: string[];
  overdueOnly?: boolean;
  // Stakeholder-specific filters
  categories?: string[];
  connectionStrength?: {
    min: number;
    max: number;
  };
  completionStatus?: string[];
  onlyKeyInsights?: boolean; // NEW
}

// Search interfaces
export interface SearchFilters {
  reportType?: string[];
  status?: string[];
  visibility?: string[];
  entityType?: string[];
  organizationId?: string;
  projectId?: string[];
  projectSiteId?: string[];
  creatorId?: string[];
  approvedBy?: string;
  lastUpdatedBy?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  approvedAfter?: string;
  approvedBefore?: string;
  searchTerm?: string;
  searchFields?: string[];
  tags?: string[];
  version?: number;
  hasExports?: boolean;
  minTotalItems?: number;
  maxTotalItems?: number;
  minCompletionPercentage?: number;
  maxCompletionPercentage?: number;
  hasSnapshots?: boolean;
  hasWorkflowHistory?: boolean;
  isExpired?: boolean;
  needsRegeneration?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchOptions {
  includeContent?: boolean;
  fuzzySearch?: boolean;
  aggregateResults?: boolean;
  includeRelated?: boolean;
  cacheResults?: boolean;
}

export interface SearchResult {
  reports: BaseReportData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  aggregations?: {
    byReportType: Record<string, number>;
    byStatus: Record<string, number>;
    byOrganization: Record<string, number>;
    byProject: Record<string, number>;
    byCreator: Record<string, number>;
    dateDistribution: Array<{
      month: string;
      count: number;
    }>;
  };
  searchMetadata: {
    query: SearchFilters;
    executionTime: number;
    fromCache: boolean;
    totalResults: number;
  };
}

export interface QuickSearchResult {
  reports: Array<{
    _id: string;
    title: string;
    reportType: string;
    projectName: string;
    organizationName: string;
    status: string;
    createdAt: string;
    relevanceScore: number;
  }>;
  suggestions: string[];
}

export interface SearchFacets {
  reportTypes: Array<{ value: string; label: string; count: number }>;
  statuses: Array<{ value: string; label: string; count: number }>;
  organizations: Array<{ value: string; label: string; count: number }>;
  projects: Array<{ value: string; label: string; count: number }>;
  creators: Array<{ value: string; label: string; count: number }>;
  tags: Array<{ value: string; count: number }>;
}

// Background processing interfaces
export interface BackgroundJobOptions {
  saveReport?: boolean;
  cacheResult?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  filters?: ReportFilters;
  reportDimension?: string;
  delay?: number;
}

export interface BackgroundJob {
  jobId: string;
  estimatedDuration: number;
  status?: 'queued' | 'active' | 'completed' | 'failed';
}

export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'not_found';
  progress: number;
  data: any;
  createdAt: string;
  processedOn?: string;
  finishedOn?: string;
  failedReason?: string;
}

export interface QueueStats {
  report: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  batch: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  regeneration: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  timestamp: string;
}

// Analytics interfaces
export interface ReportAnalytics {
  summary: {
    totalReports: number;
    avgGenerationTime: number;
    totalExports: number;
    recentActivity: number;
  };
  breakdown: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  trends: {
    recentActivity: any[];
  };
  timeRange: string;
  generatedAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// Report generation response
export interface ReportGenerationResponse {
  reportData: any;
  savedReport?: {
    _id: string;
    status: ReportStatus;
    createdAt: string;
  };
}

// Union type for all report data types
export type AnyReportData = 
  | ProjectSetupReportData
  | ProjectSiteSetupReportData
  | StakeholderMappingReportData
  | TheoryOfChangeReportData
  | RiskRegisterReportData;