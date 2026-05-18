// app/dashboard/project/[id]/theory-of-change/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, GitBranch, Target, TrendingUp, Users, 
  MapPin, Building2, CheckCircle, AlertCircle, Search, ChevronRight,
  RefreshCw
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
              <p className="text-stratosphere/70 mt-2">
                Define the pathway from actions to outcomes for {project.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Help Section */}
          <div className="py-8">
            <InstructionalPanel
              title="Need Help with Theory of Change?"
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
                  content: "Start at project level if you're defining overall strategy, or choose a site for location-specific planning.",
                  type: "tip"
                },
                {
                  content: "Site-level Theory of Change requires consultation planning to ensure stakeholder input is incorporated.",
                  type: "info"
                },
                {
                  content: "If you have questions check out the knowledge base.",
                  type: "tip"
                }
              ]}
            />
          </div>
          {/* Introduction Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
                  <GitBranch className="text-forest" size={24} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-stratosphere mb-3">
                  Understanding Theory of Change
                </h2>
                <p className="text-stratosphere/80 text-lg leading-relaxed">
                  A Theory of Change (ToC) is a comprehensive description and illustration of how 
                  and why a desired change is expected to happen in a particular context. It maps 
                  out the causal pathway from your project's activities to the ultimate outcomes 
                  and impacts you want to achieve.
                </p>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="bg-sky-tint rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">Why Theory of Change Matters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Strategic Clarity</h4>
                    <p className="text-sm text-stratosphere/70">
                      Provides a clear roadmap connecting your actions to desired social and governance outcomes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Stakeholder Alignment</h4>
                    <p className="text-sm text-stratosphere/70">
                      Ensures all team members and stakeholders understand the change pathway
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Risk Management</h4>
                    <p className="text-sm text-stratosphere/70">
                      Identifies potential risks and unintended consequences early in the process
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Monitoring & Evaluation</h4>
                    <p className="text-sm text-stratosphere/70">
                      Creates a framework for measuring progress and demonstrating impact
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Stage Process */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">The Two-Stage Process</h3>
              
              <div className="space-y-4">
                <div className="bg-white border-2 border-sky rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky flex items-center justify-center">
                      <Target className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-stratosphere mb-2">
                        Stage 1: Actions (Internal Focus)
                      </h4>
                      <p className="text-sm text-stratosphere/70 mb-3">
                        Focus on your team's planned work. Define specific actions, assign 
                        responsibilities, and establish accountability structures. This stage is about 
                        what you and your team will DO to achieve project goals.
                      </p>
                      <div className="bg-sky-tint p-3 rounded-md">
                        <p className="text-xs font-medium text-stratosphere mb-1">Key Elements:</p>
                        <ul className="text-xs text-stratosphere/70 space-y-1">
                          <li>• Specific actions and activities</li>
                          <li>• Responsibility assignments</li>
                          <li>• Timeframes and milestones</li>
                          <li>• Resource requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-forest rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-forest flex items-center justify-center">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-stratosphere mb-2">
                        Stage 2: Outcomes (External Focus)
                      </h4>
                      <p className="text-sm text-stratosphere/70 mb-3">
                        Focus on what change looks like for stakeholders. Identify potential positive 
                        and negative outcomes, assess risks, and plan mitigation strategies. This stage 
                        is about how your actions AFFECT communities and stakeholders.
                      </p>
                      <div className="bg-forest/10 p-3 rounded-md">
                        <p className="text-xs font-medium text-stratosphere mb-1">Key Elements:</p>
                        <ul className="text-xs text-stratosphere/70 space-y-1">
                          <li>• Expected outcomes and impacts</li>
                          <li>• Risk identification and assessment</li>
                          <li>• Mitigation strategies</li>
                          <li>• Success indicators</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>Important:</strong> While you can work on either stage independently, 
                  completing both stages provides a comprehensive view of your project's change 
                  pathway. Stage 1 can be completed first, and you can return to Stage 2 later 
                  when you have more information about potential outcomes.
                </div>
              </div>
            </div>
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

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/project/${projectId}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Project Overview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheoryOfChangeIntroPage;