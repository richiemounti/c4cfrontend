// app/dashboard/project/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Users, Edit, Plus, Trash2, FileText, 
  Download, File, Upload, X, ArrowRight, Map, GitBranch, ClipboardList,
  RefreshCw, ChevronDown, ChevronUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';
import ProjectSetupSummary from '@/components/project/ProjectSetupSummary';
import { getProjectSetup } from '@/lib/api/projectSetup';


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

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
            <div className="flex items-center gap-2">
              {/* NEW: Add Edit Button */}
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/project/${project._id}/edit`)}
                className="flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Edit Project
              </Button>
              
              <button
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-8 max-w-7xl mx-auto">
          <div className='py-8'>
            {/* Help & Resources */}
            <InstructionalPanel
              title="Getting Started Guide"
              subtitle="Everything you need to know about managing your project"
              videos={[
                {
                  src: "/videos/instructional/project-setup/creating-project.mp4",
                  title: "How to Create a New Project",
                  description: "This 3-minute tutorial walks you through the entire project creation process, from initial setup to adding your first survey.",
                  poster: "/videos/instructional/project-setup/creating-project-poster.PNG",
                  autoPlay: false,
                  loop: false
                }
              ]}
              texts={[
                {
                  content: "Start by completing the project setup tasks to configure your project's foundational information.",
                  type: "tip"
                },
                {
                  content: "Follow the workflow in order - each step builds upon the previous one for best results.",
                  type: "info"
                },
                {
                  content: "You can jump to any module using the sidebar navigation, but we recommend following the sequence for first-time users.",
                  type: "note"
                },
                {
                  content: "If you have questions check out the knowledge base.",
                  type: "tip"
                }
              ]}
              variant="default"
            />
          </div>
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-2xl font-medium text-stratosphere mb-4">
              Welcome to Your Design Module
            </h2>
            <p className="text-stratosphere/80 text-lg mb-6">
              This is your central hub for managing all aspects of your project. Follow the workflow below 
              to ensure you design with and learn from your stakeholders.
            </p>
            
            {/* Project Description */}
            {project.description && (
              <div className="bg-sky-tint p-6 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-stratosphere mb-2">Project Description</h3>
                <p className="text-stratosphere whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <h3 className="text-sm font-medium text-gray-500">Project Timeline</h3>
                  <p className="text-stratosphere font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'} - 
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-stratosphere font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
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
                      Submit essential project information including location details, governance structure, 
                      land tenure information, and risk assessment. This foundational step ensures all 
                      necessary project metadata is captured.
                    </p>
                    
                    {/* Setup Progress */}
                    <div className="ml-11">
                      <ProjectSetupSummary 
                        projectId={project._id} 
                        projectSites={sites}
                        contextType="project"
                        showSiteTasks={false}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="ml-4"
                    onClick={() => router.push(`/dashboard/project/${project._id}/setup`)}
                  >
                    Manage Tasks
                  </Button>
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
                      Define and manage project sites, their locations, boundaries, and site-specific information. 
                      Often a project will have multiple sites that need individual tracking and data collection.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Add site locations</span>
                      <span>• Define boundaries</span>
                      <span>• Manage site details</span>
                    </div>
                    {sites.length > 0 && (
                      <div className="ml-11 mt-3">
                        <span className="text-sm font-medium text-stratosphere">
                          {sites.length} {sites.length === 1 ? 'site' : 'sites'} configured
                        </span>
                      </div>
                    )}
                    
                    {/* Helper text directing to bottom card */}
                    <div className="ml-11 mt-4 bg-clay/10 border border-clay/30 rounded-lg p-3">
                      <p className="text-sm text-stratosphere flex items-center gap-2">
                        <ArrowDown className="text-clay animate-bounce" size={16} />
                        <span>
                          {sites.length === 0 
                            ? 'Scroll down to create your first project site in the "Project Sites" section below.'
                            : 'View and manage all your project sites in the "Project Sites" section below.'}
                        </span>
                      </p>
                    </div>
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
                      Identify and analyze key stakeholder groups, their interests, concerns, potential benefits and harms. Understanding stakeholder dynamics is crucial for project success and compliance.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Identify stakeholder groups</span>
                      <span>• Analyze interests & concerns</span>
                      <span>• Map relationships</span>
                    </div>
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
                      Sit with representatives of your stakeholder groups to design the project's logical framework. This helps us identify activities, outputs and outcomes with indicators of change.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Identify actions</span>
                      <span>• Plan consultations</span>
                      <span>• Determine outcomes of change</span>
                    </div>
                  </div>
                  <Button 
                    className="ml-4 bg-forest hover:bg-forest/90 text-white"
                    onClick={() => router.push(`/dashboard/project/${project._id}/theory-of-change`)}
                  >
                    <GitBranch size={16} className="mr-2" />
                    Build ToC
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
                      Create curated surveys tailored to stakeholder groups that enable you to monitor change. 
                      Gather essential data while ensuring GDPR compliance and data protection.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Design questions</span>
                      <span>• Collect responses</span>
                      <span>• Ensure compliance</span>
                    </div>
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
                      Visualize results, generate comprehensive reports, and communicate findings to 
                      stakeholders. Turn data into actionable insights and transparent documentation.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Visualize data</span>
                      <span>• Generate reports</span>
                      <span>• Share insights</span>
                    </div>
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

          {/* Project Sites Overview */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-stratosphere">Project Sites</h2>
              
              {/* Always show Add Site button in header */}
              <Button 
                variant="outline"
                onClick={handleCreateSite}
              >
                <Plus size={16} className="mr-2" />
                Add Site
              </Button>
            </div>

            <p className="text-stratosphere/70 py-2 mb-4">
              Often a project will have multiple sites; you can add each site and its details here.
            </p>

            {/* Conditional rendering based on sites.length */}
            {sites.length === 0 ? (
              /* Empty State - No sites */
              <div className="border-2 border-dashed border-sky rounded-lg p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-sky-tint rounded-full flex items-center justify-center mb-4">
                    <MapPin className="text-sky" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-stratosphere mb-2">
                    No Sites Added Yet
                  </h3>
                  <p className="text-stratosphere/70 mb-6 max-w-md">
                    Create your first project site to start organizing field locations, defining boundaries, 
                    and managing site-specific data collection activities.
                  </p>
                  <Button 
                    onClick={handleCreateSite}
                    className="bg-sky hover:bg-sky/90 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Your First Site
                  </Button>
                </div>
              </div>
            ) : (
              /* Sites Display - Has sites */
              <>
                {/* Grid view for fewer sites, List view for many */}
                {sites.length <= 12 ? (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedSites.map(site => (
                      <div 
                        key={site._id} 
                        className="border border-sky rounded-lg p-4 hover:border-stratosphere transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/site/${site._id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-stratosphere">{site.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            site.status === 'active' ? 'bg-green-100 text-green-800' :
                            site.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {site.status}
                          </span>
                        </div>
                        <p className="text-sm text-stratosphere/70 mb-2">{site.region || 'No region specified'}</p>
                        <p className="text-xs text-stratosphere/50">{site.siteType || 'General site'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View for many sites */
                  <div className="space-y-2">
                    {displayedSites.map(site => (
                      <div 
                        key={site._id} 
                        className="border border-sky rounded-lg p-4 hover:border-stratosphere transition-colors cursor-pointer flex items-center justify-between"
                        onClick={() => router.push(`/dashboard/site/${site._id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-stratosphere">{site.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              site.status === 'active' ? 'bg-green-100 text-green-800' :
                              site.status === 'inactive' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {site.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-stratosphere/70">{site.region || 'No region'}</p>
                            <p className="text-xs text-stratosphere/50">{site.siteType || 'General site'}</p>
                          </div>
                        </div>
                        <ArrowRight className="text-sky" size={20} />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show More/Less Button */}
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
          
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;