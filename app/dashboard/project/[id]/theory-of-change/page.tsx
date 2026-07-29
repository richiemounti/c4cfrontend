// app/dashboard/project/[id]/theory-of-change/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, GitBranch, MapPin, Building2, CheckCircle,
  Search, ChevronRight, RefreshCw, BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSites } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';
import { getStageStatusWithConsultation } from '@/lib/api/theoryOfChange';

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
                         (site.city && site.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const selectedSite = sites.find(s => s._id === selectedSiteId);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={() => router.push(`/dashboard/project/${projectId}`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project Overview
          </button>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex justify-between items-end">
                <h1 className="text-3xl font-medium text-stratosphere">Theory of Change</h1>
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="Refresh data"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
              </div>
              <Link
                href={`/dashboard/project/${projectId}/theory-of-change/guide`}
                className="inline-flex items-center text-sm text-forest hover:text-forest-600 mt-2"
              >
                <BookOpen size={14} className="mr-1" />
                Theory of Change Guide
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Help Section */}
          <div className="py-8">
            <InstructionalPanel
              title="Getting Started Guide"
              subtitle="A Theory of Change maps how the actions you take lead to real change for the people you work with. This is a collaborative exercise — sit with your stakeholders to design it with them, not just for them."
              texts={[
                {
                  content: "Watch the video tutorial for an overview of Theory of Change.",
                  type: "tip"
                },
                {
                  content: "Make sure you've reviewed the Theory of Change Guide before you begin.",
                  type: "info"
                },
                {
                  content: "Choose your working scope — project-wide or site-specific — then work through Stage 1 (Actions) and Stage 2 (Outcomes), consulting your stakeholders as you go (see the Stakeholder Mapping Guide for best practices).",
                  type: "info"
                },
                {
                  content: "Questions? Reach out to your Mentor, Hannah.",
                  type: "note"
                }
              ]}
              links={[
                {
                  href: `/dashboard/project/${projectId}/theory-of-change/guide`,
                  label: "Theory of Change Guide",
                  description: "Review this before you begin",
                  external: false
                },
                {
                  href: "mailto:hannah@citizens4change.net",
                  label: "Email Hannah",
                  description: "Your project mentor",
                  external: true
                }
              ]}
            />
          </div>

          {/* Scope Selection */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-4">
              Select Your Working Scope
            </h2>
            <p className="text-stratosphere/70 mb-6">
              Choose whether to develop a Theory of Change for the entire project or focus on 
              a specific site. Site-level ToCs allow you to address location-specific dynamics 
              and stakeholder contexts.
            </p>

            {/* Current Selection Display */}
            {(selectedSiteId || showProjectLevel) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-forest/10 to-green-50 rounded-lg border-2 border-forest">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedSiteId ? (
                      <MapPin className="h-6 w-6 text-forest" />
                    ) : (
                      <Building2 className="h-6 w-6 text-forest" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Selected Scope
                      </p>
                      <p className="text-lg font-semibold text-stratosphere">
                        {selectedSiteId 
                          ? `${selectedSite?.name}${selectedSite?.city ? ` - ${selectedSite.city}` : ''}`
                          : `Project Level: ${project.name}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-forest" />
                    {(selectedSiteId || showProjectLevel) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSiteId(null);
                          setShowProjectLevel(false);
                        }}
                        className="text-forest hover:text-forest/80"
                      >
                        Change
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Selection Options */}
            {!selectedSiteId && !showProjectLevel && (
              <>
                {/* Project Level Option */}
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
                        <p className="text-lg font-semibold text-stratosphere">
                          Project Level
                        </p>
                        <p className="text-sm text-gray-600">
                          Develop Theory of Change for the entire project across all sites
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                  </div>
                </div>

                {/* Sites Section */}
                {sites.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium text-gray-700">
                        Site-Specific Theory of Change
                      </h3>
                      <span className="text-sm text-gray-500">{sites.length} sites available</span>
                    </div>

                    {/* Search Bar */}
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

                    {/* Sites List */}
                    <div className={`space-y-3 ${sites.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                      {filteredSites.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No sites found matching your search</p>
                        </div>
                      ) : (
                        filteredSites.map((site) => (
                          <div
                            key={site._id}
                            className="p-4 rounded-lg border-2 border-gray-200 hover:border-forest hover:shadow-md cursor-pointer transition-all bg-white"
                            onClick={() => handleScopeSelection(site._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gray-100">
                                  <MapPin className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-stratosphere">
                                    {site.name}
                                  </p>
                                  {site.city && (
                                    <p className="text-sm text-gray-600">
                                      {site.city}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Section */}
          {(selectedSiteId || showProjectLevel) && (
            <div className="bg-white rounded-lg border border-sky p-8 mb-8">
              <h2 className="text-xl font-medium text-stratosphere mb-6">
                Ready to Begin?
              </h2>
              
              <div className="bg-forest/5 border-2 border-forest rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-forest flex items-center justify-center">
                    <GitBranch className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-stratosphere mb-2">
                      What Happens Next?
                    </h3>
                    <p className="text-sm text-stratosphere/70 mb-4">
                      {selectedSiteId 
                        ? "You'll need to complete a consultation plan with stakeholders at this site before defining your Theory of Change stages. This ensures your ToC is informed by local knowledge and perspectives."
                        : "You can proceed directly to defining Stage 1 (Actions) and Stage 2 (Outcomes) for your project. Site-specific consultation plans are only required when working at the site level."
                      }
                    </p>
                    
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-medium text-stratosphere mb-2">Next Steps:</p>
                      <ol className="text-sm text-stratosphere/70 space-y-2">
                        {selectedSiteId && (
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-forest">1.</span>
                            <span>Complete consultation planning with site stakeholders</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-forest">{selectedSiteId ? '2.' : '1.'}</span>
                          <span>Define Stage 1: Actions your team will take</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-forest">{selectedSiteId ? '3.' : '2.'}</span>
                          <span>Define Stage 2: Expected outcomes for stakeholders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-forest">{selectedSiteId ? '4.' : '3.'}</span>
                          <span>Review and refine your Theory of Change</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-forest hover:bg-forest/90 text-white"
                size="lg"
                onClick={handleContinue}
              >
                <GitBranch size={20} className="mr-2" />
                Continue to Theory of Change Workspace
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryOfChangeIntroPage;