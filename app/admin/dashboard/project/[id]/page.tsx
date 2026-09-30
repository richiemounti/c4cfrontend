// app/admin/dashboard/project/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Building2, 
  Calendar,
  TrendingUp,
  FileText,
  Edit,
  ExternalLink,
  Activity,
  Settings,
  MapPin,
  Users,
  Target,
  ArrowRight,
  CalendarDays,
  Clock
} from 'lucide-react';

// Import API functions
import { 
  getProjectDetail,
  getEntityTimeline,
} from '@/lib/api/adminDashboard';
import { getSurveysByProject } from '@/lib/api/survey';
import { AdminReviewManagement } from '@/components/admin/AdminReviewManagement';

interface PageProps {
  params: {
    id: string;
  };
}

interface ProjectDetailData {
  _id: string;
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  stage: string;
  startDate: string;
  endDate?: string;
  overallProgress: number;
  organization: {
    _id: string;
    name: string;
    country: string;
    city: string;
  };
  setup: {
    _id: string;
    progress: number;
    isComplete: boolean;
    completedTasks: number;
    totalTasks: number;
    requiredTasks: number;
    completedRequiredTasks: number;
    lastUpdated?: string;
  };
  sites: {
    total: number;
    activeCount: number;
    averageProgress: number;
    summary: Array<{
      _id: string;
      name: string;
      location: string;
      status: string;
      progress: number;
      setupProgress: number;
      stakeholderCount: number;
      completedStakeholders: number;
      consultationPlanProgress: number;
    }>;
  };
  theoryOfChange: {
    stages: Array<{
      _id: string;
      stageName: string;
      stageNumber: number;
      completionStatus: string;
      progress: number;
    }>;
    averageProgress: number;
  };
  stakeholderMapping: {
    groups: Array<{
      _id: string;
      name: string;
      completionStatus: string;
      mappingCount: number;
    }>;
    totalGroups: number;
    completedGroups: number;
    averageProgress: number;
  };
  risks: {
    total: number;
    high: number;
    medium: number;
    low: number;
    recent: Array<{
      _id: string;
      name: string;
      riskType: string;
      riskScore: string;
      status: string;
      owner: string;
      createdAt: string;
    }>;
  };
  contacts: Array<{
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  creator: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  user?: string;
  priority?: string;
}

interface PublishedSurvey {
  _id: string;
  title: string;
  status: string;
  category: string;
  customCategoryName?: string;
  sequenceNumber: number;
  stakeholderGroup?: {
    _id: string;
    name: string;
  };
  theoryOfChangeStage?: {
    _id: string;
    stageNumber: number;
    name: string;
  };
  settings: {
    startDate?: string;
    endDate?: string;
  };
  totalQuestions: number;
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const projectId = params.id;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [publishedSurveys, setPublishedSurveys] = useState<PublishedSurvey[]>([]);
  const [selectedTab, setSelectedTab] = useState<'progress' | 'reviews' | 'timeline' | 'survey-calendar'>('progress');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'project' | 'reviews' | 'milestones'>('all');
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details, timeline, and published surveys in parallel
        const [projectData, timelineData, surveysData] = await Promise.all([
          getProjectDetail(projectId),
          getEntityTimeline('project', projectId),
          getSurveysByProject(projectId, undefined, { status: 'published' })
        ]);

        setProject(projectData);
        setTimeline(timelineData);
        
        // Handle different possible response structures
        console.log('Surveys response:', surveysData);
        
        let surveys: PublishedSurvey[] = [];
        if (surveysData) {
          // Check if data is directly an array
          if (Array.isArray(surveysData.data)) {
            surveys = surveysData.data;
          } 
          // Check if data.surveys exists (paginated response)
          else if (surveysData.data?.surveys && Array.isArray(surveysData.data.surveys)) {
            surveys = surveysData.data.surveys;
          }
          // Check if data.data exists (double-wrapped)
          else if (surveysData.data?.data && Array.isArray(surveysData.data.data)) {
            surveys = surveysData.data.data;
          }
          // If surveysData itself is an array
          else if (Array.isArray(surveysData)) {
            surveys = surveysData;
          }
        }
        
        setPublishedSurveys(surveys);
        
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-c4c-sage bg-c4c-tint-sage';
      case 'active': return 'text-c4c-cobalt bg-c4c-tint-cyan';
      case 'planning': return 'text-black bg-c4c-tint-gold';
      case 'on-hold': return 'text-c4c-burgundy bg-c4c-tint-coral';
      default: return 'text-c4c-petrol bg-c4c-grey-bg';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'onboarding': return 'text-black bg-c4c-tint-gold';
      case 'design': return 'text-c4c-petrol bg-c4c-tint-cyan';
      case 'measure': return 'text-c4c-sage bg-c4c-tint-sage';
      case 'learn': return 'text-c4c-petrol bg-c4c-grey-bg';
      case 'tell': return 'text-c4c-petrol bg-c4c-tint-cyan';
      default: return 'text-c4c-petrol bg-c4c-grey-bg';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-c4c-sage';
    if (progress >= 50) return 'bg-c4c-cobalt';
    if (progress >= 25) return 'bg-c4c-yellow';
    return 'bg-c4c-burgundy';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 90) return { label: 'On Track', color: 'text-c4c-sage' };
    if (progress >= 50) return { label: 'In Progress', color: 'text-c4c-cobalt' };
    if (progress >= 25) return { label: 'At Risk', color: 'text-c4c-petrol' };
    return { label: 'Behind', color: 'text-c4c-burgundy' };
  };

  const handleOrganizationClick = () => {
    if (project?.organization._id) {
      router.push(`/admin/dashboard/organization/${project.organization._id}`);
    }
  };

  const handleReviewClick = (reviewId: string) => {
    router.push(`/admin/dashboard/review/${reviewId}`);
  };

  const handleNavigateToReporting = (section: string) => {
    router.push(`/dashboard/project/${projectId}/reports?section=${section}`);
  };

  const filteredTimeline = timeline.filter(event => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'project') return ['project_created', 'site_added', 'setup_completed', 'setup_started'].includes(event.type);
    if (timelineFilter === 'reviews') return ['review_created', 'review_approved', 'review_rejected'].includes(event.type);
    if (timelineFilter === 'milestones') return ['milestone', 'stage_completed', 'toc_stage_completed'].includes(event.type);
    return true;
  });

  // Group surveys by month for calendar view
  const surveysByMonth = Array.isArray(publishedSurveys) 
    ? publishedSurveys.reduce((acc, survey) => {
        const startDate = survey.settings?.startDate ? new Date(survey.settings.startDate) : null;
        
        if (startDate && !isNaN(startDate.getTime())) {
          // Valid date - group by month
          const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[monthKey]) {
            acc[monthKey] = [];
          }
          acc[monthKey].push(survey);
        } else {
          // No date or invalid date - add to "Unscheduled" category
          if (!acc['unscheduled']) {
            acc['unscheduled'] = [];
          }
          acc['unscheduled'].push(survey);
        }
        return acc;
      }, {} as Record<string, PublishedSurvey[]>)
    : {};

  console.log('Surveys by month:', surveysByMonth);
  console.log('Total published surveys:', publishedSurveys.length);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-c4c-petrol border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Project Not Found</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 text-c4c-petrol hover:text-black"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-c4c-petrol hover:text-black"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">{project.name}</h1>
            <p className="text-c4c-petrol">
              <button
                onClick={handleOrganizationClick}
                className="hover:text-black cursor-pointer"
              >
                {project.organization.name}
              </button>
              {project.location && ` • ${project.location}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(project.stage)}`}>
            {project.stage}
          </span>
          <div className="flex space-x-2 ml-4">
            <button className="inline-flex items-center px-4 py-2 border border-c4c-rule rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => router.push(`/projects/${projectId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </button>
          </div>
        </div>
      </div>

      {/* Module Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Project Setup Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-c4c-petrol" />
              <div className="ml-3">
                <p className="text-sm font-medium text-c4c-petrol">Project Setup</p>
                <p className={`text-xs ${getProgressStatus(project.setup.progress).color}`}>
                  {getProgressStatus(project.setup.progress).label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-black">{project.setup.progress}%</p>
            </div>
          </div>
          <div className="w-full bg-c4c-rule rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${getProgressColor(project.setup.progress)}`}
              style={{ width: `${project.setup.progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-c4c-petrol">
            <span>{project.setup.completedTasks}/{project.setup.totalTasks} tasks</span>
            {project.setup.isComplete && (
              <span className="text-c4c-sage font-medium">✓ Complete</span>
            )}
          </div>
        </div>

        {/* Sites Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-c4c-sage" />
              <div className="ml-3">
                <p className="text-sm font-medium text-c4c-petrol">Project Sites</p>
                <p className={`text-xs ${getProgressStatus(project.sites.averageProgress).color}`}>
                  {getProgressStatus(project.sites.averageProgress).label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-black">{Math.round(project.sites.averageProgress)}%</p>
            </div>
          </div>
          <div className="w-full bg-c4c-rule rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${getProgressColor(project.sites.averageProgress)}`}
              style={{ width: `${project.sites.averageProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-c4c-petrol">
            <span>{project.sites.total} sites</span>
            <span>{project.sites.activeCount} active</span>
          </div>
        </div>

        {/* Stakeholder Mapping Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-c4c-cobalt" />
              <div className="ml-3">
                <p className="text-sm font-medium text-c4c-petrol">Stakeholders</p>
                <p className={`text-xs ${getProgressStatus(project.stakeholderMapping.averageProgress).color}`}>
                  {getProgressStatus(project.stakeholderMapping.averageProgress).label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-black">{Math.round(project.stakeholderMapping.averageProgress)}%</p>
            </div>
          </div>
          <div className="w-full bg-c4c-rule rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${getProgressColor(project.stakeholderMapping.averageProgress)}`}
              style={{ width: `${project.stakeholderMapping.averageProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-c4c-petrol">
            <span>{project.stakeholderMapping.completedGroups}/{project.stakeholderMapping.totalGroups} groups</span>
          </div>
        </div>

        {/* Theory of Change Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-c4c-burgundy" />
              <div className="ml-3">
                <p className="text-sm font-medium text-c4c-petrol">Theory of Change</p>
                <p className={`text-xs ${getProgressStatus(project.theoryOfChange.averageProgress).color}`}>
                  {getProgressStatus(project.theoryOfChange.averageProgress).label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-black">{Math.round(project.theoryOfChange.averageProgress)}%</p>
            </div>
          </div>
          <div className="w-full bg-c4c-rule rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${getProgressColor(project.theoryOfChange.averageProgress)}`}
              style={{ width: `${project.theoryOfChange.averageProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-c4c-petrol">
            <span>{project.theoryOfChange.stages.length} stages</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-c4c-rule">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'progress', name: 'Module Progress', icon: TrendingUp },
              { id: 'survey-calendar', name: 'Survey Calendar', icon: CalendarDays },
              { id: 'reviews', name: 'Reviews', icon: FileText },
              { id: 'timeline', name: 'Timeline', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`${
                  selectedTab === tab.id
                    ? 'border-c4c-petrol text-c4c-petrol'
                    : 'border-transparent text-c4c-petrol hover:text-black hover:border-c4c-rule'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Module Progress Tab */}
          {selectedTab === 'progress' && (
            <div className="space-y-8">
              {/* Project Description */}
              <div>
                <h3 className="text-lg font-medium text-black mb-3">Project Description</h3>
                <p className="text-c4c-petrol">{project.description || 'No description available.'}</p>
              </div>

              {/* Module Progress Details */}
              <div>
                <h3 className="text-lg font-medium text-black mb-4">Module Progress Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Project Setup Module */}
                  <div className="bg-gradient-to-br from-c4c-tint-cyan to-white border border-c4c-rule rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-c4c-tint-cyan rounded-lg p-3">
                          <Settings className="h-6 w-6 text-c4c-petrol" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-semibold text-black">Project Setup</h4>
                          <p className="text-sm text-c4c-petrol">Initialize project foundation</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-black mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{project.setup.progress}%</span>
                      </div>
                      <div className="w-full bg-c4c-rule rounded-full h-3">
                        <div
                          className="bg-c4c-petrol h-3 rounded-full transition-all duration-300"
                          style={{ width: `${project.setup.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Completed Tasks:</span>
                        <span className="font-medium text-black">{project.setup.completedTasks}/{project.setup.totalTasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Status:</span>
                        <span className={`font-medium ${project.setup.isComplete ? 'text-c4c-sage' : 'text-c4c-petrol'}`}>
                          {project.setup.isComplete ? 'Complete' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigateToReporting('setup')}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-rule rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-tint-cyan transition-colors"
                    >
                      View Setup Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  {/* Project Sites Module */}
                  <div className="bg-gradient-to-br from-c4c-tint-sage to-white border border-c4c-sage rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-c4c-tint-sage rounded-lg p-3">
                          <MapPin className="h-6 w-6 text-c4c-sage" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-semibold text-black">Project Sites</h4>
                          <p className="text-sm text-c4c-petrol">Configure site locations</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-black mb-2">
                        <span>Average Progress</span>
                        <span className="font-medium">{Math.round(project.sites.averageProgress)}%</span>
                      </div>
                      <div className="w-full bg-c4c-rule rounded-full h-3">
                        <div
                          className="bg-c4c-sage h-3 rounded-full transition-all duration-300"
                          style={{ width: `${project.sites.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Total Sites:</span>
                        <span className="font-medium text-black">{project.sites.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Active Sites:</span>
                        <span className="font-medium text-black">{project.sites.activeCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigateToReporting('sites')}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-sage rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-tint-sage transition-colors"
                    >
                      View Sites Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  {/* Stakeholder Mapping Module */}
                  <div className="bg-gradient-to-br from-c4c-tint-cyan to-white border border-c4c-cobalt rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-c4c-tint-cyan rounded-lg p-3">
                          <Users className="h-6 w-6 text-c4c-cobalt" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-semibold text-black">Stakeholder Mapping</h4>
                          <p className="text-sm text-c4c-petrol">Identify & analyze stakeholders</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-black mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(project.stakeholderMapping.averageProgress)}%</span>
                      </div>
                      <div className="w-full bg-c4c-cobalt rounded-full h-3">
                        <div
                          className="bg-c4c-cobalt h-3 rounded-full transition-all duration-300"
                          style={{ width: `${project.stakeholderMapping.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Total Groups:</span>
                        <span className="font-medium text-black">{project.stakeholderMapping.totalGroups}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Completed:</span>
                        <span className="font-medium text-black">{project.stakeholderMapping.completedGroups}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigateToReporting('stakeholders')}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-cobalt rounded-md shadow-sm text-sm font-medium text-c4c-cobalt bg-white hover:bg-c4c-tint-cyan transition-colors"
                    >
                      View Stakeholder Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                  {/* Theory of Change Module */}
                  <div className="bg-gradient-to-br from-c4c-tint-gold to-white border border-c4c-yellow rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-c4c-yellow rounded-lg p-3">
                          <Target className="h-6 w-6 text-black" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-md font-semibold text-black">Theory of Change</h4>
                          <p className="text-sm text-c4c-petrol">Define impact pathway</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-black mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(project.theoryOfChange.averageProgress)}%</span>
                      </div>
                      <div className="w-full bg-c4c-tint-gold rounded-full h-3">
                        <div
                          className="bg-c4c-yellow h-3 rounded-full transition-all duration-300"
                          style={{ width: `${project.theoryOfChange.averageProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Total Stages:</span>
                        <span className="font-medium text-black">{project.theoryOfChange.stages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-c4c-petrol">Status:</span>
                        <span className="font-medium text-black">Active</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavigateToReporting('toc')}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-yellow rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-tint-gold transition-colors"
                    >
                      View ToC Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Organization Info */}
              <div>
                <h4 className="text-md font-medium text-black mb-3">Organization</h4>
                <div
                  className="bg-c4c-grey-bg rounded-lg p-4 cursor-pointer hover:bg-c4c-rule transition-colors"
                  onClick={handleOrganizationClick}
                >
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-c4c-petrol mr-3" />
                    <div>
                      <p className="text-sm font-medium text-black">{project.organization.name}</p>
                      <p className="text-xs text-c4c-petrol">{project.organization.city}, {project.organization.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Survey Calendar Tab */}
          {selectedTab === 'survey-calendar' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-black">Survey Calendar</h3>
                  <p className="text-sm text-c4c-petrol mt-1">
                    Published surveys with scheduled dates. Set dates in survey settings to schedule surveys.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      calendarView === 'month'
                        ? 'bg-c4c-petrol text-white'
                        : 'bg-c4c-grey-bg text-c4c-petrol hover:bg-c4c-rule'
                    }`}
                  >
                    Month View
                  </button>
                  <button
                    onClick={() => setCalendarView('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      calendarView === 'list'
                        ? 'bg-c4c-petrol text-white'
                        : 'bg-c4c-grey-bg text-c4c-petrol hover:bg-c4c-rule'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>

              {!Array.isArray(publishedSurveys) || publishedSurveys.length === 0 ? (
                <div className="text-center py-12 text-c4c-petrol">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-c4c-rule" />
                  <p className="text-lg">No published surveys found</p>
                  <p className="text-sm mt-2">Surveys will appear here once they are published with scheduled dates.</p>
                </div>
              ) : (
                <>
                  {calendarView === 'month' ? (
                    // Month View - Group by month
                    <div className="space-y-8">
                      {Object.keys(surveysByMonth).length === 0 ? (
                        <div className="text-center py-8 text-c4c-petrol">
                          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-c4c-rule" />
                          <p>No surveys to display</p>
                        </div>
                      ) : (
                        <>
                          {/* Unscheduled surveys first */}
                          {surveysByMonth['unscheduled'] && surveysByMonth['unscheduled'].length > 0 && (
                            <div className="border-l-4 border-c4c-petrol pl-6">
                              <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-c4c-petrol" />
                                Unscheduled Surveys ({surveysByMonth['unscheduled'].length})
                              </h4>
                              <div className="space-y-3">
                                {surveysByMonth['unscheduled'].map(survey => {
                                  const startDate = survey.settings?.startDate ? new Date(survey.settings.startDate) : null;
                                  const endDate = survey.settings?.endDate ? new Date(survey.settings.endDate) : null;

                                  return (
                                    <div key={survey._id} className="bg-white border border-c4c-rule rounded-lg p-4 hover:shadow-md transition-shadow">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <h5 className="text-sm font-medium text-black">{survey.title}</h5>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-c4c-tint-cyan text-c4c-petrol">
                                              {survey.category === 'custom' ? survey.customCategoryName : survey.category}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-c4c-grey-bg text-c4c-petrol">
                                              No date set
                                            </span>
                                          </div>

                                          {survey.stakeholderGroup?.name && (
                                            <p className="text-xs text-c4c-petrol mb-1">
                                              Target: {survey.stakeholderGroup.name}
                                            </p>
                                          )}

                                          {survey.theoryOfChangeStage && (
                                            <p className="text-xs text-c4c-petrol mb-2">
                                              Stage {survey.theoryOfChangeStage.stageNumber}: {survey.theoryOfChangeStage.name}
                                            </p>
                                          )}

                                          <div className="flex items-center space-x-4 text-xs text-c4c-petrol">
                                            <div className="flex items-center">
                                              <Clock className="h-3 w-3 mr-1" />
                                              ~{survey.estimatedDuration} min
                                            </div>
                                          </div>
                                        </div>

                                        <div className="text-right ml-4">
                                          <div className="text-sm font-medium text-black">{survey.totalQuestions}</div>
                                          <div className="text-xs text-c4c-petrol">questions</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Scheduled surveys by month */}
                          {Object.keys(surveysByMonth)
                            .filter(key => key !== 'unscheduled')
                            .sort()
                            .reverse()
                            .map(monthKey => {
                              const [year, month] = monthKey.split('-');
                              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                              const surveys = surveysByMonth[monthKey];

                              return (
                                <div key={monthKey} className="border-l-4 border-c4c-petrol pl-6">
                                  <h4 className="text-lg font-semibold text-black mb-4">{monthName} ({surveys.length})</h4>
                                  <div className="space-y-3">
                                    {surveys.map(survey => {
                                      const startDate = survey.settings?.startDate ? new Date(survey.settings.startDate) : null;
                                      const endDate = survey.settings?.endDate ? new Date(survey.settings.endDate) : null;
                                      
                                      return (
                                        <div key={survey._id} className="bg-white border border-c4c-rule rounded-lg p-4 hover:shadow-md transition-shadow">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-2 mb-2">
                                                <h5 className="text-sm font-medium text-black">{survey.title}</h5>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-c4c-tint-cyan text-c4c-petrol">
                                                  {survey.category === 'custom' ? survey.customCategoryName : survey.category}
                                                </span>
                                              </div>
                                              
                                              {survey.stakeholderGroup?.name && (
                                                <p className="text-xs text-c4c-petrol mb-1">
                                                  Target: {survey.stakeholderGroup.name}
                                                </p>
                                              )}
                                              
                                              {survey.theoryOfChangeStage && (
                                                <p className="text-xs text-c4c-petrol mb-2">
                                                  Stage {survey.theoryOfChangeStage.stageNumber}: {survey.theoryOfChangeStage.name}
                                                </p>
                                              )}
                                              
                                              <div className="flex items-center space-x-4 text-xs text-c4c-petrol">
                                                <div className="flex items-center">
                                                  <Calendar className="h-3 w-3 mr-1" />
                                                  {startDate && startDate.toLocaleDateString()}
                                                </div>
                                                {endDate && (
                                                  <>
                                                    <span>→</span>
                                                    <div className="flex items-center">
                                                      <Calendar className="h-3 w-3 mr-1" />
                                                      {endDate.toLocaleDateString()}
                                                    </div>
                                                  </>
                                                )}
                                                <div className="flex items-center">
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  ~{survey.estimatedDuration} min
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="text-right ml-4">
                                              <div className="text-sm font-medium text-black">{survey.totalQuestions}</div>
                                              <div className="text-xs text-c4c-petrol">questions</div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </>
                      )}
                    </div>
                  ) : (
                    // List View - All surveys in chronological order
                    <div className="space-y-3">
                      {(Array.isArray(publishedSurveys) ? publishedSurveys : [])
                        .sort((a, b) => {
                          const dateA = a.settings?.startDate ? new Date(a.settings.startDate).getTime() : 0;
                          const dateB = b.settings?.startDate ? new Date(b.settings.startDate).getTime() : 0;
                          
                          // If both have no date, sort by title
                          if (dateA === 0 && dateB === 0) {
                            return a.title.localeCompare(b.title);
                          }
                          // If only A has no date, put it at the end
                          if (dateA === 0) return 1;
                          // If only B has no date, put it at the end
                          if (dateB === 0) return -1;
                          // Both have dates, sort by date (newest first)
                          return dateB - dateA;
                        })
                        .map(survey => {
                          const startDate = survey.settings?.startDate ? new Date(survey.settings.startDate) : null;
                          const endDate = survey.settings?.endDate ? new Date(survey.settings.endDate) : null;
                          
                          return (
                            <div key={survey._id} className="bg-white border border-c4c-rule rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h5 className="text-sm font-medium text-black">{survey.title}</h5>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-c4c-tint-cyan text-c4c-petrol">
                                      {survey.category === 'custom' ? survey.customCategoryName : survey.category}
                                    </span>
                                    {!startDate && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-c4c-grey-bg text-c4c-petrol">
                                        No date set
                                      </span>
                                    )}
                                  </div>
                                  
                                  {survey.stakeholderGroup?.name && (
                                    <p className="text-xs text-c4c-petrol mb-1">
                                      Target: {survey.stakeholderGroup.name}
                                    </p>
                                  )}

                                  {survey.theoryOfChangeStage && (
                                    <p className="text-xs text-c4c-petrol mb-2">
                                      Stage {survey.theoryOfChangeStage.stageNumber}: {survey.theoryOfChangeStage.name}
                                    </p>
                                  )}

                                  <div className="flex items-center space-x-4 text-xs text-c4c-petrol">
                                    {startDate ? (
                                      <>
                                        <div className="flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Start: {startDate.toLocaleDateString()}
                                        </div>
                                        {endDate && (
                                          <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            End: {endDate.toLocaleDateString()}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex items-center text-c4c-petrol">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Not scheduled
                                      </div>
                                    )}
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      ~{survey.estimatedDuration} min
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right ml-4">
                                  <div className="text-sm font-medium text-black">{survey.totalQuestions}</div>
                                  <div className="text-xs text-c4c-petrol">questions</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {selectedTab === 'reviews' && (
            <AdminReviewManagement 
              projectId={projectId}
              onReviewClick={handleReviewClick}
            />
          )}

          {/* Timeline Tab */}
          {selectedTab === 'timeline' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-black">Project Timeline</h3>
                <select
                  className="text-sm border-c4c-rule rounded-md"
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value as any)}
                >
                  <option value="all">All Events</option>
                  <option value="project">Project Events</option>
                  <option value="reviews">Reviews</option>
                  <option value="milestones">Milestones</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredTimeline.map((event) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.status === 'completed' ? 'bg-c4c-sage' :
                        event.status === 'in_progress' ? 'bg-c4c-cobalt' :
                        'bg-c4c-rule'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-black">
                          {event.title}
                        </p>
                        <span className="text-xs text-c4c-petrol">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-c4c-petrol mt-1">
                        {event.description}
                      </p>
                      {event.user && (
                        <p className="text-xs text-c4c-petrol mt-1">
                          by {event.user}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredTimeline.length === 0 && (
                <div className="text-center py-8 text-c4c-petrol">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-c4c-rule" />
                  <p className="text-sm">No timeline events found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}