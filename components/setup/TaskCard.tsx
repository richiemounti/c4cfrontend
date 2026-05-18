// components/setup/TaskCard.tsx
import React from 'react';
import Link from 'next/link';
import { FileCheck, CircleDashed, FileSymlink, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    dataType: string;
    responseData?: any;
    isRequired: boolean;
  };
  parentType: 'project' | 'site';
  parentId: string;
  setupId: string;
  onTaskClick?: (taskId: string) => void;
}

export default function TaskCard({ 
  task, 
  parentType, 
  parentId, 
  setupId, 
  onTaskClick 
}: TaskCardProps) {
  const handleClick = () => {
    if (onTaskClick) {
      onTaskClick(task._id);
    }
  };

  const taskPath = parentType === 'project' 
    ? `/dashboard/project/${parentId}/setup/task/${task._id}` 
    : `/dashboard/site/${parentId}/setup/task/${task._id}`;

  return (
    <div 
      className={`border rounded-md p-4 transition-colors ${
        task.isCompleted 
          ? 'border-green-200 bg-green-50 hover:border-green-300' 
          : 'border-gray-200 hover:border-primary-300'
      }`}
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
              {task.title}
              {task.isRequired && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            
            {/* Show metadata based on task type */}
            {task.isCompleted && task.dataType === 'text' && task.responseData && (
              <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                <p className="italic">{task.responseData.text}</p>
              </div>
            )}
            
            {task.isCompleted && task.dataType === 'selection' && task.responseData && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {task.responseData.selection}
                </span>
              </div>
            )}
            
            {task.dataType === 'file' && task.responseData?.filename && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileSymlink className="h-4 w-4 mr-1" />
                <span>{task.responseData.originalName || 'File uploaded'}</span>
                {task.responseData.signedUrl && (
                  <a 
                    href={task.responseData.signedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    View
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <Link 
          href={taskPath}
          className="flex items-center text-sm text-primary-500 hover:text-primary-700"
          onClick={handleClick}
        >
          {task.isCompleted ? 'View' : 'Complete'} <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}