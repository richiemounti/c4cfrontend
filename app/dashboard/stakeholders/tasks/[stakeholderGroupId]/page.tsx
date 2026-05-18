// app/dashboard/stakeholders/tasks/[stakeholderGroupId]/page.tsx - WITH KEY INSIGHTS

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RotateCcw, Save, Info, ExternalLink, CheckCircle, Eye, MessageSquare, Star } from 'lucide-react'; // Added Star icon
import { useToast } from '@/hooks/use-toast';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { Project, Review, StakeholderGroup, TaskOption, TaskPrompt, TaskResponse } from '@/types';
import { getProject, getProjectSite } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import CreateRiskModal from '@/components/project/modals/CreateRiskModal';
import InstructionalPanel from '@/components/InstructionalPanel';
import RatingScale from '@/components/stakeholders/RatingScale';
import TaskNavigation from '@/components/stakeholders/TaskNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import ReviewStatusBadge from '@/components/stakeholders/ReviewStatusBadge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'


interface PageProps {
  params: {
    stakeholderGroupId: string;
  };
}

const TASK_TYPES = ['connections', 'power', 'wellbeing', 'roles', 'risks', 'benefits'];

// Default prompts as fallback — keep in sync with TASK_PROMPTS in stakeholderMapping.constants.ts
const DEFAULT_TASK_PROMPTS: Record<string, TaskPrompt> = {
  connections: {
    taskType: 'connections',
    promptText: 'How is this group connected to the project?',
    tooltipText: "Why are we asking this? Helps map the nature of each stakeholder's involvement — whether direct or indirect — so you can understand the ecosystem around your work.",
    ratingPrompt: 'How strongly connected is this group to the project and its outcomes?',
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'Not at all connected',
    ratingMaxLabel: 'Very strongly connected'
  },
  power: {
    taskType: 'power',
    promptText: 'What influence does this group have on the project?',
    tooltipText: "Why are we asking this? Reveals who holds power to change, support, block, or shape your project. This feeds into your risk and engagement strategies.",
    ratingPrompt: 'How much influence does this group have on the project?',
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'No influence',
    ratingMaxLabel: 'Very high influence'
  },
  wellbeing: {
    taskType: 'wellbeing',
    promptText: "How could the project enhance the group's well-being?",
    tooltipText: "Why are we asking this? Uncovers how much this group stands to lose or gain — and where your project might have unintended consequences.",
    ratingPrompt: "How much could the project enhance this group's well-being?",
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'Not at all',
    ratingMaxLabel: 'Significantly'
  },
  roles: {
    taskType: 'roles',
    promptText: 'What roles or responsibilities does this group have in the project?',
    tooltipText: "Why are we asking this? Clarifies accountability and partnership structures — helping you track who is doing what, and who needs to be consulted or supported.",
    ratingPrompt: "How significant is this group's role or responsibility in the project?",
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'No role',
    ratingMaxLabel: 'Very significant role'
  },
  risks: {
    taskType: 'risks',
    promptText: 'What risks or negative impacts could this group face from the project?',
    tooltipText: "Why are we asking this? Identifies potential harms or tensions early, so you can design mitigating actions and safeguard equity.",
    ratingPrompt: 'How likely is this group to face negative impacts from the project?',
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'Very unlikely',
    ratingMaxLabel: 'Very likely'
  },
  benefits: {
    taskType: 'benefits',
    promptText: 'How might this group benefit from the project?',
    tooltipText: "Why are we asking this? Captures tangible and intangible value for each group — which helps you demonstrate social impact and build trust.",
    ratingPrompt: 'How much could this group benefit from the project?',
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'No benefit',
    ratingMaxLabel: 'Significant benefit'
  }
};

