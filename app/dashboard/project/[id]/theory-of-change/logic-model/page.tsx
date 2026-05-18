// /app/dashboard/projects/[projectId]/theory-of-change/logic-model/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, ArrowLeft, Download, AlertTriangle, Share } from 'lucide-react';
import { getStagesByProject, getLogicModel } from '@/lib/api/theoryOfChange';
import { getProject } from '@/lib/api/project';

export default function LogicModelPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [logicModel, setLogicModel] = useState<any>(null);
  const [stage2Id, setStage2Id] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        console.log(projectData.data)
        setProject(projectData.data);
        
        // Get Stage 2 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage2 = stageResp.data.find((s: any) => s.stageNumber === 2);
        
        if (stage2) {
          setStage2Id(stage2._id);
          setIsComplete(stage2.status === 'completed');
          
          // Get logic model data
          const { data: modelData } = await getLogicModel(stage2._id);
          setLogicModel(modelData.data || null);
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
    // Implement logic to download the model as PDF or Excel
    console.log("Download logic model");
  };
  
  const handleShare = () => {
    // Implement sharing functionality
    console.log("Share logic model");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stage2Id) {
    return (
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
          <h2 className="mt-4 text-xl font-semibold">Stage 2 Not Initialized</h2>
          <p className="mt-2 text-gray-600">
            You need to complete Stage 2 (External Facing) to generate a Logic Model.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`)}
          >
            Go to Stage 2
          </Button>
        </div>
      </div>
    );
  }

  // /app/dashboard/projects/[projectId]/theory-of-change/logic-model/page.tsx (continued)

  if (!isComplete) {
    return (
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
          <h2 className="mt-4 text-xl font-semibold">Stage 2 Not Completed</h2>
          <p className="mt-2 text-gray-600">
            You need to mark Stage 2 as complete to generate the final Logic Model.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`)}
          >
            Go to Stage 2
          </Button>
        </div>
      </div>
    );
  }

  if (!logicModel || !logicModel.stakeholders || logicModel.stakeholders.length === 0) {
    return (
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
          <h2 className="mt-4 text-xl font-semibold">Unable to Generate Logic Model</h2>
          <p className="mt-2 text-gray-600">
            There might be insufficient data to generate a Logic Model.
            Please ensure you have defined impacts for at least one stakeholder group.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`)}
          >
            Go to Stage 2
          </Button>
        </div>
      </div>
    );
  }

  return (
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
          <h1 className="text-3xl font-bold">Logic Model</h1>
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
          <CardTitle>Logic Model Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{logicModel.stakeholders?.length || 0} stakeholder groups represented</p>
          <p>{logicModel.outcomes?.length || 0} expected outcomes</p>
          <p>{logicModel.totalRisks || 0} potential risks identified</p>
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Stakeholder Group</th>
              <th className="border p-3 text-left">Inputs</th>
              <th className="border p-3 text-left">Activities</th>
              <th className="border p-3 text-left">Outputs</th>
              <th className="border p-3 text-left">Outcomes</th>
              <th className="border p-3 text-left">Impact</th>
            </tr>
          </thead>
          <tbody>
            {logicModel.stakeholders.map((stakeholder: any) => (
              <tr key={stakeholder.id} className="hover:bg-gray-50">
                <td className="border p-3">
                  <div className="font-medium">{stakeholder.name}</div>
                  <div className="text-sm text-gray-500">{stakeholder.type}</div>
                </td>
                <td className="border p-3">
                  <ul className="list-inside list-disc text-sm">
                    {stakeholder.inputs.map((input: string, idx: number) => (
                      <li key={idx}>{input}</li>
                    ))}
                  </ul>
                </td>
                <td className="border p-3">
                  <ul className="list-inside list-disc text-sm">
                    {stakeholder.activities.map((activity: string, idx: number) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </td>
                <td className="border p-3">
                  <ul className="list-inside list-disc text-sm">
                    {stakeholder.outputs.map((output: string, idx: number) => (
                      <li key={idx}>{output}</li>
                    ))}
                  </ul>
                </td>
                <td className="border p-3">
                  <ul className="list-inside list-disc text-sm">
                    {stakeholder.outcomes.map((outcome: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <div>{outcome.text}</div>
                        {outcome.risks && outcome.risks.length > 0 && (
                          <div className="mt-1 text-xs text-red-500">
                            {outcome.risks.length} risks identified
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border p-3">
                  <div className="flex flex-wrap gap-1">
                    {stakeholder.sdgs && stakeholder.sdgs.map((sdg: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                      >
                        {sdg}
                      </span>
                    ))}
                  </div>
                  {stakeholder.resilienceTags && stakeholder.resilienceTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stakeholder.resilienceTags.map((tag: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {logicModel.risks && logicModel.risks.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Stakeholder</th>
                  <th className="p-2 text-left">Risk</th>
                  <th className="p-2 text-left">Severity</th>
                  <th className="p-2 text-left">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody>
                {logicModel.risks.map((risk: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{risk.stakeholder}</td>
                    <td className="p-2">{risk.description}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${
                        risk.severity === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : risk.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="p-2">{risk.mitigation || 'Not specified'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}