// components/stakeholders/StakeholderMappingView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ChevronRight, Award, Check, RefreshCw, Edit, Trash2, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject, getProjectSite } from '@/lib/api/project';
import { CompletionStats, StakeholderGroup, Project, ProjectSite } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

interface StakeholderMappingViewProps {
  projectId: string;
  siteId?: string;
  context: 'project' | 'site';
}

const StakeholderMappingView = ({ projectId, siteId, context }: StakeholderMappingViewProps) => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [site, setSite] = useState<ProjectSite | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [stakeholderGroups, setStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completionDismissed, setCompletionDismissed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load project details
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        
        // Load site details if in site context
        if (context === 'site' && siteId) {
          const siteResponse = await getProjectSite(siteId);
          setSite(siteResponse.data);
        }
        
        // Load stakeholder mapping stats
        const statsResponse = await stakeholderMappingApi.getCompletionStats(projectId, siteId);
        setStats(statsResponse.data);
        
        // Load stakeholder groups
        const groupsResponse = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId);
        
        // Correctly access the nested stakeholder groups
        if (groupsResponse && 
            groupsResponse.data && 
            groupsResponse.data.data && 
            groupsResponse.data.data.stakeholderGroups) {
          
          // For project context, filter out site-specific groups
            const groups = context === 'project' 
            ? groupsResponse.data.data.stakeholderGroups.filter(
                (group: StakeholderGroup) => !group.projectSite
                )
            : groupsResponse.data.data.stakeholderGroups;
          
          setStakeholderGroups(groups);
        } else {
          console.error('Unexpected data format from stakeholder groups API:', groupsResponse.data);
          setStakeholderGroups([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading stakeholder mapping data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stakeholder mapping data',
          variant: 'destructive',
        });
        setStakeholderGroups([]);
        setLoading(false);
      }
    };
    
    if (projectId) {
      loadData();
    }
  }, [projectId, siteId, context, toast, refreshTrigger]);

  const handleGoBack = () => {
    if (context === 'site' && siteId) {
      router.push(`/dashboard/site/${siteId}`);
    } else {
      router.push(`/dashboard/project/${projectId}`);
    }
  };

  const handleAddStakeholder = () => {
    if (context === 'site' && siteId) {
      router.push(`/dashboard/stakeholders/categories/site/${siteId}?projectId=${projectId}`);
    } else {
      router.push(`/dashboard/stakeholders/categories/project/${projectId}`);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleContinueMapping = () => {
    const incompleteGroup = stakeholderGroups.find(
      group => group.completionStatus !== 'completed'
    );
    
    if (incompleteGroup) {
      const taskTypes = ['connections', 'power', 'wellbeing', 'roles', 'risks', 'benefits'];
      const completedTasks = new Set(incompleteGroup.tasks.map(t => t.taskType));
      const nextTask = taskTypes.find(type => !completedTasks.has(type as any));
      
      if (nextTask) {
        router.push(`/dashboard/stakeholders/tasks/${incompleteGroup._id}?taskType=${nextTask}`);
      } else {
        router.push(`/dashboard/stakeholders/tasks/${incompleteGroup._id}?taskType=connections`);
      }
    } else {
      handleAddStakeholder();
    }
  };

  const handleEditStakeholder = (groupId: string) => {
    if (context === 'site' && siteId) {
      router.push(`/dashboard/stakeholders/edit/site/${siteId}/${groupId}?projectId=${projectId}`);
    } else {
      router.push(`/dashboard/stakeholders/edit/project/${projectId}/${groupId}`);
    }
  };

  const handleDeleteStakeholder = async (groupId: string, groupName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the stakeholder group "${groupName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(groupId);
      await stakeholderMappingApi.deleteStakeholderGroup(groupId);
      
      toast({
        title: 'Success',
        description: 'Stakeholder group deleted successfully',
      });
      
      // Refresh the data
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error deleting stakeholder group:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete stakeholder group',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere mx-auto mb-4"></div>
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
            onClick={handleGoBack}
            className="flex items-center text-sky-500 hover:text-stratosphere"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to {context === 'site' ? 'Site' : 'Project'}
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium mt-4 text-stratosphere">Map Stakeholders</h1>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>
          {context === 'site' && site ? (
            <p className="text-gray-600 mt-1">Site: {site.name}</p>
          ) : project ? (
            <p className="text-gray-600 mt-1">Project: {project.name}</p>
          ) : null}
        </div>

        <div className="p-8">
          {/* Help & Resources Panel */}
          <div className="py-8">
            <InstructionalPanel
              title="Getting Started Guide"
              subtitle="This module helps you identify key stakeholders and understand their interests, concerns, benefits, and potential risks related to the project. We recommend completing this collaboratively — gather your team and work through the questions together."
              texts={[
                {
                  content: "Watch the video tutorial for an overview of stakeholder mapping.",
                  type: "tip"
                },
                {
                  content: "Make sure you've reviewed the Stakeholder Mapping Guide on the previous page before you begin.",
                  type: "info"
                },
                {
                  content: "Add a stakeholder group, then work through the mapping tasks for each one — save a draft as you go, you don't need to finish in one sitting.",
                  type: "info"
                },
                {
                  content: "Questions? Reach out to your Mentor, Hannah.",
                  type: "note"
                }
              ]}
              links={[
                {
                  href: `/dashboard/project/${projectId}/stakeholders/guide`,
                  label: "Stakeholder Mapping Guide",
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
              variant="default"
            />
          </div>

          {/* Module Completion Message */}
          {stats && stats.total > 0 && stats.completed === stats.total && !completionDismissed && (
            <div className="bg-white rounded-lg shadow-sm border border-grass-500/30 p-6 mb-8">
              <h2 className="text-lg font-medium text-stratosphere mb-2">Stakeholder Mapping complete 🎉</h2>
              <p className="text-gray-600 mb-2">
                You've mapped enough stakeholders to start building your Theory of Change — time to explore what change looks like for them.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can always come back to add or edit stakeholder groups via Project Home → Project Workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
                  className="flex-1 bg-grass-500 text-white py-2 px-4 rounded hover:bg-grass-900 flex items-center justify-center"
                >
                  <GitBranch size={18} className="mr-2" />
                  Go to Theory of Change
                </button>
                <button
                  onClick={() => setCompletionDismissed(true)}
                  className="flex-1 border border-sky text-sky-500 py-2 px-4 rounded hover:bg-sky-50"
                >
                  I'll come back later
                </button>
              </div>
            </div>
          )}

          {/* Overview Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium mb-4 text-stratosphere">Stakeholder Mapping</h2>

            {/* Summary */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-sky-100 p-4 rounded-md">
                  <p className="text-2xl font-semibold text-stratosphere-500">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Groups</p>
                </div>
                <div className="bg-grass-100 p-4 rounded-md">
                  <p className="text-2xl font-semibold text-grass-900">{stats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="bg-ochre-100 p-4 rounded-md">
                  <p className="text-2xl font-semibold text-ochre-500">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {stats && (stats.inProgress > 0 || stats.notStarted > 0) && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinueMapping}
                  className="flex-1 bg-grass-500 text-white py-2 px-4 rounded hover:bg-grass-900 flex items-center justify-center"
                >
                  <ChevronRight size={18} className="mr-2" />
                  Continue Mapping
                </button>
              </div>
            )}
          </div>

          {/* Stakeholder Groups List */}
          {stakeholderGroups && stakeholderGroups.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-concrete-500 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-stratosphere">Stakeholder Groups</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {stakeholderGroups.length} group(s)
                  </p>
                </div>
                <button
                  onClick={handleAddStakeholder}
                  className="flex-shrink-0 border border-stratosphere-500 text-stratosphere-500 py-2 px-4 rounded hover:bg-stratosphere-50 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Stakeholder Group
                </button>
              </div>

              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-concrete-500">
                  <thead className="bg-concrete-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-concrete-100">
                    {stakeholderGroups.map(group => (
                      <tr key={group._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {typeof group.category === 'object' ? group.category.name : group.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            group.completionStatus === 'completed' ? 'bg-grass-100 text-grass-900' :
                            group.completionStatus === 'in_progress' ? 'bg-ochre-100 text-ochre-900' :
                            'bg-concrete-100 text-concrete-900'
                          }`}>
                            {group.completionStatus === 'completed' ? 'Completed' :
                             group.completionStatus === 'in_progress' ? 'In Progress' :
                             'Not Started'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            {/* Edit Button */}
                            <button 
                              onClick={() => handleEditStakeholder(group._id)}
                              className="text-sky-500 hover:text-stratosphere transition-colors"
                              title="Edit stakeholder group"
                            >
                              <Edit size={18} />
                            </button>
                            
                            {/* Delete Button */}
                            <button 
                              onClick={() => handleDeleteStakeholder(group._id, group.name)}
                              disabled={deletingId === group._id}
                              className="text-clay-500 hover:text-clay-900 transition-colors disabled:opacity-50"
                              title="Delete stakeholder group"
                            >
                              {deletingId === group._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-clay-500"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                            
                            {/* Continue/View Button */}
                            {group.completionStatus === 'completed' ? (
                              <button 
                                className="text-grass-500 hover:text-grass-900 flex items-center gap-1"
                                onClick={() => router.push(`/dashboard/stakeholders/tasks/${group._id}?taskType=connections`)}
                                title="View completed tasks"
                              >
                                <Check size={18} />
                              </button>
                            ) : (
                              <button 
                                className="text-stratosphere-500 hover:text-stratosphere-900 font-medium"
                                onClick={() => {
                                  const taskTypes = ['connections', 'power', 'wellbeing', 'roles', 'risks', 'benefits'];
                                  const completedTasks = new Set(group.tasks.map(t => t.taskType));
                                  const nextTask = taskTypes.find(type => !completedTasks.has(type as any)) || 'connections';
                                  router.push(`/dashboard/stakeholders/tasks/${group._id}?taskType=${nextTask}`);
                                }}
                              >
                                Continue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Award size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Stakeholder Groups Yet</h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first stakeholder group to begin mapping your {context === 'site' ? 'site' : 'project'}'s stakeholders.
              </p>
              <button
                onClick={handleAddStakeholder}
                className="bg-stratosphere-500 text-white py-2 px-4 rounded hover:bg-stratosphere-900 inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Stakeholder Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakeholderMappingView;