// components/survey/QuestionCard.tsx - UPDATED with ethnicity support and all demographic options
'use client';

import { useState, useEffect } from 'react';
import { 
  GripVertical,
  MoreVertical,
  Copy,
  Trash2,
  Zap,
  Move,
  Type,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionPreview } from './QuestionPreview';
import { SectionSelectorModal } from './SectionSelectorModal';
import { updateSurveyQuestion, duplicateSurveyQuestion, removeQuestionFromSurvey } from '@/lib/api/surveyQuestion';
import { getProjectSites } from '@/lib/api/project';
import { getProjectSiteSetup } from "@/lib/api/projectSiteSetup";
import { useToast } from "@/hooks/use-toast";

// Question type icons mapping
const questionTypeIcons = {
  'text': Type,
  'textarea': Type,
  'select': Type,
  'multiselect': Type,
  'radio': Type,
  'checkbox': Type,
  'number': Type,
  'date': Type,
  'rating': Type,
  'boolean': Type,
  'dropdown': Type,
  'scale': Type,
  'matrix': Type,
  'location': MapPin,
};

// Helper function to get question type label
const getQuestionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'text': 'Short Answer',
    'textarea': 'Long Answer',
    'select': 'Dropdown',
    'dropdown': 'Dropdown',
    'multiselect': 'Multiple Choice',
    'radio': 'Single Choice',
    'checkbox': 'Checkboxes',
    'number': 'Number',
    'date': 'Date',
    'rating': 'Rating Scale',
    'scale': 'Rating Scale',
    'boolean': 'Yes/No',
    'matrix': 'Matrix/Grid',
    'location': 'Location'
  };
  return labels[type] || type;
};

// Helper to check if question type supports options
const hasOptions = (type: string) => {
  return ['radio', 'checkbox', 'dropdown', 'select', 'multiselect', 'scale', 'matrix'].includes(type);
};

interface Section {
  _id: string;
  title: string;
  description?: string;
  questions?: any[];
}

