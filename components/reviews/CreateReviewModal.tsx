// components/reviews/CreateReviewModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useCreateReview } from '@/hooks/useReviews';
import type { 
  ReviewModule,
  ReviewPriority,
  CreateReviewRequest 
} from '@/types'; // Import from @/types, NOT from @/types/review.types

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  organizationId: string;
  projectSiteId?: string;
  // Pre-fill if creating review for specific entity
  module?: ReviewModule;           // Changed from entityType
  moduleItemId?: string;            // Changed from entityId
  entityTitle?: string;             // Keep for display purposes
}

const CreateReviewModal = ({
  isOpen,
  onClose,
  projectId,
  organizationId,
  projectSiteId,
  module: presetModule,             // Changed from entityType
  moduleItemId: presetModuleItemId, // Changed from entityId
  entityTitle
}: CreateReviewModalProps) => {
  const createReview = useCreateReview();
  
  const [formData, setFormData] = useState<Partial<CreateReviewRequest>>({
    module: presetModule || 'project_setup',      // Changed
    moduleItemId: presetModuleItemId || '',       // Changed
    projectId,
    organizationId,
    projectSiteId,
    title: entityTitle ? `Review: ${entityTitle}` : '',
    description: '',
    priority: 'medium',
    dueDate: '',
    // REMOVED: managerDueDate and staffDueDate don't exist in backend
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.moduleItemId?.trim()) {           // Changed
      newErrors.moduleItemId = 'Module Item ID is required';  // Changed
    }

    if (!formData.module) {                         // Changed
      newErrors.module = 'Module type is required'; // Changed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createReview.mutateAsync({
        module: formData.module!,              // Changed
        moduleItemId: formData.moduleItemId!,  // Changed
        projectId: formData.projectId!,
        organizationId: formData.organizationId!,
        projectSiteId: formData.projectSiteId,
        title: formData.title!,
        description: formData.description,
        priority: formData.priority as ReviewPriority,
        dueDate: formData.dueDate || undefined,
        reviewers: formData.reviewers,         // Add this if you want to support it
        nestedPath: formData.nestedPath,       // Add this if you want to support it
        nestedItemId: formData.nestedItemId,   // Add this if you want to support it
        // REMOVED: managerDueDate and staffDueDate
      });

      // Reset form and close
      setFormData({
        module: 'project_setup',               // Changed
        moduleItemId: '',                      // Changed
        projectId,
        organizationId,
        projectSiteId,
        title: '',
        description: '',
        priority: 'medium',
      });
      onClose();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleClose = () => {
    if (!createReview.isPending) {
      setFormData({
        module: 'project_setup',               // Changed
        moduleItemId: '',                      // Changed
        projectId,
        organizationId,
        projectSiteId,
        title: '',
        description: '',
        priority: 'medium',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-stratosphere">
              Create Review
            </h2>
            <button
              onClick={handleClose}
              disabled={createReview.isPending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Module Type - Changed from Entity Type */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Module Type <span className="text-red-500">*</span>
              </label>
              <select
                name="module"                      // Changed from entityType
                value={formData.module}            // Changed
                onChange={handleChange}
                disabled={!!presetModule || createReview.isPending}  // Changed
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent ${
                  errors.module ? 'border-red-500' : 'border-gray-300'  // Changed
                } ${presetModule ? 'bg-gray-100' : ''}`}>              {/* Changed */}
                <option value="project_setup">Project Setup</option>
                <option value="project_site_setup">Project Site Setup</option>
                <option value="stakeholder_group">Stakeholder Group</option>
                <option value="stakeholder_action">Stakeholder Action (TOC Stage 1)</option>
                <option value="social_impact">Social Impact (TOC Stage 2)</option>
                <option value="toc_consultation_plan">TOC Consultation Plan</option>
                <option value="survey">Survey</option>
                <option value="survey_question">Survey Question</option>
              </select>
              {errors.module && (                  // Changed
                <p className="mt-1 text-sm text-red-500">{errors.module}</p>
              )}
            </div>

            {/* Module Item ID - Changed from Entity ID */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Module Item ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="moduleItemId"                // Changed from entityId
                value={formData.moduleItemId}      // Changed
                onChange={handleChange}
                disabled={!!presetModuleItemId || createReview.isPending}  // Changed
                placeholder="Enter the ID of the item to review"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent ${
                  errors.moduleItemId ? 'border-red-500' : 'border-gray-300'  // Changed
                } ${presetModuleItemId ? 'bg-gray-100' : ''}`}               
              />
              {errors.moduleItemId && (            // Changed
                <p className="mt-1 text-sm text-red-500">{errors.moduleItemId}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                The MongoDB ObjectId of the item you want to review
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Review Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={createReview.isPending}
                placeholder="e.g., Q1 Project Setup Review"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={createReview.isPending}
                placeholder="Provide additional context about this review..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={createReview.isPending}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Due Date - Only one, removed manager and staff */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={createReview.isPending}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {createReview.isError && (
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Failed to create review
                  </h4>
                  <p className="text-xs text-red-700">
                    {createReview.error instanceof Error 
                      ? createReview.error.message 
                      : 'An unexpected error occurred'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={createReview.isPending}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createReview.isPending}
                className="px-6 py-2 bg-ochre text-white rounded-lg hover:bg-ochre-900 disabled:opacity-50 flex items-center"
              >
                {createReview.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Creating...
                  </>
                ) : (
                  'Create Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;