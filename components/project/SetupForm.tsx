import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SetupResponse, Review, ReviewModule } from '@/types';
import { completeProjectSetupTask, removeProjectSetupTaskFile, updateProjectSetupTaskData } from '@/lib/api/projectSetup';
import { completeProjectSiteSetupTask, removeProjectSiteSetupTaskFile, updateProjectSiteSetupTaskData } from '@/lib/api/projectSiteSetup';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import TaskField from './TaskField';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  SkipForward,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SetupFormProps {
  setupData: SetupResponse;
  setupId: string;
  isProjectSite?: boolean;
  onTaskComplete?: () => void;
  projectId?: string;
  organizationId?: string;
  projectSites?: Array<{ _id: string; name: string }>;
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
  stepNumber?: number;
  stepLabel?: string;
  conditionalOn?: { fieldName: string; value: any };
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  responseData?: any;
}

interface StepGroup {
  stepNumber: number;
  stepLabel: string;
  tasks: Task[];
  startIndex: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const truncateLabel = (label: string, max = 20): string =>
  label.length > max ? label.slice(0, max - 1) + '…' : label;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SetupForm: React.FC<SetupFormProps> = ({
  setupData,
  setupId,
  isProjectSite = false,
  onTaskComplete,
  projectId,
  organizationId,
  projectSites,
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Review state
  const [taskReviews, setTaskReviews] = useState<Record<string, Review>>({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Live boolean responses — seeded from saved task data on mount, updated on change.
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

  // ---------------------------------------------------------------------------
  // Derived: sorted tasks, step groups
  // ---------------------------------------------------------------------------

  const sortedTasks = useMemo(
    () =>
      [...(setupData.tasks as Task[])].sort((a, b) => {
        const aStep = a.stepNumber ?? 0;
        const bStep = b.stepNumber ?? 0;
        if (aStep !== bStep) return aStep - bStep;
        return a.sortOrder - b.sortOrder;
      }),
    [setupData.tasks]
  );

  // Group into wizard segments by unique (stepNumber, stepLabel) pair.
  const stepGroups = useMemo((): StepGroup[] => {
    const groups: StepGroup[] = [];
    sortedTasks.forEach((task, idx) => {
      const last = groups[groups.length - 1];
      if (
        !last ||
        last.stepNumber !== (task.stepNumber ?? 0) ||
        last.stepLabel !== (task.stepLabel ?? '')
      ) {
        groups.push({
          stepNumber: task.stepNumber ?? 0,
          stepLabel: task.stepLabel ?? '',
          tasks: [task],
          startIndex: idx,
        });
      } else {
        last.tasks.push(task);
      }
    });
    return groups;
  }, [sortedTasks]);

  const currentStepGroup = stepGroups[currentGroupIndex];

  // ---------------------------------------------------------------------------
  // Conditional logic — data-driven via task.conditionalOn
  // ---------------------------------------------------------------------------

  const isTaskDisabled = useCallback(
    (task: Task): boolean => {
      if (!task.conditionalOn) return false;
      const triggerValue = localResponses[task.conditionalOn.fieldName];
      if (triggerValue === undefined || triggerValue === null) return false;
      return triggerValue !== task.conditionalOn.value;
    },
    [localResponses]
  );

  // Update local boolean state on change — conditional tasks update their
  // visibility immediately without a round-trip.
  const handleBooleanChange = useCallback(
    (fieldName: string, value: boolean) => {
      setLocalResponses(prev => ({ ...prev, [fieldName]: value }));
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Step completion status for wizard bar
  // ---------------------------------------------------------------------------

  const getStepStatus = useCallback(
    (group: StepGroup): 'complete' | 'partial' | 'incomplete' => {
      const activeTasks = group.tasks.filter(t => !isTaskDisabled(t));
      if (activeTasks.length === 0) return 'incomplete';
      const completedCount = activeTasks.filter(t => t.isCompleted).length;
      if (completedCount === activeTasks.length) return 'complete';
      if (completedCount > 0) return 'partial';
      return 'incomplete';
    },
    [isTaskDisabled]
  );

  const getSectionProgress = useCallback(
    (group: StepGroup) => {
      const activeTasks = group.tasks.filter(t => !isTaskDisabled(t));
      return {
        total: activeTasks.length,
        completed: activeTasks.filter(t => t.isCompleted).length,
      };
    },
    [isTaskDisabled]
  );

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------

  const fetchReviews = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingReviews(true);
      const module = isProjectSite ? 'project_site_setup' : 'project_setup';
      const response = await getReviewsByModuleItem(module as ReviewModule, setupId);
      if (response.success && response.data) {
        const map: Record<string, Review> = {};
        response.data.forEach((r: Review) => {
          if (r.nestedItemId) map[r.nestedItemId] = r;
        });
        setTaskReviews(map);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [projectId, isProjectSite, setupId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, setupData.tasks]);

  const handleViewReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = async () => {
    setShowReviewModal(false);
    setSelectedReviewId(null);
    await fetchReviews();
  };

  // ---------------------------------------------------------------------------
  // Task actions
  // ---------------------------------------------------------------------------

  const handleTaskComplete = async (task: Task, responseData: any, files?: File[]) => {
    try {
      setLoading(prev => ({ ...prev, [task._id]: true }));
      setError(null);

      if (isProjectSite) {
        await completeProjectSiteSetupTask(setupId, task._id, responseData, files?.length ? files : undefined);
      } else {
        await completeProjectSetupTask(setupId, task._id, responseData, files?.length ? files : undefined);
      }

      setSuccess(`"${task.fieldLabel}" saved.`);
      setTimeout(() => setSuccess(null), 1500);

      if (onTaskComplete) onTaskComplete();
      setTimeout(() => fetchReviews(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(prev => ({ ...prev, [task._id]: false }));
    }
  };

  const handleTaskUpdate = async (task: Task, responseData: any, files?: File[]) => {
    try {
      setLoading(prev => ({ ...prev, [task._id]: true }));
      setError(null);

      if (isProjectSite) {
        await updateProjectSiteSetupTaskData(setupId, task._id, responseData, files?.length ? files : undefined);
      } else {
        await updateProjectSetupTaskData(setupId, task._id, responseData, files?.length ? files : undefined);
      }

      setSuccess(`"${task.fieldLabel}" updated.`);
      setTimeout(() => setSuccess(null), 1500);
      if (onTaskComplete) onTaskComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setLoading(prev => ({ ...prev, [task._id]: false }));
    }
  };

  const handleDeleteFile = async (taskId: string, filename: string) => {
    try {
      if (isProjectSite) {
        await removeProjectSiteSetupTaskFile(setupId, taskId, filename);
      } else {
        await removeProjectSetupTaskFile(setupId, taskId, filename);
      }
      if (onTaskComplete) onTaskComplete();
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  // ---------------------------------------------------------------------------
  // Navigation — section level
  // ---------------------------------------------------------------------------

  const goToPreviousSection = () => {
    if (currentGroupIndex > 0) setCurrentGroupIndex(currentGroupIndex - 1);
  };

  const goToNextSection = () => {
    if (currentGroupIndex < stepGroups.length - 1) setCurrentGroupIndex(currentGroupIndex + 1);
  };

  // ---------------------------------------------------------------------------
  // Review badge
  // ---------------------------------------------------------------------------

  const getReviewStatusBadge = (review: Review) => {
    const configs = {
      pending:   { icon: Clock,          text: 'Pending Review', bg: 'bg-ochre-50',    border: 'border-ochre-500',    fg: 'text-ochre-900'    },
      in_review: { icon: ClipboardCheck, text: 'In Review',      bg: 'bg-sky-50',      border: 'border-sky-500',      fg: 'text-sky-900'      },
      approved:  { icon: CheckCircle,    text: 'Approved',       bg: 'bg-grass-50',    border: 'border-grass-500',    fg: 'text-grass-900'    },
      escalated: { icon: AlertCircle,    text: 'Shared',         bg: 'bg-sand-50',     border: 'border-sand-500',     fg: 'text-sand-900'     },
      resolved:  { icon: CheckCircle,    text: 'Resolved',       bg: 'bg-concrete-50', border: 'border-concrete-500', fg: 'text-concrete-900' },
    };
    const cfg = configs[review.status as keyof typeof configs] ?? configs.pending;
    const Icon = cfg.icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
        <Icon className={`w-4 h-4 ${cfg.fg}`} />
        <span className={`text-sm font-medium ${cfg.fg}`}>{cfg.text}</span>
      </div>
    );
  };

  // ---------------------------------------------------------------------------

  const segmentLabel = isProjectSite ? 'Section' : 'Step';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-stratosphere">
          {isProjectSite ? 'Site Setup' : 'Project Setup'}
        </h2>
        <span className="bg-stratosphere-100 text-stratosphere-500 px-4 py-2 rounded-full text-sm font-medium">
          {setupData.progress}% complete
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-stratosphere h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${setupData.progress}%` }}
        />
      </div>

      {/* Inline alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded text-sm">
          {success}
        </div>
      )}

      {/* ── Wizard segment bar ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {stepGroups.map((group, groupIdx) => {
          const isActive = groupIdx === currentGroupIndex;
          const status = getStepStatus(group);

          return (
            <React.Fragment key={`${group.stepNumber}-${group.stepLabel}`}>
              <button
                onClick={() => setCurrentGroupIndex(groupIdx)}
                className={`flex flex-col items-start px-3 py-2 rounded-lg min-w-[88px] border transition-all text-left flex-shrink-0
                  ${isActive
                    ? 'bg-stratosphere border-stratosphere text-white shadow-sm'
                    : status === 'complete'
                      ? 'bg-grass-50 border-grass-400 text-grass-700 hover:bg-grass-100'
                      : status === 'partial'
                        ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                  }`}
              >
                <span className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-white/70' : 'opacity-60'}`}>
                  {segmentLabel} {groupIdx + 1}
                </span>
                <span className="text-xs font-medium leading-tight">
                  {truncateLabel(group.stepLabel)}
                </span>
                {status === 'complete' && !isActive && (
                  <CheckCircle className="w-3 h-3 mt-1 text-grass-500" />
                )}
              </button>

              {groupIdx < stepGroups.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Section header ── */}
      {currentStepGroup && (() => {
        const { total, completed } = getSectionProgress(currentStepGroup);
        return (
          <div className="mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stratosphere/60 mb-0.5">
                  {segmentLabel} {currentGroupIndex + 1} of {stepGroups.length}
                </p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentStepGroup.stepLabel}
                </h3>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-medium text-gray-500">
                  {completed} / {total} done
                </span>
                {completed === total && total > 0 && (
                  <div className="flex items-center gap-1 justify-end mt-1 text-grass-600 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Complete
                  </div>
                )}
              </div>
            </div>

            {/* Section progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1 mt-3">
              <div
                className="bg-stratosphere h-1 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%' }}
              />
            </div>
          </div>
        );
      })()}

      {/* ── All tasks in current section ── */}
      <div className="space-y-5 mb-8">
        {currentStepGroup?.tasks.map((task) => {
          const disabled = isTaskDisabled(task);
          const taskReview = taskReviews[task._id];
          const isLoadingTask = loading[task._id] || false;

          return (
            <div
              key={task._id}
              className={`rounded-xl border transition-all ${
                disabled
                  ? 'border-dashed border-gray-200 bg-gray-50/50'
                  : task.isCompleted
                    ? 'border-grass-200 bg-grass-50/30'
                    : 'border-gray-100 bg-sky-tint'
              }`}
            >
              {/* Task header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-3 gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Completion indicator dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${
                    disabled
                      ? 'border border-dashed border-gray-300 bg-transparent'
                      : task.isCompleted
                        ? 'bg-grass-500'
                        : 'bg-gray-300'
                  }`} />
                  <h4 className={`text-sm font-medium leading-snug ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {task.fieldLabel}
                    {task.isRequired && !disabled && (
                      <span className="ml-1 text-red-400 text-xs">*</span>
                    )}
                  </h4>
                  {disabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400 border border-dashed border-gray-300 flex-shrink-0">
                      <SkipForward className="w-3 h-3" />
                      Not applicable
                    </span>
                  )}
                </div>

                {/* Review badge */}
                {!disabled && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.isCompleted && taskReview && (
                      <>
                        {getReviewStatusBadge(taskReview)}
                        <button
                          onClick={() => handleViewReview(taskReview._id)}
                          className="px-3 py-1.5 text-sm bg-white border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                        >
                          View Review
                        </button>
                      </>
                    )}
                    {task.isCompleted && !taskReview && !loadingReviews && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        Review pending
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Task field */}
              <div className="px-6 pb-5">
                <TaskField
                  task={task}
                  onComplete={handleTaskComplete}
                  onUpdate={handleTaskUpdate}
                  onDeleteFile={(filename) => handleDeleteFile(task._id, filename)}
                  isLoading={isLoadingTask}
                  projectId={projectId}
                  organizationId={organizationId}
                  projectSites={projectSites}
                  isDisabled={disabled}
                  onBooleanChange={handleBooleanChange}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Section navigation ── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={goToPreviousSection}
          disabled={currentGroupIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentGroupIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous {segmentLabel}
        </button>

        <span className="text-xs text-gray-400 tabular-nums">
          {segmentLabel} {currentGroupIndex + 1} of {stepGroups.length}
        </span>

        <button
          onClick={goToNextSection}
          disabled={currentGroupIndex === stepGroups.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentGroupIndex === stepGroups.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-stratosphere text-white hover:opacity-90'
          }`}
        >
          Next {segmentLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Review modal */}
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