interface QuestionCardProps {
  question: any;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onToggleRequired: (required: boolean) => void;
  onOpenConditionalLogic: () => void;
  previewMode: boolean;
  index: number;
  isOrphaned?: boolean;
  surveyId: string;
  availableSections?: Section[];
  onMoveToSection?: (questionId: string, sectionId: string | null) => Promise<void>;
  projectId?: string;
  onRefresh?: () => void;
  onDropOnQuestion?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

export const QuestionCard = ({ 
  question, 
  isSelected, 
  onSelect, 
  onDelete,
  onUpdateText,
  onToggleRequired,
  onOpenConditionalLogic,
  previewMode,
  index,
  isOrphaned = false,
  surveyId,
  availableSections = [],
  onMoveToSection,
  projectId,
  onRefresh,
  onDropOnQuestion,
}: QuestionCardProps) => {
  const { toast } = useToast();
  const questionType = question.question?.type || 'text';
  const questionText = question.customText || question.question?.text || '';
  const Icon = questionTypeIcons[questionType as keyof typeof questionTypeIcons] || Type;
  
  const [localText, setLocalText] = useState(questionText);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [projectSites, setProjectSites] = useState<any[]>([]);
  const [ethnicGroups, setEthnicGroups] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Check if this is a location or ethnicity demographic
  const isLocationDemographic = question.question?.isStandardDemographic && 
                                question.question?.demographicType === 'location';
  
  const isEthnicityDemographic = question.question?.isStandardDemographic && 
                                 question.question?.demographicType === 'ethnicity';

  const isDemographicWithOptions = question.question?.isStandardDemographic && 
                                    hasOptions(questionType);

  // Fetch project sites and ethnic groups
  useEffect(() => {
    const fetchDemographicData = async () => {
      if ((isLocationDemographic || isEthnicityDemographic) && showOptions && projectId) {
        setLoadingData(true);
        try {
          // Fetch project sites
          const sitesResponse = await getProjectSites(projectId, 1, 100);
          const sites = sitesResponse.data || [];
          setProjectSites(sites);

          // If ethnicity demographic, fetch ethnic groups from all sites
          if (isEthnicityDemographic && sites.length > 0) {
            const allEthnicGroups = new Set<string>();
            
            // Fetch setup data for each site
            await Promise.all(
              sites.map(async (site: any) => {
                try {
                  const setupData = await getProjectSiteSetup(site._id);
                  
                  // Find task 11 (index 11, sortOrder 12) - ethnic_groups_present
                  const ethnicTask = setupData.tasks?.find(
                    (task: any) => task.fieldName === 'ethnic_groups_present'
                  );
                  
                  // Add ethnic groups from this site
                  if (ethnicTask?.responseData && Array.isArray(ethnicTask.responseData)) {
                    ethnicTask.responseData.forEach((group: string) => {
                      if (group && group.trim()) {
                        allEthnicGroups.add(group.trim());
                      }
                    });
                  }
                } catch (error) {
                  console.error(`Failed to fetch setup for site ${site._id}:`, error);
                }
              })
            );
            
            // Convert Set to sorted array
            setEthnicGroups(Array.from(allEthnicGroups).sort());
          }
        } catch (error) {
          console.error('Failed to fetch demographic data:', error);
          toast({
            title: 'Warning',
            description: 'Could not load demographic data',
            variant: 'default',
          });
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchDemographicData();
  }, [isLocationDemographic, isEthnicityDemographic, showOptions, projectId]);

  // Get display options based on question type and demographic type
  const getDisplayOptions = () => {
    // Handle location demographics
    if (isLocationDemographic) {
      if (projectSites.length > 0) {
        return projectSites.map(site => ({
          value: site._id,
          label: site.name
        }));
      }
      return [{ value: 'text', label: 'Free text entry (no project sites available)' }];
    }
    
    // Handle ethnicity demographics
    if (isEthnicityDemographic) {
      if (ethnicGroups.length > 0) {
        return ethnicGroups.map(group => ({
          value: group.toLowerCase().replace(/\s+/g, '_'),
          label: group
        }));
      }
      return [{ value: 'text', label: 'Free text entry (no ethnic groups configured)' }];
    }

    // Handle scale questions
    if (questionType === 'scale') {
      const sc = question.question?.scaleConfig;
      // scaleConfig.scaleOptions (legacy format)
      if (sc?.scaleOptions && Array.isArray(sc.scaleOptions) && sc.scaleOptions.length > 0) {
        return sc.scaleOptions.map((opt: any) => ({
          value: String(opt.value ?? opt),
          label: String(opt.label ?? opt.value ?? opt)
        }));
      }
      // question.options (current format — per-point labels stored on the question)
      const qOpts = question.question?.options;
      if (Array.isArray(qOpts) && qOpts.length > 0) {
        return qOpts.map((opt: any) => ({
          value: String(opt.value ?? opt),
          label: String(opt.label ?? opt.value ?? opt)
        }));
      }
      // Fall back to generating numeric points from scaleConfig bounds
      if (sc) {
        const points: { value: string; label: string }[] = [];
        const step = sc.step ?? 1;
        for (let i = sc.min; i <= sc.max; i += step) {
          points.push({ value: String(i), label: String(i) });
        }
        return points;
      }
      return [];
    }

    // Handle matrix questions
    if (questionType === 'matrix') {
      const mc = question.question?.matrixConfig;
      return mc?.columns || [];
    }

    // Handle other demographics with options (age, gender, education, etc.)
    if (question.question?.isStandardDemographic && question.question?.options?.length > 0) {
      return question.question.options;
    }

    // Handle custom options or regular question options
    // customOptions is always [] from Mongoose when unset, so check length before trusting it
    if (question.customOptions?.length > 0) return question.customOptions;
    return question.question?.options || [];
  };

  const displayOptions = getDisplayOptions();

  const getOptionsToggleLabel = () => {
    if (questionType === 'scale') {
      const sc = question.question?.scaleConfig;
      if (sc) return `Scale ${sc.min}–${sc.max}`;
      return 'Scale';
    }
    if (questionType === 'matrix') {
      const mc = question.question?.matrixConfig;
      if (mc) return `${mc.rows?.length || 0} rows × ${mc.columns?.length || 0} columns`;
      return 'Matrix grid';
    }
    return `${displayOptions.length} option${displayOptions.length !== 1 ? 's' : ''}`;
  };

  const shouldShowOptionsToggle = hasOptions(questionType) ||
                                   isLocationDemographic || 
                                   isEthnicityDemographic ||
                                   isDemographicWithOptions;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'question',
      questionId: question._id
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOverPosition(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after');
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPosition(null);
    }
  };

  const handleCardDrop = (e: React.DragEvent) => {
    setDragOverPosition(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type !== 'question' || data.questionId === question._id) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
      onDropOnQuestion?.(data.questionId, question._id, position);
    } catch {
      // ignore malformed drag data
    }
  };

  const handleUpdateText = async (newText: string) => {
    if (newText === questionText) return;
    
    setIsUpdating(true);
    try {
      await updateSurveyQuestion(surveyId, question._id, { customText: newText });
      onUpdateText(newText);
      toast({
        title: 'Question updated',
        description: 'Question text has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to update question text:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question text',
        variant: 'destructive',
      });
      setLocalText(questionText);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRequired = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newRequired = !question.required;
      await updateSurveyQuestion(surveyId, question._id, { required: newRequired });
      onToggleRequired(newRequired);
      toast({
        title: newRequired ? 'Question set as required' : 'Question set as optional',
        description: 'Question requirement has been updated',
      });
    } catch (error) {
      console.error('Failed to toggle question required:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question requirement',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateSurveyQuestion(surveyId, question._id, {
        customText: `${questionText} (Copy)`
      });
      toast({
        title: 'Question duplicated',
        description: 'Question has been duplicated successfully',
      });
      onRefresh?.();
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate question',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await removeQuestionFromSurvey(surveyId, question._id);
      onDelete();
      toast({
        title: 'Question deleted',
        description: 'Question has been removed from your survey',
      });
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const handleMoveToSection = async (sectionId: string | null) => {
    try {
      if (onMoveToSection) {
        await onMoveToSection(question._id, sectionId);
      } else {
        toast({
          title: 'Feature unavailable',
          description: 'Move functionality is not available in this context',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to move question:', error);
      toast({
        title: 'Error',
        description: 'Failed to move question',
        variant: 'destructive',
      });
    }
  };

  const getCurrentSectionId = () => {
    if (question.section) {
      return typeof question.section === 'string' ? question.section : question.section._id;
    }
    return null;
  };

  if (previewMode) {
    return (
      <Card className="border border-concrete-500/20 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-sky-50 rounded-full text-sm font-medium text-sky-500">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-stratosphere-900 text-lg">{questionText}</h4>
                {question.customDescription && (
                  <p className="text-sky-500 mt-2">{question.customDescription}</p>
                )}
              </div>
              {question.required && (
                <span className="text-red-500 text-lg font-bold">*</span>
              )}
            </div>
            
            <div className="ml-12">
              <QuestionPreview
                type={questionType}
                options={displayOptions}
                scaleConfig={question.question?.scaleConfig}
                matrixConfig={question.question?.matrixConfig}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div
        className="relative"
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        onDrop={handleCardDrop}
      >
        {dragOverPosition === 'before' && (
          <div className="absolute -top-px left-0 right-0 z-10 flex items-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
            <div className="flex-1 h-0.5 bg-sky-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
          </div>
        )}
        {dragOverPosition === 'after' && (
          <div className="absolute -bottom-px left-0 right-0 z-10 flex items-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
            <div className="flex-1 h-0.5 bg-sky-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
          </div>
        )}
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isDragging
            ? 'opacity-50 scale-[0.98] shadow-2xl border-2 border-sky-400 rotate-1'
            : isSelected
            ? 'border-2 border-sky-500 shadow-xl bg-gradient-to-br from-sky-50 to-white'
            : isOrphaned
            ? 'border border-ochre-500/30 hover:border-ochre-500/60 bg-gradient-to-br from-white to-ochre-50/20'
            : 'border border-concrete-500/20 hover:border-sky-500/40 bg-white'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            <div
              className="p-2 bg-stratosphere-50 rounded-lg cursor-grab hover:bg-stratosphere-100 transition-colors active:cursor-grabbing"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="h-5 w-5 text-concrete-500 hover:text-stratosphere-900" />
            </div>

            {/* Question Type Icon */}
            <div className="p-2 bg-gradient-to-br from-sky-50 to-stratosphere-50 rounded-lg">
              <Icon className="h-5 w-5 text-sky-500" />
            </div>

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Question Text */}
                  <Input
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onBlur={(e) => handleUpdateText(e.target.value)}
                    className="font-semibold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent text-stratosphere-900 text-lg"
                    placeholder="Question text"
                    disabled={isUpdating}
                  />
                  
                  {/* Question Description */}
                  {question.customDescription && (
                    <Input
                      value={question.customDescription}
                      className="text-sky-500 border-none shadow-none px-0 focus-visible:ring-0 mt-2 bg-transparent"
                      placeholder="Question description"
                    />
                  )}
                  
                  {/* Question Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge className="bg-sky-50 text-sky-600 border-sky-500/20 text-xs">
                      {getQuestionTypeLabel(questionType)}
                    </Badge>
                    
                    {question.conditionalLogic?.enabled && (
                      <Badge className="bg-gradient-to-r from-coral-50 to-coral-100 text-coral-600 border-coral-500/20 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Conditional
                      </Badge>
                    )}
                    
                    {question.required && (
                      <Badge className="bg-red-50 text-red-600 border-red-500/20 text-xs">
                        Required
                      </Badge>
                    )}
                    
                    {isOrphaned && (
                      <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20 text-xs">
                        No Section
                      </Badge>
                    )}
                    
                    {isLocationDemographic && (
                      <Badge className="bg-grass-50 text-grass-600 border-grass-500/20 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location Demographic
                      </Badge>
                    )}
                    
                    {isEthnicityDemographic && (
                      <Badge className="bg-clay-50 text-clay-600 border-clay-500/20 text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Ethnicity Demographic
                      </Badge>
                    )}
                    
                    {question.question?.isStandardDemographic && !isLocationDemographic && !isEthnicityDemographic && (
                      <Badge className="bg-clay-50 text-clay-600 border-clay-500/20 text-xs">
                        Standard Demographic
                      </Badge>
                    )}
                  </div>

                  {/* Response Options Display */}
                  {shouldShowOptionsToggle && (
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptions(!showOptions);
                        }}
                        className="text-xs text-sky-500 hover:text-sky-600 hover:bg-sky-50 p-0 h-auto"
                      >
                        {showOptions ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide response options ({getOptionsToggleLabel()})
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View response options ({getOptionsToggleLabel()})
                          </>
                        )}
                      </Button>

                      {showOptions && (
                        <div className="mt-3 p-4 bg-stratosphere-50 rounded-lg border border-stratosphere-200">
                          {/* Header based on demographic type */}
                          {(isLocationDemographic || isEthnicityDemographic) && (
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stratosphere-200">
                              {isLocationDemographic ? (
                                <>
                                  <MapPin className="h-4 w-4 text-grass-500" />
                                  <p className="text-xs font-medium text-stratosphere-900">
                                    {loadingData ? 'Loading project sites...' : 
                                     projectSites.length > 0 ? 'Project Sites (Auto-populated)' : 
                                     'No project sites available - will use text field'}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Users className="h-4 w-4 text-clay-500" />
                                  <p className="text-xs font-medium text-stratosphere-900">
                                    {loadingData ? 'Loading ethnic groups...' : 
                                     ethnicGroups.length > 0 ? 'Ethnic Groups (Auto-populated from all sites)' : 
                                     'No ethnic groups configured - will use text field'}
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                          
                          {loadingData ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-sky-500 border-t-transparent"></div>
                            </div>
                          ) : questionType === 'scale' ? (
                            <div className="space-y-2">
                              <div className="overflow-x-auto pb-1">
                                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                                  {displayOptions.map((opt: any, idx: number) => (
                                    <div key={idx} className="flex flex-col items-center gap-1 w-16 flex-shrink-0">
                                      <div className="w-10 h-10 flex items-center justify-center border-2 border-sky-300 rounded-lg bg-sky-50 text-sm font-bold text-sky-700">
                                        {opt.value}
                                      </div>
                                      {opt.label && (
                                        <span className="text-xs text-sky-500 text-center leading-tight w-16 break-words">
                                          {opt.label}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : questionType === 'matrix' && question.question?.matrixConfig?.rows?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr>
                                    <th className="p-2 w-1/3 text-left text-stratosphere-700 font-medium border-b border-concrete-200" />
                                    {question.question.matrixConfig.columns.map((col: any, i: number) => (
                                      <th key={i} className="p-2 text-center text-stratosphere-700 font-medium border-b border-concrete-200">
                                        {col.label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {question.question.matrixConfig.rows.map((row: any, i: number) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stratosphere-50/50'}>
                                      <td className="p-2 text-stratosphere-900 border-r border-concrete-200 font-medium">{row.label}</td>
                                      {question.question.matrixConfig.columns.map((_: any, j: number) => (
                                        <td key={j} className="p-2 text-center">
                                          <input type="radio" disabled className="opacity-40" />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : displayOptions.length > 0 ? (
                            <div className="space-y-2">
                              {displayOptions.map((option: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="rounded border border-concrete-200 overflow-hidden"
                                >
                                  <div className="flex items-center gap-3 p-2 bg-white">
                                    <div className="flex items-center justify-center w-6 h-6 bg-sky-50 rounded-full text-xs font-medium text-sky-600 flex-shrink-0">
                                      {idx + 1}
                                    </div>
                                    <span className="text-sm text-stratosphere-900 flex-1">
                                      {option.label || option.value}
                                    </span>
                                    {option.descriptor && (
                                      <Badge variant="outline" className="text-xs bg-sky-50 text-sky-600 border-sky-200 flex-shrink-0">
                                        + follow-up
                                      </Badge>
                                    )}
                                    {isLocationDemographic && (
                                      <Badge variant="outline" className="ml-auto text-xs bg-grass-50 text-grass-600 border-grass-300">
                                        Site
                                      </Badge>
                                    )}
                                    {isEthnicityDemographic && (
                                      <Badge variant="outline" className="ml-auto text-xs bg-clay-50 text-clay-600 border-clay-300">
                                        Ethnic Group
                                      </Badge>
                                    )}
                                  </div>
                                  {option.descriptor && (
                                    <div className="px-3 py-1.5 bg-sky-50 border-t border-sky-100">
                                      <p className="text-xs text-sky-600 italic">"{option.descriptor}"</p>
                                      {option.placeholder && (
                                        <p className="text-xs text-concrete-500 mt-0.5">Placeholder: "{option.placeholder}"</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-sky-500 text-center py-3">
                              No options configured for this question
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleRequired}
                    className={`text-xs ${
                      question.required 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-concrete-500 hover:bg-stratosphere-50'
                    }`}
                  >
                    {question.required ? 'Required' : 'Optional'}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-stratosphere-50">
                        <MoreVertical className="h-4 w-4 text-concrete-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                      <DropdownMenuItem
                        className="text-stratosphere-900"
                        onClick={handleDuplicate}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Question
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-stratosphere-900"
                        onClick={onOpenConditionalLogic}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Conditional Logic
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-stratosphere-900"
                        onClick={() => setShowSectionSelector(true)}
                      >
                        <Move className="h-4 w-4 mr-2" />
                        Move to Section
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Question
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Section Selector Modal */}
      <SectionSelectorModal
        isOpen={showSectionSelector}
        onClose={() => setShowSectionSelector(false)}
        questionText={questionText}
        availableSections={availableSections}
        currentSectionId={getCurrentSectionId()}
        onMoveToSection={handleMoveToSection}
      />
    </>
  );
};