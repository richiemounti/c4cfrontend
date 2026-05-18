// components/stakeholders/TaskNavigation.tsx - ENHANCED WITH CLICK HANDLERS
'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import { Review, StakeholderGroup } from '@/types';
import ReviewStatusBadge from './ReviewStatusBadge';

interface TaskNavigationProps {
  currentTask: string;
  stakeholderGroupId: string;
  completedTasks: string[];
  stakeholderGroup: StakeholderGroup;
  onNavigate?: (taskType: string) => void;
  onReviewClick?: (review: Review) => void; // 🆕 Add callback for review clicks
}

const TASK_TYPES = [
  { type: 'connections', label: 'Connections', icon: '🔗' },
  { type: 'power', label: 'Power', icon: '💪' },
  { type: 'wellbeing', label: 'Well-being', icon: '💚' },
  { type: 'roles', label: 'Roles', icon: '👥' },
  { type: 'risks', label: 'Risks', icon: '⚠️' },
  { type: 'benefits', label: 'Benefits', icon: '✨' }
];

const TaskNavigation = ({ 
  currentTask, 
  stakeholderGroupId,
  stakeholderGroup,
  completedTasks,
  onNavigate,
  onReviewClick // 🆕 Destructure the callback
}: TaskNavigationProps) => {
  const router = useRouter();
  const currentIndex = TASK_TYPES.findIndex(t => t.type === currentTask);
  
  // State for review statuses
  const [taskReviews, setTaskReviews] = useState<Record<string, Review | null>>({});
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < TASK_TYPES.length - 1;

  // Fetch reviews for all completed tasks
  useEffect(() => {
    const fetchTaskReviews = async () => {
      try {
        setLoadingReviews(true);
        const reviewPromises = stakeholderGroup.tasks.map(async (task) => {
          if (!task._id) return null;
          
          try {
            const response = await getReviewsByModuleItem(
              'stakeholder_group',
              stakeholderGroupId,
              task._id
            );
            
            if (response.success && response.data.length > 0) {
              return {
                taskType: task.taskType,
                review: response.data[0] // Get most recent review
              };
            }
          } catch (error) {
            console.error(`Error fetching review for ${task.taskType}:`, error);
          }
          return null;
        });

        const results = await Promise.all(reviewPromises);
        
        const reviewsMap: Record<string, Review | null> = {};
        results.forEach(result => {
          if (result) {
            reviewsMap[result.taskType] = result.review;
          }
        });
        
        setTaskReviews(reviewsMap);
      } catch (error) {
        console.error('Error fetching task reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (stakeholderGroup?.tasks?.length > 0) {
      fetchTaskReviews();
    }
  }, [stakeholderGroup, stakeholderGroupId]);
  
  const handleNavigate = (taskType: string) => {
    if (onNavigate) {
      onNavigate(taskType);
    }
    router.push(`/dashboard/stakeholders/tasks/${stakeholderGroupId}?taskType=${taskType}`);
  };
  
  const handlePrevious = () => {
    if (hasPrevious) {
      handleNavigate(TASK_TYPES[currentIndex - 1].type);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      handleNavigate(TASK_TYPES[currentIndex + 1].type);
    }
  };
  
  // 🆕 Handle review badge click
  const handleReviewClick = (e: React.MouseEvent, review: Review) => {
    e.stopPropagation(); // Prevent task navigation
    if (onReviewClick) {
      onReviewClick(review);
    }
  };
  
  const isTaskCompleted = (taskType: string) => completedTasks.includes(taskType);
  const isTaskCurrent = (taskType: string) => taskType === currentTask;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Your Progress</span>
          <span className="text-sm text-gray-500">
            {completedTasks.length} of {TASK_TYPES.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-sky-400 to-grass-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedTasks.length / TASK_TYPES.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Task Pills with Review Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TASK_TYPES.map((task) => {
          const isCompleted = isTaskCompleted(task.type);
          const isCurrent = isTaskCurrent(task.type);
          const review = taskReviews[task.type];
          
          return (
            <div key={task.type} className="flex flex-col gap-1">
              <button
                onClick={() => handleNavigate(task.type)}
                className={`
                  relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isCurrent 
                    ? 'bg-stratosphere text-white shadow-lg scale-105' 
                    : isCompleted
                      ? 'bg-grass-100 text-grass-900 hover:bg-grass-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-1">{task.icon}</span>
                {task.label}
                {isCompleted && !isCurrent && (
                  <Check size={14} className="inline ml-1 -mr-1" />
                )}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                )}
              </button>
              
              {/* 🆕 Enhanced Review Status Badge with Click Handler */}
              {isCompleted && (
                <div className="flex justify-center">
                  <ReviewStatusBadge
                    status={review?.status || null}
                    loading={loadingReviews}
                    compact={true}
                    showIcon={true}
                    showTooltip={true}
                    priority={review?.priority}
                    unresolvedIssuesCount={review?.unresolvedIssuesCount}
                    reviewId={review?._id}
                    onClick={review ? (e: any) => handleReviewClick(e as any, review) : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Navigation Arrows */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${hasPrevious 
              ? 'text-sky-500 hover:bg-sky-50 hover:text-stratosphere' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Task {currentIndex + 1} of {TASK_TYPES.length}</p>
          <p className="text-sm font-semibold text-stratosphere">
            {TASK_TYPES[currentIndex]?.label}
          </p>
        </div>
        
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${hasNext 
              ? 'text-sky-500 hover:bg-sky-50 hover:text-stratosphere' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TaskNavigation;