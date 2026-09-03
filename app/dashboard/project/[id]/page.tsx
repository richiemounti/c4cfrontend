// app/dashboard/project/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, Edit, Plus, FileText,
  Map, GitBranch, ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { getProjectSetup, getProjectSetupProgress } from '@/lib/api/projectSetup';
import { LastEditedBy } from '@/components/shared/LastEditedBy';


interface PageParams {
  id: string;
}

const ProjectDetailsPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [project, setProject] = useState<Project | any>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [setupProgress, setSetupProgress] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAllSites, setShowAllSites] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const projectResponse = await getProject(projectId);
      setProject(projectResponse.data);

      if (projectResponse.data.organization) {
        const orgId = typeof projectResponse.data.organization === 'object' 
          ? projectResponse.data.organization._id 
          : projectResponse.data.organization;
        setOrganizationId(orgId);
      }
      
      try {
        const sitesResponse = await getProjectSites(projectId);
        setSites(sitesResponse.data);
      } catch (siteError) {
        console.error('Error fetching project sites:', siteError);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const fetchSetupData = async () => {
    try {
      const response = await getProjectSetup(projectId);
      setSetupData(response);
    } catch (error) {
      console.error('Error fetching setup data:', error);
    }

    try {
      const progressResponse = await getProjectSetupProgress(projectId);
      setSetupProgress(progressResponse?.progress ?? null);
    } catch (error) {
      console.error('Error fetching setup progress:', error);
    }
  };

  const getSetupCtaLabel = () => {
    if (setupProgress === null || setupProgress === 0) return 'Start Project Setup';
    if (setupProgress >= 100) return 'Edit Project Setup';
    return 'Continue Project Setup';
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    fetchData();
    fetchSetupData();
  }, [projectId, authLoading, isAuthenticated, refreshTrigger, router]);

  const handleGoBackToOrganization = () => {
    if (organizationId) {
      router.push(`/dashboard/organization/${organizationId}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleCreateSite = () => {
    router.push(`/dashboard/project/${projectId}/create-site`);
  };

  const getTaskValue = (fieldName: string) => {
    if (!setupData?.tasks) return null;
    const task = setupData.tasks.find(t => t.fieldName === fieldName);
    return task?.responseData || null;
  };

  const formatTaskValue = (value: any): string => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Determine how many sites to display
  const displayedSites = showAllSites ? sites : sites.slice(0, 6);
  const hasMoreSites = sites.length > 6;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Loading...'}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={handleGoBackToOrganization}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Organization
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={handleGoBackToOrganization}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Organization
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">{project.name}</h1>
              {organizationId && (
                <HeaderHelpActions
                  organizationId={organizationId}
                  videoSrc="/videos/instructional/project-setup/creating-project.mp4"
                  videoTitle="Watch the Video Tutorial"
                />
              )}
              <LastEditedBy
                name={typeof project.lastUpdatedBy === 'object' ? project.lastUpdatedBy?.name : undefined}
                timestamp={project.updatedAt}
                className="mt-1"
              />

              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
                <span className="text-gray-500 text-sm">
                  {sites.length} {sites.length === 1 ? 'site' : 'sites'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Your Project */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-2xl font-medium text-stratosphere mb-6">
              Your Project
            </h2>

            {/* Project Description */}
            {project.description && (
              <div className="bg-sky-tint p-6 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-stratosphere mb-2">Description</h3>
                <p className="text-stratosphere whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-start">
                <MapPin className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-stratosphere font-medium">{project.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                  <p className="text-stratosphere font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'} -
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                  <p className="text-stratosphere font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/project/${project._id}/edit`)}
            >
              <Edit size={16} className="mr-2" />
              Edit Project Details
            </Button>

            {/* Project Sites */}
            <div className="mt-8 pt-8 border-t border-sky">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-stratosphere">Project Sites</h3>
                <Button variant="outline" onClick={handleCreateSite}>
                  <Plus size={16} className="mr-2" />
                  Add Site
                </Button>
              </div>

              {sites.length === 0 ? (
                <div className="border-2 border-dashed border-sky rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-sky-tint rounded-full flex items-center justify-center mb-4">
                      <MapPin className="text-sky" size={32} />
                    </div>
                    <h4 className="text-lg font-medium text-stratosphere mb-2">
                      No Sites Added Yet
                    </h4>
                    <p className="text-stratosphere/70 mb-6 max-w-md">
                      Create your first project site to start organizing field locations, defining boundaries,
                      and managing site-specific data collection activities.
                    </p>
                    <Button onClick={handleCreateSite} className="bg-sky hover:bg-sky/90 text-white">
                      <Plus size={16} className="mr-2" />
                      Create Your First Site
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedSites.map(site => (
                      <div
                        key={site._id}
                        className="border border-sky rounded-lg p-4 hover:border-stratosphere transition-colors cursor-pointer group"
                        onClick={() => router.push(`/dashboard/site/${site._id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-stratosphere">{site.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            site.status === 'active' ? 'bg-green-100 text-green-800' :
                            site.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                            site.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {site.status}
                          </span>
                        </div>
                        <p className="text-sm text-stratosphere/70 mb-2">{site.location || 'No location specified'}</p>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/site/${site._id}/edit`);
                            }}
                            className="text-xs text-sky-500 hover:text-stratosphere opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          >
                            <Edit size={12} />
                            Edit Site Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMoreSites && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllSites(!showAllSites)}
                        className="border-sky-200 text-sky-500 hover:bg-sky-50"
                      >
                        {showAllSites ? (
                          <>
                            <ChevronUp size={16} className="mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} className="mr-2" />
                            Show All {sites.length} Sites
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Project Stakeholders */}
            <div className="mt-8 pt-8 border-t border-sky">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-stratosphere">Project Stakeholders</h3>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/project/${project._id}/stakeholders`)}
                >
                  <Users size={16} className="mr-2" />
                  Edit Stakeholder Details
                </Button>
              </div>
              <p className="text-sm text-stratosphere/70">
                Map and manage the people and groups affected by this project.
              </p>
            </div>
          </div>

          {/* Workflow Overview */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">
              Project Workflow
            </h2>
            <p className="text-stratosphere/80 mb-8">
              Follow this structured approach:
            </p>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {/* Step 1: Setup */}
              <div className="border-l-4 border-sky pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky text-white text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Project Setup & Configuration</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-4">
                      Tell us the essentials — scope, context and purpose, as well as safeguarding, inclusion
                      and learning priorities — so everything else you build here stands on solid ground.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/project/${project._id}/setup`)}
                    >
                      {getSetupCtaLabel()}
                    </Button>
                    {setupProgress !== null && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 whitespace-nowrap">
                        {Math.round(setupProgress)}% complete
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Project Sites */}
              <div className="border-l-4 border-clay pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-clay text-white text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Project Sites</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Add each site where the work is happening, so you can track and compare progress across
                      locations.
                    </p>
                  </div>
                  <Button
                    className="ml-4 bg-clay hover:bg-clay/90 text-white"
                    onClick={handleCreateSite}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Site
                  </Button>
                </div>
              </div>

              {/* Step 3: Stakeholder Mapping */}
              <div className="border-l-4 border-ochre pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ochre text-white text-sm font-bold">
                        3
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Stakeholder Mapping</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Map the people this project affects and involves — their interests, their concerns, and
                      how they connect to one another.
                    </p>
                  </div>
                  <Button
                    className="ml-4 bg-ochre hover:bg-ochre/90 text-white"
                    onClick={() => router.push(`/dashboard/project/${project._id}/stakeholders`)}
                  >
                    <Map size={16} className="mr-2" />
                    Start Mapping
                  </Button>
                </div>
              </div>

              {/* Step 4: Theory of Change */}
              <div className="border-l-4 border-forest pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest text-white text-sm font-bold">
                        4
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Theory of Change</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Sit with your stakeholders to map how change actually happens here: from what you do, to
                      what shifts for people.
                    </p>
                  </div>
                  <Button
                    className="ml-4 bg-forest hover:bg-forest/90 text-white"
                    onClick={() => router.push(`/dashboard/project/${project._id}/theory-of-change`)}
                  >
                    <GitBranch size={16} className="mr-2" />
                    Create ToC
                  </Button>
                </div>
              </div>

              {/* Step 5: Survey Building */}
              <div className="border-l-4 border-stratosphere pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stratosphere text-white text-sm font-bold">
                        5
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Build Surveys & Collect Data</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Build surveys that capture real change in people's lives, safely and in line with data
                      protection.
                    </p>
                  </div>
                  <Button
                    className="ml-4"
                    onClick={() => router.push(`/dashboard/project/${project._id}/surveys`)}
                  >
                    <FileText size={16} className="mr-2" />
                    Build Survey
                  </Button>
                </div>
              </div>

              {/* Step 6: Analysis & Reporting */}
              <div className="border-l-4 border-concrete pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-concrete text-white text-sm font-bold">
                        6
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Analyze & Report</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Turn what you've gathered into insight: visualised, shared, and ready to open a
                      conversation with your funders.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-4"
                    onClick={() => router.push(`/dashboard/project/${project._id}/reports`)}
                  >
                    <ClipboardList size={16} className="mr-2" />
                    View Reports
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;