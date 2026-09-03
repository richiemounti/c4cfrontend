// app/dashboard/project/[id]/results/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BarChart3, Building2, ChevronRight, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectSidebar from '@/components/project/ProjectSidebar';

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
      <div className="flex min-h-screen bg-sky-tint">
        {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar projectId={projectId} projectName="Project" />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Project Not Found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      <ProjectSidebar projectId={project._id} projectName={project.name} />

      <div className="flex-1">
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button
            onClick={() => router.push(`/dashboard/project/${projectId}`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project Overview
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
              <BarChart3 className="text-forest" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">Visualize Results</h1>
              <p className="text-stratosphere/70 mt-1">Review survey responses for {project.name}</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-sky p-8">
            <h2 className="text-xl font-medium text-stratosphere mb-2">Select Your Scope</h2>
            <p className="text-stratosphere/70 mb-6">
              Choose whether to review surveys collected across the entire project, or focus on a specific site.
            </p>

            <div
              className="mb-4 p-6 rounded-lg border-2 border-gray-200 hover:border-forest hover:shadow-md cursor-pointer transition-all bg-white"
              onClick={() => handleScopeSelection(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-forest/10">
                    <Building2 className="h-6 w-6 text-forest" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-stratosphere">Project Level</p>
                    <p className="text-sm text-gray-600">Surveys not tied to a specific site</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-700">Site-Specific Results</h3>
                <span className="text-sm text-gray-500">{sites.length} sites available</span>
              </div>

              {sites.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search sites by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-forest focus:ring-forest"
                  />
                </div>
              )}

              <div className={`space-y-3 ${sites.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                {filteredSites.map((site) => (
                  <div
                    key={site._id}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-forest hover:shadow-md cursor-pointer transition-all bg-white"
                    onClick={() => handleScopeSelection(site._id, site.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <MapPin className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-stratosphere">{site.name}</p>
                          {site.location && <p className="text-sm text-gray-600">{site.location}</p>}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="ghost" onClick={() => handleScopeSelection(null)}>
              Skip to project-level results
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
