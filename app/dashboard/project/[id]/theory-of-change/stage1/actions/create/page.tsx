// app/dashboard/project/[id]/theory-of-change/stage1/actions/create/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAction } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getStagesByProject } from '@/lib/api/theoryOfChange';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ActionForm from '@/components/forms/ActionForm';
import { CreateActionData } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StakeholderGroup {
  _id: string;
  name: string;
  project: string;
  projectSite?: string;
  category: {
    _id: string;
    name: string;
  };
}

export default function CreateActionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId'); // Get siteId from query params
  
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [allStakeholderGroups, setAllStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [project, setProject] = useState<any>(null);
  const [stageId, setStageId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Helper function to get error message from API response
  const getErrorMessage = (error: any): string => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return data.message || 'Please check your input and try again';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'Resource not found. Please refresh and try again.';
        case 409:
          return 'An action with the same content already exists for this stakeholder group.';
        case 422:
          return 'Invalid data provided. Please check your inputs.';
        case 500:
          return 'Server error. Please try again or contact support.';
        default:
          return data.message || `Error ${status}: Operation failed`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection and try again.';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        // Get ALL stakeholder groups for the project (we'll filter client-side)
        const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId || undefined);
        
        // Extract stakeholder groups from the correct path
        const extractedStakeholderGroups = stakeholderResponse.data?.stakeholderGroups || [];
        setAllStakeholderGroups(extractedStakeholderGroups);
        
        // Get or initialize Stage 1 — pass siteId so we get the site-level stage when in site context
        const { data: stageResp } = await getStagesByProject(projectId, siteId || undefined);
        const stage1 = stageResp.data.find((s: any) => s.stageNumber === 1);
        if (stage1) {
          setStageId(stage1._id);
        } else {
          console.error("Stage 1 not found");
          toast({
            title: "Error",
            description: "Stage 1 not found. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        
        const errorMessage = getErrorMessage(error);
        toast({
          title: "Loading Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, siteId, toast]);
  
  const handleSubmit = async (data: CreateActionData) => {
    try {
      setIsSubmitting(true);
      
      // Add siteId if in site context
      const actionData = {
        ...data,
        projectSiteId: siteId || undefined
      };
      
      toast({
        title: "Creating Action",
        description: "Please wait while we create your action...",
      });
      
      await createAction(actionData);
      
      toast({
        title: "Success!",
        description: "Action created successfully",
      });
      
      // Navigate back with context preserved
      setTimeout(() => {
        const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
        router.push(siteId ? `${url}?siteId=${siteId}` : url);
      }, 1500);
      
    } catch (error) {
      console.error("Error creating action:", error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
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
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={() => {
              const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
              router.push(siteId ? `${url}?siteId=${siteId}` : url);
            }}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 1
          </button>
          <h1 className="text-2xl font-medium text-stratosphere">
            Define New Stakeholder Action {siteId && <span className="text-gray-500">(Site Level)</span>}
          </h1>
          <p className="text-gray-500 mt-2">
            Create a new action for a stakeholder group{siteId && " at this site"}
          </p>
        </div>

        {/* Context Info */}
        {siteId && (
          <div className="mx-8 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Site Context:</span> You are creating an action for a site-specific stakeholder group.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="p-8">
          {filteredStakeholderGroups.length === 0 ? (
            <div className="bg-white rounded-lg border border-sky p-8 text-center">
              <p className="text-gray-500 text-lg mb-2">No stakeholder groups available</p>
              <p className="text-sm text-gray-400">
                {siteId 
                  ? "There are no site-specific stakeholder groups. Please create stakeholder groups for this site first."
                  : "There are no project-level stakeholder groups. Please create stakeholder groups first."
                }
              </p>
            </div>
          ) : (
            <ActionForm
              projectId={projectId}
              projectSiteId={siteId || undefined}
              stageId={stageId}
              stakeholderGroups={filteredStakeholderGroups}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              submitLabel="Save Action"
              title="Action Details"
            />
          )}
        </div>
      </div>
    </div>
  );
}