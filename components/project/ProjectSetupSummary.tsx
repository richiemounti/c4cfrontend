// Modified ProjectSetupSummary.tsx
import React, { useEffect, useState } from 'react';
import { 
  getProjectSetupProgress 
} from '@/lib/api/projectSetup';
import { getProjectSiteSetupProgress } from '@/lib/api/projectSiteSetup';
import SetupProgressCard from './SetupProgressCard';

interface ProjectSetupSummaryProps {
  projectId: string;
  projectSites?: { _id: string; name: string }[];
  contextType?: 'project' | 'site';  // Context type
  siteId?: string;                   // Site ID for site context
  showSiteTasks?: boolean;           // New prop to control site tasks visibility
}

interface SetupProgress {
  progress: number;
  isComplete: boolean;
  taskStats?: {
    total: number;
    completed: number;
    remaining: number;
  };
}

const ProjectSetupSummary: React.FC<ProjectSetupSummaryProps> = ({ 
  projectId, 
  projectSites = [],
  contextType = 'project',  // Default to project context
  siteId,
  showSiteTasks = true      // By default show site tasks, but can be controlled
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectSetupProgress, setProjectSetupProgress] = useState<SetupProgress | null>(null);
  const [siteProgressMap, setSiteProgressMap] = useState<Record<string, SetupProgress>>({});
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (isDataFetched) return;

    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always fetch project setup progress in project context
        if (contextType === 'project') {
          const projectProgress = await getProjectSetupProgress(projectId);
          setProjectSetupProgress(projectProgress);
          
          // Only fetch site progresses if we're in project context AND showSiteTasks is true
          if (showSiteTasks && projectSites && projectSites.length > 0) {
            const siteProgress: Record<string, SetupProgress> = {};
            
            await Promise.all(
              projectSites.map(async (site) => {
                try {
                  const progress = await getProjectSiteSetupProgress(site._id);
                  siteProgress[site._id] = progress;
                } catch (err) {
                  console.error(`Error fetching progress for site ${site._id}:`, err);
                }
              })
            );
            
            setSiteProgressMap(siteProgress);
          }
        } 
        else if (contextType === 'site' && siteId) {
          // Only fetch the specific site progress in site context
          try {
            const progress = await getProjectSiteSetupProgress(siteId);
            const siteProgress: Record<string, SetupProgress> = {};
            siteProgress[siteId] = progress;
            setSiteProgressMap(siteProgress);
          } catch (err) {
            console.error(`Error fetching progress for site ${siteId}:`, err);
            setError(err instanceof Error ? err.message : 'Error fetching site progress data');
          }
        }
        setIsDataFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching progress data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProgressData();
    }
  }, [projectId, contextType, siteId, isDataFetched, showSiteTasks, projectSites]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  // Generate a description that works whether taskStats exists or not
  const getDescription = (progress: SetupProgress) => {
    if (progress.taskStats) {
      return `${progress.taskStats.completed} of ${progress.taskStats.total} tasks completed`;
    }
    // Fallback description when taskStats is missing
    return `${Math.round(progress.progress)}% complete`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-stratosphere">Setup Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Setup Card - Only show in project context */}
          {contextType === 'project' && projectSetupProgress && (
            <SetupProgressCard
              title="Project Setup"
              progress={projectSetupProgress.progress}
              isComplete={projectSetupProgress.isComplete}
              href={`/dashboard/project/${projectId}/setup`}
              description={getDescription(projectSetupProgress)}
            />
          )}
          
          {/* Site Setup Cards - Only in project context and if showSiteTasks is true */}
          {contextType === 'project' && showSiteTasks && projectSites && projectSites.map((site) => {
            const siteProgress = siteProgressMap[site._id];
            
            if (!siteProgress) {
              return null;
            }
            
            return (
              <SetupProgressCard
                key={site._id}
                title={`${site.name} Setup`}
                progress={siteProgress.progress}
                isComplete={siteProgress.isComplete}
                href={`/dashboard/site/${site._id}/setup`}
                description={getDescription(siteProgress)}
              />
            );
          })}
          
          {/* Single Site Card - Only in site context */}
          {contextType === 'site' && siteId && siteProgressMap[siteId] && (
            <SetupProgressCard
              title="Site Setup" 
              progress={siteProgressMap[siteId].progress}
              isComplete={siteProgressMap[siteId].isComplete}
              href={`/dashboard/site/${siteId}/setup`}
              description={getDescription(siteProgressMap[siteId])}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectSetupSummary;