// app/dashboard/project/[id]/theory-of-change/stage2/page.tsx
// Updated Stage2 Page with project/site filtering

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Loader, Plus, AlertTriangle, ArrowLeft, Edit, Trash2, 
  RefreshCw
} from 'lucide-react';
import { getStageProgress, getImpactsByStage, completeStage, getStagesByProject, deleteImpact } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

interface Impact {
  _id: string;
  stakeholderGroup: {
    _id: string;
    name: string;
  };
  themes: Array<{
    _id: string;
    name: string;
  }>;
  subThemes: Array<{
    _id: string;
    name: string;
  }>;
  outcome: string;
  risks: Array<{ _id: string }>;
  sdgTags: string[];
  resilienceTags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ImpactsByStakeholder {
  stakeholderGroup: {
    _id: string;
    name: string;
  };
  impacts: Impact[];
}

interface StakeholderGroup {
  _id: string;
  name: string;
  project: string;
  projectSite?: string; // Optional - only present for site-level stakeholders
  category: {
    _id: string;
    name: string;
  };
}

export default function Stage2Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId'); // Get siteId from query params if present
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [stageData, setStageData] = useState<any>(null);
  const [allStakeholderGroups, setAllStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [impactsByStakeholder, setImpactsByStakeholder] = useState<ImpactsByStakeholder[]>([]);
  const [deletingImpactId, setDeletingImpactId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter stakeholder groups based on context (project vs site)
  const filteredStakeholderGroups = useMemo(() => {
    if (!allStakeholderGroups || allStakeholderGroups.length === 0) return [];
    
    if (siteId) {
      // Site context: Show only stakeholders with this specific projectSite
      return allStakeholderGroups.filter(group => group.projectSite === siteId);
    } else {
      // Project context: Show only stakeholders WITHOUT projectSite
      return allStakeholderGroups.filter(group => !group.projectSite);
    }
  }, [allStakeholderGroups, siteId]);

  // Filter impacts to only show those from relevant stakeholder groups
  const filteredImpacts = useMemo(() => {
    const relevantStakeholderIds = new Set(filteredStakeholderGroups.map(g => g._id));
    return impacts.filter(impact => relevantStakeholderIds.has(impact.stakeholderGroup._id));
  }, [impacts, filteredStakeholderGroups]);

  // Filter impactsByStakeholder
  const filteredImpactsByStakeholder = useMemo(() => {
    const relevantStakeholderIds = new Set(filteredStakeholderGroups.map(g => g._id));
    return impactsByStakeholder.filter(item => 
      relevantStakeholderIds.has(item.stakeholderGroup._id)
    );
  }, [impactsByStakeholder, filteredStakeholderGroups]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const projectData = await getProject(projectId);
      setProject(projectData.data);
      
      const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId || undefined);
      // API returns { success, count, data: { stakeholderGroups, groupsByCategory } }
      setAllStakeholderGroups(stakeholderResponse.data?.stakeholderGroups || []);
      
      // Initialize stage if it doesn't exist yet or get existing stage
      // Pass siteId so we get the site-level stage when in site context
      let stageId;
      try {
        const { data: stageResp } = await getStagesByProject(projectId, siteId || undefined);
        const stage2 = stageResp.data.find((s: any) => s.stageNumber === 2);
        stageId = stage2._id;
      } catch (error) {
        console.error("Error getting stage:", error);
        return;
      }
      
      // Get stage progress data
      const { data: progressData } = await getStageProgress(stageId);
      setStageData(progressData.data);
      
      // Get all impacts for this stage
      const { data: impactsData } = await getImpactsByStage(stageId);
      setImpacts(impactsData.data.impacts || []);
      setImpactsByStakeholder(impactsData.data.impactsByStakeholder || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, siteId, refreshTrigger]);

  const navigateToCreateImpact = () => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage2/impacts/create`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };
  
  const navigateToStakeholder = (stakeholderId: string) => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage2/${stakeholderId}`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };

