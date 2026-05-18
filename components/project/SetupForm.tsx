import React, { useState, useEffect, useCallback } from 'react';
import { SetupResponse, Review, ReviewModule } from '@/types';
import { completeProjectSetupTask, removeProjectSetupTaskFile, updateProjectSetupTaskData } from '@/lib/api/projectSetup';
import { completeProjectSiteSetupTask, removeProjectSiteSetupTaskFile, updateProjectSiteSetupTaskData } from '@/lib/api/projectSiteSetup';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import { checkPulseSurveyRequired, getPulseSurveyByModule } from '@/lib/api/pulseSurvey';
import { PulseSurvey, ModuleType } from '@/types/pulseSurvey';
import TaskField from './TaskField';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import { ChevronLeft, ChevronRight, ClipboardCheck, AlertCircle, CheckCircle, Clock, MessageSquare, SkipForward } from 'lucide-react';

// ---------------------------------------------------------------------------
// Conditional pairs: trigger fieldName -> dependent fieldName
// When the trigger is answered "No", the dependent task is skipped + disabled.
// ---------------------------------------------------------------------------
const CONDITIONAL_PAIRS: Record<string, string> = {
  // Project setup
  customary_institutions_involved: 'customary_institutions_details',
  conflict_history: 'conflict_notes',
  access_issues: 'access_notes',
  previous_project_failures: 'previous_failure_notes',
  // Site setup
  vulnerable_groups_present: 'vulnerability_indicators',
  wildlife_conflict_present: 'wildlife_conflict_summary',
};

interface SetupFormProps {
  setupData: SetupResponse;
  setupId: string;
  isProjectSite?: boolean;
  onTaskComplete?: () => void;
  projectId?: string;
  organizationId?: string;
  projectSites?: Array<{ _id: string; name: string; }>;
}

interface Task {
  _id: string;
  fieldName: string;
  dataType: string;
  description?: string;
  userFacingCopy?: string;
  options?: string[];
  fieldLabel: string;
  helperText: string;
  hoverText: string;
  isRequired: boolean;
  sortOrder: number;
  step: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  responseData?: any;
}

