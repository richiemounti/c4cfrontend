// app/dashboard/project/[id]/setup/task/[taskid]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjectSetup } from '@/lib/api/projectSetup';
import TaskForm from '@/components/setup/TaskForm';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Task } from '@/types';


type TaskDataType = 'text' | 'number' | 'boolean' | 'selection' | 'file' | 'date';


interface SetupData {
  isInitialized: boolean;
    progress: number;
    isComplete: boolean;
    completedAt?: Date;
    tasks: Task[];
    _id: string;
}

export default function ProjectSetupTaskPage() {
  const router = useRouter();
  const { id: projectId, taskid: taskId } = useParams() as { id: string; taskid: string };
  
  const [setupData, setSetupData] = useState<SetupData | any>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch project setup data when component mounts
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        setLoading(true);
        const response = await getProjectSetup(projectId);
        
        if (!response.isInitialized) {
          // Redirect to project page if setup is not initialized
          router.push(`/dashboard/project/${projectId}`);
          return;
        }
        
        setSetupData(response);
        
        // Find the current task and index
        const taskIndex = response.tasks.findIndex(
          (task: Task) => task._id === taskId
        );
        
        if (taskIndex === -1) {
          setError('Task not found');
        } else {
          setCurrentTask(response.tasks[taskIndex]);
          setCurrentTaskIndex(taskIndex);
        }
      } catch (err) {
        console.error('Error fetching setup data:', err);
        setError('Failed to load task data');
      } finally {
        setLoading(false);
      }
    };

    fetchSetupData();
  }, [projectId, taskId, router]);

  // Handle task completion
  const handleTaskComplete = () => {
    // Refetch the setup data to get the updated task status
    const fetchUpdatedData = async () => {
      try {
        const response = await getProjectSetup(projectId);
        setSetupData(response);
        
        // Find the updated task
        const taskIndex = response.tasks.findIndex(
          (task: Task) => task._id === taskId
        );
        
        if (taskIndex !== -1) {
          setCurrentTask(response.tasks[taskIndex]);
        }
      } catch (err) {
        console.error('Error fetching updated setup data:', err);
      }
    };

    fetchUpdatedData();
  };

  // Handle saving task progress
  const handleSave = () => {
    // Similar to handleTaskComplete, but without navigation
    const fetchUpdatedData = async () => {
      try {
        const response = await getProjectSetup(projectId);
        setSetupData(response);
        
        // Find the updated task
        const taskIndex = response.tasks.findIndex(
          (task: Task) => task._id === taskId
        );
        
        if (taskIndex !== -1) {
          setCurrentTask(response.tasks[taskIndex]);
        }
      } catch (err) {
        console.error('Error fetching updated setup data:', err);
      }
    };

    fetchUpdatedData();
  };

  // Handle navigation between tasks
  const handleNavigate = (index: number) => {
    if (setupData && index >= 0 && index < setupData.tasks.length) {
      const nextTask = setupData.tasks[index];
      router.push(`/dashboard/project/${projectId}/setup/task/${nextTask._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !setupData || !currentTask) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {error || 'Task not found'}
          </h2>
          <p className="mt-2 text-gray-600">
            We couldn't load the requested task information.
          </p>
          <Link
            href={`/dashboard/project/${projectId}`}
            className="mt-6 inline-block px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            Return to Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href={`/dashboard/project/${projectId}`}
          className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project Setup
        </Link>

        {/* Task form */}
        <TaskForm
          setupId={setupData._id}
          tasks={setupData.tasks}
          currentTaskIndex={currentTaskIndex}
          parentType="project"
          parentId={projectId}
          onTaskComplete={handleTaskComplete}
          onSave={handleSave}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}