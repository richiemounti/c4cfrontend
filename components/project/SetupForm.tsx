import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SetupResponse, Review, ReviewModule } from '@/types';
import { completeProjectSetupTask, removeProjectSetupTaskFile, updateProjectSetupTaskData } from '@/lib/api/projectSetup';
import { completeProjectSiteSetupTask, removeProjectSiteSetupTaskFile, updateProjectSiteSetupTaskData } from '@/lib/api/projectSiteSetup';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import TaskField from './TaskField';
import { ReviewDrawer } from '@/components/reviews/ReviewDrawer';
import { LastEditedBy } from '@/components/shared/LastEditedBy';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  Circle,
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

  // Optimistic completion tracking — gives instant progress feedback before the parent re-fetches
  const [sessionCompletedIds, setSessionCompletedIds] = useState<Set<string>>(new Set());
  const prevSetupDataRef = useRef(setupData);
  useEffect(() => {
    if (prevSetupDataRef.current !== setupData) {
      prevSetupDataRef.current = setupData;
      setSessionCompletedIds(new Set()); // parent refreshed — clear local overrides
    }
  }, [setupData]);

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

  // Clamp in case the task list shrinks (e.g. a template change) out from under the current index
  const safeGroupIndex = Math.min(currentGroupIndex, Math.max(stepGroups.length - 1, 0));
  const currentStepGroup = stepGroups[safeGroupIndex];

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

  // Effective completion state — merges backend data with optimistic session updates
  const isEffectivelyCompleted = useCallback(
    (task: Task): boolean => task.isCompleted || sessionCompletedIds.has(task._id),
    [sessionCompletedIds]
  );

  // ---------------------------------------------------------------------------
  // Step completion status for wizard bar
  // ---------------------------------------------------------------------------

  const getStepStatus = useCallback(
    (group: StepGroup): 'complete' | 'partial' | 'incomplete' => {
      const activeTasks = group.tasks.filter(t => !isTaskDisabled(t));
      if (activeTasks.length === 0) return 'incomplete';
      const completedCount = activeTasks.filter(t => isEffectivelyCompleted(t)).length;
      if (completedCount === activeTasks.length) return 'complete';
      if (completedCount > 0) return 'partial';
      return 'incomplete';
    },
    [isTaskDisabled, isEffectivelyCompleted]
  );

  const getSectionProgress = useCallback(
    (group: StepGroup) => {
      const activeTasks = group.tasks.filter(t => !isTaskDisabled(t));
      return {
        total: activeTasks.length,
        completed: activeTasks.filter(t => isEffectivelyCompleted(t)).length,
      };
    },
    [isTaskDisabled, isEffectivelyCompleted]
  );

  // A step can't be left until every active, required task inside it is answered.
  const hasUnmetRequiredTasks = useCallback(
    (group: StepGroup): boolean =>
      group.tasks.some(t => t.isRequired && !isTaskDisabled(t) && !isEffectivelyCompleted(t)),
    [isTaskDisabled, isEffectivelyCompleted]
  );

  // Progress is computed over active (non-disabled) tasks only — a conditionally
  // hidden task shouldn't count against completion.
  const { effectiveProgress } = useMemo(() => {
    const activeTasks = sortedTasks.filter(t => !isTaskDisabled(t));
    const completed = activeTasks.filter(t => isEffectivelyCompleted(t)).length;
    return {
      effectiveProgress: activeTasks.length > 0 ? Math.round((completed / activeTasks.length) * 100) : setupData.progress,
    };
  }, [sortedTasks, isTaskDisabled, isEffectivelyCompleted, setupData.progress]);

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

      // Immediately mark as complete for instant progress feedback
      setSessionCompletedIds(prev => new Set([...prev, task._id]));

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
    if (currentGroupIndex >= stepGroups.length - 1) return;
    if (hasUnmetRequiredTasks(currentStepGroup)) {
      setError('Please answer all required questions in this step before continuing.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCurrentGroupIndex(currentGroupIndex + 1);
  };

  // Jumping backward via the segment bar is always allowed; jumping ahead is
  // blocked while the current step still has unanswered required questions.
  const handleStepSelect = (groupIdx: number) => {
    if (groupIdx > safeGroupIndex && hasUnmetRequiredTasks(currentStepGroup)) {
      setError('Please answer all required questions in this step before continuing.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCurrentGroupIndex(groupIdx);
  };

  // ---------------------------------------------------------------------------
  // Review badge
  // ---------------------------------------------------------------------------

  const getReviewStatusBadge = (review: Review) => {
    const configs = {
      pending:   { icon: Clock,          text: 'Pending Review', bg: 'bg-c4c-tint-gold',  border: 'border-c4c-yellow',   fg: 'text-black'         },
      in_review: { icon: ClipboardCheck, text: 'In Review',      bg: 'bg-c4c-tint-cyan',  border: 'border-c4c-cobalt',   fg: 'text-c4c-cobalt'    },
      approved:  { icon: CheckCircle,    text: 'Approved',       bg: 'bg-c4c-tint-sage',  border: 'border-c4c-sage',     fg: 'text-c4c-sage'      },
      escalated: { icon: AlertCircle,    text: 'Shared',         bg: 'bg-c4c-tint-coral', border: 'border-c4c-burgundy', fg: 'text-c4c-burgundy'  },
      resolved:  { icon: CheckCircle,    text: 'Resolved',       bg: 'bg-c4c-grey-bg',    border: 'border-c4c-rule',     fg: 'text-c4c-petrol'    },
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

  const segmentLabel = 'Step';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!currentStepGroup) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm text-sm text-c4c-petrol">
        No setup tasks found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            {isProjectSite ? 'Site Setup' : 'Project Setup'}
          </h2>
          <LastEditedBy
            name={typeof setupData.lastUpdatedBy === 'object' ? setupData.lastUpdatedBy?.name : undefined}
            timestamp={setupData.updatedAt}
            className="mt-1"
          />
        </div>
        <span className="bg-c4c-grey-bg text-c4c-petrol px-4 py-2 rounded-full text-sm font-medium">
          {effectiveProgress}% complete
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-c4c-grey-bg rounded-full h-1.5 mb-6">
        <div
          className="bg-c4c-petrol h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${effectiveProgress}%` }}
        />
      </div>

      {/* Inline alerts */}
      {error && (
        <div className="bg-c4c-tint-coral border-l-4 border-c4c-burgundy text-black p-3 mb-4 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-c4c-tint-sage border-l-4 border-c4c-sage text-black p-3 mb-4 rounded text-sm">
          {success}
        </div>
      )}

      {/* ── Wizard segment bar ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {stepGroups.map((group, groupIdx) => {
          const isActive = groupIdx === safeGroupIndex;
          const status = getStepStatus(group);

          return (
            <React.Fragment key={`${group.stepNumber}-${group.stepLabel}`}>
              <button
                onClick={() => handleStepSelect(groupIdx)}
                className={`flex flex-col items-start px-3 py-2 rounded-lg min-w-[88px] border transition-all text-left flex-shrink-0
                  ${isActive
                    ? 'bg-c4c-petrol border-c4c-petrol text-white shadow-sm'
                    : status === 'complete'
                      ? 'bg-c4c-tint-sage border-c4c-sage text-c4c-sage hover:bg-c4c-tint-sage'
                      : status === 'partial'
                        ? 'bg-c4c-grey-bg border-c4c-rule text-c4c-petrol hover:bg-c4c-rule'
                        : 'bg-c4c-grey-bg border-c4c-rule text-c4c-petrol hover:bg-c4c-rule'
                  }`}
              >
                <span className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-white/70' : 'opacity-60'}`}>
                  {segmentLabel} {groupIdx + 1}
                </span>
                <span className="text-xs font-medium leading-tight">
                  {truncateLabel(group.stepLabel)}
                </span>
                {status === 'complete' && !isActive && (
                  <CheckCircle className="w-3 h-3 mt-1 text-c4c-sage" />
                )}
              </button>

              {groupIdx < stepGroups.length - 1 && (
                <ChevronRight className="w-4 h-4 text-c4c-petrol flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Section header ── */}
      {(() => {
        const { total, completed } = getSectionProgress(currentStepGroup);
        return (
          <div className="mb-6 pb-4 border-b border-c4c-rule">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/60 mb-0.5">
                  {segmentLabel} {safeGroupIndex + 1} of {stepGroups.length}
                </p>
                <h3 className="text-xl font-semibold text-black">
                  {currentStepGroup.stepLabel}
                </h3>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-medium text-c4c-petrol">
                  {completed} / {total} done
                </span>
                {completed === total && total > 0 && (
                  <div className="flex items-center gap-1 justify-end mt-1 text-c4c-sage text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Complete
                  </div>
                )}
              </div>
            </div>

            {/* Section progress bar */}
            <div className="w-full bg-c4c-grey-bg rounded-full h-1 mt-3">
              <div
                className="bg-c4c-petrol h-1 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%' }}
              />
            </div>
          </div>
        );
      })()}

      {/* ── All tasks in current section ── */}
      <div className="space-y-5 mb-8">
        {currentStepGroup.tasks.map((task) => {
          const disabled = isTaskDisabled(task);
          const completed = isEffectivelyCompleted(task);
          const taskReview = taskReviews[task._id];
          const isLoadingTask = loading[task._id] || false;

          return (
            <div
              key={task._id}
              className={`rounded-xl border transition-all ${
                disabled
                  ? 'border-dashed border-c4c-rule bg-c4c-grey-bg/50'
                  : completed
                    ? 'border-c4c-sage bg-c4c-tint-sage/30'
                    : 'border-c4c-rule bg-c4c-grey-bg'
              }`}
            >
              {/* Task header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-3 gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Completion indicator */}
                  {disabled ? (
                    <Circle className="w-4 h-4 flex-shrink-0 mt-0.5 text-c4c-petrol" strokeDasharray="2.5 2.5" />
                  ) : completed ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-c4c-sage" />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0 mt-0.5 text-c4c-petrol" />
                  )}
                  {disabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-c4c-grey-bg text-c4c-petrol border border-dashed border-c4c-rule flex-shrink-0">
                      <SkipForward className="w-3 h-3" />
                      Not applicable
                    </span>
                  )}
                </div>

                {/* Review badge */}
                {!disabled && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {completed && taskReview && (
                      <>
                        {getReviewStatusBadge(taskReview)}
                        <button
                          onClick={() => handleViewReview(taskReview._id)}
                          className="px-3 py-1.5 text-sm bg-white border border-c4c-rule text-c4c-petrol rounded-lg hover:bg-c4c-grey-bg transition-colors"
                        >
                          View Review
                        </button>
                      </>
                    )}
                    {completed && !taskReview && loadingReviews && (
                      <div className="text-sm text-c4c-petrol flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-c4c-rule" />
                        Loading review...
                      </div>
                    )}
                    {completed && !taskReview && !loadingReviews && (
                      <span className="text-xs text-c4c-petrol flex items-center gap-1">
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
      <div className="flex items-center justify-between pt-4 border-t border-c4c-rule">
        <button
          onClick={goToPreviousSection}
          disabled={safeGroupIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            safeGroupIndex === 0
              ? 'bg-c4c-grey-bg text-c4c-petrol cursor-not-allowed'
              : 'bg-c4c-grey-bg text-c4c-petrol hover:bg-c4c-rule'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous {segmentLabel}
        </button>

        <span className="text-xs text-c4c-petrol tabular-nums">
          {segmentLabel} {safeGroupIndex + 1} of {stepGroups.length}
        </span>

        <button
          onClick={goToNextSection}
          disabled={safeGroupIndex === stepGroups.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            safeGroupIndex === stepGroups.length - 1
              ? 'bg-c4c-grey-bg text-c4c-petrol cursor-not-allowed'
              : 'bg-c4c-coral text-black hover:bg-c4c-petrol hover:text-white'
          }`}
        >
          Next {segmentLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Review drawer */}
      <ReviewDrawer
        isOpen={showReviewModal && !!selectedReviewId}
        reviewId={selectedReviewId}
        onClose={handleCloseReviewModal}
      />
    </div>
  );
};

export default SetupForm;
