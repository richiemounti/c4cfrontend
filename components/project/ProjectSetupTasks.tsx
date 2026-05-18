// components/project/ProjectSetupTasks.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  getProjectSetup, 
  initializeProjectSetup, 
  completeProjectSetupTask,
  updateProjectSetupTaskData,
} from '@/lib/api/projectSetup';
import SetupProgress from './SetupProgress';
import TaskGroup from './TaskGroup';
import { Task } from '@/types';

interface ProjectSetupTasksProps {
  projectId: string;
}

const ProjectSetupTasks: React.FC<ProjectSetupTasksProps> = ({ projectId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{
    isInitialized: boolean;
    progress: number;
    isComplete: boolean;
    completedAt?: Date;
    tasks: Task[];
    _id?: string;
  } | null>(null);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProjectSetup(projectId);
        setSetupData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching setup data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSetupData();
    }
  }, [projectId]);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeProjectSetup(projectId);
      
      // Fetch the newly initialized setup data
      const data = await getProjectSetup(projectId);
      setSetupData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error initializing setup');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string, responseData: any, files?: File[]) => { // ✅ Changed
    if (!setupData || !setupData._id) return;
    
    try {
      setError(null);
      
      const result = await completeProjectSetupTask(
        setupData._id,
        taskId,
        responseData,
        files // ✅ Now passing File[] instead of File
      );
      
      // Update local state with the updated task
      setSetupData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: result.progress,
          isComplete: result.isComplete,
          tasks: prev.tasks.map(t => 
            t._id === taskId 
              ? { ...t, isCompleted: true, responseData: responseData }
              : t
          )
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing task');
      throw err;
    }
  };

  const handleTaskUpdate = async (taskId: string, responseData: any, files?: File[]) => { // ✅ Changed
    if (!setupData || !setupData._id) return;
    
    try {
      setError(null);
      
      const result = await updateProjectSetupTaskData(
        setupData._id,
        taskId,
        responseData,
        files // ✅ Now passing File[] instead of File
      );
      
      // Update local state with the updated task data
      setSetupData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => 
            t._id === taskId 
              ? { ...t, responseData: responseData }
              : t
          )
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating task');
      throw err;
    }
  };
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!setupData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
          {error || 'Failed to load setup data'}
        </div>
        <button
          onClick={() => router.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Reload
        </button>
      </div>
    );
  }

  if (!setupData.isInitialized) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Project Setup</h2>
          <p className="text-gray-600">
            Initialize the project setup to start adding additional information to your project.
          </p>
        </div>
        <button
          onClick={handleInitialize}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Initializing...' : 'Initialize Setup'}
        </button>
      </div>
    );
  }

  // Get unique step numbers from tasks
  const steps = [...new Set(setupData.tasks.map(task => task.step))].sort();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Project Setup</h2>
        <p className="text-gray-600">
          Complete the tasks below to set up additional information for your project.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-500 mb-4">
          {error}
        </div>
      )}

      <SetupProgress progress={setupData.progress} isComplete={setupData.isComplete} />

      {steps.map(step => (
        <TaskGroup
          key={step}
          title={`Step ${step}`}
          tasks={setupData.tasks}
          step={step}
          onTaskComplete={handleTaskComplete}
          onTaskUpdate={handleTaskUpdate}
          isDisabled={loading}
        />
      ))}
    </div>
  );
};

export default ProjectSetupTasks;