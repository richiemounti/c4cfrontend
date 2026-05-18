// app/dashboard/project/[id]/theory-of-change/stage1/page.tsx
// Updated Stage1 Page with project/site filtering

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader, Plus, ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getStageProgress, getActionsByStage, getStagesByProject, completeStage, deleteAction } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

interface Action {
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
  action: string;
  responsibility?: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
  };
  timeframe?: {
    startDate?: string;
    endDate?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActionsByStakeholder {
  stakeholderGroup: {
    _id: string;
    name: string;
  };
  actions: Action[];
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

export default function Stage1Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId'); // Get siteId from query params if present
  
  const [loading, setLoading] = useState(true);
  const [stageData, setStageData] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [allStakeholderGroups, setAllStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionsByStakeholder, setActionsByStakeholder] = useState<ActionsByStakeholder[]>([]);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [completingStage, setCompletingStage] = useState(false);

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

  // Filter actions to only show those from relevant stakeholder groups
  const filteredActions = useMemo(() => {
    const relevantStakeholderIds = new Set(filteredStakeholderGroups.map(g => g._id));
    return actions.filter(action => relevantStakeholderIds.has(action.stakeholderGroup._id));
  }, [actions, filteredStakeholderGroups]);

  // Filter actionsByStakeholder
  const filteredActionsByStakeholder = useMemo(() => {
    const relevantStakeholderIds = new Set(filteredStakeholderGroups.map(g => g._id));
    return actionsByStakeholder.filter(item => 
      relevantStakeholderIds.has(item.stakeholderGroup._id)
    );
  }, [actionsByStakeholder, filteredStakeholderGroups]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const projectData = await getProject(projectId);
      setProject(projectData.data);
      
      // Get ALL stakeholder groups for the project (we'll filter client-side)
      const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId || undefined);
      // API returns { success, count, data: { stakeholderGroups, groupsByCategory } }
      setAllStakeholderGroups(stakeholderResponse.data?.stakeholderGroups || []);
      
      // Initialize stage if it doesn't exist yet or get existing stage
      // Pass siteId so we get the site-level stage when in site context
      let stageId;
      try {
        const { data: stageResp } = await getStagesByProject(projectId, siteId || undefined);
        const stage1 = stageResp.data.find((s: any) => s.stageNumber === 1);
        stageId = stage1._id;
      } catch (error) {
        console.error("Error getting stage:", error);
        return;
      }
      
      // Get stage progress data
      const { data: progressData } = await getStageProgress(stageId);
      setStageData(progressData.data);
      
      // Get all actions for this stage
      const { data: actionsData } = await getActionsByStage(stageId);
      setActions(actionsData.data.actions || []);
      setActionsByStakeholder(actionsData.data.actionsByStakeholder || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, siteId, refreshTrigger]);

  const navigateToCreateAction = () => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage1/actions/create`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };
  
  const navigateToStakeholder = (stakeholderId: string) => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage1/${stakeholderId}`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };

  const navigateToEditAction = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `/dashboard/project/${projectId}/theory-of-change/stage1/actions/${actionId}/edit`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };

  const handleDeleteAction = async (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this action? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingActionId(actionId);
      await deleteAction(actionId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting action:", error);
      alert('Failed to delete action. Please try again.');
    } finally {
      setDeletingActionId(null);
    }
  };

  const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    const handleCompleteStage = async () => {
    if (!stageData?.stage?._id) return;
    
    if (!confirm('Are you sure you want to mark this stage as complete? This will finalize all actions for this stage.')) {
      return;
    }

    try {
      setCompletingStage(true);
      await completeStage(stageData.stage._id);
      alert('Stage 1 completed successfully!');
      await fetchData();
    } catch (error: any) {
      console.error("Error completing stage:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to complete stage. Please try again.';
      alert(errorMessage);
    } finally {
      setCompletingStage(false);
    }
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

  const getThemeSubthemeSummary = (action: Action) => {
    const themeCount = action.themes?.length || 0;
    const subthemeCount = action.subThemes?.length || 0;
    
    if (themeCount === 0 && subthemeCount === 0) return "No themes/subthemes";
    if (themeCount === 1 && subthemeCount === 1) {
      return `${action.themes[0].name} → ${action.subThemes[0].name}`;
    }
    return `${themeCount} themes, ${subthemeCount} subthemes`;
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
                Stage 1: Actions {siteId && <span className="text-gray-500">(Site Level)</span>}
              </h1>
              <p className="text-gray-500 mt-2">
                Define your team's planned actions for each stakeholder group
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
              <Button onClick={navigateToCreateAction} className="bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Action
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
                <span className="font-semibold">Site Context:</span> You are viewing and managing actions for stakeholders specific to this site.
              </p>
            </div>
          )}

          {/* Help & Resources Panel */}
          <div className="mt-8">
            <InstructionalPanel
              title="Need Help with Theory of Change - Stage 1?"
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
                  content: "Stage 1 plans internal actions to generate Verified Emission Reductions.",
                  type: "info"
                },
                {
                  content: "Stage 2 identifies what stakeholders want to achieve as a result of receiving carbon revenue.",
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
                value="all-actions" 
                className="text-stratosphere data-[state=active]:bg-stratosphere data-[state=active]:text-white"
              >
                All Actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-stakeholder">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredActionsByStakeholder.length > 0 ? (
                  filteredActionsByStakeholder.map(item => (
                    <Card 
                      key={item.stakeholderGroup._id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-sky hover:border-stratosphere"
                    >
                      <CardHeader>
                        <CardTitle className="text-stratosphere">{item.stakeholderGroup.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-3 text-sm text-gray-600">{item.actions.length} actions defined</p>
                        <div className="space-y-2">
                          {item.actions.slice(0, 3).map((action: Action) => (
                            <div key={action._id} className="text-sm">
                              <p className="text-stratosphere font-medium truncate">• {action.action}</p>
                              <p className="text-xs text-gray-500 mt-1">{getThemeSubthemeSummary(action)}</p>
                            </div>
                          ))}
                          {item.actions.length > 3 && (
                            <p className="text-ochre-500 font-medium text-sm">+ {item.actions.length - 3} more</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky p-12 text-center bg-white">
                    <p className="mb-4 text-gray-500 text-lg">No actions defined yet</p>
                    <p className="mb-6 text-sm text-gray-400">
                      Start by defining your first action for a stakeholder group{siteId && " at this site"}
                    </p>
                    <Button onClick={navigateToCreateAction} className="bg-stratosphere hover:bg-stratosphere-900 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Define First Action
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all-actions">
              <Card className="bg-white border border-sky">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-sky-tint border-b border-sky">
                      <tr>
                        <th className="p-4 text-left text-stratosphere font-semibold">Stakeholder</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Themes</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">SubThemes</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Action</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Responsibility</th>
                        <th className="p-4 text-left text-stratosphere font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredActions.length > 0 ? (
                        filteredActions.map(action => (
                          <tr 
                            key={action._id} 
                            className="hover:bg-sky-tint transition-colors text-stratosphere"
                          >
                            <td className="p-4 font-medium">{action.stakeholderGroup.name}</td>
                            <td className="p-4">
                              {renderThemes(action.themes, 2)}
                            </td>
                            <td className="p-4">
                              {renderSubThemes(action.subThemes, 2)}
                            </td>
                            <td className="p-4">
                              <div className="max-w-xs">
                                <p className="truncate" title={action.action}>
                                  {action.action}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">{action.responsibility?.name || '-'}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => navigateToEditAction(action._id, e)}
                                  className="h-8 w-8 p-0"
                                  title="Edit action"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleDeleteAction(action._id, e)}
                                  disabled={deletingActionId === action._id}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                                  title="Delete action"
                                >
                                  {deletingActionId === action._id ? (
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
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No actions defined yet{siteId && " for this site"}
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
          {stageData && stageData.stage.status !== 'completed' && filteredActions.length > 0 && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button 
                onClick={handleCompleteStage}
                disabled={completingStage}
                className="bg-grass-500 hover:bg-grass-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completingStage ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Completing Stage...
                  </>
                ) : (
                  'Mark Stage 1 as Complete'
                )}
              </Button>
            </div>
          )}    

          {/* Completion Status Badge */}
          {stageData && stageData.stage.status === 'completed' && (
            <div className="bg-grass-50 border border-grass-200 rounded-lg p-4 mt-6">
              <p className="text-grass-800 font-medium flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Stage 1 Completed
              </p>
              {stageData.stage.completedAt && (
                <p className="text-sm text-grass-600 mt-1 ml-7">
                  Completed on {new Date(stageData.stage.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}    
        </div>
      </div>
    </div>
  );
}