const SetupForm: React.FC<SetupFormProps> = ({
  setupData,
  setupId,
  isProjectSite = false,
  onTaskComplete,
  projectId,
  organizationId,
  projectSites
}) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);

  // Review state
  const [taskReviews, setTaskReviews] = useState<{ [taskId: string]: Review }>({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ---------------------------------------------------------------------------
  // Track live boolean responses so we can compute skip/disable state.
  // Seeded from saved task.responseData on mount; updated via onBooleanChange.
  // ---------------------------------------------------------------------------
  const [localResponses, setLocalResponses] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    setupData.tasks.forEach(t => {
      if (t.dataType === 'boolean' && t.responseData !== null && t.responseData !== undefined) {
        map[t.fieldName] =
          t.responseData === 'true' ? true :
          t.responseData === 'false' ? false :
          t.responseData;
      }
    });
    return map;
  });

  // Flatten and sort all tasks by step and then sortOrder
  const sortedTasks = [...setupData.tasks]
    .sort((a, b) => {
      if (a.step !== b.step) {
        return a.step - b.step;
      }
      return a.sortOrder - b.sortOrder;
    });

  const currentTask = sortedTasks[currentTaskIndex];

  // ---------------------------------------------------------------------------
  // Determine whether a given task should be disabled (its trigger answered No)
  // ---------------------------------------------------------------------------
  const isTaskDisabled = useCallback((task: Task): boolean => {
    const triggerEntry = Object.entries(CONDITIONAL_PAIRS).find(([, dep]) => dep === task.fieldName);
    if (!triggerEntry) return false;
    const [triggerField] = triggerEntry;
    const triggerValue = localResponses[triggerField];
    return triggerValue === false || triggerValue === 'false';
  }, [localResponses]);

  // ---------------------------------------------------------------------------
  // Called by TaskField whenever a boolean radio button changes.
  // If value is false AND this is the current task AND it has a dependent,
  // auto-advance past the dependent task.
  // ---------------------------------------------------------------------------
  const handleBooleanChange = useCallback((fieldName: string, value: boolean) => {
    setLocalResponses(prev => ({ ...prev, [fieldName]: value }));

    if (!value && CONDITIONAL_PAIRS[fieldName]) {
      const dependentField = CONDITIONAL_PAIRS[fieldName];
      const dependentIndex = sortedTasks.findIndex(t => t.fieldName === dependentField);
      const triggerIndex = sortedTasks.findIndex(t => t.fieldName === fieldName);

      // Only auto-skip if the user is currently on the trigger task
      if (triggerIndex === currentTaskIndex && dependentIndex > currentTaskIndex) {
        // Skip past the dependent to the next task after it
        const skipTo = Math.min(dependentIndex + 1, sortedTasks.length - 1);
        setTimeout(() => setCurrentTaskIndex(skipTo), 350);
      }
    }
  }, [sortedTasks, currentTaskIndex]);

  // Fetch reviews for all completed tasks
  useEffect(() => {
    const fetchReviews = async () => {
      if (!projectId) return;

      try {
        setLoadingReviews(true);

        const module = isProjectSite ? 'project_site_setup' : 'project_setup';

        const response = await getReviewsByModuleItem(
          module as ReviewModule,
          setupId
        );

        if (response.success && response.data) {
          const reviewsMap: { [taskId: string]: Review } = {};
          response.data.forEach((review: Review) => {
            if (review.nestedItemId) {
              reviewsMap[review.nestedItemId] = review;
            }
          });

          setTaskReviews(reviewsMap);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [projectId, setupId, isProjectSite, setupData.tasks]);

  const currentTaskReview = currentTask ? taskReviews[currentTask._id] : null;

  const handleViewReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = async () => {
    setShowReviewModal(false);
    setSelectedReviewId(null);

    if (projectId) {
      try {
        const module = isProjectSite ? 'project_site_setup' : 'project_setup';

        const response = await getReviewsByModuleItem(
          module as ReviewModule,
          setupId
        );

        if (response.success && response.data) {
          const reviewsMap: { [taskId: string]: Review } = {};
          response.data.forEach((review: Review) => {
            if (review.nestedItemId) {
              reviewsMap[review.nestedItemId] = review;
            }
          });
          setTaskReviews(reviewsMap);
        }
      } catch (err) {
        console.error('Error refreshing reviews:', err);
      }
    }
  };


  const handleTaskComplete = async (task: Task, responseData: any, files?: File[]) => {
    try {
      setLoading({ ...loading, [task._id]: true });
      setError(null);

      if (isProjectSite) {
        if (files && files.length > 0) {
          await completeProjectSiteSetupTask(setupId, task._id, responseData, files);
        } else {
          await completeProjectSiteSetupTask(setupId, task._id, responseData);
        }
      } else {
        if (files && files.length > 0) {
          await completeProjectSetupTask(setupId, task._id, responseData, files);
        } else {
          await completeProjectSetupTask(setupId, task._id, responseData);
        }
      }

      setSuccess(`Task "${task.fieldLabel}" completed successfully!`);

      setTimeout(() => {
        setSuccess(null);
        if (currentTaskIndex < sortedTasks.length - 1) {
          setCurrentTaskIndex(currentTaskIndex + 1);
        }
      }, 1500);

      if (onTaskComplete) {
        onTaskComplete();
      }

      setTimeout(async () => {
        if (projectId) {
          try {
            const module = isProjectSite ? 'project_site_setup' : 'project_setup';

            const response = await getReviewsByModuleItem(
              module as ReviewModule,
              setupId
            );

            if (response.success && response.data) {
              const reviewsMap: { [taskId: string]: Review } = {};
              response.data.forEach((review: Review) => {
                if (review.nestedItemId) {
                  reviewsMap[review.nestedItemId] = review;
                }
              });
              setTaskReviews(reviewsMap);
            }
          } catch (err) {
            console.error('Error refreshing reviews:', err);
          }
        }
      }, 2000);

    } catch (err) {
      console.error('Error completing task:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setLoading({ ...loading, [task._id]: false });
    }
  };

  const handleTaskUpdate = async (task: Task, responseData: any, files?: File[]) => {
    try {
      setLoading({ ...loading, [task._id]: true });
      setError(null);

      if (isProjectSite) {
        if (files && files.length > 0) {
          await updateProjectSiteSetupTaskData(setupId, task._id, responseData, files);
        } else {
          await updateProjectSiteSetupTaskData(setupId, task._id, responseData);
        }
      } else {
        if (files && files.length > 0) {
          await updateProjectSetupTaskData(setupId, task._id, responseData, files);
        } else {
          await updateProjectSetupTaskData(setupId, task._id, responseData);
        }
      }

      setSuccess(`Task "${task.fieldLabel}" data updated!`);

      setTimeout(() => {
        setSuccess(null);
      }, 1500);

      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (err) {
      console.error('Error updating task data:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task data');
    } finally {
      setLoading({ ...loading, [task._id]: false });
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      if (isProjectSite) {
        await removeProjectSiteSetupTaskFile(setupId, currentTask._id, filename);
      } else {
        await removeProjectSetupTaskFile(setupId, currentTask._id, filename);
      }

      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const goToPrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentTaskIndex < sortedTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const getStepLabel = (taskIndex: number) => {
    const task = sortedTasks[taskIndex];
    return `Step ${task.step} - Task ${taskIndex + 1}`;
  };

  const getReviewStatusBadge = (review?: Review) => {
    if (!review) return null;

    const statusConfig = {
      pending: {
        icon: Clock,
        text: 'Pending Review',
        bgColor: 'bg-ochre-50',
        textColor: 'text-ochre-900',
        borderColor: 'border-ochre-500',
      },
      in_review: {
        icon: ClipboardCheck,
        text: 'In Review',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-500',
      },
      approved: {
        icon: CheckCircle,
        text: 'Approved',
        bgColor: 'bg-grass-50',
        textColor: 'text-grass-900',
        borderColor: 'border-grass-500',
      },
      escalated: {
        icon: AlertCircle,
        text: 'Shared',
        bgColor: 'bg-sand-50',
        textColor: 'text-sand-900',
        borderColor: 'border-sand-500',
      },
      resolved: {
        icon: CheckCircle,
        text: 'Resolved',
        bgColor: 'bg-concrete-50',
        textColor: 'text-concrete-900',
        borderColor: 'border-concrete-500',
      },
    };

    const config = statusConfig[review.status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <Icon className={`w-4 h-4 ${config.textColor}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    );
  };

  // Derive disabled state for the current task
  const currentTaskDisabled = currentTask ? isTaskDisabled(currentTask) : false;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-stratosphere">
            {isProjectSite ? 'Project Site Setup' : 'Project Setup'}
          </h2>
          <div className="flex items-center gap-3">

            <div className="bg-stratosphere-100 text-stratosphere-500 px-4 py-2 rounded-full">
              Progress: {setupData.progress}%
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{success}</p>
          </div>
        )}


        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${setupData.progress}%` }}
          ></div>
        </div>

        {/* Task progress indicators */}
        <div className="flex justify-between mb-6">
          {sortedTasks.map((task, index) => {
            const hasReview = taskReviews[task._id];
            const disabled = isTaskDisabled(task);

            return (
              <div key={task._id} className="flex flex-col items-center gap-1">
                <button
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all
                    ${currentTaskIndex === index
                      ? 'bg-stratosphere-500 text-white ring-2 ring-stratosphere-300'
                      : disabled
                        ? 'bg-gray-100 text-gray-400 border border-dashed border-gray-300'
                        : task.isCompleted
                          ? 'bg-forest-500 text-white'
                          : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setCurrentTaskIndex(index)}
                  title={disabled ? `${task.fieldLabel} (skipped — not applicable)` : task.fieldLabel}
                >
                  {disabled ? '–' : index + 1}
                </button>

                {hasReview && !disabled && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hasReview.status === 'approved' ? 'bg-grass-500' :
                      hasReview.status === 'escalated' ? 'bg-sand-500' :
                      hasReview.status === 'in_review' ? 'bg-sky-500' :
                      'bg-ochre-500'
                    }`}
                    title={`Review: ${hasReview.status}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current task */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-medium text-stratosphere-500 mb-1">
              {getStepLabel(currentTaskIndex)}
            </h3>
            <div className="flex items-center gap-2">
              <h4 className={`text-lg font-medium ${currentTaskDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentTask.fieldLabel}
              </h4>
              {currentTaskDisabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 border border-dashed border-gray-300">
                  <SkipForward className="w-3 h-3" />
                  Skipped
                </span>
              )}
            </div>
          </div>

          {currentTask.isCompleted && currentTaskReview && (
            <div className="flex items-center gap-2">
              {getReviewStatusBadge(currentTaskReview)}
              <button
                onClick={() => handleViewReview(currentTaskReview._id)}
                className="px-4 py-2 text-sm bg-white border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
              >
                View Review
              </button>
            </div>
          )}

          {currentTask.isCompleted && !currentTaskReview && loadingReviews && (
            <div className="text-sm text-concrete-900 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
              Loading review...
            </div>
          )}

          {currentTask.isCompleted && !currentTaskReview && !loadingReviews && !currentTaskDisabled && (
            <div className="text-sm text-concrete-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-concrete-900" />
              Review pending creation
            </div>
          )}
        </div>

        <div className="bg-sky-tint p-6 rounded-lg mb-6">
          {currentTask && (
            <TaskField
              key={currentTask._id}
              task={currentTask}
              onComplete={handleTaskComplete}
              onUpdate={handleTaskUpdate}
              onDeleteFile={handleDeleteFile}
              isLoading={loading[currentTask._id] || false}
              projectId={projectId}
              organizationId={organizationId}
              projectSites={projectSites}
              isDisabled={currentTaskDisabled}
              onBooleanChange={handleBooleanChange}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentTaskIndex === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentTaskIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>

          <div className="text-gray-500">
            {currentTaskIndex + 1} of {sortedTasks.length}
          </div>

          <button
            onClick={goToNext}
            disabled={currentTaskIndex === sortedTasks.length - 1}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentTaskIndex === sortedTasks.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReviewId && (
        <ReviewDetailModal
          reviewId={selectedReviewId}
          onClose={handleCloseReviewModal}
        />
      )}
    </div>
  );
};

export default SetupForm;
