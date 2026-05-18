// app/dashboard/projects/[id]/setup/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getProjectSetup, getProjectSetupProgress, initializeProjectSetup } from '@/lib/api/projectSetup';
import SetupForm from '@/components/project/SetupForm';
import { Project, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

import { checkPulseSurveyRequired } from '@/lib/api/pulseSurvey';
import { PulseSurvey, ModuleType } from '@/types/pulseSurvey';
import PulseSurveyModal from '@/components/PulseSurveyModal';

const ProjectSetupPage: React.FC = () => {
  const params = useParams();
  const projectId = params?.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [project, setProject] = useState<Project | any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pulse survey
  const moduleStartTime = useRef<number>(Date.now());
  const pulseSurveyChecked = useRef<boolean>(false);

  const [showPulseSurveyModal, setShowPulseSurveyModal] = useState(false);
  const [pulseSurvey, setPulseSurvey] = useState<PulseSurvey | null>(null);

  useEffect(() => {
    const fetchSetupData = async () => {
      if (!projectId) return;

      // Reset so each page load re-evaluates
      pulseSurveyChecked.current = false;

      try {
        setLoading(true);
        const data = await getProjectSetup(projectId);
        setSetupData(data);

        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);

        if (data.progress === 100 && !pulseSurveyChecked.current) {
          pulseSurveyChecked.current = true;

          const checkResult = await checkPulseSurveyRequired('setup_project', data._id);

          if (checkResult.required && !checkResult.alreadyCompleted && checkResult.pulseSurvey) {
            setPulseSurvey(checkResult.pulseSurvey);
            setShowPulseSurveyModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching project setup:', err);
        toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Failed to load setup data' });
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, [projectId, refreshTrigger]);

  const handleInitialize = async () => {
    if (!projectId) return;

    try {
      setInitializing(true);

      await initializeProjectSetup(projectId);

      const data = await getProjectSetup(projectId);
      setSetupData(data);

      toast({
        title: "Success",
        description: "Project setup initialized successfully",
      });
    } catch (err) {
      console.error('Error initializing project setup:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to initialize project setup',
      });
    } finally {
      setInitializing(false);
    }
  };

  // Replace handleTaskComplete:
  const handleTaskComplete = async () => {
    if (!projectId) return;

    try {
      const data = await getProjectSetup(projectId);
      setSetupData(data);

      // Trigger pulse survey check once when progress first hits 100
      if (data.progress === 100 && !pulseSurveyChecked.current) {
        pulseSurveyChecked.current = true;

        const checkResult = await checkPulseSurveyRequired('setup_project', data._id);

        if (checkResult.required && !checkResult.alreadyCompleted && checkResult.pulseSurvey) {
          setPulseSurvey(checkResult.pulseSurvey);
          setShowPulseSurveyModal(true);
        }
      }
    } catch (err) {
      console.error('Error refreshing project setup:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
          <p className="text-stratosphere font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
        {/* Sidebar */}
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="container mx-auto p-6">

        <div className="mb-6">
            <Link 
            href={`/dashboard/project/${projectId}`}
            className="inline-flex items-center text-sky-500 hover:text-stratosphere"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
            </Link>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-bold mb-6 text-stratosphere">Project Setup</h1>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
        

        {/* Help & Resources Panel */}
        <div className="mt-8 py-8">
          <InstructionalPanel
            title="Start here by setting up your project"
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
                content: "Complete the project setup tasks.",
                type: "info"
              },
              {
                content: "You don't have to do this in one go. You can always come back later to complete the tasks.",
                type: "tip"
              },
              {
                content: "If you have questions check out the knowledge base.",
                type: "tip"
              }
            ]}
            variant="default"
          />
        </div>

        {setupData && !setupData.isInitialized ? (
            <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4 text-stratosphere">Initialize Project Setup</h2>
            <p className="mb-4 text-sky">
                Project setup needs to be initialized before you can start configuring your project.
                This will create the necessary setup tasks for your project.
            </p>
            <Button 
                onClick={handleInitialize} 
                disabled={initializing}
            >
                {initializing ? "Initializing..." : "Initialize Setup"}
            </Button>
            </div>
        ) : setupData && setupData.isInitialized ? (
            <SetupForm 
            setupData={setupData} 
            setupId={setupData._id} 
            isProjectSite={false}
            onTaskComplete={handleTaskComplete}
            projectId={projectId}
            organizationId={project?.organization || ''}
            projectSites={project?.sites || []}
            />
        ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm">
            <p>No setup data available. Please try again or contact support.</p>
            </div>
        )}  
      </div>

      {showPulseSurveyModal && pulseSurvey && project && (
        <PulseSurveyModal
          isOpen={showPulseSurveyModal}
          onClose={() => setShowPulseSurveyModal(false)}
          pulseSurvey={pulseSurvey}
          moduleType="setup_project"
          moduleReference={setupData!._id}
          moduleReferenceModel="ProjectSetup"
          organizationId={project.organization}
          projectId={projectId}
          timeToComplete={Math.floor((Date.now() - moduleStartTime.current) / 1000)}
          onSubmitSuccess={() => {
            toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
          }}
        />
      )}
    </div>
  );
};

export default ProjectSetupPage;