const TaskPage = ({ params }: PageProps) => {
  const { stakeholderGroupId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const taskType = searchParams.get('taskType') || 'connections';
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [taskDataLoading, setTaskDataLoading] = useState(false);
  
  // Data states
  const [stakeholderGroup, setStakeholderGroup] = useState<StakeholderGroup | null>(null);
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [taskPrompt, setTaskPrompt] = useState<TaskPrompt | null>(null);
  const [project, setProject] = useState<Project | any>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // 🆕 Enhanced form states - now tracks both description AND key insight flag
  const [selectedOptions, setSelectedOptions] = useState<Map<string, { description: string; isKeyInsight: boolean }>>(new Map());
  const [rating, setRating] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Review states
  const [currentTaskReview, setCurrentTaskReview] = useState<Review | null>(null);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const [loadingCurrentReview, setLoadingCurrentReview] = useState(false);
  
  // Modal states
  const [showCreateRiskModal, setShowCreateRiskModal] = useState(false);
  const [selectedOptionIdForRisk, setSelectedOptionIdForRisk] = useState<string | null>(null);

  // Memoized completed tasks for navigation
  const completedTasks = useMemo(() => {
    if (!stakeholderGroup) return [];
    return stakeholderGroup.tasks.map(t => t.taskType);
  }, [stakeholderGroup]);

  // 🆕 Memoized key insights count for current task
  const keyInsightsCount = useMemo(() => {
    return Array.from(selectedOptions.values()).filter(option => option.isKeyInsight).length;
  }, [selectedOptions]);

  // Determine navigation context
  const determineNavigationContext = useCallback((group: StakeholderGroup | null) => {
    if (!group) return { type: 'unknown', id: null };
    
    if (group.projectSite?._id) {
      return { type: 'site', id: group.projectSite._id };
    }
    
    const projectId = typeof group.project === 'object' ? group.project._id : group.project;
    return { type: 'project', id: projectId };
  }, []);

  // OPTIMIZED: Load stakeholder data once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadStakeholderData = async () => {
      try {
        setInitialLoading(true);
        
        const groupResponse = await stakeholderMappingApi.getStakeholderGroup(stakeholderGroupId);
        
        if (!groupResponse.data.success) {
          throw new Error(groupResponse.data.message || 'Failed to load stakeholder group');
        }
        
        if (!isMounted) return;
        
        const group = groupResponse.data.data;
        setStakeholderGroup(group);
        
        // Load project data
        const context = determineNavigationContext(group);
        if (context.id) {
          let finalProjectId = context.id;
          
          if (context.type === 'site') {
            const siteResponse = await getProjectSite(context.id);
            if (siteResponse.data) {
              const site = siteResponse.data;
              finalProjectId = typeof site.project === 'object' ? site.project._id : site.project;
            }
          }
          
          if (isMounted) {
            setProjectId(finalProjectId);
            const projectResponse = await getProject(finalProjectId);
            if (projectResponse.data && isMounted) {
              setProject(projectResponse.data);
            }
          }
        }
        
      } catch (error) {
        console.error('Error loading stakeholder data:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load stakeholder data',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    
    loadStakeholderData();
    
    return () => {
      isMounted = false;
    };
  }, [stakeholderGroupId, toast, determineNavigationContext]);

  // OPTIMIZED: Load task-specific data when taskType changes
  useEffect(() => {
    let isMounted = true;
    
    const loadTaskData = async () => {
      if (!stakeholderGroup) return;
      
      try {
        setTaskDataLoading(true);
        
        // Get category ID
        const categoryId = typeof stakeholderGroup.category === 'object' 
          ? stakeholderGroup.category._id 
          : stakeholderGroup.category;
        
        // Load task options and prompt in parallel
        const [optionsResponse] = await Promise.all([
          stakeholderMappingApi.getTaskOptions(categoryId, taskType)
        ]);
        
        if (!isMounted) return;
        
        if (optionsResponse.data.success) {
          setTaskOptions(optionsResponse.data.data.options);
          setTaskPrompt(optionsResponse.data.data.prompt);
        } else {
          // Fallback to default prompt
          setTaskPrompt(DEFAULT_TASK_PROMPTS[taskType]);
          setTaskOptions([]);
        }
        
        // 🆕 Initialize form with existing task data INCLUDING key insight flags
        const existingTask = stakeholderGroup.tasks.find((t: any) => t.taskType === taskType);
        if (existingTask) {
          const optionsMap = new Map();
          existingTask.responses.forEach((response: TaskResponse) => {
            optionsMap.set(response.optionId, {
              description: response.description,
              isKeyInsight: response.isKeyInsight || false
            });
          });
          setSelectedOptions(optionsMap);
          setRating(existingTask.rating || 1);
        } else {
          // Reset for new task
          setSelectedOptions(new Map());
          setRating(1);
        }
        
      } catch (error) {
        console.error('Error loading task data:', error);
        if (isMounted) {
          setTaskPrompt(DEFAULT_TASK_PROMPTS[taskType]);
          setTaskOptions([]);
          toast({
            title: 'Warning',
            description: 'Using default task configuration',
            variant: 'default',
          });
        }
      } finally {
        if (isMounted) {
          setTaskDataLoading(false);
        }
      }
    };
    
    loadTaskData();
    
    return () => {
      isMounted = false;
    };
  }, [stakeholderGroup, taskType, toast]);

  // Load review for current task when task changes
  useEffect(() => {
    const loadCurrentTaskReview = async () => {
      if (!stakeholderGroup || !taskType) return;
      
      try {
        setLoadingCurrentReview(true);
        
        const currentTask = stakeholderGroup.tasks.find(t => t.taskType === taskType);
        if (!currentTask?._id) {
          setCurrentTaskReview(null);
          return;
        }
        
        const response = await getReviewsByModuleItem(
          'stakeholder_group',
          stakeholderGroupId,
          currentTask._id
        );
        
        if (response.success && response.data.length > 0) {
          setCurrentTaskReview(response.data[0]);
        } else {
          setCurrentTaskReview(null);
        }
      } catch (error) {
        console.error('Error loading current task review:', error);
        setCurrentTaskReview(null);
      } finally {
        setLoadingCurrentReview(false);
      }
    };
    
    loadCurrentTaskReview();
  }, [stakeholderGroup, taskType, stakeholderGroupId]);

  // 🆕 Handle toggling an option selection
  const handleToggleOption = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      if (newMap.has(optionId)) {
        newMap.delete(optionId);
      } else {
        newMap.set(optionId, { description: '', isKeyInsight: false });
      }
      return newMap;
    });
  }, []);

  // 🆕 Handle description change
  const handleDescriptionChange = useCallback((optionId: string, description: string) => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(optionId);
      if (existing) {
        newMap.set(optionId, { ...existing, description });
      }
      return newMap;
    });
  }, []);

  // 🆕 NEW: Handle key insight toggle
  const handleToggleKeyInsight = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(optionId);
      if (existing) {
        newMap.set(optionId, { ...existing, isKeyInsight: !existing.isKeyInsight });
      }
      return newMap;
    });
  }, []);

  // Handle review click from navigation
  const handleReviewClick = useCallback((review: Review) => {
    setSelectedReviewId(review._id);
    setShowReviewModal(true);
  }, []);

  // Handle view current task review
  const handleViewCurrentReview = useCallback(() => {
    if (currentTaskReview) {
      setSelectedReviewId(currentTaskReview._id);
      setShowReviewModal(true);
    }
  }, [currentTaskReview]);

  // Function to check for created review
  const checkForCreatedReview = async (taskIndex: number) => {
    try {
      setCheckingReview(true);
      
      const task = stakeholderGroup?.tasks[taskIndex];
      if (!task?._id) return;
      
      const response = await getReviewsByModuleItem(
        'stakeholder_group',
        stakeholderGroupId,
        task._id
      );
      
      if (response.success && response.data.length > 0) {
        const latestReview = response.data[0];
        setCreatedReview(latestReview);
        
        toast({
          title: 'Task saved and review created!',
          description: 'Your task has been submitted for review.',
          action: (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3 py-1 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 transition-colors"
            >
              View Review
            </button>
          ),
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error checking for review:', error);
    } finally {
      setCheckingReview(false);
    }
  };

  // 🆕 Save task with key insights
  const handleSave = async () => {
    if (selectedOptions.size === 0) {
      toast({
        title: 'Required',
        description: 'Please select at least one option',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // 🆕 Convert map to responses array with key insight flags
      const responses = Array.from(selectedOptions.entries()).map(([optionId, data]) => ({
        optionId,
        description: data.description,
        isKeyInsight: data.isKeyInsight
      }));

      const response = await stakeholderMappingApi.updateTask(stakeholderGroupId, taskType, {
        responses,
        rating
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save task');
      }

      toast({
        title: 'Success',
        description: `Task saved successfully${keyInsightsCount > 0 ? ` with ${keyInsightsCount} key insight${keyInsightsCount !== 1 ? 's' : ''}` : ''}`,
      });

      // Update local stakeholder group data
      const updatedGroup = response.data.data;
      setStakeholderGroup(updatedGroup);

      // Check for the created review
      const taskIndex = TASK_TYPES.indexOf(taskType);
      if (taskIndex !== -1) {
        setTimeout(() => {
          checkForCreatedReview(taskIndex);
        }, 1000);
      }

      // Navigate to next task or back
      const currentTaskIndex = TASK_TYPES.indexOf(taskType);
      if (currentTaskIndex < TASK_TYPES.length - 1) {
        const nextTaskType = TASK_TYPES[currentTaskIndex + 1];
        router.push(`/dashboard/stakeholders/tasks/${stakeholderGroupId}?taskType=${nextTaskType}`);
      } else {
        handleBack();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save task',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle risk creation
  const handleRiskCreated = () => {
    toast({
      title: 'Success',
      description: 'Risk created successfully',
    });
    setShowCreateRiskModal(false);
    setSelectedOptionIdForRisk(null);
  };

  // Navigate back
  const handleBack = () => {
    if (!stakeholderGroup) {
      router.push('/dashboard/stakeholders');
      return;
    }
    
    const context = determineNavigationContext(stakeholderGroup);
    
    if (context.type === 'site' && context.id) {
      if (projectId) {
        router.push(`/dashboard/stakeholders/site/${context.id}?projectId=${projectId}`);
      } else {
        router.push(`/dashboard/stakeholders/site/${context.id}`);
      }
    } else if (context.type === 'project' && context.id) {
      router.push(`/dashboard/stakeholders/project/${context.id}`);
    } else {
      router.push('/dashboard/stakeholders');
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-concrete-50">
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere mx-auto mb-4"></div>
            <p className="text-stratosphere text-lg">Loading stakeholder data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-concrete-50">
      {projectId && <ProjectSidebar projectId={projectId} projectName={project?.name || 'Project'} />}
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <button 
            onClick={handleBack} 
            className="flex items-center text-sky-500 hover:text-stratosphere-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>

        {/* Instructional Panel */}
        <div className='py-8'>
          <InstructionalPanel
            title="Proceed through each of these questions to understand your stakeholders' interests in the project"
            videos={[
              {
                src: "/videos/instructional/project-setup/creating-project.mp4",
                title: "How to Create a New Project",
                description: "This 3-minute tutorial walks you through the entire project creation process.",
                poster: "/videos/instructional/project-setup/creating-project-poster.PNG",
                autoPlay: false,
                loop: false
              }
            ]}
            texts={[
              {
                content: "Select all the answers that apply to the question; add details where necessary.",
                type: "info"
              },
              {
                content: "The details that you add will appear in your final stakeholder analysis report.",
                type: "tip"
              },
              {
                content: "Mark important insights with the star icon to highlight them in your reports and analysis.",
                type: "tip"
              }
            ]}
            variant="default"
          />
        </div>

        {/* Review Created Banner */}
        {createdReview && (
          <div className="mb-6 p-4 bg-grass-50 border border-grass-100 rounded-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-grass-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-grass-900 mb-1">
                    Review Created Successfully
                  </p>
                  <p className="text-sm text-stratosphere-900">
                    Your task has been submitted for review. Status:{' '}
                    <span className="font-medium capitalize">
                      {createdReview.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedReviewId(createdReview._id);
                  setShowReviewModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-grass-500 text-white text-sm rounded hover:bg-grass-900 transition-colors whitespace-nowrap"
              >
                View Review
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Existing Review Access Panel */}
        {currentTaskReview && !createdReview && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-100 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Eye className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-sky-900">
                      This task has an active review
                    </p>
                    <ReviewStatusBadge
                      status={currentTaskReview.status}
                      compact={false}
                      showIcon={true}
                      showTooltip={false}
                      priority={currentTaskReview.priority}
                      unresolvedIssuesCount={currentTaskReview.unresolvedIssuesCount}
                    />
                  </div>
                  <p className="text-sm text-stratosphere-900">
                    {currentTaskReview.unresolvedIssuesCount! > 0 && (
                      <span className="text-clay-900 font-medium">
                        {currentTaskReview.unresolvedIssuesCount} unresolved issue{currentTaskReview.unresolvedIssuesCount !== 1 ? 's' : ''} • 
                      </span>
                    )}
                    {' '}Created {new Date(currentTaskReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-3">
                <button
                  onClick={handleViewCurrentReview}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 transition-colors whitespace-nowrap"
                >
                  <Eye className="w-3 h-3" />
                  View Review
                </button>
                {currentTaskReview.streamChannelCreated && (
                  <button
                    onClick={() => {
                      handleViewCurrentReview();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 border border-sky-500 text-sky-500 text-sm rounded hover:bg-sky-50 transition-colors whitespace-nowrap"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Discuss
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Navigation */}
        {stakeholderGroup && (
          <TaskNavigation
            currentTask={taskType}
            stakeholderGroupId={stakeholderGroupId}
            stakeholderGroup={stakeholderGroup}
            completedTasks={completedTasks}
            onReviewClick={handleReviewClick}
          />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-semibold text-stratosphere-500">
                  {stakeholderGroup?.name}
                </h1>
                {stakeholderGroup?.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-pointer flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs text-xs whitespace-normal">
                        {stakeholderGroup.description}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {stakeholderGroup?.category && typeof stakeholderGroup.category === 'object'
                  ? stakeholderGroup.category.name
                  : 'Loading category...'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {/* 🆕 Key Insights Counter */}
              {keyInsightsCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-ochre-50 border border-ochre-200 rounded text-ochre-900">
                  <Star className="h-4 w-4 fill-ochre-500" />
                  <span className="text-sm font-medium">
                    {keyInsightsCount} Key Insight{keyInsightsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => {
                  setSelectedOptions(new Map());
                  setRating(1);
                }}
                className="p-2 text-sky-500 hover:text-stratosphere-500 border border-concrete-500 rounded transition-colors"
                title="Reset selections"
                disabled={taskDataLoading}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || selectedOptions.size === 0 || taskDataLoading}
                className="p-2 px-4 bg-stratosphere-500 text-white rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky transition-colors"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </button>
            </div>
          </div>

          {/* Task Content */}
          {taskDataLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="space-y-3 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : taskPrompt ? (
            <>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h2 className="text-lg font-medium text-stratosphere-500">{taskPrompt.promptText}</h2>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  
                  {showTooltip && (
                    <div className="absolute mt-8 p-3 bg-gray-800 text-white text-sm rounded shadow-lg max-w-xs z-10">
                      {taskPrompt.tooltipText}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-500 text-sm">
                  Select all that apply and provide details for each selection. Mark important insights with the star icon.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {taskOptions.map((option) => {
                  const optionData = selectedOptions.get(option.optionId);
                  const isSelected = selectedOptions.has(option.optionId);
                  const isKeyInsight = optionData?.isKeyInsight || false;
                  
                  return (
                    <div 
                      key={option.optionId} 
                      className={`border rounded-lg p-4 transition-colors ${
                        isKeyInsight 
                          ? 'border-ochre-500 bg-ochre-50' 
                          : isSelected
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-concrete-500 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-1">
                          <input
                            type="checkbox"
                            id={option.optionId}
                            checked={isSelected}
                            onChange={() => handleToggleOption(option.optionId)}
                            className="mt-1 h-4 w-4 text-stratosphere-500 border-concrete-500 rounded focus:ring-stratosphere-500"
                          />
                          <label htmlFor={option.optionId} className="ml-2 block text-sm font-medium text-stratosphere cursor-pointer">
                            {option.label}
                          </label>
                        </div>
                        
                        {/* 🆕 Key Insight Toggle Button */}
                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => handleToggleKeyInsight(option.optionId)}
                            className={`ml-2 p-1 rounded transition-colors flex-shrink-0 ${
                              isKeyInsight
                                ? 'text-ochre-500 hover:text-ochre-900'
                                : 'text-gray-300 hover:text-ochre-500'
                            }`}
                            title={isKeyInsight ? 'Remove from key insights' : 'Mark as key insight'}
                          >
                            <Star className={`h-5 w-5 ${isKeyInsight ? 'fill-ochre-500' : ''}`} />
                          </button>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="mt-2 pl-6 animate-in slide-in-from-top-2 duration-200">
                          <div className="flex justify-between items-center mb-1">
                            <label htmlFor={`desc-${option.optionId}`} className="block text-xs text-gray-500">
                              {taskType === 'risks' 
                                ? 'If you have checked this box please provide details and create a risk'
                                : 'Please provide details:'}
                            </label>
                            {taskType === 'risks' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOptionIdForRisk(option.optionId);
                                  setShowCreateRiskModal(true);
                                }}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                              >
                                Create Risk
                              </button>
                            )}
                          </div>
                          <textarea
                            id={`desc-${option.optionId}`}
                            value={optionData?.description || ''}
                            onChange={(e) => handleDescriptionChange(option.optionId, e.target.value)}
                            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 text-sm text-stratosphere-500 ${
                              isKeyInsight
                                ? 'border-ochre-300 focus:ring-ochre-500 bg-white'
                                : 'border-concrete-500 focus:ring-stratosphere-500'
                            }`}
                            rows={3}
                            placeholder="Describe how this applies to the stakeholder group..."
                          />
                          
                          {/* 🆕 Key Insight Label */}
                          {isKeyInsight && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-ochre-900">
                              <Star className="h-3 w-3 fill-ochre-500" />
                              <span className="font-medium">Marked as key insight</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rating Scale */}
              <div className="border-t pt-6 border-stratosphere-500">
                <RatingScale
                  value={rating}
                  onChange={setRating}
                  minLabel={taskPrompt.ratingMinLabel}
                  maxLabel={taskPrompt.ratingMaxLabel}
                  prompt={taskPrompt.ratingPrompt}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load task data</p>
            </div>
          )}
        </div>

        {/* Footer with Review Status Indicator */}
        <div className="flex justify-between px-4 items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-sky-500 hover:text-stratosphere-500 transition-colors"
            >
              Cancel
            </button>
            
            {currentTaskReview && (
              <div className="flex items-center gap-2 text-sm text-concrete-900">
                <span>Review:</span>
                <ReviewStatusBadge
                  status={currentTaskReview.status}
                  compact={false}
                  showIcon={true}
                  showTooltip={true}
                  onClick={handleViewCurrentReview}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🆕 Key Insights Counter in Footer */}
            {keyInsightsCount > 0 && (
              <span className="text-sm text-concrete-900 flex items-center gap-1">
                <Star className="h-4 w-4 fill-ochre-500 text-ochre-500" />
                {keyInsightsCount} key insight{keyInsightsCount !== 1 ? 's' : ''}
              </span>
            )}
            
            {checkingReview && (
              <span className="text-sm text-concrete-900 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                Creating review...
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || selectedOptions.size === 0 || taskDataLoading}
              className="bg-stratosphere-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-stratosphere-900 transition-colors"
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateRiskModal && stakeholderGroup && projectId && user && (
        <CreateRiskModal
          isOpen={showCreateRiskModal}
          onClose={() => {
            setShowCreateRiskModal(false);
            setSelectedOptionIdForRisk(null);
          }}
          projectId={projectId}
          organizationId={(project?.organization as unknown as string) || ''}
          userRole={user.primaryRole as 'manager' | 'projectCreator' | 'organiser' | 'reviewer' || 'manager'}
          onRiskCreated={handleRiskCreated}
          projectSites={project?.sites || []}
          currentUser={{
            _id: user._id,
            name: user.name,
            email: user.email
          }}
        />
      )}

      {showReviewModal && selectedReviewId && (
        <ReviewDetailModal
          reviewId={selectedReviewId}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReviewId(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskPage;