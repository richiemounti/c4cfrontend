// app/dashboard/project/[id]/surveys/builder/[stakeholderGroupId]/[stageId]/page.tsx - Enhanced with Demographics
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Filter, 
  Check, 
  Star,
  Users,
  GitBranch,
  Tag,
  Clock,
  FileText,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  HelpCircle,
  Info,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Wand2,
  Shield,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  Globe2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { useSurveyBuilder } from '@/hooks/useSurvey';
import { useToast } from "@/hooks/use-toast";
import { getProject } from '@/lib/api/project';
import { createBespokeQuestion } from '@/lib/api/question';

interface PageParams {
  id: string;
  stakeholderGroupId: string;
  stageId: string;
}

interface Question {
  _id: string;
  text: string;
  description?: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'number' | 'email' | 'date' | 'rating' | 'dropdown' | 'scale' | 'matrix' | 'boolean';
  options?: Array<{value: string; label: string; _id: string}>; 
  theme?: {
    _id: string;
    name: string;
  };
  subThemes?: Array<{
    _id: string;
    name: string;
  }>;
  targetAudience: string;
  isFrequentlyAsked?: boolean;
  usageCount?: number;
  estimatedTime?: number;
  isBespoke?: boolean;
  isStandardDemographic?: boolean;
  demographicType?: 'age' | 'gender' | 'education' | 'income' | 'location' | 'employment' | 'household_size' | 'marital_status' | 'ethnicity' | 'language' | 'disability' | 'other';
  demographicCategory?: 'basic' | 'socioeconomic' | 'cultural' | 'accessibility';
  demographicMetadata?: {
    isRequired: boolean;
    recommendedForAudience: string[];
    complianceRelevant: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    anonymizationRequired: boolean;
  };
  scaleConfig?: {
    min: number;
    max: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
    scaleOptions?: Array<{ value: string | number; label: string }>;
  };
  matrixConfig?: {
    rows: Array<{ label: string; description?: string }>;
    columns: Array<{ value: string; label: string; description?: string }>;
    allowMultiple?: boolean;
  };
  bespokeMetadata?: {
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  };
}

interface BespokeQuestionForm {
  text: string;
  description: string;
  type: string;
  options: Array<{ label: string; value: string }>;
  targetAudience: string;
  category?: string;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'radio', label: 'Multiple Choice (Single)', description: 'Select one option' },
  { value: 'checkbox', label: 'Multiple Choice (Many)', description: 'Select multiple options' },
  { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown list' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'rating', label: 'Rating', description: 'Star or scale rating' },
];

const QuestionSelectionPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, stakeholderGroupId, stageId } = params;
  
  const { 
    filteredQuestions, 
    context, 
    loading, 
    error, 
    loadFilteredQuestions, 
    loadContext,
    demographicQuestions,
    loadDemographicQuestions
  } = useSurveyBuilder();
  
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [selectedDemographics, setSelectedDemographics] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [subThemeFilter, setSubThemeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [showFrequentOnly, setShowFrequentOnly] = useState(false);
  const [collapsedSubThemes, setCollapsedSubThemes] = useState<Set<string>>(new Set());
  const [expandedDemographics, setExpandedDemographics] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
  const [project, setProject] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  // Bespoke question state
  const [isCreatingBespoke, setIsCreatingBespoke] = useState(false);
  const [bespokeForm, setBespokeForm] = useState<BespokeQuestionForm>({
    text: '',
    description: '',
    type: 'text',
    options: [{ label: '', value: '' }],
    targetAudience: 'both',
    category: ''
  });
  const [bespokeValidationErrors, setBespokeValidationErrors] = useState<Record<string, string>>({});
  const [isSubmittingBespoke, setIsSubmittingBespoke] = useState(false);

  useEffect(() => {
    if (stakeholderGroupId && stageId) {
      loadContext(stakeholderGroupId, stageId);
      loadQuestions();
    }
  }, [stakeholderGroupId, stageId]);

  useEffect(() => {
    loadQuestions();
  }, [searchTerm, themeFilter, subThemeFilter, typeFilter, showFrequentOnly]);

  // NEW: Load demographic questions when context is available
  useEffect(() => {
    if (context?.stakeholderGroup) {
      const audience = context.stakeholderGroup.group || 'both';
      loadDemographicQuestions(audience as 'internal' | 'external' | 'both');
    }
  }, [context, loadDemographicQuestions]);

  const loadQuestions = async () => {
    const params = {
      stakeholderGroupId,
      stageId,
      searchTerm: searchTerm || undefined,
      themeIds: themeFilter !== 'all' ? [themeFilter] : undefined,
      subThemeIds: subThemeFilter !== 'all' ? [subThemeFilter] : undefined,
      questionType: typeFilter !== 'all' ? typeFilter : undefined,
      includeFrequentlyAsked: showFrequentOnly,
      page: 1,
      limit: 100
    };

    try {
      const projectResponse = await getProject(projectId);
      setProject(projectResponse.data);
      await loadFilteredQuestions(params);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    }
  };

  const handleQuestionToggle = (questionId: string, subThemeName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const key = `${questionId}::${subThemeName}`;
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // NEW: Handle demographic question toggle
  const handleDemographicToggle = (questionId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedDemographics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allSlots: string[] = [];
    Object.entries(groupedQuestions).forEach(([subThemeName, questions]) => {
      questions.forEach(q => allSlots.push(`${q._id}::${subThemeName}`));
    });
    const allSelected = allSlots.length > 0 && allSlots.every(k => selectedQuestions.has(k));
    if (allSelected) {
      setSelectedQuestions(prev => {
        const newSet = new Set(prev);
        allSlots.forEach(k => newSet.delete(k));
        return newSet;
      });
    } else {
      setSelectedQuestions(prev => new Set([...prev, ...allSlots]));
    }
  };

  // NEW: Handle select all demographics
  const handleSelectAllDemographics = () => {
    if (selectedDemographics.size === demographicQuestions.length) {
      setSelectedDemographics(new Set());
    } else {
      setSelectedDemographics(new Set(demographicQuestions.map((q: any) => q._id)));
    }
  };

  const handleContinueToSurveyCreation = () => {
    const totalSelected = selectedQuestions.size + selectedDemographics.size;
    
    if (totalSelected === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to continue',
        variant: 'destructive',
      });
      return;
    }

    // Serialize composite keys as plain questionIds (with duplicates) so the create page
    // can call addQuestionToSurvey once per slot, producing separate survey question documents.
    const plainQuestionIds = Array.from(selectedQuestions).map(k => k.split('::')[0]);
    sessionStorage.setItem('selectedQuestions', JSON.stringify(plainQuestionIds));
    sessionStorage.setItem('selectedDemographics', JSON.stringify(Array.from(selectedDemographics)));
    
    router.push(`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}/create`);
  };

  const toggleSubThemeExpansion = (name: string) => {
    setCollapsedSubThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  // Bespoke Question Functions (unchanged)
  const validateBespokeQuestion = (): boolean => {
    const errors: Record<string, string> = {};

    if (!bespokeForm.text.trim()) {
      errors.text = 'Question text is required';
    } else if (bespokeForm.text.length < 10) {
      errors.text = 'Question text must be at least 10 characters';
    } else if (bespokeForm.text.length > 500) {
      errors.text = 'Question text must be less than 500 characters';
    }

    const isDuplicate = filteredQuestions.some(q => 
      q.text.toLowerCase().trim() === bespokeForm.text.toLowerCase().trim()
    );
    if (isDuplicate) {
      errors.text = 'A question with this text already exists';
    }

    if (!bespokeForm.type) {
      errors.type = 'Question type is required';
    }

    const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(bespokeForm.type);
    if (requiresOptions) {
      const validOptions = bespokeForm.options.filter(opt => opt.label.trim());
      if (validOptions.length < 2) {
        errors.options = 'At least 2 options are required for this question type';
      }
      
      const optionLabels = validOptions.map(opt => opt.label.toLowerCase().trim());
      const uniqueLabels = new Set(optionLabels);
      if (optionLabels.length !== uniqueLabels.size) {
        errors.options = 'Option labels must be unique';
      }
    }

    setBespokeValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOption = () => {
    setBespokeForm(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setBespokeForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, label: string) => {
    setBespokeForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { 
        label, 
        value: label.toLowerCase().replace(/\s+/g, '_') 
      };
      return { ...prev, options: newOptions };
    });
  };

  const handleCreateBespokeQuestion = async () => {
    if (!validateBespokeQuestion()) {
      return;
    }

    setIsSubmittingBespoke(true);

    try {
      const questionData: any = {
        text: bespokeForm.text.trim(),
        description: bespokeForm.description.trim() || undefined,
        type: bespokeForm.type,
        targetAudience: bespokeForm.targetAudience,
        projectId: projectId,
        required: false
      };

      const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(bespokeForm.type);
      if (requiresOptions) {
        questionData.options = bespokeForm.options
          .filter(opt => opt.label.trim())
          .map(opt => ({
            label: opt.label.trim(),
            value: opt.value || opt.label.toLowerCase().replace(/\s+/g, '_')
          }));
      }

      const response = await createBespokeQuestion(questionData);

      toast({
        title: 'Question Created',
        description: 'Your custom question has been submitted for approval and added to your selection',
      });

      setSelectedQuestions(prev => new Set([...prev, `${response.data._id}::Uncategorized`]));

      setBespokeForm({
        text: '',
        description: '',
        type: 'text',
        options: [{ label: '', value: '' }],
        targetAudience: 'both',
        category: ''
      });
      setBespokeValidationErrors({});
      setIsCreatingBespoke(false);

      await loadQuestions();

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create custom question',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingBespoke(false);
    }
  };

  // NEW: Get demographic type icon
  const getDemographicIcon = (type?: string) => {
    switch (type) {
      case 'age': return <Calendar className="h-4 w-4" />;
      case 'gender': return <Users className="h-4 w-4" />;
      case 'education': return <GraduationCap className="h-4 w-4" />;
      case 'income': return <Briefcase className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'employment': return <Briefcase className="h-4 w-4" />;
      case 'disability': return <Heart className="h-4 w-4" />;
      case 'language': return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  // NEW: Get sensitivity badge color
  const getSensitivityColor = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-red-50 text-red-600 border-red-500/20';
      case 'medium': return 'bg-ochre-50 text-ochre-600 border-ochre-500/20';
      case 'low': return 'bg-grass-50 text-grass-600 border-grass-500/20';
      default: return 'bg-concrete-50 text-concrete-600 border-concrete-500/20';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'email': return <FileText className="h-4 w-4" />;
      case 'radio':
      case 'boolean':
      case 'checkbox':
      case 'matrix':
      case 'dropdown': return <Target className="h-4 w-4" />;
      case 'number':
      case 'rating':
      case 'scale': return <Star className="h-4 w-4" />;
      case 'date': return <Clock className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'email': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'radio':
      case 'boolean':
      case 'checkbox':
      case 'matrix':
      case 'dropdown': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      case 'number':
      case 'rating':
      case 'scale': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'date': return 'bg-forest-50 text-forest-500 border-forest-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getApprovalStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-grass-50 text-grass-600 border-grass-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const groupQuestionsBySubTheme = (questions: Question[]) => {
    const grouped: Record<string, Question[]> = {};

    questions.forEach(question => {
      const subThemes = question.subThemes;
      if (subThemes && subThemes.length > 0) {
        subThemes.forEach(st => {
          if (!grouped[st.name]) grouped[st.name] = [];
          grouped[st.name].push(question);
        });
      } else {
        if (!grouped['Uncategorized']) grouped['Uncategorized'] = [];
        grouped['Uncategorized'].push(question);
      }
    });

    return grouped;
  };

  const filteredQuestionsToShow = filteredQuestions
    .filter(q => !q.isStandardDemographic)
    .filter(q => audienceFilter === 'all' || q.targetAudience === audienceFilter || q.targetAudience === 'both')
    .filter(q => viewMode === 'all' || Array.from(selectedQuestions).some(k => k.startsWith(`${q._id}::`)));

  const groupedQuestions = groupQuestionsBySubTheme(filteredQuestionsToShow);

  const totalEstimatedTime =
    Array.from(selectedQuestions).reduce((total, key) => {
      const questionId = key.split('::')[0];
      const question = filteredQuestions.find(q => q._id === questionId);
      return total + (question?.estimatedTime || 1);
    }, 0) +
    Array.from(selectedDemographics).reduce((total, questionId) => {
      const question = demographicQuestions.find((q: any) => q._id === questionId);
      return total + (question?.estimatedTime || 1);
    }, 0);

  const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(bespokeForm.type);

  if (loading && !demographicQuestions.length && !filteredQuestions.length) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grass-500 mx-auto mb-4"></div>
            <p className="text-stratosphere-900 font-medium">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Error Loading Questions</h2>
            <p className="text-sky-500 mb-4">{error}</p>
            <Button 
              onClick={loadQuestions}
              className="bg-grass-500 hover:bg-grass-600 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
          <Link 
            href={`/dashboard/project/${projectId}/surveys/builder`}
            className="flex items-center text-grass-500 hover:text-stratosphere-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Builder
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-stratosphere-900">Select Questions</h1>
                <Badge className="bg-grass-500 text-white border-0">
                  Step 1 of 2
                </Badge>
              </div>
              <p className="text-sm text-sky-500 mt-1">
                Choose questions relevant to {context?.stakeholderGroup?.name || 'stakeholder group'} in {context?.stage?.name || 'this stage'}
              </p>
              {context && (
                <div className="flex items-center gap-4 mt-2 text-sm text-sky-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {context.stakeholderGroup?.name || 'Stakeholder Group'}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    Stage {context.stage?.stageNumber || 'N/A'}: {context.stage?.name || 'Stage'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Sheet open={isCreatingBespoke} onOpenChange={setIsCreatingBespoke}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-grass-500/30 text-grass-500 hover:bg-grass-50"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Custom Question
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-grass-500" />
                      Create Custom Question
                    </SheetTitle>
                    <SheetDescription>
                      Create a bespoke question specific to your project needs. It will be submitted for approval before use.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 py-6">
                    {/* Question Text */}
                    <div className="space-y-2">
                      <Label htmlFor="question-text">
                        Question Text <span className="text-grass-500">*</span>
                      </Label>
                      <Textarea
                        id="question-text"
                        placeholder="What would you like to ask?"
                        value={bespokeForm.text}
                        onChange={(e) => setBespokeForm(prev => ({ ...prev, text: e.target.value }))}
                        className={`min-h-[100px] ${bespokeValidationErrors.text ? 'border-grass-500' : ''}`}
                      />
                      {bespokeValidationErrors.text && (
                        <p className="text-sm text-grass-500">{bespokeValidationErrors.text}</p>
                      )}
                      <p className="text-xs text-sky-500">
                        {bespokeForm.text.length}/500 characters (minimum 10)
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="question-description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="question-description"
                        placeholder="Provide additional context or instructions..."
                        value={bespokeForm.description}
                        onChange={(e) => setBespokeForm(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-sky-500">
                        Help respondents understand what you're asking
                      </p>
                    </div>

                    {/* Question Type */}
                    <div className="space-y-2">
                      <Label htmlFor="question-type">
                        Question Type <span className="text-grass-500">*</span>
                      </Label>
                      <Select 
                        value={bespokeForm.type} 
                        onValueChange={(value) => setBespokeForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className={bespokeValidationErrors.type ? 'border-grass-500' : ''}>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-xs text-sky-500">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {bespokeValidationErrors.type && (
                        <p className="text-sm text-grass-500">{bespokeValidationErrors.type}</p>
                      )}
                    </div>

                    {/* Options for choice-based questions */}
                    {requiresOptions && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>
                            Answer Options <span className="text-grass-500">*</span>
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddOption}
                            className="border-grass-500/30 text-grass-500 hover:bg-grass-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {bespokeForm.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option.label}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1"
                              />
                              {bespokeForm.options.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-grass-500 hover:text-grass-600 hover:bg-grass-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {bespokeValidationErrors.options && (
                          <p className="text-sm text-grass-500">{bespokeValidationErrors.options}</p>
                        )}
                        <p className="text-xs text-sky-500">
                          Minimum 2 options required
                        </p>
                      </div>
                    )}

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <Label htmlFor="target-audience">Target Audience</Label>
                      <Select 
                        value={bespokeForm.targetAudience}
                        onValueChange={(value) => setBespokeForm(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal Stakeholders</SelectItem>
                          <SelectItem value="external">External Communities</SelectItem>
                          <SelectItem value="both">Both Internal & External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Info Alert */}
                    <Alert className="border-sky-500/30 bg-sky-50">
                      <Info className="h-4 w-4 text-sky-500" />
                      <AlertDescription className="text-sm text-sky-500">
                        Your custom question will be submitted for approval by project managers. 
                        Once approved, it will be available for use across all surveys in this project.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreatingBespoke(false);
                        setBespokeForm({
                          text: '',
                          description: '',
                          type: 'text',
                          options: [{ label: '', value: '' }],
                          targetAudience: 'both',
                          category: ''
                        });
                        setBespokeValidationErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBespokeQuestion}
                      disabled={isSubmittingBespoke}
                      className="bg-grass-500 hover:bg-grass-600 text-white"
                    >
                      {isSubmittingBespoke ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Question
                        </>
                      )}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <div className="text-sm text-sky-500">
                {selectedQuestions.size + selectedDemographics.size} questions selected
                {totalEstimatedTime > 0 && (
                  <span className="ml-2">• ~{totalEstimatedTime} min</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Introduction Section */}
          <Collapsible open={showIntro} onOpenChange={setShowIntro} className="mb-8">
            <Card className="border-sky-500/30 bg-gradient-to-br from-sky-50 to-grass-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-500 rounded-lg p-2">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-stratosphere-900">
                        How Question Selection Works
                      </CardTitle>
                      <CardDescription className="text-sky-500">
                        Understanding the smart filtering process
                      </CardDescription>
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {showIntro ? (
                        <ChevronUp className="h-4 w-4 text-sky-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-sky-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-concrete-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-grass-500" />
                        <h4 className="font-semibold text-stratosphere-900">Pre-Filtered</h4>
                      </div>
                      <p className="text-sm text-sky-500">
                        Questions are pre-filtered for your context. Simply select the ones you need - details come next.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-concrete-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-sky-500" />
                        <h4 className="font-semibold text-stratosphere-900">Demographics First</h4>
                      </div>
                      <p className="text-sm text-sky-500">
                        Standard demographic questions are suggested and will appear first in your survey for compliance
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-concrete-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Wand2 className="h-4 w-4 text-grass-500" />
                        <h4 className="font-semibold text-stratosphere-900">Customizable</h4>
                      </div>
                      <p className="text-sm text-sky-500">
                        Can't find what you need? Create custom bespoke questions specific to your project
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-concrete-500/20" />

                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-sky-500">
                      <p className="text-sm text-sky-500">
                        <strong className="text-stratosphere-900">Selection Tips:</strong>
                      </p>
                      <ul className="space-y-1 ml-4 list-disc">
                        <li>Demographics are optional but recommended for compliance and analysis</li>
                        <li>Location demographics will be customized with your project sites</li>
                        <li>Focus on choosing questions that align with your survey objectives</li>
                        <li>Consider the estimated completion time (aim for 10-15 minutes total)</li>
                        <li>Custom questions require approval before general use</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* NEW: Standard Demographics Section */}
          {demographicQuestions.length > 0 && (
            <div className="mb-8">
              <Card className="border-sky-500/30 bg-white shadow-sm">
                <Collapsible
                  open={expandedDemographics}
                  onOpenChange={setExpandedDemographics}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-stratosphere-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-sky-500 rounded-lg p-2">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-stratosphere-900 flex items-center gap-2">
                            Standard Demographics
                            <Badge variant="outline" className="text-xs border-sky-500/30 text-sky-500">
                              Recommended
                            </Badge>
                          </h3>
                          <p className="text-sm text-sky-500">
                            {selectedDemographics.size} of {demographicQuestions.length} selected • These questions will appear first in your survey
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAllDemographics();
                          }}
                          className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                        >
                          {selectedDemographics.size === demographicQuestions.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        {expandedDemographics ? (
                          <ChevronUp className="h-5 w-5 text-sky-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-sky-500" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <Alert className="mb-4 border-sky-500/30 bg-sky-50">
                        <Info className="h-4 w-4 text-sky-500" />
                        <AlertDescription className="text-sm text-sky-500">
                          <strong className="text-stratosphere-900">About Demographics:</strong> These questions help ensure GDPR compliance and provide valuable context for your survey data. 
                          {demographicQuestions.some((q: any) => q.demographicType === 'location') && (
                            <span className="block mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Location questions will be automatically populated with your project sites.
                            </span>
                          )}
                          {demographicQuestions.some((q: any) => q.demographicType === 'ethnicity') && (
                            <span className="block mt-1">
                              <Globe2 className="h-3 w-3 inline mr-1" />
                              Ethnicity questions will be automatically populated with the ethnic groups you added in the project site setup.
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {demographicQuestions.map((question: any) => (
                          <Card 
                            key={question._id}
                            className={`border transition-all cursor-pointer hover:shadow-md ${
                              selectedDemographics.has(question._id)
                                ? 'border-sky-500 bg-sky-50/30 shadow-sm'
                                : 'border-concrete-500/20 hover:border-sky-500/50 hover:bg-stratosphere-50/30'
                            }`}
                            onClick={() => handleDemographicToggle(question._id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div onClick={(e) => handleDemographicToggle(question._id, e)}>
                                  <Checkbox
                                    checked={selectedDemographics.has(question._id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedDemographics(prev => new Set([...prev, question._id]));
                                      } else {
                                        setSelectedDemographics(prev => {
                                          const newSet = new Set(prev);
                                          newSet.delete(question._id);
                                          return newSet;
                                        });
                                      }
                                    }}
                                    className="border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 mt-1"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-stratosphere-900 leading-relaxed">
                                      {question.text}
                                    </h4>
                                    <div className="flex items-center gap-2 ml-4">
                                      <Badge className="bg-sky-50 text-sky-600 border-sky-500/20">
                                        {getDemographicIcon(question.demographicType)}
                                        <span className="ml-1 capitalize">{question.demographicType?.replace('_', ' ')}</span>
                                      </Badge>
                                      {question.demographicMetadata?.complianceRelevant && (
                                        <Badge variant="outline" className="text-xs border-grass-500/30 text-grass-500 bg-grass-50">
                                          <Shield className="h-3 w-3 mr-1" />
                                          GDPR
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {question.description && (
                                    <p className="text-sm text-sky-500 mb-3">{question.description}</p>
                                  )}

                                  {/* AUTO-POPULATION INDICATORS */}
                                  {(question.demographicType === 'location' || question.demographicType === 'ethnicity') && (
                                    <div className="mb-3 p-2.5 bg-grass-50 rounded-md border border-grass-500/20">
                                      <div className="flex items-start gap-2">
                                        <Sparkles className="h-4 w-4 text-grass-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-grass-600">
                                            {question.demographicType === 'location' && 'Auto-populated with project sites'}
                                            {question.demographicType === 'ethnicity' && 'Auto-populated with ethnic groups'}
                                          </p>
                                          <p className="text-xs text-grass-500 mt-0.5">
                                            {question.demographicType === 'location' && 'Options will be automatically generated from your project and site locations'}
                                            {question.demographicType === 'ethnicity' && 'Options will be automatically generated from ethnic groups defined in your project site setup'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-xs text-sky-500">
                                    <div className="flex items-center gap-1">
                                      {getQuestionTypeIcon(question.type)}
                                      <Badge className={`text-xs ${getQuestionTypeColor(question.type)}`}>
                                        {question.type}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      <Badge className={`text-xs ${getSensitivityColor(question.demographicMetadata?.sensitivityLevel)}`}>
                                        {question.demographicMetadata?.sensitivityLevel || 'medium'} sensitivity
                                      </Badge>
                                    </div>
                                    
                                    {question.demographicType === 'location' && (
                                      <div className="flex items-center gap-1 text-grass-500">
                                        <MapPin className="h-3 w-3" />
                                        Will use project sites
                                      </div>
                                    )}
                                    {question.demographicType === 'ethnicity' && (
                                      <div className="flex items-center gap-1 text-grass-500">
                                        <Globe2 className="h-3 w-3" />
                                        Will use ethnic groups added to sites
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      ~{question.estimatedTime || 1} min
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-concrete-500/20 p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-concrete-500/30 focus:border-grass-500 focus:ring-grass-500/20"
                />
              </div>
              
              <Select value={themeFilter} onValueChange={setThemeFilter}>
                <SelectTrigger className="border-concrete-500/30 focus:border-grass-500">
                  <SelectValue placeholder="Filter by theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {context?.availableThemesWithSubThemes?.map((item: any) => {
                    const themeId = item.theme?._id || item._id;
                    const themeName = item.theme?.name || item.name;
                    
                    return (
                      <SelectItem key={themeId} value={themeId}>
                        {themeName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-concrete-500/30 focus:border-grass-500">
                  <SelectValue placeholder="Question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="border-concrete-500/30 focus:border-grass-500">
                  <SelectValue placeholder="Target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={showFrequentOnly}
                    onCheckedChange={(checked) => setShowFrequentOnly(checked === true)}
                    className="border-grass-500 data-[state=checked]:bg-grass-500"
                  />
                  <Star className="h-4 w-4 text-ochre-500" />
                  Frequently asked questions only
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('all')}
                  className={viewMode === 'all' ? 'bg-grass-500 hover:bg-grass-600 text-white' : 'border-grass-500/30 text-grass-500 hover:bg-grass-50'}
                >
                  All Questions ({filteredQuestions.length})
                </Button>
                <Button
                  variant={viewMode === 'selected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('selected')}
                  className={viewMode === 'selected' ? 'bg-grass-500 hover:bg-grass-600 text-white' : 'border-grass-500/30 text-grass-500 hover:bg-grass-50'}
                >
                  Selected ({selectedQuestions.size})
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-grass-500/30 text-grass-500 hover:bg-grass-50"
              >
                {(() => {
                  const allSlots = Object.entries(groupedQuestions).flatMap(([st, qs]) => qs.map(q => `${q._id}::${st}`));
                  return allSlots.length > 0 && allSlots.every(k => selectedQuestions.has(k)) ? 'Deselect All' : 'Select All';
                })()}
              </Button>
              
              {(selectedQuestions.size > 0 || selectedDemographics.size > 0) && (
                <Alert className="border-grass-500/50 bg-grass-50 py-2 px-4">
                  <AlertDescription className="text-grass-500 text-sm">
                    {selectedDemographics.size} demographics + {selectedQuestions.size} questions selected • Estimated time: ~{totalEstimatedTime} minutes
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button
              onClick={handleContinueToSurveyCreation}
              disabled={selectedQuestions.size + selectedDemographics.size === 0}
              className="bg-grass-500 hover:bg-grass-600 text-white disabled:opacity-50 disabled:hover:bg-grass-500"
            >
              Continue to Survey Creation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Questions Display */}
          {filteredQuestionsToShow.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stratosphere-900 mb-2">
                {viewMode === 'selected' ? 'No Questions Selected' : 'No Questions Found'}
              </h3>
              <p className="text-sky-500 mb-4">
                {viewMode === 'selected' 
                  ? 'Select some questions from the "All Questions" view to see them here'
                  : 'Try adjusting your filters or create a custom question'
                }
              </p>
              <div className="flex gap-3 justify-center">
                {viewMode === 'selected' ? (
                  <Button 
                    onClick={() => setViewMode('all')}
                    className="bg-grass-500 hover:bg-grass-600 text-white"
                  >
                    View All Questions
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setThemeFilter('all');
                        setTypeFilter('all');
                        setShowFrequentOnly(false);
                      }}
                      variant="outline"
                      className="border-grass-500/30 text-grass-500 hover:bg-grass-50"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => setIsCreatingBespoke(true)}
                      className="bg-grass-500 hover:bg-grass-600 text-white"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Create Custom Question
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedQuestions).map(([subThemeName, questions]) => (
                <div key={subThemeName} className="bg-white rounded-lg border border-concrete-500/20 shadow-sm">
                  <Collapsible
                    open={!collapsedSubThemes.has(subThemeName)}
                    onOpenChange={() => toggleSubThemeExpansion(subThemeName)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-stratosphere-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-grass-500" />
                          <h3 className="text-lg font-semibold text-stratosphere-900">{subThemeName}</h3>
                          <Badge variant="outline" className="text-xs border-concrete-500/30 text-sky-500">
                            {questions.length} questions
                          </Badge>
                        </div>
                        {!collapsedSubThemes.has(subThemeName) ? (
                          <ChevronUp className="h-5 w-5 text-grass-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-grass-500" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-6 pb-6 space-y-4">
                        {questions.map((question) => {
                          const slotKey = `${question._id}::${subThemeName}`;
                          const isSlotSelected = selectedQuestions.has(slotKey);
                          return (
                          <Card
                            key={slotKey}
                            className={`border transition-all cursor-pointer hover:shadow-md ${
                              isSlotSelected
                                ? 'border-grass-500 bg-grass-50/30 shadow-sm'
                                : 'border-concrete-500/20 hover:border-grass-500/50 hover:bg-stratosphere-50/30'
                            }`}
                            onClick={() => handleQuestionToggle(question._id, subThemeName)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div onClick={(e) => handleQuestionToggle(question._id, subThemeName, e)}>
                                  <Checkbox
                                    checked={isSlotSelected}
                                    onCheckedChange={(checked) => {
                                      const key = `${question._id}::${subThemeName}`;
                                      setSelectedQuestions(prev => {
                                        const newSet = new Set(prev);
                                        if (checked) {
                                          newSet.add(key);
                                        } else {
                                          newSet.delete(key);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="border-grass-500 data-[state=checked]:bg-grass-500 data-[state=checked]:border-grass-500 mt-1"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-stratosphere-900 leading-relaxed">
                                      {question.text}
                                    </h4>
                                    <div className="flex items-center gap-2 ml-4">
                                      {question.isBespoke && (
                                        <Badge className="bg-purple-50 text-purple-600 border-purple-500/20">
                                          <Wand2 className="h-3 w-3 mr-1" />
                                          Bespoke
                                        </Badge>
                                      )}
                                      {question.isFrequentlyAsked && (
                                        <div title="Frequently asked">
                                          <Star className="h-4 w-4 text-ochre-500 fill-ochre-500" />
                                        </div>
                                      )}
                                      {question.usageCount && question.usageCount > 10 && (
                                        <Badge variant="outline" className="text-xs border-grass-500/30 text-grass-500 bg-grass-50">
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {question.description && (
                                    <p className="text-sm text-sky-500 mb-3">{question.description}</p>
                                  )}
                                  
                                  {/* Bespoke Question Metadata */}
                                  {question.isBespoke && question.bespokeMetadata && (
                                    <div className="mb-3 p-3 bg-purple-50/50 rounded-md border border-purple-500/10">
                                      <div className="flex items-center gap-4 text-xs text-purple-600">
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          Created by {question.bespokeMetadata.createdBy.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(question.bespokeMetadata.createdAt).toLocaleDateString()}
                                        </div>
                                        {getApprovalStatusBadge(question.bespokeMetadata.status)}
                                      </div>
                                    </div>
                                  )}

                                  {/* Options preview for choice-based questions */}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                      {question.options.slice(0, 5).map((opt) => (
                                        <span
                                          key={opt._id || opt.value}
                                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-concrete-50 text-concrete-700 border border-concrete-500/20"
                                        >
                                          {question.type === 'radio' || question.type === 'boolean' ? (
                                            <span className="w-2.5 h-2.5 rounded-full border border-concrete-400 flex-shrink-0" />
                                          ) : question.type === 'checkbox' ? (
                                            <span className="w-2.5 h-2.5 rounded border border-concrete-400 flex-shrink-0" />
                                          ) : null}
                                          {opt.label}
                                        </span>
                                      ))}
                                      {question.options.length > 5 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-sky-500 bg-sky-50 border border-sky-500/20">
                                          +{question.options.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-sky-500">
                                    <div className="flex items-center gap-1">
                                      {getQuestionTypeIcon(question.type)}
                                      <Badge className={`text-xs ${getQuestionTypeColor(question.type)}`}>
                                        {question.type.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    
                                    {question.subThemes && question.subThemes.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <Tag className="h-3 w-3 flex-shrink-0" />
                                        {question.subThemes.map(st => st.name).join(', ')}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      ~{question.estimatedTime || 1} min
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {question.targetAudience}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}

          {/* Continue Button Fixed at Bottom */}
          {(selectedQuestions.size > 0 || selectedDemographics.size > 0) && (
            <div className="fixed bottom-8 right-8 z-50">
              <Button
                onClick={handleContinueToSurveyCreation}
                className="bg-grass-500 hover:from-grass-600 hover:to-grass-600 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Survey ({selectedQuestions.size + selectedDemographics.size} questions)
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionPage;