// components/survey-creation/SurveyStructureStep.tsx
'use client';

import { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Move3D,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  Wand2,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { SurveyCreationContextType, SurveySection, SurveyQuestionItem } from '@/types/survey-creation';

interface SurveyStructureStepProps {
  context: SurveyCreationContextType;
  onNext: () => void;
  onBack: () => void;
}

// Simple Question Item Component
function QuestionItem({ 
  questionItem, 
  onMove, 
  onToggleRequired,
  allSections 
}: {
  questionItem: SurveyQuestionItem;
  onMove: (questionItem: SurveyQuestionItem, targetSectionId: string | null) => void;
  onToggleRequired: (questionItem: SurveyQuestionItem) => void;
  allSections: SurveySection[];
}) {
  return (
    <div className="border border-concrete-500/20 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-stratosphere-900 text-sm line-clamp-2">
                {questionItem.customText || questionItem.question?.text}
              </h4>
              {(questionItem.question?.description || questionItem.customDescription) && (
                <p className="text-sm text-sky-500 mt-1 line-clamp-2">
                  {questionItem.customDescription || questionItem.question?.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-concrete-500/30">
                  {questionItem.question?.type}
                </Badge>
                {questionItem.question?.theme && (
                  <Badge variant="secondary" className="text-xs bg-stratosphere-50 text-stratosphere-900">
                    {questionItem.question?.theme.name}
                  </Badge>
                )}
                {questionItem.question?.isBespoke && questionItem.question.bespokeMetadata && (
                  <div className="flex flex-col gap-0.5">
                    {/* Status Badge */}
                    {questionItem.question.bespokeMetadata.status === 'pending' && (
                      <Badge className="text-xs bg-ochre-100 text-ochre-900 border-ochre-300">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'approved' && (
                      <Badge className="text-xs bg-grass-100 text-grass-900 border-grass-300">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'rejected' && (
                      <Badge className="text-xs bg-sand-100 text-sand-900 border-sand-300">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'elevated' && (
                      <Badge className="text-xs bg-sky-100 text-sky-900 border-sky-300">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Elevated
                      </Badge>
                    )}
                    
                    {/* Creator Info */}
                    {typeof questionItem.question.bespokeMetadata.createdBy === 'object' && (
                      <span className="text-[10px] text-stratosphere-600">
                        by {questionItem.question.bespokeMetadata.createdBy.name}
                      </span>
                    )}
                  </div>
                )}
                {questionItem.required && (
                  <Badge className="text-xs bg-ochre-100 text-ochre-700">
                    Required
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Select 
                value={questionItem.sectionId || 'unassigned'} 
                onValueChange={(value) => onMove(questionItem, value === 'unassigned' ? null : value)}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs border-concrete-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {allSections.map(section => (
                    <SelectItem key={section._id} value={section._id!}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleRequired(questionItem)}
                className="h-8 text-xs border-concrete-500/30 hover:border-forest-500"
              >
                {questionItem.required ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-grass-500" />
                    Required
                  </>
                ) : (
                  <>
                    <Circle className="h-3 w-3 mr-1 text-sky-500" />
                    Optional
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurveyStructureStep({ context, onNext, onBack }: SurveyStructureStepProps) {
  const { toast } = useToast();
  const { 
    sections, 
    setSections, 
    unassignedQuestions, 
    setUnassignedQuestions,
    moveQuestionToSection
  } = context;

  // Dialog states
  const [newSectionDialog, setNewSectionDialog] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  const createSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: SurveySection = {
      _id: `temp_${Date.now()}`,
      title: newSectionTitle,
      description: newSectionDescription,
      order: sections.length + 1,
      isExpanded: true,
      questions: []
    };
    
    setSections(prev => [...prev, newSection]);
    setNewSectionTitle('');
    setNewSectionDescription('');
    setNewSectionDialog(false);
    
    toast({
      title: 'Section created',
      description: 'New section has been added to your survey',
    });
  };

  const deleteSection = (sectionId: string) => {
    const section = sections.find(s => s._id === sectionId);
    if (!section) return;
    
    // Move questions back to unassigned
    setUnassignedQuestions(prev => [...prev, ...section.questions]);
    setSections(prev => prev.filter(s => s._id !== sectionId));
    
    toast({
      title: 'Section deleted',
      description: 'Section and its questions have been moved to unassigned',
    });
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section._id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const toggleQuestionRequired = (questionItem: SurveyQuestionItem) => {
    const updatedQuestion = { ...questionItem, required: !questionItem.required };
    
    // Update in sections
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        questions: section.questions.map(q => 
          q.questionId === questionItem.questionId ? updatedQuestion : q
        )
      }))
    );
    
    // Update in unassigned
    setUnassignedQuestions(prev => 
      prev.map(q => q.questionId === questionItem.questionId ? updatedQuestion : q)
    );
  };

  return (
    <div className="space-y-6">
      {/* Informational Guide */}
      <Collapsible open={showHelp} onOpenChange={setShowHelp}>
        <Card className="border-forest-500/30 bg-gradient-to-br from-forest-50 to-grass-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-forest-500 rounded-lg p-2">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-stratosphere-900">
                    Survey Structure Guide
                  </CardTitle>
                  <CardDescription className="text-forest-500">
                    Best practices for organizing your questions
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {showHelp ? (
                    <ChevronUp className="h-4 w-4 text-forest-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-forest-500" />
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
                    <Layers className="h-4 w-4 text-grass-500" />
                    <h4 className="font-semibold text-stratosphere-900 text-sm">Sections</h4>
                  </div>
                  <p className="text-xs text-sky-500">
                    Group related questions into logical sections (e.g., "Demographics", "Project Impact", "Feedback")
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-concrete-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-grass-500" />
                    <h4 className="font-semibold text-stratosphere-900 text-sm">Required Questions</h4>
                  </div>
                  <p className="text-xs text-sky-500">
                    Mark critical questions as required, but don't make too many required - it reduces completion rates
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-concrete-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Move3D className="h-4 w-4 text-grass-500" />
                    <h4 className="font-semibold text-stratosphere-900 text-sm">Organization</h4>
                  </div>
                  <p className="text-xs text-sky-500">
                    Start with easier questions, progress to more complex ones. Keep related questions together
                  </p>
                </div>
              </div>

              <Alert className="border-grass-500/30 bg-grass-50">
                <Info className="h-4 w-4 text-grass-500" />
                <AlertDescription className="text-sm text-forest-500">
                  <strong>Pro Tip:</strong> You can always edit the survey structure later. 
                  Focus on basic organization now - fine-tuning can happen after creation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-forest-500" />
                Survey Structure
              </CardTitle>
              <p className="text-sm text-sky-500">
                Organize your questions into sections for better clarity
              </p>
            </div>
            <Button
              onClick={() => setNewSectionDialog(true)}
              size="sm"
              className="bg-forest-500 hover:bg-forest-900 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Info Alert */}
          <Alert className="border-forest-500/30 bg-forest-50">
            <AlertCircle className="h-4 w-4 text-forest-500" />
            <AlertDescription className="text-sm text-sky-500">
              Use the dropdowns to assign questions to sections. Mark important questions as required.
              Survey flow: <strong className="text-stratosphere-900">Sections (in order) → Unassigned Questions</strong>
            </AlertDescription>
          </Alert>

          {/* Sections */}
          {sections.map(section => (
            <Collapsible
              key={section._id}
              open={section.isExpanded}
              onOpenChange={() => toggleSectionExpanded(section._id!)}
            >
              <div className="border border-forest-200 rounded-lg">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-forest-50 rounded-t-lg hover:bg-forest-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      {section.isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-forest-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-forest-500" />
                      )}
                      <div>
                        <h3 className="font-medium text-stratosphere-900">
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-sky-500 mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-forest-500/30 text-forest-500">
                        {section.questions.length} questions
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section._id!);
                        }}
                        className="text-ochre-500 hover:text-ochre-700 hover:bg-ochre-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 space-y-3">
                    {section.questions.length === 0 ? (
                      <div className="text-center py-8 text-sky-500">
                        <Move3D className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No questions in this section. Use the dropdown on questions to assign them here.
                        </p>
                      </div>
                    ) : (
                      section.questions.map(questionItem => (
                        <QuestionItem
                          key={questionItem.questionId}
                          questionItem={questionItem}
                          onMove={moveQuestionToSection}
                          onToggleRequired={toggleQuestionRequired}
                          allSections={sections}
                        />
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {/* Unassigned Questions */}
          <div className="border border-concrete-500/20 rounded-lg">
            <div className="p-4 bg-concrete-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-stratosphere-900">
                    Unassigned Questions
                  </h3>
                  <p className="text-sm text-sky-500 mt-1">
                    Questions not organized into sections
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-concrete-500/30">
                  {unassignedQuestions.length} questions
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {unassignedQuestions.length === 0 ? (
                <div className="text-center py-8 text-sky-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-grass-500" />
                  <p className="text-sm font-medium text-stratosphere-900">All questions organized!</p>
                  <p className="text-xs text-sky-500 mt-1">All questions have been assigned to sections</p>
                </div>
              ) : (
                unassignedQuestions.map(questionItem => (
                  <QuestionItem
                    key={questionItem.questionId}
                    questionItem={questionItem}
                    onMove={moveQuestionToSection}
                    onToggleRequired={toggleQuestionRequired}
                    allSections={sections}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-concrete-500/30">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back: Survey Details
        </Button>
        <Button onClick={onNext} className="bg-forest-500 hover:bg-forest-900 text-white">
          Next: Survey Settings
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* New Section Dialog */}
      <Dialog open={newSectionDialog} onOpenChange={setNewSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Organize your questions into logical sections for better user experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sectionTitle">Section Title</Label>
              <Input
                id="sectionTitle"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g., Demographics, Project Impact..."
                className="mt-1 border-concrete-500/30 focus:border-forest-500"
              />
            </div>
            
            <div>
              <Label htmlFor="sectionDescription">Section Description (Optional)</Label>
              <Textarea
                id="sectionDescription"
                value={newSectionDescription}
                onChange={(e) => setNewSectionDescription(e.target.value)}
                placeholder="Briefly describe what this section covers..."
                rows={3}
                className="mt-1 border-concrete-500/30 focus:border-forest-500"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSectionDialog(false)} className="border-concrete-500/30">
              Cancel
            </Button>
            <Button 
              onClick={createSection} 
              disabled={!newSectionTitle.trim()}
              className="bg-forest-500 hover:bg-forest-900 text-white"
            >
              Create Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}