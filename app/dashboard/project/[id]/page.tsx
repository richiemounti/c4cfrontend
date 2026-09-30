// app/dashboard/project/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Calendar, Clock, Edit, Plus, FileText,
  Map, GitBranch, ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { getProjectSetup, getProjectSetupProgress } from '@/lib/api/projectSetup';
import { LastEditedBy } from '@/components/shared/LastEditedBy';
import { Topbar, TopbarBack, TopbarTitle, TopbarMeta } from '@/components/shared/Topbar';
import { Divider, RowHead, CardLede, DescBlock, MetaGrid, MetaItem, TileGrid, Tile } from '@/components/shared/PageLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Steps, Step, type StepState } from '@/components/shared/WorkflowSteps';


interface PageParams {
  id: string;
}

// Status badge variant — the mockup's rule is one colour per job, so this
// collapses the old ad-hoc green/blue/stone/yellow set onto the tag scale:
// done=complete, phase=in progress, quiet=finished/inactive, attention=
// anything else (draft, on hold — a state waiting on a person).
const statusVariant = (status?: string): 'done' | 'phase' | 'quiet' | 'attention' => {
  switch (status) {
    case 'active': return 'done';
    case 'planning': return 'phase';
    case 'completed': return 'quiet';
    default: return 'attention';
  }
};

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

  // Step 1 is the only step with real completion data (setupProgress).
  // Steps 2-6 have no completion signal from this page's data, so they
  // stay "open" rather than a decorative, meaningless rainbow of state —
  // the mockup's whole point is that colour should carry real information.
  const setupState: StepState = setupProgress !== null && setupProgress >= 100 ? 'done' : 'now';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName={project?.name || 'Loading...'}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 p-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium text-black mb-2">Project Not Found</h2>
            <p className="text-c4c-petrol mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button variant="spotlight" onClick={handleGoBackToOrganization}>
              Back to Organization
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      {/* Sidebar */}
      <ProjectSidebar
        projectId={project._id}
        projectName={project.name}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <Topbar motif="navy">
          <TopbarBack href={organizationId ? `/dashboard/organization/${organizationId}` : '/dashboard'}>
            Back to Organization
          </TopbarBack>
          <TopbarTitle>{project.name}</TopbarTitle>
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
            className="mt-2"
          />
          <TopbarMeta>
            <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
            <span className="text-c4c-petrol text-sm">
              {sites.length} {sites.length === 1 ? 'site' : 'sites'}
            </span>
          </TopbarMeta>
        </Topbar>

        {/* Main content area */}
        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {/* Your Project */}
          <Card className="p-8">
            <h2 className="font-title text-2xl font-semibold text-black">
              Your Project
            </h2>

            {/* Project Description */}
            {project.description && (
              <DescBlock label="Description">
                <span className="whitespace-pre-wrap">{project.description}</span>
              </DescBlock>
            )}

            {/* Project Info Grid */}
            <MetaGrid>
              <MetaItem icon={<MapPin />} label="Location" value={project.location || 'Not specified'} />
              <MetaItem
                icon={<Calendar />}
                label="Timeline"
                value={`${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not specified'} - ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}`}
              />
              <MetaItem icon={<Clock />} label="Created Date" value={new Date(project.createdAt).toLocaleDateString()} />
            </MetaGrid>

            <div className="mt-6">
              <Button
                variant="anchor"
                onClick={() => router.push(`/dashboard/project/${project._id}/edit`)}
              >
                <Edit size={16} />
                Edit Project Details
              </Button>
            </div>

            {/* Project Sites — no "Add Site" button here: that action
                belongs to workflow step 2 below, which already owns it. */}
            <Divider />
            <RowHead>
              <h3 className="text-lg font-medium text-black">Project Sites</h3>
            </RowHead>

            {sites.length === 0 ? (
              <div className="mt-4 border border-c4c-rule bg-white">
                <EmptyState
                  icon={<MapPin />}
                  title="No Sites Added Yet"
                  description="Create your first project site to start organizing field locations, defining boundaries, and managing site-specific data collection activities."
                  actions={
                    <Button variant="spotlight" onClick={handleCreateSite}>
                      <Plus size={16} />
                      Create Your First Site
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                <TileGrid>
                  {displayedSites.map(site => (
                    <div key={site._id} className="group relative cursor-pointer" onClick={() => router.push(`/dashboard/site/${site._id}`)}>
                      <Tile
                        title={site.name}
                        tag={<Badge variant={statusVariant(site.status)}>{site.status}</Badge>}
                        caption={site.location || 'No location specified'}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/site/${site._id}/edit`);
                        }}
                        className="absolute bottom-[17px] right-[18px] text-xs text-c4c-petrol opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Edit size={12} />
                        Edit Site Details
                      </button>
                    </div>
                  ))}
                </TileGrid>

                {hasMoreSites && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="quiet"
                      onClick={() => setShowAllSites(!showAllSites)}
                    >
                      {showAllSites ? (
                        <>
                          <ChevronUp size={16} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Show All {sites.length} Sites
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Project Stakeholders — no "Edit Stakeholder Details" button:
                Stakeholder Mapping is workflow step 3 below and owns it. */}
            <Divider />
            <RowHead>
              <h3 className="text-lg font-medium text-black">Project Stakeholders</h3>
            </RowHead>
            <p className="text-sm text-c4c-petrol">
              Map and manage the people and groups affected by this project.
            </p>
          </Card>

          {/* Workflow Overview */}
          <Card className="p-8">
            <h2 className="font-title text-xl font-semibold text-black">
              Project Workflow
            </h2>
            <CardLede>Follow this structured approach:</CardLede>

            <Steps>
              <Step
                number={1}
                state={setupState}
                title="Project Setup & Configuration"
                description="Tell us the essentials — scope, context and purpose, as well as safeguarding, inclusion and learning priorities — so everything else you build here stands on solid ground."
                actions={
                  <>
                    <Button
                      variant={setupState === 'now' ? 'spotlight' : 'anchor'}
                      size="sm"
                      onClick={() => router.push(`/dashboard/project/${project._id}/setup`)}
                    >
                      {getSetupCtaLabel()}
                    </Button>
                    {setupProgress !== null && (
                      <Badge variant="quiet">{Math.round(setupProgress)}% complete</Badge>
                    )}
                  </>
                }
              />

              <Step
                number={2}
                state="open"
                title="Project Sites"
                description="Add each site where the work is happening, so you can track and compare progress across locations."
                actions={
                  <Button variant="anchor" size="sm" onClick={handleCreateSite}>
                    <Plus size={16} />
                    Add Site
                  </Button>
                }
              />

              <Step
                number={3}
                state="open"
                title="Stakeholder Mapping"
                description="Map the people this project affects and involves — their interests, their concerns, and how they connect to one another."
                actions={
                  <Button variant="anchor" size="sm" onClick={() => router.push(`/dashboard/project/${project._id}/stakeholders`)}>
                    <Map size={16} />
                    Start Mapping
                  </Button>
                }
              />

              <Step
                number={4}
                state="open"
                title="Theory of Change"
                description="Sit with your stakeholders to map how change actually happens here: from what you do, to what shifts for people."
                actions={
                  <Button variant="anchor" size="sm" onClick={() => router.push(`/dashboard/project/${project._id}/theory-of-change`)}>
                    <GitBranch size={16} />
                    Create ToC
                  </Button>
                }
              />

              <Step
                number={5}
                state="open"
                title="Build Surveys & Collect Data"
                description="Build surveys that capture real change in people's lives, safely and in line with data protection."
                actions={
                  <Button variant="anchor" size="sm" onClick={() => router.push(`/dashboard/project/${project._id}/surveys`)}>
                    <FileText size={16} />
                    Build Survey
                  </Button>
                }
              />

              <Step
                number={6}
                state="open"
                title="Analyze & Report"
                description="Turn what you've gathered into insight: visualised, shared, and ready to open a conversation with your funders."
                actions={
                  <Button variant="quiet" size="sm" onClick={() => router.push(`/dashboard/project/${project._id}/reports`)}>
                    <ClipboardList size={16} />
                    View Reports
                  </Button>
                }
              />
            </Steps>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
