// app/admin/dashboard/organization/[id]/page.tsx
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
  MoreVertical,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Activity,
  TrendingUp,
  Target,
  FileText,
  Shield,
  Mail,
  Phone,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

// Import the API functions
import {
  getEntityTimeline,
} from '@/lib/api/adminDashboard';
import { getOrganization, updateOrganization } from '@/lib/api/organization';
import { getOrganizationProjects } from '@/lib/api/project';
import { getProjectSetupProgress } from '@/lib/api/projectSetup';
import { getProjectSiteSetupProgress } from '@/lib/api/projectSiteSetup';
import { getOrganizationUsers } from '@/lib/api/user';
import { getWorkloadSummary, getSupportEscalationStats, listAccountManagers } from '@/lib/api/workload';
import { getPulseSurveyStats } from '@/lib/api/pulseSurvey';
import { useToast } from '@/hooks/use-toast';
import { User, AccountManager } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

interface ProjectDetail {
  _id: string;
  name: string;
  description: string;
  location: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  stage: string;
  startDate: string;
  endDate?: string;
  progress: number;
  setup: {
    progress: number;
    isComplete: boolean;
    completedTasks: number;
    totalTasks: number;
  };
  sites: {
    total: number;
    summary: any[];
    averageProgress: number;
  };
  stakeholderMapping: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  risks: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  lastActivity: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  priority?: 'high' | 'medium' | 'low';
}

interface KeyContact {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  primaryRole: string;
}

