// app/dashboard/project/[id]/theory-of-change/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, GitBranch, MapPin, Building2, CheckCircle,
  ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { getStageStatusWithConsultation } from '@/lib/api/theoryOfChange';
import { Topbar, TopbarBack, TopbarHead, TopbarTitle, TopbarActions } from '@/components/shared/Topbar';
import { ScopeList, ScopeRow } from '@/components/shared/ScopePicker';
import { SearchField } from '@/components/shared/Toolbar';
import { RowHead } from '@/components/shared/PageLayout';
import { NumberedList } from '@/components/shared/Lists';

interface PageParams {
  id: string;
}

const TheoryOfChangeIntroPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [project, setProject] = useState<Project | any>(null);
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectLevel, setShowProjectLevel] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const projectResponse = await getProject(projectId);
    setProject(projectResponse.data);

    const sitesResponse = await getProjectSites(projectId);
    setSites(sitesResponse.data || []);
    
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
}, [projectId, toast]);

useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    router.push('/account/login');
    return;
  }

  fetchData();
}, [isAuthenticated, fetchData, router, refreshTrigger]);

  const handleScopeSelection = (siteId: string | null) => {
    setSelectedSiteId(siteId);
    setShowProjectLevel(!siteId);
  };

  const handleContinue = () => {
    const query = selectedSiteId ? `?selectedSite=${selectedSiteId}` : '';
    router.push(`/dashboard/project/${projectId}/theory-of-change/workspace${query}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (site.location && site.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const selectedSite = sites.find(s => s._id === selectedSiteId);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        {project && (
          <ProjectSidebar
            projectId={project._id}
            projectName={project.name}
          />
        )}
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
          </Card>
        </div>
      </div>
    );
  }

  const nextSteps = [
    ...(selectedSiteId ? ['Complete consultation planning with site stakeholders'] : []),
    'Define Stage 1: Actions your team will take',
    'Define Stage 2: Expected outcomes for stakeholders',
    'Review and refine your Theory of Change',
  ];

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      <ProjectSidebar
        projectId={project._id}
        projectName={project.name}
      />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <Topbar motif="gold">
          <TopbarBack href={`/dashboard/project/${projectId}`}>Back to Project Overview</TopbarBack>
          <TopbarHead>
            <div>
              <TopbarTitle>Theory of Change</TopbarTitle>
              {project?.organization && (
                <HeaderHelpActions
                  organizationId={project.organization}
                  guideHref={`/dashboard/project/${projectId}/theory-of-change/guide`}
                />
              )}
            </div>
            <TopbarActions>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  const query = selectedSiteId ? `?siteId=${selectedSiteId}` : '';
                  router.push(`/dashboard/project/${projectId}/theory-of-change/stage1${query}`);
                }}
              >
                Skip to Stage 1
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  const query = selectedSiteId ? `?siteId=${selectedSiteId}` : '';
                  router.push(`/dashboard/project/${projectId}/theory-of-change/stage2${query}`);
                }}
              >
                Skip to Stage 2
                <ArrowRight size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh data">
                <RefreshCw size={18} className="text-c4c-petrol" />
              </Button>
            </TopbarActions>
          </TopbarHead>
        </Topbar>

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {/* Scope Selection */}
          <Card className="p-8">
            <h2 className="font-title text-xl font-semibold text-black">
              Select Your Working Scope
            </h2>
            <p className="mt-2.5 text-[14.5px] text-c4c-petrol">
              Choose whether to develop a Theory of Change for the entire project or focus on
              a specific site. Site-level ToCs allow you to address location-specific dynamics
              and stakeholder contexts.
            </p>

            {/* Current Selection Display */}
            {(selectedSiteId || showProjectLevel) && (
              <div className="mt-5 flex items-center justify-between gap-4 border-2 border-c4c-petrol bg-c4c-grey-bg p-4">
                <div className="flex items-center gap-3">
                  {selectedSiteId ? (
                    <MapPin className="h-6 w-6 text-c4c-petrol" />
                  ) : (
                    <Building2 className="h-6 w-6 text-c4c-petrol" />
                  )}
                  <div>
                    <p className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">
                      Selected Scope
                    </p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {selectedSiteId
                        ? `${selectedSite?.name}${selectedSite?.location ? ` - ${selectedSite.location}` : ''}`
                        : `Project Level: ${project.name}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-c4c-petrol" />
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => {
                      setSelectedSiteId(null);
                      setShowProjectLevel(false);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            {/* Selection Options */}
            {!selectedSiteId && !showProjectLevel && (
              <>
                <ScopeList>
                  <ScopeRow
                    icon={<Building2 />}
                    title="Project Level"
                    subtitle="Develop Theory of Change for the entire project across all sites"
                    onClick={() => handleScopeSelection(null)}
                  />
                </ScopeList>

                {/* Sites Section */}
                {sites.length > 0 && (
                  <>
                    <RowHead>
                      <h3 className="mt-6 text-[15px] font-semibold tracking-[-0.015em] text-black">
                        Site-Specific Theory of Change
                      </h3>
                      <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">{sites.length} sites available</span>
                    </RowHead>

                    {sites.length > 5 && (
                      <div className="mt-4">
                        <SearchField
                          placeholder="Search sites by name or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    )}

                    <div className={sites.length > 5 ? 'mt-3 max-h-96 overflow-y-auto pr-2' : 'mt-3'}>
                      {filteredSites.length === 0 ? (
                        <div className="text-center py-8 text-c4c-petrol">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-c4c-rule" />
                          <p>No sites found matching your search</p>
                        </div>
                      ) : (
                        <ScopeList>
                          {filteredSites.map((site) => (
                            <ScopeRow
                              key={site._id}
                              icon={<MapPin />}
                              title={site.name}
                              subtitle={site.location || undefined}
                              onClick={() => handleScopeSelection(site._id)}
                            />
                          ))}
                        </ScopeList>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Card>

          {/* Action Section */}
          {(selectedSiteId || showProjectLevel) && (
            <Card className="p-8">
              <h2 className="font-title text-xl font-semibold text-black">
                Ready to Begin?
              </h2>

              {/* White, not grey-bg: the NumberedList nested below is
                  itself grey-bg, so this needs to stay white or the two
                  would blend into each other. */}
              <div className="mt-5 border-2 border-c4c-petrol bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-c4c-petrol flex items-center justify-center">
                    <GitBranch className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      What Happens Next?
                    </h3>
                    <p className="text-sm text-c4c-ink/80 mb-1">
                      {selectedSiteId
                        ? "You'll need to complete a consultation plan with stakeholders at this site before defining your Theory of Change stages. This ensures your ToC is informed by local knowledge and perspectives."
                        : "You can proceed directly to defining Stage 1 (Actions) and Stage 2 (Outcomes) for your project. Site-specific consultation plans are only required when working at the site level."
                      }
                    </p>

                    <NumberedList items={nextSteps} />
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                variant="spotlight"
                size="lg"
                onClick={handleContinue}
              >
                <GitBranch size={20} />
                Continue to Theory of Change Workspace
                <ArrowRight size={20} />
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryOfChangeIntroPage;