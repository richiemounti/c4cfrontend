// app/dashboard/project/[id]/results/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, Building2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { Topbar, TopbarBack } from '@/components/shared/Topbar';
import { ScopeList, ScopeRow } from '@/components/shared/ScopePicker';
import { SearchField } from '@/components/shared/Toolbar';
import { RowHead } from '@/components/shared/PageLayout';

interface PageParams {
  id: string;
}

export default function ResultsScopePage({ params }: { params: PageParams }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectResponse, sitesResponse] = await Promise.all([getProject(projectId), getProjectSites(projectId)]);
      setProject(projectResponse.data);
      setSites(sitesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load project data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading, fetchData, router]);

  // No sites at all — nothing to choose between, go straight to the survey list.
  useEffect(() => {
    if (!loading && sites.length === 0 && project) {
      router.replace(`/dashboard/project/${projectId}/results/surveys`);
    }
  }, [loading, sites.length, project, projectId, router]);

  const handleScopeSelection = (siteId: string | null, siteName?: string) => {
    const query = siteId ? `?siteId=${siteId}&siteName=${encodeURIComponent(siteName || '')}` : '';
    router.push(`/dashboard/project/${projectId}/results/surveys${query}`);
  };

  const filteredSites = sites.filter(
    (site) => site.name.toLowerCase().includes(searchQuery.toLowerCase()) || (site.location && site.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading || (sites.length === 0 && project)) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar projectId={projectId} projectName="Project" />
        <div className="flex-1 p-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium text-black mb-2">Project Not Found</h2>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      <ProjectSidebar projectId={project._id} projectName={project.name} />

      <div className="flex-1 min-w-0">
        <Topbar motif="sage">
          <TopbarBack href={`/dashboard/project/${projectId}`}>Back to Project Overview</TopbarBack>
          <div className="flex items-center gap-3.5 mt-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-c4c-grey-bg">
              <BarChart3 className="text-c4c-petrol" size={20} />
            </span>
            <div>
              <h1 className="font-title text-[clamp(26px,3.2vw,34px)] font-semibold text-black">Visualize Results</h1>
              <p className="mt-1.5 text-[14.5px] text-c4c-ink/80">Review survey responses for {project.name}</p>
            </div>
          </div>
        </Topbar>

        <div className="p-8 max-w-5xl mx-auto">
          <Card className="p-8">
            <h2 className="font-title text-xl font-semibold text-black">Select your scope</h2>
            <p className="mt-2.5 text-[14.5px] text-c4c-petrol">
              Choose whether to review surveys collected across the entire project, or focus on a specific site.
            </p>

            <ScopeList>
              <ScopeRow icon={<Building2 />} title="Project Level" subtitle="Surveys not tied to a specific site" onClick={() => handleScopeSelection(null)} />
            </ScopeList>

            <RowHead>
              <h3 className="mt-6 text-[15px] font-semibold tracking-[-0.015em] text-black">Site-Specific Results</h3>
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
              <ScopeList>
                {filteredSites.map((site) => (
                  <ScopeRow
                    key={site._id}
                    icon={<MapPin />}
                    title={site.name}
                    subtitle={site.location || undefined}
                    onClick={() => handleScopeSelection(site._id, site.name)}
                  />
                ))}
              </ScopeList>
            </div>
          </Card>

          <div className="flex justify-end mt-6">
            <Button variant="quiet" onClick={() => handleScopeSelection(null)}>
              Skip to project-level results
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
