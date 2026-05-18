// components/feedback/BugReportModal.tsx - Enhanced Version

'use client'
import { useState, useRef } from 'react';
import { X, Star, Upload, AlertCircle, Lightbulb, MessageSquare, Bug, User, Palette } from 'lucide-react';
import { submitBugReport } from '@/lib/api/bugReport';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug_report' | 'user_experience' | 'thematic_feedback' | 'feature_suggestion' | 'general_feedback';

interface FormData {
  // Basic fields
  feedbackType: FeedbackType;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  
  // NEW FIELDS
  assignedToTeamMember: 'kate' | 'sam' | 'belinda' | '';
  sourceOfFeedback: {
    source: string;
    contactPerson: string;
  };
  
  // Bug-specific fields
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
  
  // User Experience fields
  userExperienceRating: {
    overallSatisfaction: number;
    easeOfUse: number;
    speed: number;
    visualAppeal: number;
    functionalityClarity: number;
  };
  
  // Performance fields
  performanceIssues: {
    pageLoadTime: string;
    timeToInteractive: string;
    specificSlowAreas: string[];
    browserFreeze: boolean;
    memoryIssues: boolean;
  };
  
  // Thematic feedback
  thematicFeedback: {
    lookAndFeelRating: number;
    colorSchemeAppropriate: boolean | null;
    fontReadability: number;
    layoutIntuitive: number;
    brandConsistency: number;
    specificThematicComments: string;
  };
  
  // Feature suggestion
  featureSuggestion: {
    description: string;
    businessValue: 'low' | 'medium' | 'high';
    userImpact: 'low' | 'medium' | 'high';
    suggestedPriority: 'low' | 'medium' | 'high';
    discussedInternally: boolean;
  };
  
  // UPDATED FIELDS
  urgencyLevel: 'fix_24_hours' | 'fix_1_3_days' | 'fix_this_week' | 'fix_2_weeks' | 'fix_next_month' | 'later';
  bugType: 'fix' | 'food_for_thought' | 'pipeline' | '';
  
  // Business impact
  businessImpact: {
    affectedUsers: 'few' | 'some' | 'many' | 'most' | 'all';
    functionalityBlocked: boolean;
    workaroundAvailable: boolean;
    revenueImpact: boolean;
    complianceImpact: boolean;
  };
  
  // Tags
  tags: string[];
  requiresFollowUp: boolean;
}



const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    feedbackType: 'bug_report',
    title: '',
    description: '',
    category: '',
    subCategory: '',
    
    // NEW FIELDS
    assignedToTeamMember: '',
    sourceOfFeedback: {
      source: '',
      contactPerson: '',
    },
    
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    userExperienceRating: {
      overallSatisfaction: 0,
      easeOfUse: 0,
      speed: 0,
      visualAppeal: 0,
      functionalityClarity: 0,
    },
    performanceIssues: {
      pageLoadTime: '',
      timeToInteractive: '',
      specificSlowAreas: [],
      browserFreeze: false,
      memoryIssues: false,
    },
    thematicFeedback: {
      lookAndFeelRating: 0,
      colorSchemeAppropriate: null,
      fontReadability: 0,
      layoutIntuitive: 0,
      brandConsistency: 0,
      specificThematicComments: '',
    },
    featureSuggestion: {
      description: '',
      businessValue: 'medium',
      userImpact: 'medium',
      suggestedPriority: 'medium',
      discussedInternally: false,
    },
    
    // UPDATED DEFAULTS
    urgencyLevel: 'fix_this_week',
    bugType: '',
    
    businessImpact: {
      affectedUsers: 'some',
      functionalityBlocked: false,
      workaroundAvailable: false,
      revenueImpact: false,
      complianceImpact: false,
    },
    tags: [],
    requiresFollowUp: false,
  });


  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Feedback type configurations
  const feedbackTypes = [
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-red-600', description: 'Report a software issue or error' },
    { value: 'user_experience', label: 'User Experience', icon: User, color: 'text-blue-600', description: 'Share feedback about usability and experience' },
    { value: 'thematic_feedback', label: 'Design Feedback', icon: Palette, color: 'text-purple-600', description: 'Feedback on visual design and theme' },
    { value: 'feature_suggestion', label: 'Feature Request', icon: Lightbulb, color: 'text-green-600', description: 'Suggest new features or improvements' },
    { value: 'general_feedback', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-600', description: 'Other feedback or comments' },
  ];

  // Categories based on feedback type
  const getCategories = () => {
  switch (formData.feedbackType) {
    case 'bug_report':
      return ['functionality', 'ui_ux', 'performance', 'security', 'data_integrity', 'integration'];
    case 'user_experience':
      return ['navigation', 'layout', 'accessibility', 'responsiveness', 'loading_speed'];
    case 'thematic_feedback':
      return ['visual_design', 'branding', 'color_scheme', 'typography', 'iconography'];
    case 'feature_suggestion':
      return ['new_feature', 'enhancement', 'workflow_improvement', 'automation'];
    case 'general_feedback':
      return ['copy', 'other']; // ADDED COPY CATEGORY
    default:
      return ['other'];
  }
};

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - attachments.length); // Max 5 files
    setAttachments(prev => [...prev, ...newFiles]);
    
    // Create previews for images
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachmentPreviews(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const collectSystemInfo = () => {
    const connection = (navigator as any).connection;
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' as const : 'desktop' as const,
      connectionSpeed: connection?.effectiveType || 'unknown',
      browserVersion: navigator.appVersion,
      osVersion: navigator.platform,
      // Add user info if available
      ...(localStorage.getItem('user') && {
        ...JSON.parse(localStorage.getItem('user') || '{}')
      })
    };
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    
    switch (formData.feedbackType) {
      case 'bug_report':
        if (!formData.steps.trim()) return 'Steps to reproduce are required for bug reports';
        if (!formData.expectedBehavior.trim()) return 'Expected behavior is required for bug reports';
        if (!formData.actualBehavior.trim()) return 'Actual behavior is required for bug reports';
        break;
      case 'user_experience':
        if (formData.userExperienceRating.overallSatisfaction === 0) return 'Overall satisfaction rating is required';
        break;
      case 'feature_suggestion':
        if (!formData.featureSuggestion.description.trim()) return 'Feature description is required';
        break;
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const systemInfo = collectSystemInfo();
      
      // Prepare form data for submission
      const submissionData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          submissionData.append(key, JSON.stringify(value));
        } else {
          submissionData.append(key, String(value));
        }
      });
      
      submissionData.append('systemInfo', JSON.stringify(systemInfo));
      
      // Add attachments
      attachments.forEach((file, index) => {
        submissionData.append('attachments', file);
      });
      
      await submitBugReport(submissionData);
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
      setSubmitSuccess(false);
      // Reset to initial state with updated fields
      setFormData({
        feedbackType: 'bug_report',
        title: '',
        description: '',
        category: '',
        subCategory: '',
        assignedToTeamMember: '',
        sourceOfFeedback: {
          source: '',
          contactPerson: '',
        },
        steps: '',
        expectedBehavior: '',
        actualBehavior: '',
        userExperienceRating: {
          overallSatisfaction: 0,
          easeOfUse: 0,
          speed: 0,
          visualAppeal: 0,
          functionalityClarity: 0,
        },
        performanceIssues: {
          pageLoadTime: '',
          timeToInteractive: '',
          specificSlowAreas: [],
          browserFreeze: false,
          memoryIssues: false,
        },
        thematicFeedback: {
          lookAndFeelRating: 0,
          colorSchemeAppropriate: null,
          fontReadability: 0,
          layoutIntuitive: 0,
          brandConsistency: 0,
          specificThematicComments: '',
        },
        featureSuggestion: {
          description: '',
          businessValue: 'medium',
          userImpact: 'medium',
          suggestedPriority: 'medium',
          discussedInternally: false,
        },
        urgencyLevel: 'fix_this_week',
        bugType: '',
        businessImpact: {
          affectedUsers: 'some',
          functionalityBlocked: false,
          workaroundAvailable: false,
          revenueImpact: false,
          complianceImpact: false,
        },
        tags: [],
        requiresFollowUp: false,
      });
      setAttachments([]);
      setAttachmentPreviews([]);
      onClose();
    }, 2000);
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{ value: number; onChange: (value: number) => void; label: string }> = ({ value, onChange, label }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-stratosphere w-32">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-5 w-5" fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">({value}/5)</span>
    </div>
  );

  const currentFeedbackType = feedbackTypes.find(ft => ft.value === formData.feedbackType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-sky-tint rounded-lg shadow-xl">
        <div className="sticky top-0 bg-sky-tint p-4 border-b border-sky flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentFeedbackType && (
              <currentFeedbackType.icon className={`h-6 w-6 ${currentFeedbackType.color}`} />
            )}
            <div>
              <h2 className="text-xl font-semibold text-stratosphere">Submit Feedback</h2>
              <p className="text-sm text-stratosphere/70">{currentFeedbackType?.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stratosphere/70 hover:text-stratosphere focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-6 text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
              <h3 className="font-semibold">Thank you!</h3>
              <p>Your {currentFeedbackType?.label.toLowerCase()} has been submitted successfully.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitError && (
              <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {submitError}
              </div>
            )}

            {/* Feedback Type Selection */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-3">
                Feedback Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('feedbackType', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.feedbackType === type.value
                        ? 'border-stratosphere bg-stratosphere/10'
                        : 'border-sky hover:border-stratosphere/50'
                    }`}
                  >
                    <type.icon className={`h-6 w-6 mx-auto mb-2 ${type.color}`} />
                    <div className="text-xs font-medium text-stratosphere">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-stratosphere mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                  placeholder="Brief summary"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-stratosphere mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                  required
                >
                  <option value="">Select category</option>
                  {getCategories().map(cat => (
                    <option key={cat} value={cat}>
                      {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stratosphere mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                placeholder="Detailed description"
                required
              />
            </div>

            {/* Assignment and Source Section */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800">Assignment & Source Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignedToTeamMember" className="block text-sm font-medium text-stratosphere mb-1">
                    Assign to Team Member (Optional)
                  </label>
                  <select
                    id="assignedToTeamMember"
                    value={formData.assignedToTeamMember}
                    onChange={(e) => handleChange('assignedToTeamMember', e.target.value)}
                    className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                  >
                    <option value="">-- Select Team Member --</option>
                    <option value="kate">Kate</option>
                    <option value="sam">Sam</option>
                    <option value="belinda">Belinda</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="feedbackSource" className="block text-sm font-medium text-stratosphere mb-1">
                    Source of Feedback
                  </label>
                  <input
                    type="text"
                    id="feedbackSource"
                    value={formData.sourceOfFeedback.source}
                    onChange={(e) => handleChange('sourceOfFeedback.source', e.target.value)}
                    className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    placeholder="e.g., Early Adopter, Client XYZ, Internal Testing"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Who provided this feedback? (e.g., Mark - Carbon Tanzania)
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-stratosphere mb-1">
                  Contact Person (Optional)
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  value={formData.sourceOfFeedback.contactPerson}
                  onChange={(e) => handleChange('sourceOfFeedback.contactPerson', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                  placeholder="e.g., Mark Johnson"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Type-specific sections */}
            {formData.feedbackType === 'bug_report' && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Bug Report Details
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-stratosphere mb-1">
                    Steps to Reproduce <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.steps}
                    onChange={(e) => handleChange('steps', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. Notice that..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stratosphere mb-1">
                      Expected Behavior <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) => handleChange('expectedBehavior', e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                      placeholder="What should happen"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stratosphere mb-1">
                      Actual Behavior <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) => handleChange('actualBehavior', e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                      placeholder="What actually happens"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.feedbackType === 'user_experience' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Experience Ratings
                </h3>
                
                <div className="space-y-3">
                  <StarRating
                    value={formData.userExperienceRating.overallSatisfaction}
                    onChange={(value) => handleChange('userExperienceRating.overallSatisfaction', value)}
                    label="Overall Satisfaction"
                  />
                  <StarRating
                    value={formData.userExperienceRating.easeOfUse}
                    onChange={(value) => handleChange('userExperienceRating.easeOfUse', value)}
                    label="Ease of Use"
                  />
                  <StarRating
                    value={formData.userExperienceRating.speed}
                    onChange={(value) => handleChange('userExperienceRating.speed', value)}
                    label="Speed"
                  />
                  <StarRating
                    value={formData.userExperienceRating.visualAppeal}
                    onChange={(value) => handleChange('userExperienceRating.visualAppeal', value)}
                    label="Visual Appeal"
                  />
                  <StarRating
                    value={formData.userExperienceRating.functionalityClarity}
                    onChange={(value) => handleChange('userExperienceRating.functionalityClarity', value)}
                    label="Functionality Clarity"
                  />
                </div>

                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Performance Issues (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stratosphere mb-1">
                        Page Load Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.performanceIssues.pageLoadTime}
                        onChange={(e) => handleChange('performanceIssues.pageLoadTime', e.target.value)}
                        className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stratosphere mb-1">
                        Time to Interactive (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.performanceIssues.timeToInteractive}
                        onChange={(e) => handleChange('performanceIssues.timeToInteractive', e.target.value)}
                        className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.performanceIssues.browserFreeze}
                        onChange={(e) => handleChange('performanceIssues.browserFreeze', e.target.checked)}
                        className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                      />
                      <span className="ml-2 text-sm text-stratosphere">Browser freeze/hang issues</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.performanceIssues.memoryIssues}
                        onChange={(e) => handleChange('performanceIssues.memoryIssues', e.target.checked)}
                        className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                      />
                      <span className="ml-2 text-sm text-stratosphere">Memory/resource issues</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {formData.feedbackType === 'thematic_feedback' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design & Theme Feedback
                </h3>
                
                <div className="space-y-3">
                  <StarRating
                    value={formData.thematicFeedback.lookAndFeelRating}
                    onChange={(value) => handleChange('thematicFeedback.lookAndFeelRating', value)}
                    label="Look & Feel"
                  />
                  <StarRating
                    value={formData.thematicFeedback.fontReadability}
                    onChange={(value) => handleChange('thematicFeedback.fontReadability', value)}
                    label="Font Readability"
                  />
                  <StarRating
                    value={formData.thematicFeedback.layoutIntuitive}
                    onChange={(value) => handleChange('thematicFeedback.layoutIntuitive', value)}
                    label="Layout Intuitive"
                  />
                  <StarRating
                    value={formData.thematicFeedback.brandConsistency}
                    onChange={(value) => handleChange('thematicFeedback.brandConsistency', value)}
                    label="Brand Consistency"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stratosphere mb-2">
                    Color Scheme Appropriate?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="colorScheme"
                        checked={formData.thematicFeedback.colorSchemeAppropriate === true}
                        onChange={() => handleChange('thematicFeedback.colorSchemeAppropriate', true)}
                        className="text-stratosphere focus:ring-stratosphere"
                      />
                      <span className="ml-2 text-sm text-stratosphere">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="colorScheme"
                        checked={formData.thematicFeedback.colorSchemeAppropriate === false}
                        onChange={() => handleChange('thematicFeedback.colorSchemeAppropriate', false)}
                        className="text-stratosphere focus:ring-stratosphere"
                      />
                      <span className="ml-2 text-sm text-stratosphere">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stratosphere mb-1">
                    Specific Comments
                  </label>
                  <textarea
                    value={formData.thematicFeedback.specificThematicComments}
                    onChange={(e) => handleChange('thematicFeedback.specificThematicComments', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    placeholder="Specific design feedback..."
                  />
                </div>
              </div>
            )}

            {formData.feedbackType === 'feature_suggestion' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Feature Suggestion
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-stratosphere mb-1">
                    Feature Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.featureSuggestion.description}
                    onChange={(e) => handleChange('featureSuggestion.description', e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    placeholder="Describe the feature you'd like to see..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stratosphere mb-1">
                      Business Value
                    </label>
                    <select
                      value={formData.featureSuggestion.businessValue}
                      onChange={(e) => handleChange('featureSuggestion.businessValue', e.target.value)}
                      className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stratosphere mb-1">
                      User Impact
                    </label>
                    <select
                      value={formData.featureSuggestion.userImpact}
                      onChange={(e) => handleChange('featureSuggestion.userImpact', e.target.value)}
                      className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stratosphere mb-1">
                      Suggested Priority
                    </label>
                    <select
                      value={formData.featureSuggestion.suggestedPriority}
                      onChange={(e) => handleChange('featureSuggestion.suggestedPriority', e.target.value)}
                      className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                {/* NEW: Internal Discussion Checkbox */}
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featureSuggestion.discussedInternally}
                      onChange={(e) => handleChange('featureSuggestion.discussedInternally', e.target.checked)}
                      className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                    />
                    <span className="ml-2 text-sm text-stratosphere">
                      This feature request has been discussed internally
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Assessment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stratosphere mb-1">
                  Turnaround Time
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => handleChange('urgencyLevel', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                >
                  <option value="fix_24_hours">Fix within 24 hours</option>
                  <option value="fix_1_3_days">Fix within 1-3 days</option>
                  <option value="fix_this_week">Fix within this week</option>
                  <option value="fix_2_weeks">Fix within 2 weeks</option>
                  <option value="fix_next_month">Fix within next month</option>
                  <option value="later">Later</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stratosphere mb-1">
                  Type (Optional)
                </label>
                <select
                  value={formData.bugType}
                  onChange={(e) => handleChange('bugType', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                >
                  <option value="">-- Select Type --</option>
                  <option value="fix">Fix</option>
                  <option value="food_for_thought">Food for Thought</option>
                  <option value="pipeline">Pipeline</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Fix: Immediate bug fix | Food for Thought: Idea to consider | Pipeline: Future feature
                </p>
              </div>
            </div>

            {/* Business Impact */}
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800">Business Impact Assessment</h3>
              
              <div>
                <label className="block text-sm font-medium text-stratosphere mb-1">
                  How many users are affected?
                </label>
                <select
                  value={formData.businessImpact.affectedUsers}
                  onChange={(e) => handleChange('businessImpact.affectedUsers', e.target.value)}
                  className="w-full rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                >
                  <option value="few">Few users</option>
                  <option value="some">Some users</option>
                  <option value="many">Many users</option>
                  <option value="most">Most users</option>
                  <option value="all">All users</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessImpact.functionalityBlocked}
                      onChange={(e) => handleChange('businessImpact.functionalityBlocked', e.target.checked)}
                      className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                    />
                    <span className="ml-2 text-sm text-stratosphere">Blocks key functionality</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessImpact.workaroundAvailable}
                      onChange={(e) => handleChange('businessImpact.workaroundAvailable', e.target.checked)}
                      className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                    />
                    <span className="ml-2 text-sm text-stratosphere">Workaround available</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessImpact.revenueImpact}
                      onChange={(e) => handleChange('businessImpact.revenueImpact', e.target.checked)}
                      className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                    />
                    <span className="ml-2 text-sm text-stratosphere">Has revenue impact</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessImpact.complianceImpact}
                      onChange={(e) => handleChange('businessImpact.complianceImpact', e.target.checked)}
                      className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                    />
                    <span className="ml-2 text-sm text-stratosphere">Affects compliance</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-1">
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-md border border-sky p-2 focus:border-stratosphere focus:outline-none focus:ring-1 focus:ring-stratosphere"
                  placeholder="Add a tag..."
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.tags.length >= 10}
                  className="px-4 py-2 bg-stratosphere text-white rounded-md hover:bg-stratosphere/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-stratosphere/10 text-stratosphere rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-stratosphere/70 hover:text-stratosphere"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.tags.length}/10 tags
              </p>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-stratosphere mb-1">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-sky rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-stratosphere">
                        Drop files here or{" "}
                        <span className="text-stratosphere font-medium underline">browse</span>
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.log"
                        onChange={(e) => e.target.files && handleFileChange(e.target.files)}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Images, videos, documents, logs (max 5 files, 10MB each)
                  </p>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresFollowUp}
                  onChange={(e) => handleChange('requiresFollowUp', e.target.checked)}
                  className="rounded border-sky text-stratosphere focus:ring-stratosphere"
                />
                <span className="ml-2 text-sm text-stratosphere">
                  I would like to be contacted about this feedback
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-sky text-stratosphere rounded-md hover:bg-sky/10 focus:outline-none focus:ring-2 focus:ring-stratosphere focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-stratosphere text-white rounded-md hover:bg-stratosphere/90 focus:outline-none focus:ring-2 focus:ring-stratosphere focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit {currentFeedbackType?.label}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BugReportModal;