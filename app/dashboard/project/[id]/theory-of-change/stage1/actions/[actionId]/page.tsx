// pages/edit-action.tsx (simplified version)

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { updateAction, getActionById } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getStagesByProject } from '@/lib/api/theoryOfChange';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ActionForm from '@/components/forms/ActionForm';
import { CreateActionData } from '@/types';

export default function EditActionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const actionId = params.actionId as string;
  
  const [loading, setLoading] = useState(true);
  const [stakeholderGroups, setStakeholderGroups] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [action, setAction] = useState<any>(null);
  const [stageId, setStageId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        // Get all stakeholder groups for the project
        const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId);
        
        // Extract stakeholder groups from the correct path
        let extractedStakeholderGroups = [];
        if (stakeholderResponse && stakeholderResponse.data) {
          if (Array.isArray(stakeholderResponse.data.stakeholderGroups)) {
            extractedStakeholderGroups = stakeholderResponse.data.stakeholderGroups;
          } else if (Array.isArray(stakeholderResponse.data)) {
            extractedStakeholderGroups = stakeholderResponse.data;
          }
        }
        
        setStakeholderGroups(extractedStakeholderGroups);
        
        // Get Stage 1 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage1 = stageResp.data.find((s: any) => s.stageNumber === 1);
        if (stage1) {
          setStageId(stage1._id);
        }
        
        // Get the specific action to edit
        const { data: actionData } = await getActionById(actionId);
        if (actionData.success) {
          setAction(actionData.data);
        } else {
          console.error("Action not found");
          router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, actionId, router]);
  
  const handleSubmit = async (data: CreateActionData) => {
    try {
      setIsSubmitting(true);
      await updateAction(actionId, data);
      router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`);
    } catch (error) {
      console.error("Error updating action:", error);
      // Handle error - show toast, etc
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`);
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
          <p className="text-stratosphere font-medium ml-3">Loading action...</p>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-medium text-stratosphere mb-2">Action Not Found</h2>
            <p className="text-gray-600 mb-4">The action you're trying to edit could not be found.</p>
            <button 
              onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`)}
              className="text-sky-500 hover:text-stratosphere"
            >
              ← Back to Stage 1
            </button>
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
            onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage1`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 1
          </button>
          <h1 className="text-2xl font-medium text-stratosphere">Edit Stakeholder Action</h1>
          <p className="text-gray-500 mt-2">
            Editing action for {action.stakeholderGroup.name}
          </p>
        </div>

        {/* Main content */}
        <div className="p-8">
          <ActionForm
            projectId={projectId}
            stageId={stageId}
            stakeholderGroups={stakeholderGroups}
            initialData={action}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel="Update Action"
            title={`Edit Action for ${action.stakeholderGroup.name}`}
          />
        </div>
      </div>
    </div>
  );
}