  const navigateToEditImpact = (impactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `/dashboard/project/${projectId}/theory-of-change/stage2/impacts/${impactId}/edit`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };

  const handleDeleteImpact = async (impactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this impact? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingImpactId(impactId);
      await deleteImpact(impactId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting impact:", error);
      alert('Failed to delete impact. Please try again.');
    } finally {
      setDeletingImpactId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderThemes = (themes: Array<{name: string}>, maxDisplay: number = 2) => {
    if (!themes || themes.length === 0) return <span className="text-gray-400">No themes</span>;

    const displayThemes = themes.slice(0, maxDisplay);
    const remainingCount = themes.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1">
        {displayThemes.map((theme, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {theme.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };

  const renderSubThemes = (subThemes: Array<{name: string}>, maxDisplay: number = 2) => {
    if (!subThemes || subThemes.length === 0) return <span className="text-gray-400">No subthemes</span>;

    const displaySubThemes = subThemes.slice(0, maxDisplay);
    const remainingCount = subThemes.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1">
        {displaySubThemes.map((subTheme, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {subTheme.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };

  const getThemeSubthemeSummary = (impact: Impact) => {
    const themeCount = impact.themes?.length || 0;
    const subthemeCount = impact.subThemes?.length || 0;
    
    if (themeCount === 0 && subthemeCount === 0) return "No themes/subthemes";
    if (themeCount === 1 && subthemeCount === 1) {
      return `${impact.themes[0].name} → ${impact.subThemes[0].name}`;
    }
    return `${themeCount} themes, ${subthemeCount} subthemes`;
  };

  const renderSDGTags = (sdgTags: string[], maxDisplay: number = 3) => {
    if (!sdgTags || sdgTags.length === 0) return <span className="text-gray-400">None</span>;

    const displayTags = sdgTags.slice(0, maxDisplay);
    const remainingCount = sdgTags.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1">
        {displayTags.map((tag, index) => (
          <span 
            key={index} 
            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
          >
            {tag}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
            +{remainingCount}
          </span>
        )}
      </div>
    );
  };

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
          <p className="text-stratosphere font-medium ml-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {project && (
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
      )}
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={() => {
              const url = `/dashboard/project/${projectId}/theory-of-change`;
              router.push(siteId ? `${url}?siteId=${siteId}` : url);
            }}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Theory of Change
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-stratosphere">
                Stage 2: Outcomes {siteId && <span className="text-gray-500">(Site Level)</span>}
              </h1>
              <p className="text-gray-500 mt-2">
                Define social impacts and risks for each stakeholder group
                {siteId && " at this site"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh data"
                disabled={loading}
              >
                <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Button onClick={navigateToCreateImpact} className="bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Outcome
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 space-y-6">
          {/* Context Info */}
          {siteId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Site Context:</span> You are viewing and managing outcomes for stakeholders specific to this site.
              </p>
            </div>
          )}

          {/* Help & Resources Panel */}
          <div className="mt-8">
            <InstructionalPanel
              title="Need Help with Theory of Change - Stage 2?"
              subtitle="Resources and guidance for defining your project's social change"
              videos={[
                {
                  src: "/videos/instructional/project-setup/creating-project.mp4",
                  title: "How to Create a New Project",
                  description: "This 3-minute tutorial walks you through the entire project creation process.",
                  poster: "/videos/instructional/project-setup/creating-project-poster.PNG",
                  autoPlay: false,
                  loop: false
                }
              ]}
              texts={[
                {
                  content: "Start with consultation planning if working on specific sites to ensure stakeholder input.",
                  type: "tip"
                },
                {
                  content: "Stage 1 plans internal actions to generate VERs.",
                  type: "info"
                },
                {
                  content: "Stage 2 plans external outcomes from carbon revenue.",
                  type: "info"
                },
                {
                  content: "Complete both stages to generate comprehensive workplans and logic models.",
                  type: "tip"
                }
              ]}
              variant="default"
            />
          </div>

          
          {/* Tabs */}
          <Tabs defaultValue="by-stakeholder" className="space-y-6">
            <TabsList className="bg-white border border-sky">
              <TabsTrigger 
                value="by-stakeholder" 
                className="text-stratosphere data-[state=active]:bg-stratosphere data-[state=active]:text-white"
              >
                By Stakeholder
              </TabsTrigger>
              <TabsTrigger 
                value="all-impacts" 
                className="text-stratosphere data-[state=active]:bg-stratosphere data-[state=active]:text-white"
              >
                All Outcomes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-stakeholder">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredImpactsByStakeholder.length > 0 ? (
                  filteredImpactsByStakeholder.map(item => (
                    <Card 
                      key={item.stakeholderGroup._id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-sky hover:border-stratosphere"        
                    >
                      <CardHeader>
                        <CardTitle className="text-stratosphere">{item.stakeholderGroup.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-3 text-sm text-gray-600">{item.impacts.length} outcomes defined</p>
                        <div className="space-y-2">
                          {item.impacts.slice(0, 3).map((impact: Impact) => (
                            <div key={impact._id} className="text-sm">
                              <p className="text-stratosphere font-medium truncate">• {impact.outcome}</p>
                              <p className="text-xs text-gray-500 mt-1">{getThemeSubthemeSummary(impact)}</p>
                              {impact.risks && impact.risks.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  {impact.risks.length} risk{impact.risks.length !== 1 ? 's' : ''} in register
                                </div>
                              )}
                            </div>
                          ))}
                          {item.impacts.length > 3 && (
                            <p className="text-ochre-500 font-medium text-sm">+ {item.impacts.length - 3} more</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky p-12 text-center bg-white">
                    <p className="mb-4 text-gray-500 text-lg">No outcomes defined yet</p>
                    <p className="mb-6 text-sm text-gray-400">
                      Start by defining your first outcome for a stakeholder group{siteId && " at this site"}
                    </p>
                    <Button onClick={navigateToCreateImpact} className="bg-stratosphere hover:bg-stratosphere-900 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Define First Outcome
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all-impacts">
              <Card className="bg-white border border-sky">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-sky-tint border-b border-sky">
                      <tr>
                        <th className="p-4 text-left text-stratosphere font-semibold">Stakeholder</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Themes</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">SubThemes</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Outcome</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Risks</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">SDGs</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredImpacts.length > 0 ? (
                        filteredImpacts.map(impact => (
                          <tr 
                            key={impact._id} 
                            className="hover:bg-sky-tint transition-colors text-stratosphere"
                          >
                            <td className="p-4 font-medium">{impact.stakeholderGroup.name}</td>
                            <td className="p-4">
                              {renderThemes(impact.themes, 2)}
                            </td>
                            <td className="p-4">
                              {renderSubThemes(impact.subThemes, 2)}
                            </td>
                            <td className="p-4">
                              <div className="max-w-xs">
                                <p className="truncate" title={impact.outcome}>
                                  {impact.outcome}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              {impact.risks && impact.risks.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3 w-3" />
                                  {impact.risks.length}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">None</span>
                              )}
                            </td>
                            <td className="p-4">
                              {renderSDGTags(impact.sdgTags, 2)}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => navigateToEditImpact(impact._id, e)}
                                  className="h-8 w-8 p-0"
                                  title="Edit impact"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleDeleteImpact(impact._id, e)}
                                  disabled={deletingImpactId === impact._id}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                                  title="Delete impact"
                                >
                                  {deletingImpactId === impact._id ? (
                                    <Loader size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} className="text-red-600" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            No outcomes defined yet{siteId && " for this site"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Complete Stage Button */}
          {stageData && stageData.stage.status !== 'completed' && filteredImpacts.length > 0 && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button 
                onClick={() => {
                  completeStage(stageData.stage._id);
                }}
                className="bg-grass-500 hover:bg-grass-600 text-white"
              >
                Mark Stage 2 as Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}