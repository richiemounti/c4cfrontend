// app/dashboard/project/[id]/theory-of-change/stage1/actions/[actionId]/edit/page.tsx
// UPDATED VERSION WITH AUTO-CREATE REVIEW

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getActionById, updateAction } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject } from '@/lib/api/project';
import { getReviewsByModuleItem, createReview } from '@/lib/api/reviews'; // ✅ ADD createReview
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ActionForm from '@/components/forms/ActionForm';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import { CreateActionData, Review } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StakeholderGroup {
  _id: string;
  name: string;
  project: string;
  projectSite?: string;
  category: {
    _id: string;
    name: string;
  };
}

export default function EditActionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const actionId = params.actionId as string;
  const siteId = searchParams.get('siteId');
  
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [allStakeholderGroups, setAllStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [project, setProject] = useState<any>(null);
  const [actionData, setActionData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Review state management
  const [actionReview, setActionReview] = useState<Review | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [creatingReview, setCreatingReview] = useState(false); // ✅ NEW: Track review creation
  
  // Filter stakeholder groups based on context (project vs site)
  const filteredStakeholderGroups = useMemo(() => {
    if (!allStakeholderGroups || allStakeholderGroups.length === 0) return [];
    
    if (siteId) {
      return allStakeholderGroups.filter(group => group.projectSite === siteId);
    } else {
      return allStakeholderGroups.filter(group => !group.projectSite);
    }
  }, [allStakeholderGroups, siteId]);
  
  // Helper function to get error message from API response
  const getErrorMessage = (error: any): string => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return data.message || 'Please check your input and try again';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'Action not found. It may have been deleted.';
        case 409:
          return 'An action with the same content already exists.';
        case 422:
          return 'Invalid data provided. Please check your inputs.';
        case 500:
          return 'Server error. Please try again or contact support.';
        default:
          return data.message || `Error ${status}: Operation failed`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection and try again.';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  };
  
  // ✅ UPDATED: Fetch or create review for this action
  const fetchOrCreateActionReview = async () => {
    if (!actionId || !actionData || !project) return;
    
    try {
      setLoadingReview(true);
      
      // First, try to fetch existing review
      const response = await getReviewsByModuleItem(
        'stakeholder_action',
        actionId
      );
      
      if (response.success && response.data && response.data.length > 0) {
        // Review exists - use the most recent one
        setActionReview(response.data[0]);
        console.log('✅ Existing review found:', response.data[0]._id);
      } else {
        // No review exists - create one automatically
        console.log('📝 No review found, creating new review for action:', actionId);
        await createActionReview();
      }
    } catch (err) {
      console.error('Error fetching action review:', err);
      setActionReview(null);
    } finally {
      setLoadingReview(false);
    }
  };
  
  // ✅ NEW: Create a review for this action
  const createActionReview = async () => {
    if (!actionData || !project) {
      console.error('Missing action or project data for review creation');
      return;
    }
    
    try {
      setCreatingReview(true);
      
      // Generate review title from action data
      const stakeholderName = actionData.stakeholderGroup?.name || 'Unknown Stakeholder';
      const actionText = actionData.action?.substring(0, 50) || 'Action';
      const reviewTitle = `Review: ${stakeholderName} - ${actionText}${actionText.length > 50 ? '...' : ''}`;
      
      // Prepare review data
      const reviewData = {
        module: 'stakeholder_action' as const,
        moduleItemId: actionId,
        organizationId: project.organization?._id || project.organization,
        projectId: projectId,
        projectSiteId: siteId || undefined,
        title: reviewTitle,
        description: `Review for stakeholder action: ${actionData.action}`,
        priority: 'medium' as const,
        // Let backend auto-assign reviewers
      };
      
      console.log('Creating review with data:', reviewData);
      
      const response = await createReview(reviewData);
      
      if (response.success && response.data) {
        setActionReview(response.data);
        console.log('✅ Review created successfully:', response.data._id);
        
        toast({
          title: "Review Created",
          description: "A review has been initiated for this action",
        });
      }
    } catch (err: any) {
      console.error('Error creating review:', err);
      
      // Only show error if it's not a "review already exists" error
      if (err.response?.status !== 409) {
        toast({
          title: "Review Creation Failed",
          description: getErrorMessage(err),
          variant: "destructive",
        });
      } else {
        // If review already exists (409), try fetching it again
        console.log('Review already exists, fetching it...');
        const response = await getReviewsByModuleItem('stakeholder_action', actionId);
        if (response.success && response.data && response.data.length > 0) {
          setActionReview(response.data[0]);
        }
      }
    } finally {
      setCreatingReview(false);
    }
  };
  
  // Handler to view review
  const handleViewReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setShowReviewModal(true);
  };
  
  // Handler to close review modal and refresh
  const handleCloseReviewModal = async () => {
    setShowReviewModal(false);
    setSelectedReviewId(null);
    
    // Refresh the review data
    await fetchOrCreateActionReview();
  };
  
  // Get review status badge
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
        text: 'Escalated',
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        // Get ALL stakeholder groups for the project
        const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId || undefined);
        const extractedStakeholderGroups = stakeholderResponse.data?.stakeholderGroups || [];
        setAllStakeholderGroups(extractedStakeholderGroups);
        
        // Fetch existing action data
        const { data: actionResponse } = await getActionById(actionId);
        if (actionResponse.success) {
          setActionData(actionResponse.data);
        } else {
          throw new Error('Failed to load action data');
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        
        const errorMessage = getErrorMessage(error);
        toast({
          title: "Loading Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Navigate back on error
        setTimeout(() => {
          const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
          router.push(siteId ? `${url}?siteId=${siteId}` : url);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, actionId, siteId, toast, router]);
  
  // ✅ NEW: Separate useEffect to fetch/create review after action and project are loaded
  useEffect(() => {
    if (actionData && project && !loading) {
      fetchOrCreateActionReview();
    }
  }, [actionData, project, loading]);
  
  const handleSubmit = async (data: CreateActionData) => {
    try {
      setIsSubmitting(true);
      
      toast({
        title: "Updating Action",
        description: "Please wait while we update your action...",
      });
      
      await updateAction(actionId, data);
      
      toast({
        title: "Success!",
        description: "Action updated successfully",
      });
      
      // Refresh review after update
      await fetchOrCreateActionReview();
      
      // Navigate back with context preserved
      setTimeout(() => {
        const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
        router.push(siteId ? `${url}?siteId=${siteId}` : url);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating action:", error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
          <p className="text-stratosphere font-medium ml-3">Loading action data...</p>
        </div>
      </div>
    );
  }
  
  if (!actionData) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Action not found</p>
            <button
              onClick={handleCancel}
              className="text-sky-500 hover:text-stratosphere"
            >
              Return to Stage 1
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-sky-tint">
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={() => {
              const url = `/dashboard/project/${projectId}/theory-of-change/stage1`;
              router.push(siteId ? `${url}?siteId=${siteId}` : url);
            }}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 1
          </button>
          
          {/* Header with Review Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-stratosphere">
                Edit Stakeholder Action {siteId && <span className="text-gray-500">(Site Level)</span>}
              </h1>
              <p className="text-gray-500 mt-2">
                Update action for {actionData.stakeholderGroup.name}
              </p>
            </div>
            
            {/* Review Status Badge and Button */}
            {actionReview && (
              <div className="flex items-center gap-2">
                {getReviewStatusBadge(actionReview)}
                <button
                  onClick={() => handleViewReview(actionReview._id)}
                  className="px-4 py-2 text-sm bg-white border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  View Review
                </button>
              </div>
            )}

            {/* ✅ NEW: Creating review indicator */}
            {creatingReview && (
              <div className="text-sm text-sky-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                Creating review...
              </div>
            )}

            {/* Loading review indicator */}
            {loadingReview && !creatingReview && !actionReview && (
              <div className="text-sm text-concrete-900 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                Loading review...
              </div>
            )}

            {/* No review indicator - shouldn't show often since we auto-create */}
            {!loadingReview && !creatingReview && !actionReview && (
              <div className="text-sm text-concrete-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-concrete-900" />
                Review pending
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Review creation notice */}
        {creatingReview && (
          <div className="mx-8 mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
            <p className="text-sm text-sky-900">
              <span className="font-semibold">Initiating Review:</span> A review is being created for this action to track changes and approvals.
            </p>
          </div>
        )}

        {/* Context Info */}
        {siteId && (
          <div className="mx-8 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Site Context:</span> You are editing a site-specific action.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="p-8">
          <ActionForm
            projectId={projectId}
            projectSiteId={siteId || undefined}
            stageId={actionData.stage}
            stakeholderGroups={filteredStakeholderGroups}
            initialData={actionData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel="Update Action"
            title="Edit Action Details"
          />
        </div>
      </div>
      
      {/* Review Detail Modal */}
      {showReviewModal && selectedReviewId && (
        <ReviewDetailModal
          reviewId={selectedReviewId}
          onClose={handleCloseReviewModal}
        />
      )}
    </div>
  );
}