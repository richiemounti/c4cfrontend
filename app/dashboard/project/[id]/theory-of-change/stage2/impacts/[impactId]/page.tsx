// pages/edit-impact.tsx (simplified version)

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { updateImpact, getImpactById } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getStagesByProject } from '@/lib/api/theoryOfChange';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ImpactForm from '@/components/forms/ImpactForm';
import { CreateImpactData } from '@/types';

export default function EditImpactPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const impactId = params.impactId as string;
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [stakeholderGroups, setStakeholderGroups] = useState<any[]>([]);
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
        
        // Get Stage 2 ID
        const { data: stageResp } = await getStagesByProject(projectId);
        const stage2 = stageResp.data.find((s: any) => s.stageNumber === 2);
        if (stage2) {
          setStageId(stage2._id);
        }
        
        // Get the specific impact to edit
        const { data: impactData } = await getImpactById(impactId);
        if (impactData.success) {
          setImpact(impactData.data);
        } else {
          console.error("Impact not found");
          router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, impactId, router]);
  
  const handleSubmit = async (data: CreateImpactData) => {
    try {
      setIsSubmitting(true);
      await updateImpact(impactId, data);
      router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`);
    } catch (error) {
      console.error("Error updating impact:", error);
      // Handle error - show toast, etc
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`);
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
          <p className="text-stratosphere font-medium ml-3">Loading impact...</p>
        </div>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-medium text-stratosphere mb-2">Impact Not Found</h2>
            <p className="text-gray-600 mb-4">The social impact you're trying to edit could not be found.</p>
            <button 
              onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`)}
              className="text-sky-500 hover:text-stratosphere"
            >
              ← Back to Stage 2
            </button>
          </div>
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
            onClick={() => router.push(`/dashboard/projects/${projectId}/theory-of-change/stage2`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 2
          </button>
          <div>
            <h1 className="text-2xl font-medium text-stratosphere">Edit Social Outcome</h1>
            <p className="text-gray-500 mt-2">
              Editing impact for {impact.stakeholderGroup.name}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <ImpactForm
            projectId={projectId}
            stageId={stageId}
            stakeholderGroups={stakeholderGroups}
            initialData={impact}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel="Update Outcome"
            title={`Edit Impact for ${impact.stakeholderGroup.name}`}
          />
        </div>
      </div>
    </div>
  );
}