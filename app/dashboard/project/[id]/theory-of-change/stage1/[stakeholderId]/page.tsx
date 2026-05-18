// /app/dashboard/projects/[projectId]/theory-of-change/stage1/[stakeholderId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Plus, ArrowLeft, CalendarDays, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { deleteAction, getActionsByStakeholder, getStagesByProject } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { format } from 'date-fns';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';

export default function StakeholderActionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const stakeholderId = params.stakeholderId as string;
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [stakeholder, setStakeholder] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [actionsByTheme, setActionsByTheme] = useState<any[]>([]);
  const [stageId, setStageId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        console.log(projectData.data)
        setProject(projectData.data);
        
        // Get stakeholder details
        const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroup(stakeholderId);
        setStakeholder(stakeholderResponse.data);
        
        // Get Stage 1 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage1 = stageResp.data.find((s:any) => s.stageNumber === 1);
        if (stage1) {
          setStageId(stage1._id);
          
          // Get actions for this stakeholder
          const { data: actionsData } = await getActionsByStakeholder(stage1._id, stakeholderId);
          setActions(actionsData.data.actions || []);
          setActionsByTheme(actionsData.data.actionsByTheme || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, stakeholderId]);

  const navigateToCreateAction = () => {
    // Pre-fill stakeholder ID in the create form
    router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1/actions/create?stakeholderId=${stakeholderId}`);
  };
  
  const handleEditAction = (actionId: string) => {
    router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1/actions/${actionId}/edit`);
  };
  
  const handleDeleteAction = async (actionId: string) => {
    if (confirm('Are you sure you want to delete this action?')) {
      try {
        await deleteAction(actionId);
        // Refresh data after deletion
        const { data: actionsData } = await getActionsByStakeholder(stageId, stakeholderId);
        setActions(actionsData.data.actions || []);
        setActionsByTheme(actionsData.data.actionsByTheme || []);
      } catch (error) {
        console.error("Error deleting action:", error);
      }
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
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
        <div className="flex h-full items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stage 1
        </Button>
        
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{stakeholder?.name}</h1>
            <p className="text-gray-600">Actions for this stakeholder group</p>
          </div>
          <Button onClick={navigateToCreateAction}>
            <Plus className="mr-2 h-4 w-4" /> Add Action
          </Button>
        </div>
        
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="text-sm font-medium text-gray-500">Type:</span>{' '}
                  {stakeholder?.type}
                </p>
                <p>
                  <span className="text-sm font-medium text-gray-500">Category:</span>{' '}
                  {stakeholder?.category}
                </p>
                {stakeholder?.description && (
                  <p>
                    <span className="text-sm font-medium text-gray-500">Description:</span>{' '}
                    {stakeholder.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>
                  <span className="text-2xl font-semibold">{actions.length}</span>{' '}
                  <span className="text-gray-500">actions defined</span>
                </p>
                <p>
                  <span className="text-gray-500">Across {actionsByTheme.length} themes</span>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Impact Types</CardTitle>
            </CardHeader>
            <CardContent>
              {stakeholder?.impactTypes && stakeholder.impactTypes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {stakeholder.impactTypes.map((type: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No impact types defined</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="by-theme" className="mb-6">
          <TabsList>
            <TabsTrigger value="by-theme">By Theme</TabsTrigger>
            <TabsTrigger value="all-actions">All Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-theme">
            <div className="space-y-6">
              {actionsByTheme.length > 0 ? (
                actionsByTheme.map(themeGroup => (
                  <Card key={themeGroup.theme._id}>
                    <CardHeader>
                      <CardTitle>{themeGroup.theme.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {themeGroup.actions.map((action: any) => (
                          <div key={action._id} className="py-4 first:pt-0 last:pb-0">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{action.action}</h3>
                                <p className="text-sm text-gray-500">
                                  Subtheme: {action.subTheme.name}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditAction(action._id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteAction(action._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            
                            {action.responsibility && action.responsibility.name && (
                              <div className="mt-2 flex items-center text-sm">
                                <span className="font-medium">Responsible:</span>&nbsp;
                                <span>{action.responsibility.name}</span>
                                {action.responsibility.role && (
                                  <span className="ml-1 text-gray-500">({action.responsibility.role})</span>
                                )}
                              </div>
                            )}
                            
                            {(action.timeframe?.startDate || action.timeframe?.endDate) && (
                              <div className="mt-1 flex items-center gap-1 text-sm">
                                <CalendarDays className="h-3 w-3 text-gray-400" />
                                <span>
                                  {formatDate(action.timeframe.startDate)} to {formatDate(action.timeframe.endDate)}
                                </span>
                              </div>
                            )}
                            
                            {action.responsibility?.email && (
                              <div className="mt-1 flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{action.responsibility.email}</span>
                              </div>
                            )}
                            
                            {action.responsibility?.phone && (
                              <div className="mt-1 flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{action.responsibility.phone}</span>
                              </div>
                            )}
                            
                            {action.notes && (
                              <div className="mt-2 rounded-md bg-gray-50 p-2 text-sm text-gray-600">
                                <p>{action.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="mb-4 text-gray-500">No actions defined yet for this stakeholder group</p>
                  <Button onClick={navigateToCreateAction}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Action
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all-actions">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Theme</th>
                    <th className="p-3 text-left">Subtheme</th>
                    <th className="p-3 text-left">Responsible</th>
                    <th className="p-3 text-left">Timeframe</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {actions.length > 0 ? (
                    actions.map(action => (
                      <tr key={action._id}>
                        <td className="p-3">{action.action}</td>
                        <td className="p-3">{action.theme.name}</td>
                        <td className="p-3">{action.subTheme.name}</td>
                        <td className="p-3">
                          {action.responsibility?.name ? (
                            <div>
                              <div>{action.responsibility.name}</div>
                              {action.responsibility.role && (
                                <div className="text-xs text-gray-500">{action.responsibility.role}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          {action.timeframe?.startDate ? (
                            <div className="text-xs">
                              {formatDate(action.timeframe.startDate)} 
                              {action.timeframe.endDate && (
                                <span> - {formatDate(action.timeframe.endDate)}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditAction(action._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteAction(action._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No actions defined yet for this stakeholder
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}