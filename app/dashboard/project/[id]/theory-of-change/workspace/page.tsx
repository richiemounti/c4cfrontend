// app/dashboard/project/[id]/theory-of-change/workspace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight,
  Users, Target, TrendingUp, GitBranch, Info,
  RefreshCw
} from 'lucide-react';
import { getProject, getProjectSites } from '@/lib/api/project';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getStageStatusWithConsultation } from '@/lib/api/theoryOfChange';
import type { ProjectSite, StageStatusResponse } from '@/types';
import InstructionalPanel from '@/components/InstructionalPanel';
import { toast } from '@/hooks/use-toast';

export default function TheoryOfChangeWorkspacePage() {
  const params = useParams();
  const router = useRouter();     
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const selectedSiteFromUrl = searchParams.get('selectedSite');
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(selectedSiteFromUrl);
  const [stageStatus, setStageStatus] = useState<StageStatusResponse | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        const sitesData = await getProjectSites(projectId);
        setSites(sitesData.data || []);
        
        if (selectedSiteId) {
          const statusResponse = await getStageStatusWithConsultation(projectId, selectedSiteId);
          const statusData = statusResponse.data.data || statusResponse.data;
          setStageStatus(statusData);
        } else {
          const statusResponse = await getStageStatusWithConsultation(projectId);
          const statusData = statusResponse.data.data || statusResponse.data;
          setStageStatus(statusData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, selectedSiteId, refreshTrigger]); // Add refreshTrigger here


  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const navigateToConsultationPlan = () => {
    if (selectedSiteId) {
      router.push(`/dashboard/project/${projectId}/theory-of-change/consultation-plan?siteId=${selectedSiteId}`);
    } else {
      toast({
        title: "Error",
        description: "Please select a site first to create a consultation plan",
        variant: "destructive",
      });
    }
  };

  const navigateToStage = (stageNumber: number) => {
    const query = selectedSiteId ? `?siteId=${selectedSiteId}` : '';
    // Navigate to intro first
    router.push(`/dashboard/project/${projectId}/theory-of-change/stage${stageNumber}/intro${query}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-grass-500" />;
      case 'in_progress':
        return <div className="h-5 w-5 rounded-full bg-ochre-500"></div>;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-concrete-500"></div>;
    }
  };

  const getConsultationStatusIcon = (isCompleted: boolean, exists: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-grass-500" />;
    }
    if (exists) {
      return <div className="h-5 w-5 rounded-full bg-ochre-500"></div>;
    }
    return <div className="h-5 w-5 rounded-full border-2 border-concrete-500"></div>;
  };

  const selectedSite = sites.find(s => s._id === selectedSiteId);
  const isProjectLevel = !selectedSiteId;
  const needsConsultationPlan = sites.length > 0 && selectedSiteId;
  const consultationCompleted = stageStatus?.consultationPlan?.isCompleted || false;
  const canAccessStages = isProjectLevel || consultationCompleted;

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

  if (!project || !stageStatus) {
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
            <AlertCircle className="h-12 w-12 text-sand-500 mx-auto mb-4" />
            <p className="text-stratosphere font-medium">Failed to load Theory of Change data</p>
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
            onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Introduction
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-stratosphere">Theory of Change Workspace</h1>
              <p className="text-gray-500 mt-2">
                {isProjectLevel 
                  ? `Working at project level: ${project.name}`
                  : `Working at site level: ${selectedSite?.name || 'Selected Site'}`
                }
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Help Section */}
            <InstructionalPanel
            title="Need Help?"
            videos={[
                {
                  src: "/videos/instructional/project-setup/creating-project.mp4",
                  title: "How to Create a New Project",
                  description: "This 3-minute tutorial walks you through the entire project creation process, from initial setup to adding your first survey.",
                  poster: "/videos/instructional/project-setup/creating-project-poster.PNG",
                  autoPlay: false,
                  loop: false
                }
            ]}
            texts={[
              {
                content: "At the site level it really is important for you to consult with your stakeholders. The first thing to do is to complete step 1 which will help you think through how you want to consult them.",
                type: "tip"
              },
              {
                content: "Stage 1 focuses on YOUR TEAM's actions. Stage 2 focuses on STAKEHOLDER outcomes.",
                type: "info"
              },
              {
                content: "If you have questions check out the knowledge base.",
                type: "tip"
              }
            ]}
          />
          {/* Current Scope Display */}
          <div className="bg-gradient-to-r from-forest/10 to-green-50 rounded-lg border-2 border-forest p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center">
                  <GitBranch className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Working Scope</p>
                  <p className="text-xl font-semibold text-stratosphere">
                    {isProjectLevel ? `Project: ${project.name}` : selectedSite?.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
              >
                Change Scope
              </Button>
            </div>
          </div>

          {/* Consultation Planning Card (for sites only) */}
          {needsConsultationPlan && (
            <div className="bg-white rounded-lg border border-sky shadow-sm">
              <div className="border-b border-sky bg-sky-tint px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-sky" size={24} />
                    <div>
                      <h2 className="text-lg font-medium text-stratosphere">Step 1: Consultation Planning</h2>
                      {consultationCompleted && (
                        <p className="text-sm text-grass-500 mt-1">✓ Completed</p>
                      )}
                    </div>
                  </div>
                  {getConsultationStatusIcon(consultationCompleted, stageStatus.consultationPlan?.exists || false)}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-stratosphere/70 mb-6">
                  Before defining your Theory of Change for this site, you need to plan stakeholder 
                  consultations. One of the core values of Reflect for Carbon is that stakeholders themselves define the changes they want to see in their communities. Use these consultations to plan how you will meet with stakeholders and work with them to identify and prioritise those changes.
                </p>
                
                {stageStatus.consultationPlan?.exists ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-stratosphere">Progress</h4>
                        <span className="text-sm text-gray-500">
                          {stageStatus.consultationPlan?.completionPercentage || 0}% complete
                        </span>
                      </div>
                      <Progress 
                        value={stageStatus.consultationPlan?.completionPercentage || 0} 
                        className="h-2 mb-3" 
                      />
                      <p className="text-sm text-stratosphere/70">
                        {consultationCompleted 
                          ? 'Your consultation plan is complete. You can now access Theory of Change stages.'
                          : 'Complete your consultation plan to unlock Theory of Change stages.'
                        }
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={consultationCompleted ? "outline" : "default"}
                      onClick={navigateToConsultationPlan}
                    >
                      {consultationCompleted ? 'Review Plan' : 'Complete Plan'}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-sky-tint rounded-lg p-4">
                      <p className="text-sm text-stratosphere">
                        No consultation plan created yet. Start by selecting stakeholders and 
                        planning your consultation approach.
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-sky hover:bg-sky/90"
                      onClick={navigateToConsultationPlan}
                    >
                      Create Consultation Plan
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1 Card */}
            <div className={`bg-white rounded-lg border-2 shadow-sm transition-all ${
              canAccessStages ? 'border-sky hover:shadow-lg' : 'border-gray-200 opacity-60'
            }`}>
              <div className="border-b border-sky bg-sky-tint px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      canAccessStages ? 'bg-sky' : 'bg-gray-300'
                    }`}>
                      <Target className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-stratosphere">Stage 1: Actions</h2>
                      <p className="text-xs text-stratosphere/60">Internal focus: What will you DO?</p>
                    </div>
                  </div>
                  {stageStatus.stageAccessibility?.stage1?.status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-grass-500" />
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {canAccessStages ? (
                  <div className="space-y-4">
                    <p className="text-sm text-stratosphere/70">
                      Define the concrete actions your team will take. Focus on your activities, 
                      responsibilities, and accountability structures.
                    </p>
                    
                    <Button 
                      className="w-full bg-sky hover:bg-sky/90"
                      onClick={() => navigateToStage(1)}
                    >
                      {stageStatus.stageAccessibility?.stage1?.exists ? 'Continue' : 'Start'} Stage 1
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Complete consultation planning to access this stage
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2 Card */}
            <div className={`bg-white rounded-lg border-2 shadow-sm transition-all ${
              canAccessStages ? 'border-forest hover:shadow-lg' : 'border-gray-200 opacity-60'
            }`}>
              <div className="border-b border-forest bg-forest/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      canAccessStages ? 'bg-forest' : 'bg-gray-300'
                    }`}>
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-stratosphere">Stage 2: Outcomes</h2>
                      <p className="text-xs text-stratosphere/60">External focus: What will CHANGE?</p>
                    </div>
                  </div>
                  {stageStatus.stageAccessibility?.stage2?.status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-grass-500" />
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {canAccessStages ? (
                  <div className="space-y-4">
                    <p className="text-sm text-stratosphere/70">
                      Identify expected outcomes for stakeholders - both positive benefits and 
                      potential risks that need to be managed.
                    </p>                
                    
                    <Button 
                      className="w-full bg-forest hover:bg-forest/90 text-white"
                      onClick={() => navigateToStage(2)}
                    >
                      {stageStatus.stageAccessibility?.stage2?.exists ? 'Continue' : 'Start'} Stage 2
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Complete consultation planning to access this stage
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          {isProjectLevel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-stratosphere mb-2">Project-Level Theory of Change</h3>
                  <p className="text-sm text-stratosphere/70">
                    You're working at the project level, so you can access stages directly without 
                    consultation planning. Site-level ToCs require consultation plans to ensure 
                    stakeholder input is incorporated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}