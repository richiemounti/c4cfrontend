// components/setup/SiteSetupOverview.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initializeProjectSiteSetup, getProjectSiteSetup, getProjectSiteSetupProgress } from '@/lib/api/projectSiteSetup';
import { FileCheck, CircleDashed, ArrowRight, FileSymlink, Loader2 } from 'lucide-react';
import { Task } from '@/types';


interface SiteSetupData {
  isInitialized: boolean;
  progress: number;
  isComplete: boolean;
  completedAt?: Date;
  tasks: Task[];
  _id?: string;
}

interface SiteSetupOverviewProps {
  siteId: string;
}

export default function SiteSetupOverview({ siteId }: SiteSetupOverviewProps) {
  const router = useRouter();
  const [setupData, setSetupData] = useState<SiteSetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSetupData();
  }, [siteId]);

  const fetchSetupData = async () => {
    try {
      setLoading(true);
      const response = await getProjectSiteSetup(siteId);
      setSetupData(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch site setup data');
      console.error('Error fetching site setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      await initializeProjectSiteSetup(siteId);
      // Refetch setup data after initialization
      await fetchSetupData();
    } catch (err) {
      setError('Failed to initialize site setup');
      console.error('Error initializing site setup:', err);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Loading site setup data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-2 text-primary-500 hover:text-primary-700"
          onClick={fetchSetupData}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!setupData?.isInitialized) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Site Setup</h2>
        <p className="mb-4 text-gray-600">
          Site setup has not been initialized yet. Initialize to create setup tasks for this project site.
        </p>
        <button
          onClick={handleInitialize}
          disabled={initializing}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initializing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Initializing...
            </>
          ) : (
            'Initialize Site Setup'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Site Setup</h2>
        <div className="flex items-center">
          <div className="bg-gray-100 rounded-full h-6 w-40 mr-2">
            <div 
              className="bg-primary-500 h-6 rounded-full" 
              style={{ width: `${setupData.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{setupData.progress}% Complete</span>
        </div>
      </div>

      {/* Setup completion message */}
      {setupData.isComplete && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-center">
          <FileCheck className="h-5 w-5 mr-2" />
          <span>Site setup completed on {new Date(setupData.completedAt!).toLocaleDateString()}</span>
        </div>
      )}

      {/* Tasks list */}
      <div className="space-y-4">
        {setupData.tasks.map((task) => (
          <div 
            key={task._id} 
            className="border border-gray-200 rounded-md p-4 hover:border-primary-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                {task.isCompleted ? (
                  <FileCheck className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                ) : (
                  <CircleDashed className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {task.fieldName}
                    {task.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                </div>
              </div>
              <Link 
                href={`/dashboard/site/${siteId}/setup/task/${task._id}`}
                className="flex items-center text-sm text-primary-500 hover:text-primary-700"
              >
                {task.isCompleted ? 'View' : 'Complete'} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* If there's a file uploaded, show file info */}
            {task.dataType === 'file' && task.responseData?.filename && (
              <div className="mt-3 ml-8 flex items-center text-sm text-gray-600">
                <FileSymlink className="h-4 w-4 mr-1" />
                <span>{task.responseData.originalName || 'File uploaded'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}