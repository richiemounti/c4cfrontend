// /app/dashboard/projects/[projectId]/theory-of-change/stage2/[stakeholderId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader, Plus, ArrowLeft, Edit, Trash2, 
  AlertTriangle, AlertOctagon, ShieldCheck
} from 'lucide-react';
import { deleteImpact, getImpactsByStakeholder, getStagesByProject } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';

export default function StakeholderImpactsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const stakeholderId = params.stakeholderId as string;
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [stakeholder, setStakeholder] = useState<any>(null);
  const [impacts, setImpacts] = useState<any[]>([]);
  const [impactsByTheme, setImpactsByTheme] = useState<any[]>([]);
  const [stageId, setStageId] = useState<string>('');
  const [sdgTags, setSdgTags] = useState<string[]>([]);
  const [resilienceTags, setResilienceTags] = useState<string[]>([]);

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
        
        // Get Stage 2 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage2 = stageResp.data.find((s: any) => s.stageNumber === 2);
        if (stage2) {
          setStageId(stage2._id);
          
          // Get impacts for this stakeholder
          const { data: impactsData } = await getImpactsByStakeholder(stage2._id, stakeholderId);
          setImpacts(impactsData.data.impacts || []);
          setImpactsByTheme(impactsData.data.impactsByTheme || []);
          
          // Collect unique SDG and resilience tags
          const sdgs = new Set<string>();
          const resilience = new Set<string>();
          impactsData.data.impacts.forEach((impact: any) => {
            impact.sdgTags?.forEach((tag: string) => sdgs.add(tag));
            impact.resilienceTags?.forEach((tag: string) => resilience.add(tag));
          });
          
          setSdgTags(Array.from(sdgs));
          setResilienceTags(Array.from(resilience));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, stakeholderId]);

  const navigateToCreateImpact = () => {
    // Pre-fill stakeholder ID in the create form
    router.push(`/dashboard/project/${projectId}/theory-of-change/stage2/impacts/create?stakeholderId=${stakeholderId}`);
  };
  
  const handleEditImpact = (impactId: string) => {
    router.push(`/dashboard/project/${projectId}/theory-of-change/stage2/impacts/${impactId}/edit`);
  };
  
  const handleDeleteImpact = async (impactId: string) => {
    if (confirm('Are you sure you want to delete this impact?')) {
      try {
        await deleteImpact(impactId);
        // Refresh data after deletion
        const { data: impactsData } = await getImpactsByStakeholder(stageId, stakeholderId);
        setImpacts(impactsData.data.impacts || []);
        setImpactsByTheme(impactsData.data.impactsByTheme || []);
      } catch (error) {
        console.error("Error deleting impact:", error);
      }
    }
  };
  
  const getRiskSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
          <p className="text-ink font-medium ml-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-tint">
      {project && (
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
      )}
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-neutral">
          <button 
            onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change/stage2`)}
            className="flex items-center text-neutral-500 hover:text-ink mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 2
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-ink">{stakeholder?.name}</h1>
              <p className="text-neutral-500 mt-2">Social impacts for this stakeholder group</p>
            </div>
            <Button onClick={navigateToCreateImpact} className="bg-coral-500 hover:bg-coral-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Impact
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="bg-white border border-neutral">
              <CardHeader>
                <CardTitle className="text-ink">Stakeholder Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="text-sm font-medium text-neutral-500">Type:</span>{' '}
                    {stakeholder?.type}
                  </p>
                  <p>
                    <span className="text-sm font-medium text-neutral-500">Category:</span>{' '}
                    {stakeholder?.category?.name || stakeholder?.category}
                  </p>
                  {stakeholder?.description && (
                    <p>
                      <span className="text-sm font-medium text-neutral-500">Description:</span>{' '}
                      {stakeholder.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-neutral">
              <CardHeader>
                <CardTitle className="text-ink">Impacts Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>
                    <span className="text-2xl font-semibold text-ink">{impacts.length}</span>{' '}
                    <span className="text-neutral-500">impacts defined</span>
                  </p>
                  <p>
                    <span className="text-neutral-500">Across {impactsByTheme.length} themes</span>
                  </p>
                  <p className="mt-1 text-sm">
                    {impacts.reduce((total, impact) => total + (impact.risks?.length || 0), 0)} risks identified
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-neutral">
              <CardHeader>
                <CardTitle className="text-ink">Associated SDGs</CardTitle>
              </CardHeader>
              <CardContent>
                {sdgTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {sdgTags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center rounded-full bg-cobalt-100 px-2 py-0.5 text-xs text-cobalt-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No SDGs associated</p>
                )}
                
                {resilienceTags.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-sm font-medium text-neutral-500">Resilience Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {resilienceTags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="by-theme" className="space-y-6">
            <TabsList className="bg-white border border-neutral">
              <TabsTrigger 
                value="by-theme" 
                className="text-ink data-[state=active]:bg-coral-500 data-[state=active]:text-white"
              >
                By Theme
              </TabsTrigger>
              <TabsTrigger 
                value="all-impacts" 
                className="text-ink data-[state=active]:bg-coral-500 data-[state=active]:text-white"
              >
                All Impacts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-theme">
              <div className="space-y-6">
                {impactsByTheme.length > 0 ? (
                  impactsByTheme.map(themeGroup => (
                    <Card key={themeGroup.theme._id} className="bg-white border border-neutral">
                      <CardHeader>
                        <CardTitle className="text-ink">{themeGroup.theme.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y divide-stone-100">
                          {themeGroup.impacts.map((impact: any) => (
                            <div key={impact._id} className="py-4 first:pt-0 last:pb-0">
                              <div className="mb-2 flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-ink">{impact.outcome}</h3>
                                  <p className="text-sm text-neutral-500">
                                    Subtheme: {impact.subTheme.name}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditImpact(impact._id)}
                                    className="hover:bg-neutral-tint"
                                  >
                                    <Edit className="h-4 w-4 text-ink" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteImpact(impact._id)}
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              
                              {impact.sdgTags && impact.sdgTags.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {impact.sdgTags.map((tag: string, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex items-center rounded-full bg-cobalt-100 px-2 py-0.5 text-xs text-cobalt-800"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {impact.risks && impact.risks.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium text-ink">Risks:</h4>
                                  <div className="mt-1 space-y-2">
                                    {impact.risks.map((risk: any, idx: number) => (
                                      <div key={idx} className="rounded-md bg-neutral-tint border border-neutral p-3">
                                        <div className="flex items-center gap-2">
                                          {getRiskSeverityIcon(risk.severity)}
                                          <p className="font-medium text-ink">{risk.description}</p>
                                        </div>
                                        {risk.mitigation && (
                                          <div className="mt-2 border-t border-stone-200 pt-2">
                                            <p className="text-sm">
                                              <span className="text-neutral-500 font-medium">Mitigation:</span> {risk.mitigation}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {impact.notes && (
                                <div className="mt-2 rounded-md bg-neutral-tint border border-neutral p-3 text-sm text-neutral-600">
                                  <p><span className="font-medium text-ink">Notes:</span> {impact.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral p-12 text-center bg-white">
                    <p className="mb-4 text-neutral-500 text-lg">No impacts defined yet for this stakeholder group</p>
                    <p className="mb-6 text-sm text-neutral-400">Start by defining your first impact for this stakeholder</p>
                    <Button onClick={navigateToCreateImpact} className="bg-coral-500 hover:bg-coral-600 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Add First Impact
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all-impacts">
              <Card className="bg-white border border-neutral">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-tint border-b border-neutral">
                      <tr>
                        <th className="p-4 text-left text-ink font-semibold">Outcome</th>
                        <th className="p-4 text-left text-ink font-semibold">Theme</th>
                        <th className="p-4 text-left text-ink font-semibold">Subtheme</th>
                        <th className="p-4 text-left text-ink font-semibold">Risks</th>
                        <th className="p-4 text-left text-ink font-semibold">SDGs</th>
                        <th className="p-4 text-left text-ink font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {impacts.length > 0 ? (
                        impacts.map(impact => (
                          <tr key={impact._id} className="hover:bg-neutral-tint transition-colors">
                            <td className="p-4 text-ink font-medium">{impact.outcome}</td>
                            <td className="p-4">{impact.theme.name}</td>
                            <td className="p-4">{impact.subTheme.name}</td>
                            <td className="p-4">
                              {impact.risks && impact.risks.length > 0 ? (
                                <div className="flex gap-1">
                                  {impact.risks.map((risk: any, idx: number) => (
                                    <div key={idx} title={risk.description}>
                                      {getRiskSeverityIcon(risk.severity)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-neutral-400">None</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {impact.sdgTags && impact.sdgTags.length > 0 ? (
                                  impact.sdgTags.map((tag: string, idx: number) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex items-center rounded-full bg-cobalt-100 px-2 py-0.5 text-xs text-cobalt-800"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-neutral-400">None</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditImpact(impact._id)}
                                  className="hover:bg-neutral-tint"
                                >
                                  <Edit className="h-4 w-4 text-ink" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteImpact(impact._id)}
                                  className="hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-neutral-500">
                            No impacts defined yet for this stakeholder
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}