export default function OrganizationDetailPage({ params }: PageProps) {
  const router = useRouter();
  const organizationId = params.id;
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'project' | 'reviews' | 'milestones'>('all');
  const [keyContacts, setKeyContacts] = useState<KeyContact[]>([]);
  const [orgWorkload, setOrgWorkload] = useState<any>(null);
  const [orgSatisfaction, setOrgSatisfaction] = useState<any>(null);
  const [orgPulseSurvey, setOrgPulseSurvey] = useState<any>(null);
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [selectedAccountManagerId, setSelectedAccountManagerId] = useState<string>('');
  const [savingAccountManager, setSavingAccountManager] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        // Fetch organization details
        const orgRes = await getOrganization(organizationId);
        setOrganization(orgRes.data);
        setSelectedAccountManagerId((orgRes.data as any)?.assignedAccountManagerId || '');

        // Fetch staff eligible to be assigned as this org's account manager
        try {
          const ams = await listAccountManagers();
          setAccountManagers(ams);
        } catch (error) {
          console.warn('Failed to fetch account managers:', error);
        }

        // Fetch organization projects
        const projectsRes = await getOrganizationProjects(organizationId, 1, 50);
        
        // Process projects with setup progress
        const processedProjects: ProjectDetail[] = await Promise.all(
          projectsRes.data.map(async (project: any) => {
            let setupProgress = { progress: 0, isComplete: false, completedTasks: 0, totalTasks: 0 };
            let sitesProgress = { total: 0, averageProgress: 0 };
            
            try {
              // Get project setup progress
              const setupRes = await getProjectSetupProgress(project._id);
              setupProgress = {
                progress: setupRes.progress || 0,
                isComplete: setupRes.isComplete || false,
                completedTasks: setupRes.completedTasks || 0,
                totalTasks: setupRes.totalTasks || 0
              };
            } catch (error) {
              console.warn(`Failed to fetch setup progress for project ${project._id}:`, error);
            }

            // Calculate sites progress if sites exist
            if (project.sites && project.sites.length > 0) {
              sitesProgress.total = project.sites.length;
              
              // Get site setup progress for each site
              const siteProgresses = await Promise.all(
                project.sites.map(async (site: any) => {
                  try {
                    const siteSetupRes = await getProjectSiteSetupProgress(site._id);
                    return siteSetupRes.progress || 0;
                  } catch (error) {
                    console.warn(`Failed to fetch site setup progress for site ${site._id}:`, error);
                    return 0;
                  }
                })
              );
              
              sitesProgress.averageProgress = siteProgresses.reduce((sum, progress) => sum + progress, 0) / siteProgresses.length;
            }

            return {
              _id: project._id,
              name: project.name,
              description: project.description || '',
              location: project.location || '',
              status: project.status || 'planning',
              stage: project.stage || 'onboarding',
              startDate: project.startDate,
              endDate: project.endDate,
              progress: setupProgress.progress,
              setup: setupProgress,
              sites: {
                total: sitesProgress.total,
                summary: project.sites || [],
                averageProgress: sitesProgress.averageProgress
              },
              stakeholderMapping: {
                total: 0,
                completed: 0,
                inProgress: 0,
                notStarted: 0
              },
              risks: {
                total: 0,
                high: 0,
                medium: 0,
                low: 0
              },
              lastActivity: project.updatedAt
            };
          })
        );
        
        setProjects(processedProjects);
        
        // Fetch key contacts (managers and project creators)
        try {
          const usersRes = await getOrganizationUsers(organizationId);
          const users = usersRes.data || [];
          
          // Filter for managers and project creators
          const contacts = users.filter((user: User) => {
            return user.roles.some(role => 
              (role.role === 'manager' || role.role === 'projectCreator') &&
              role.organization === organizationId
            );
          }).map((user: User) => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.roles.find(r => r.organization === organizationId)?.role || user.primaryRole,
            photo: user.photo,
            primaryRole: user.primaryRole
          }));
          
          setKeyContacts(contacts);
        } catch (error) {
          console.warn('Failed to fetch key contacts:', error);
        }
        
        // Fetch organization-level workload (filtered by organization)
        try {
          const workloadRes = await getWorkloadSummary();
          // Filter workload items for this organization
          if (workloadRes && workloadRes.items) {
            const orgItems = workloadRes.items.filter((item: any) => 
              item.organization._id === organizationId
            );
            setOrgWorkload({
              ...workloadRes,
              items: orgItems,
              totalItems: orgItems.length,
              activeProjects: orgItems.filter((i: any) => i.type === 'project').length,
              activeSites: orgItems.filter((i: any) => i.type === 'site').length
            });
          }
        } catch (error) {
          console.warn('Failed to fetch organization workload:', error);
        }
        
        // Fetch organization-level satisfaction metrics
        try {
          const satisfactionRes = await getSupportEscalationStats();
          setOrgSatisfaction(satisfactionRes);
        } catch (error) {
          console.warn('Failed to fetch satisfaction stats:', error);
        }
        
        // Fetch organization-level pulse survey data
        try {
          const pulseRes = await getPulseSurveyStats();
          setOrgPulseSurvey(pulseRes);
        } catch (error) {
          console.warn('Failed to fetch pulse survey stats:', error);
        }
        
        // Generate timeline for organization
        try {
          const timelineEvents: TimelineEvent[] = [];
          
          // Add organization creation event
          timelineEvents.push({
            id: '1',
            type: 'organization_created',
            title: 'Organization Onboarded',
            description: `${orgRes.data.name} was successfully onboarded to the platform`,
            date: orgRes.data.createdAt.toString(),
            status: 'completed'
          });
          
          // Fetch timeline for each project
          for (const project of processedProjects) {
            try {
              const projectTimelineRes = await getEntityTimeline('project', project._id);
              projectTimelineRes.forEach((event: any) => {
                timelineEvents.push({
                  id: `${project._id}_${event.id}`,
                  type: event.type,
                  title: `${project.name}: ${event.title}`,
                  description: event.description,
                  date: event.date,
                  status: event.status,
                  priority: event.priority
                });
              });
            } catch (projectTimelineError) {
              console.warn(`Failed to fetch timeline for project ${project._id}:`, projectTimelineError);
              timelineEvents.push({
                id: `project_${project._id}`,
                type: 'project_created',
                title: 'Project Created',
                description: `${project.name} was initiated`,
                date: project.startDate,
                status: 'completed'
              });
            }
          }
          
          timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTimeline(timelineEvents);
        } catch (error) {
          console.warn('Failed to generate organization timeline:', error);
        }
        
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganizationData();
    }
  }, [organizationId]);

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-c4c-tint-cyan text-c4c-cobalt';
      case 'projectCreator': return 'bg-c4c-tint-sage text-black';
      default: return 'bg-c4c-grey-bg text-c4c-petrol';
    }
  };

  const getSatisfactionEmoji = (percentage: number) => {
    if (percentage >= 80) return <Smile className="h-5 w-5 text-c4c-sage" />;
    if (percentage >= 60) return <Meh className="h-5 w-5 text-c4c-yellow" />;
    return <Frown className="h-5 w-5 text-c4c-burgundy" />;
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/admin/dashboard/project/${projectId}`);
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleSaveAccountManager = async () => {
    setSavingAccountManager(true);
    try {
      await updateOrganization(organizationId, {
        assignedAccountManagerId: selectedAccountManagerId || null,
      });
      toast({ title: 'Account manager updated' });
    } catch (error) {
      console.error('Failed to update account manager:', error);
      toast({
        title: "Couldn't update account manager",
        variant: 'destructive',
      });
    } finally {
      setSavingAccountManager(false);
    }
  };

  const filteredTimeline = timeline.filter(event => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'project') return ['project_created', 'site_added', 'setup_completed'].includes(event.type);
    if (timelineFilter === 'reviews') return ['review_approved'].includes(event.type);
    if (timelineFilter === 'milestones') return ['milestone', 'stage_completed'].includes(event.type);
    return true;
  });

  const selectedProjectTimeline = selectedProject ? 
    timeline.filter(event => event.id.includes(selectedProject)) : filteredTimeline;

  // Calculate completed sites
  const completedSites = projects.reduce((sum, p) => 
    sum + p.sites.summary.filter((s: any) => s.status === 'completed').length, 0
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-c4c-petrol border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Organization Not Found</h1>
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
            <h1 className="text-3xl font-bold text-black">{organization.name}</h1>
            <p className="text-c4c-petrol">{organization.city}, {organization.country}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-c4c-rule rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={() => router.push(`/projects/create?organizationId=${organizationId}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 text-c4c-petrol" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Total Projects</dt>
                <dd className="text-2xl font-semibold text-black">{projects.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-c4c-sage" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Total Sites</dt>
                <dd className="text-2xl font-semibold text-black">
                  {projects.reduce((sum, p) => sum + p.sites.total, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-c4c-petrol" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Completed Sites</dt>
                <dd className="text-2xl font-semibold text-black">
                  {completedSites}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-c4c-petrol" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Key Personnel</dt>
                <dd className="text-2xl font-semibold text-black">
                  {keyContacts.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Organization-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Workload Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-black mb-4">Organization Workload</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-black">
                {orgWorkload?.activeProjects || 0}
              </div>
              <div className="text-xs text-c4c-petrol mt-1">Active Projects</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-black">
                {orgWorkload?.activeSites || 0}
              </div>
              <div className="text-xs text-c4c-petrol mt-1">Active Sites</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-black">
                {orgWorkload?.totalItems || 0}
              </div>
              <div className="text-xs text-c4c-petrol mt-1">Total Workload</div>
            </div>
          </div>
        </div>

        {/* Satisfaction Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black">Client Satisfaction</h3>
            {orgSatisfaction && (
              <div className="flex items-center space-x-2">
                {getSatisfactionEmoji(orgSatisfaction.overallSatisfaction || 0)}
                <span className="text-lg font-semibold text-black">
                  {orgSatisfaction.overallSatisfaction || 0}%
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-c4c-tint-cyan rounded-lg border border-c4c-cobalt">
              <div className="text-xl font-bold text-c4c-cobalt">
                {orgPulseSurvey?.totalResponses || 0}
              </div>
              <div className="text-xs text-c4c-petrol mt-1">Pulse Surveys</div>
            </div>
            <div className="text-center p-3 bg-c4c-tint-coral rounded-lg border border-c4c-burgundy">
              <div className="text-xl font-bold text-c4c-burgundy">
                {orgSatisfaction?.clientIncidents || 0}
              </div>
              <div className="text-xs text-c4c-petrol mt-1">Incidents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Manager */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h3 className="text-lg font-medium text-black mb-1">Account Manager</h3>
        <p className="text-sm text-c4c-petrol mb-4">
          The staff member this organization's "Message Mentor" button connects to. If unset, it falls back to whichever account manager has the lowest current workload.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={selectedAccountManagerId}
            onChange={(e) => setSelectedAccountManagerId(e.target.value)}
            className="flex-1 border border-c4c-rule rounded-md px-3 py-2 text-sm text-black"
          >
            <option value="">— None (use workload-based fallback) —</option>
            {accountManagers.map((am) => (
              <option key={am._id} value={am._id}>
                {am.name} ({am.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleSaveAccountManager}
            disabled={savingAccountManager}
            className="px-4 py-2 border-2 border-c4c-petrol text-c4c-petrol text-sm font-medium rounded-md hover:bg-c4c-petrol hover:text-white disabled:opacity-60"
          >
            {savingAccountManager ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Key Contacts */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-black">Key Contacts</h3>
          <button
            onClick={() => router.push(`/users?organizationId=${organizationId}`)}
            className="text-sm text-c4c-petrol hover:text-black font-medium"
          >
            View All Users →
          </button>
        </div>
        
        {keyContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyContacts.map((contact) => (
              <div
                key={contact._id}
                className="border border-c4c-rule rounded-lg p-4 hover:border-c4c-petrol hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleUserClick(contact._id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {contact.photo ? (
                      <img
                        src={contact.photo}
                        alt={contact.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-c4c-rule flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-c4c-petrol" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-c4c-petrol truncate flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {contact.email}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleBadgeColor(contact.role)}`}>
                      {contact.role === 'projectCreator' ? 'Project Creator' : 'Manager'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-c4c-petrol">
            <Users className="h-12 w-12 mx-auto mb-3 text-c4c-rule" />
            <p className="text-sm">No key contacts found for this organization.</p>
            <button
              onClick={() => router.push(`/users/invite?organizationId=${organizationId}`)}
              className="mt-2 text-c4c-petrol hover:text-black font-medium text-sm"
            >
              Invite Users →
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-c4c-rule">
              <h3 className="text-lg font-medium text-black">Projects</h3>
            </div>

            <div className="divide-y divide-c4c-rule">
              {projects.map((project) => (
                <div key={project._id} className="px-6 py-4 hover:bg-c4c-grey-bg cursor-pointer" onClick={() => handleProjectClick(project._id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-black">{project.name}</h4>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}>
                          {project.stage}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-c4c-petrol">
                        {project.location} • {project.sites.total} sites • Setup: {project.setup.progress}%
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-c4c-petrol mr-2">Setup Progress:</span>
                          <div className="w-32 bg-c4c-rule rounded-full h-2">
                            <div
                              className="bg-c4c-petrol h-2 rounded-full"
                              style={{ width: `${project.setup.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-c4c-petrol ml-2">{project.setup.progress}%</span>
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="mt-3 flex space-x-4 text-xs text-c4c-petrol">
                        <span>Setup: {project.setup.completedTasks}/{project.setup.totalTasks} tasks</span>
                        <span>Sites: {project.sites.total} ({Math.round(project.sites.averageProgress)}% avg)</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className={`text-sm px-3 py-1 rounded ${
                          selectedProject === project._id
                            ? 'bg-c4c-tint-cyan text-c4c-petrol'
                            : 'text-c4c-petrol hover:text-black'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(
                            selectedProject === project._id ? null : project._id
                          );
                        }}
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                      <button
                        className="text-c4c-petrol hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project._id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="px-6 py-8 text-center text-c4c-petrol">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-c4c-rule" />
                  <p>No projects found for this organization.</p>
                  <button
                    onClick={() => router.push(`/projects/create?organizationId=${organizationId}`)}
                    className="mt-2 text-c4c-petrol hover:text-black font-medium"
                  >
                    Create the first project →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-c4c-rule">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">
                  {selectedProject ? 'Project Timeline' : 'Organization Timeline'}
                </h3>
                <select
                  className="text-sm border-c4c-rule rounded-md"
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value as any)}
                >
                  <option value="all">All Events</option>
                  <option value="project">Projects</option>
                  <option value="reviews">Reviews</option>
                  <option value="milestones">Milestones</option>
                </select>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="px-6 py-4 space-y-4">
                {selectedProjectTimeline.map((event) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.status === 'completed' ? 'bg-c4c-sage' :
                        event.status === 'in_progress' ? 'bg-c4c-cobalt' :
                        'bg-c4c-rule'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black">
                        {event.title}
                      </p>
                      <p className="text-xs text-c4c-petrol">
                        {event.description}
                      </p>
                      <p className="text-xs text-c4c-petrol mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {selectedProjectTimeline.length === 0 && (
                  <div className="text-center py-8 text-c4c-petrol">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-c4c-rule" />
                    <p className="text-sm">No timeline events found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}