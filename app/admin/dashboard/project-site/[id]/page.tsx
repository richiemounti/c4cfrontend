// app/admin/dashboard/project-site/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Building2, 
  FolderOpen, 
  MapPin, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Activity,
  TrendingUp,
  Target,
  FileText,
  Shield,
  Settings,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MessageCircle
} from 'lucide-react';

// Import API functions
import { 
  getProjectSiteDetail,
  getEntityTimeline,
  getSiteSetupTasks,
  getReviewQueue, 
  createReview, 
  updateReviewStatus, 
  addReviewComment,
  generateReviews 
} from '@/lib/api/adminDashboard';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';

interface PageProps {
  params: {
    id: string;
  };
}

interface ProjectSiteDetailData {
  _id: string;
  name: string;
  description: string;
  address: string;
  region: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'planned';
  overallProgress: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  size: number;
  sizeUnit: string;
  siteType: string;
  project: {
    _id: string;
    name: string;
    organization: {
      _id: string;
      name: string;
    };
  };
  setup: {
    _id: string;
    progress: number;
    isComplete: boolean;
    completedTasks: number;
    totalTasks: number;
    requiredTasks: number;
    completedRequiredTasks: number;
  };
  consultationPlan: {
    _id: string;
    completionPercentage: number;
    totalQuestions: number;
    answeredQuestions: number;
    isComplete: boolean;
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
  reviews?: Array<{
    _id: string;
    entityType: string;
    title: string;
    status: string;
    priority: string;
    progress: number;
    dueDate: string;
    createdAt: string;
  }>;
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

interface StakeholderGroup {
  _id: string;
  project: string;
  projectSite?: string;
  category: {
    _id: string;
    name: string;
  };
  name: string;
  description?: string;
  tasks: Array<{
    taskType: string;
    responses: Array<{
      optionId: string;
      description: string;
      _id: string;
    }>;
    rating: number;
    updatedAt: string;
    _id: string;
  }>;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  creator: {
    _id: string;
    name: string;
  };
  lastUpdatedBy: {
    _id: string;
    name: string;
  };
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StakeholderGroupsData {
  stakeholderGroups: StakeholderGroup[];
  groupsByCategory: Record<string, StakeholderGroup[]>;
}

export default function ProjectSiteDetailPage({ params }: PageProps) {
  const router = useRouter();
  const siteId = params.id;
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<ProjectSiteDetailData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [setupTasks, setSetupTasks] = useState<any>(null);
  const [stakeholderData, setStakeholderData] = useState<StakeholderGroupsData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'setup' | 'consultation' | 'stakeholders' | 'reviews' | 'timeline' | 'risks'>('overview');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'site' | 'reviews' | 'milestones'>('all');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const getSiteIdFromReview = (review: any): string | null => {
    if (!review.projectSite) return null;
    
    // If projectSite is a string
    if (typeof review.projectSite === 'string') {
      return review.projectSite;
    }
    
    // If projectSite is an object (populated), get the _id
    if (typeof review.projectSite === 'object' && review.projectSite._id) {
      return review.projectSite._id;
    }
    
    return null;
  };



  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
        
        // First get site details to get the project ID
        const siteData = await getProjectSiteDetail(siteId);
        setSite(siteData);
        
        if (siteData?.project?._id) {
          // Fetch site details, timeline, setup tasks, and stakeholder groups in parallel
          const [timelineData, setupData, stakeholderResponse, allReviews] = await Promise.all([
            getEntityTimeline('projectSite', siteId),
            getSiteSetupTasks(siteId),
            stakeholderMappingApi.getStakeholderGroups(siteData.project._id, siteId),
            getReviewQueue()
          ]);

          setTimeline(timelineData);
          setSetupTasks(setupData);
          setStakeholderData(stakeholderResponse.data.data);

          // Debug: Log site filtering
          console.log('All reviews for site filtering:', allReviews);
          console.log('Looking for siteId:', siteId);

          // Filter reviews for this site
          const siteReviews = allReviews.filter((review: any) => {
            const reviewSiteId = typeof review.projectSite === 'string' 
              ? review.projectSite 
              : review.projectSite?._id;
            
            console.log('Review site ID:', reviewSiteId, 'vs', siteId, 'Match:', reviewSiteId === siteId);
            
            return reviewSiteId === siteId;
          });
          
          console.log('Filtered site reviews:', siteReviews);
          setReviews(siteReviews);
        }
        
      } catch (error) {
        console.error('Error fetching site data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'planned': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleProjectClick = () => {
    if (site?.project._id) {
      router.push(`/admin/dashboard/project/${site.project._id}`);
    }
  };

  const handleOrganizationClick = () => {
    if (site?.project.organization._id) {
      router.push(`/admin/dashboard/organization/${site.project.organization._id}`);
    }
  };

  const filteredTimeline = timeline.filter(event => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'site') return ['site_created', 'setup_completed', 'setup_started', 'consultation_completed'].includes(event.type);
    if (timelineFilter === 'reviews') return ['review_created', 'review_approved', 'review_rejected'].includes(event.type);
    if (timelineFilter === 'milestones') return ['milestone', 'stage_completed', 'toc_stage_completed'].includes(event.type);
    return true;
  });

  // Get stakeholder groups for this specific site
  const siteStakeholderGroups = stakeholderData?.stakeholderGroups.filter(sg => sg.projectSite === siteId) || [];

  const refreshReviews = async () => {
    try {
      const allReviews = await getReviewQueue();
      const projectReviews = allReviews.filter((review: any) => {
        const reviewProjectId = typeof review.project === 'string' 
          ? review.project 
          : review.project?._id;
        return reviewProjectId === site?.project._id;
      });
      setReviews(projectReviews);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    }
  };

  

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Site Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-gray-600">
              <button 
                onClick={handleProjectClick}
                className="hover:text-blue-600 cursor-pointer"
              >
                {site.project.name}
              </button>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(site.status)}`}>
            {site.status}
          </span>
          <div className="flex space-x-2 ml-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ExternalLink className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={() => router.push(`/project-sites/${siteId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Site
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{site.overallProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Setup Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{site.setup.progress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Consultation</p>
              <p className="text-2xl font-semibold text-gray-900">{site.consultationPlan?.completionPercentage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stakeholder Groups</p>
              <p className="text-2xl font-semibold text-gray-900">{siteStakeholderGroups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{site.reviews?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Risks</p>
              <p className="text-2xl font-semibold text-gray-900">{site.risks.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'setup', name: 'Setup Tasks', icon: Settings },
              { id: 'consultation', name: 'Consultation Plan', icon: MessageCircle },
              { id: 'stakeholders', name: 'Stakeholders', icon: Users },
              { id: 'reviews', name: 'Reviews', icon: FileText },
              { id: 'timeline', name: 'Timeline', icon: Activity },
              { id: 'risks', name: 'Risks', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Site Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Site Description</h3>
                <p className="text-gray-600">{site.description || 'No description available.'}</p>
              </div>

              {/* Site Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Location Details</h4>
                  <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Address:</span>
                      <span className="text-sm text-gray-700">{site.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Region:</span>
                      <span className="text-sm text-gray-700">{site.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">City:</span>
                      <span className="text-sm text-gray-700">{site.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Country:</span>
                      <span className="text-sm text-gray-700">{site.country}</span>
                    </div>
                    {site.coordinates && site.coordinates.lat != null && site.coordinates.lng != null && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Coordinates:</span>
                        <span className="text-sm text-gray-700">
                          {site.coordinates.lat.toFixed(6)}, {site.coordinates.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Site Specifications</h4>
                  <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Size:</span>
                      <span className="text-sm text-gray-700">{site.size} {site.sizeUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="text-sm text-gray-700 capitalize">{site.siteType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                        {site.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Setup Progress</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <span>Site Setup</span>
                      <span>{site.setup.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${site.setup.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {site.setup.completedRequiredTasks} of {site.setup.requiredTasks} required tasks completed
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Consultation Plan</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <span>Consultation Progress</span>
                      <span>{site.consultationPlan?.completionPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${site.consultationPlan?.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {site.consultationPlan?.answeredQuestions || 0} of {site.consultationPlan?.totalQuestions || 0} questions completed
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Theory of Change</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <span>ToC Progress</span>
                      <span>{site.theoryOfChange.averageProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${site.theoryOfChange.averageProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {site.theoryOfChange.stages.length} stages initialized
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Project & Organization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={handleProjectClick}
                  >
                    <div className="flex items-center">
                      <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{site.project.name}</p>
                        <p className="text-xs text-gray-500">Project</p>
                      </div>
                    </div>
                  </div>
                  {site.project.organization && (
                    <div 
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={handleOrganizationClick}
                    >
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{site.project.organization.name}</p>
                          <p className="text-xs text-gray-500">Organization</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacts */}
              {site.contacts && site.contacts.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Site Contacts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {site.contacts.map((contact, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                            {contact.role && (
                              <p className="text-xs text-gray-500">{contact.role}</p>
                            )}
                            {contact.email && (
                              <p className="text-xs text-blue-600 mt-1">{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-xs text-gray-500 mt-1">{contact.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Setup Tasks Tab */}
          {selectedTab === 'setup' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Site Setup Tasks</h3>
                <div className="text-sm text-gray-500">
                  {setupTasks?.summary.completedRequiredTasks || 0} of {setupTasks?.summary.requiredTasks || 0} required tasks completed
                  {setupTasks?.setup.isComplete && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Setup Complete
                    </span>
                  )}
                </div>
              </div>

              {setupTasks && Object.keys(setupTasks.tasksByStep || {}).map((step) => (
                <div key={step} className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Step {step}</h4>
                  <div className="space-y-3">
                    {setupTasks.tasksByStep[step].map((task: any) => (
                      <div key={task._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {task.isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.fieldLabel}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.isRequired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              task.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.isCompleted ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        {task.helperText && (
                          <p className="text-xs text-gray-400 mt-2 ml-8">{task.helperText}</p>
                        )}
                        {task.responseData && (
                          <div className="text-xs text-gray-600 mt-2 ml-8 bg-white p-2 rounded border">
                            <strong>Response:</strong> {JSON.stringify(task.responseData)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!setupTasks && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Site setup has not been initialized yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Consultation Plan Tab */}
          {selectedTab === 'consultation' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Consultation Plan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{site.consultationPlan?.totalQuestions || 0}</div>
                  <div className="text-sm text-blue-800">Total Questions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{site.consultationPlan?.answeredQuestions || 0}</div>
                  <div className="text-sm text-green-800">Answered</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{site.consultationPlan?.completionPercentage || 0}%</div>
                  <div className="text-sm text-orange-800">Completion</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {site.consultationPlan?.isComplete ? 'Complete' : 'In Progress'}
                  </div>
                  <div className="text-sm text-gray-800">Status</div>
                </div>
              </div>

              {site.consultationPlan ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Consultation plan progress: {site.consultationPlan.completionPercentage}% complete
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${site.consultationPlan.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No consultation plan found for this site.</p>
                </div>
              )}
            </div>
          )}

          {/* Stakeholders Tab */}
          {selectedTab === 'stakeholders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Site Stakeholder Mapping</h3>
                <button 
                  onClick={() => router.push(`/admin/dashboard/stakeholder-mapping/create?projectId=${site.project._id}&siteId=${siteId}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder Group
                </button>
              </div>
              
              {/* Overall Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{siteStakeholderGroups.length}</div>
                  <div className="text-sm text-blue-800">Total Groups</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {siteStakeholderGroups.filter(sg => sg.completionStatus === 'completed').length}
                  </div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {siteStakeholderGroups.filter(sg => sg.completionStatus === 'in_progress').length}
                  </div>
                  <div className="text-sm text-yellow-800">In Progress</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {siteStakeholderGroups.filter(sg => sg.completionStatus === 'not_started').length}
                  </div>
                  <div className="text-sm text-gray-800">Not Started</div>
                </div>
              </div>

              {/* Site Stakeholder Groups by Category */}
              {siteStakeholderGroups.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(
                    siteStakeholderGroups.reduce((acc, sg) => {
                      const categoryName = sg.category?.name || 'Uncategorized';
                      if (!acc[categoryName]) acc[categoryName] = [];
                      acc[categoryName].push(sg);
                      return acc;
                    }, {} as Record<string, StakeholderGroup[]>)
                  ).map(([categoryName, groups]) => (
                    <div key={categoryName} className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{categoryName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map((group) => (
                          <div 
                            key={group._id} 
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/dashboard/stakeholder-mapping/${group._id}`)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-900">{group.name}</h5>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompletionStatusColor(group.completionStatus)}`}>
                                {group.completionStatus.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {group.description && (
                              <p className="text-xs text-gray-600 mb-3">{group.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>Tasks completed: {group.tasks.length}/6</span>
                              <span>Updated: {new Date(group.updatedAt).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round((group.tasks.length / 6) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${Math.round((group.tasks.length / 6) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Show some task details */}
                            {group.tasks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Recent tasks:</p>
                                <div className="flex flex-wrap gap-1">
                                  {group.tasks.slice(0, 3).map((task, index) => (
                                    <span 
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                    >
                                      {task.taskType}
                                    </span>
                                  ))}
                                  {group.tasks.length > 3 && (
                                    <span className="text-xs text-gray-400">+{group.tasks.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No stakeholder groups found for this site.</p>
                  <button 
                    onClick={() => router.push(`/admin/dashboard/stakeholder-mapping/create?projectId=${site.project._id}&siteId=${siteId}`)}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create the first stakeholder group →
                  </button>
                </div>
              )}

              {/* Link to Project-Level Stakeholders */}
              {stakeholderData && stakeholderData.stakeholderGroups.filter(sg => !sg.projectSite).length > 0 && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-blue-900">Project-Level Stakeholder Groups</h5>
                      <p className="text-xs text-blue-700">
                        {stakeholderData.stakeholderGroups.filter(sg => !sg.projectSite).length} groups available at project level
                      </p>
                    </div>
                    <button 
                      onClick={handleProjectClick}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Project Stakeholders →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {selectedTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Site Reviews</h3>
                <button 
                  onClick={() => router.push(`/admin/dashboard/reviews?projectSiteId=${siteId}`)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Reviews →
                </button>
              </div>

              <div className="space-y-4">
                {site.reviews && site.reviews.length > 0 ? (
                  site.reviews.map((review: any) => (
                    <div key={review._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {getReviewStatusIcon(review.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{review.title}</p>
                            <p className="text-xs text-gray-500 capitalize mt-1">{review.entityType.replace('_', ' ')}</p>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(review.priority)}`}>
                                {review.priority} priority
                              </span>
                              <div className="text-xs text-gray-500">
                                Progress: {review.progress}%
                              </div>
                            </div>
                            
                            {review.dueDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {new Date(review.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviews found for this site.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {selectedTab === 'timeline' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Site Timeline</h3>
                <select 
                  className="text-sm border-gray-300 rounded-md"
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value as any)}
                >
                  <option value="all">All Events</option>
                  <option value="site">Site Events</option>
                  <option value="reviews">Reviews</option>
                  <option value="milestones">Milestones</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredTimeline.map((event) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.status === 'completed' ? 'bg-green-500' :
                        event.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.description}
                      </p>
                      {event.user && (
                        <p className="text-xs text-blue-600 mt-1">
                          by {event.user}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredTimeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No timeline events found.</p>
                </div>
              )}
            </div>
          )}

          {/* Risks Tab */}
          {selectedTab === 'risks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Site Risks</h3>
                <button 
                  onClick={() => router.push(`/admin/dashboard/risks?projectSiteId=${siteId}`)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Risks →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{site.risks.total}</div>
                  <div className="text-sm text-gray-800">Total Risks</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{site.risks.high}</div>
                  <div className="text-sm text-red-800">High Risk</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{site.risks.medium}</div>
                  <div className="text-sm text-yellow-800">Medium Risk</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{site.risks.low}</div>
                  <div className="text-sm text-green-800">Low Risk</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Recent Risks</h4>
                {site.risks.recent.map((risk: any) => (
                  <div key={risk._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{risk.name}</h5>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{risk.riskType}</p>
                        {risk.owner && (
                          <p className="text-xs text-blue-600 mt-1">Owner: {risk.owner}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          risk.riskScore === 'high' ? 'bg-red-100 text-red-800' :
                          risk.riskScore === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.riskScore} risk
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {site.risks.recent.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No risks found for this site.</p>
                  <button 
                    onClick={() => router.push(`/risks/create?projectSiteId=${siteId}`)}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add the first risk →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}