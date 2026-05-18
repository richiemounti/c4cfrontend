// /app/dashboard/projects/[projectId]/theory-of-change/workplan/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader, ArrowLeft, Download, AlertTriangle, Share,
  CalendarDays, Check, Clock, Mail, Phone
} from 'lucide-react';
import { getStagesByProject, getWorkplan } from '@/lib/api/theoryOfChange';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';

export default function WorkplanPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [workplan, setWorkplan] = useState<any>(null);
  const [stage1Id, setStage1Id] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        console.log(projectData.data)
        setProject(projectData.data);
        
        // Get Stage 1 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage1 = stageResp.data.find((s: any) => s.stageNumber === 1);
        
        if (stage1) {
          setStage1Id(stage1._id);
          setIsComplete(stage1.status === 'completed');
          
          // Get workplan data
          const { data: planData } = await getWorkplan(stage1._id);
          setWorkplan(planData.data || null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  const handleDownload = () => {
    // Implement logic to download the workplan as PDF or Excel
    console.log("Download workplan");
  };
  
  const handleShare = () => {
    // Implement sharing functionality
    console.log("Share workplan");
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
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

  if (!stage1Id) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
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
            Back
          </Button>
          
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold">Stage 1 Not Initialized</h2>
            <p className="mt-2 text-gray-600">
              You need to complete Stage 1 (Internal Facing) to generate a Workplan.
            </p>
            <Button 
              className="mt-4"
              onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`)}
            >
              Go to Stage 1
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isComplete) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
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
            Back
          </Button>
          
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold">Stage 1 Not Completed</h2>
            <p className="mt-2 text-gray-600">
              You need to mark Stage 1 as complete to generate the final Workplan.
            </p>
            <Button 
              className="mt-4"
              onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`)}
            >
              Go to Stage 1
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!workplan || !workplan.actions || workplan.actions.length === 0) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
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
            Back
          </Button>
          
          <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">Unable to Generate Workplan</h2>
            <p className="mt-2 text-gray-600">
              There might be insufficient data to generate a Workplan.
              Please ensure you have defined actions for at least one stakeholder group.
            </p>
            <Button 
              className="mt-4"
              onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`)}
            >
              Go to Stage 1
            </Button>
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Workplan</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleShare}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button 
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workplan Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Total Actions</p>
                <p className="text-2xl font-semibold">{workplan.actions?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stakeholder Groups</p>
                <p className="text-2xl font-semibold">{workplan.stakeholders?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">With Assigned Responsibility</p>
                <p className="text-2xl font-semibold">{workplan.assignedCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">With Timeframe</p>
                <p className="text-2xl font-semibold">{workplan.withTimeframeCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Stakeholder</th>
                    <th className="p-3 text-left">Theme / Subtheme</th>
                    <th className="p-3 text-left">Responsibility</th>
                    <th className="p-3 text-left">Timeframe</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {workplan.actions.map((action: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{action.action}</div>
                        {action.notes && (
                          <div className="mt-1 text-xs text-gray-500">{action.notes}</div>
                        )}
                      </td>
                      <td className="p-3">{action.stakeholder}</td>
                      <td className="p-3">
                        <div>{action.theme}</div>
                        <div className="text-xs text-gray-500">{action.subTheme}</div>
                      </td>
                      <td className="p-3">
                        {action.responsibility?.name ? (
                          <div>
                            <div className="font-medium">{action.responsibility.name}</div>
                            {action.responsibility.role && (
                              <div className="text-xs text-gray-500">{action.responsibility.role}</div>
                            )}
                            {action.responsibility.email && (
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{action.responsibility.email}</span>
                              </div>
                            )}
                            {action.responsibility.phone && (
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{action.responsibility.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        {(action.timeframe?.startDate || action.timeframe?.endDate) ? (
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <div>
                              {action.timeframe.startDate && (
                                <div>Start: {formatDate(action.timeframe.startDate)}</div>
                              )}
                              {action.timeframe.endDate && (
                                <div>End: {formatDate(action.timeframe.endDate)}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}