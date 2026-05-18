'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getProjectSiteSetup, initializeProjectSiteSetup } from '@/lib/api/projectSiteSetup';
import { getProject, getProjectSite } from '@/lib/api/project';
import { checkPulseSurveyRequired } from '@/lib/api/pulseSurvey';
import SetupForm from '@/components/project/SetupForm';
import PulseSurveyModal from '@/components/PulseSurveyModal';
import { Project, SetupResponse } from '@/types';
import { PulseSurvey } from '@/types/pulseSurvey';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

const ProjectSiteSetupPage: React.FC = () => {
  const params = useParams();
  const siteId = params?.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pulse survey
  const moduleStartTime = useRef<number>(Date.now());
  const pulseSurveyChecked = useRef<boolean>(false);
  const [showPulseSurveyModal, setShowPulseSurveyModal] = useState(false);
  const [pulseSurvey, setPulseSurvey] = useState<PulseSurvey | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!siteId) return;

      try {
        setLoading(true);

        const siteResponse = await getProjectSite(siteId);
        const site = siteResponse.data;

        let currentProjectId = null;
        if (site.project) {
          currentProjectId = typeof site.project === 'string' ? site.project : site.project._id;
          setProjectId(currentProjectId);
        }

        if (currentProjectId) {
          const projectResponse = await getProject(currentProjectId);
          setProject(projectResponse.data);
        } else {
          console.error('No project ID found in site data');
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Project ID not found in site data',
          });
          return;
        }

        const setupResponse = await getProjectSiteSetup(siteId);
        setSetupData(setupResponse);
      } catch (err) {
        console.error('Error fetching project site data:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load project site data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, toast, refreshTrigger]);

  const handleInitialize = async () => {
    if (!siteId) return;

    try {
      setInitializing(true);

      await initializeProjectSiteSetup(siteId);

      const data = await getProjectSiteSetup(siteId);
      setSetupData(data);

      toast({
        title: 'Success',
        description: 'Project site setup initialized successfully',
      });
    } catch (err) {
      console.error('Error initializing project site setup:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to initialize project site setup',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleTaskComplete = async () => {
    if (!siteId) return;

    try {
      const data = await getProjectSiteSetup(siteId);
      setSetupData(data);

      // Trigger pulse survey once when progress first hits 100
      if (data.progress === 100 && !pulseSurveyChecked.current) {
        pulseSurveyChecked.current = true;

        const checkResult = await checkPulseSurveyRequired('setup_site', data._id);

        if (checkResult.required && !checkResult.alreadyCompleted && checkResult.pulseSurvey) {
          setPulseSurvey(checkResult.pulseSurvey);
          setShowPulseSurveyModal(true);
        }
      }
    } catch (err) {
      console.error('Error refreshing project site setup:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
          <p className="text-stratosphere font-medium ml-4">Loading...</p>
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
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link
            href={projectId ? `/dashboard/site/${siteId}?projectId=${projectId}` : `/dashboard/site/${siteId}`}
            className="inline-flex items-center text-sky-500 hover:text-stratosphere"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project Site
          </Link>
        </div>

        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-bold mb-6 text-stratosphere">Project Site Setup</h1>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="py-8">
          <InstructionalPanel
            title="Site Management Help"
            subtitle="Resources for managing your project site"
            texts={[
              {
                content: 'Complete site setup tasks to configure data collection parameters specific to this location.',
                type: 'tip',
              },
              {
                content: 'If you have questions check out the knowledge base.',
                type: 'tip',
              },
            ]}
            variant="default"
          />
        </div>

        {setupData && !setupData.isInitialized ? (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4 text-stratosphere">Initialize Project Site Setup</h2>
            <p className="mb-4 text-sky">
              Project site setup needs to be initialized before you can start configuring your site.
              This will create the necessary setup tasks for your project site.
            </p>
            <Button onClick={handleInitialize} disabled={initializing}>
              {initializing ? 'Initializing...' : 'Initialize Setup'}
            </Button>
          </div>
        ) : setupData && setupData.isInitialized ? (
          <SetupForm
            setupData={setupData}
            setupId={setupData._id}
            isProjectSite={true}
            onTaskComplete={handleTaskComplete}
            projectId={projectId || undefined}
            organizationId={project?.organization || undefined}
            projectSites={project?.sites || []}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p>No setup data available. Please try again or contact support.</p>
          </div>
        )}
      </div>

      {showPulseSurveyModal && pulseSurvey && project && setupData && (
        <PulseSurveyModal
          isOpen={showPulseSurveyModal}
          onClose={() => setShowPulseSurveyModal(false)}
          pulseSurvey={pulseSurvey}
          moduleType="setup_site"
          moduleReference={setupData._id}
          moduleReferenceModel="ProjectSiteSetup"
          organizationId={project.organization}
          projectId={projectId || undefined}
          projectSiteId={siteId}
          timeToComplete={Math.floor((Date.now() - moduleStartTime.current) / 1000)}
          onSubmitSuccess={() => {
            toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
          }}
        />
      )}
    </div>
  );
};

export default ProjectSiteSetupPage;