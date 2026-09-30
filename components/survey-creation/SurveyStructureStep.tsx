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
    <div className="border border-c4c-rule rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-black text-sm line-clamp-2">
                {questionItem.customText || questionItem.question?.text}
              </h4>
              {(questionItem.question?.description || questionItem.customDescription) && (
                <p className="text-sm text-c4c-petrol mt-1 line-clamp-2">
                  {questionItem.customDescription || questionItem.question?.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-c4c-rule">
                  {questionItem.question?.type}
                </Badge>
                {questionItem.question?.theme && (
                  <Badge variant="secondary" className="text-xs bg-c4c-grey-bg text-black">
                    {questionItem.question?.theme.name}
                  </Badge>
                )}
                {questionItem.question?.isBespoke && questionItem.question.bespokeMetadata && (
                  <div className="flex flex-col gap-0.5">
                    {/* Status Badge */}
                    {questionItem.question.bespokeMetadata.status === 'pending' && (
                      <Badge className="text-xs bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'approved' && (
                      <Badge className="text-xs bg-c4c-tint-sage text-c4c-petrol border-c4c-sage">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'rejected' && (
                      <Badge className="text-xs bg-c4c-tint-coral text-c4c-burgundy border-c4c-burgundy">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {questionItem.question.bespokeMetadata.status === 'elevated' && (
                      <Badge className="text-xs bg-c4c-rule text-c4c-petrol border-c4c-rule">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Elevated
                      </Badge>
                    )}
                    
                    {/* Creator Info */}
                    {typeof questionItem.question.bespokeMetadata.createdBy === 'object' && (
                      <span className="text-[10px] text-c4c-petrol">
                        by {questionItem.question.bespokeMetadata.createdBy.name}
                      </span>
                    )}
                  </div>
                )}
                {questionItem.required && (
                  <Badge className="text-xs bg-c4c-tint-gold text-c4c-petrol">
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
                <SelectTrigger className="w-[160px] h-8 text-xs border-c4c-rule">
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
                className="h-8 text-xs border-c4c-rule hover:border-c4c-petrol"
              >
                {questionItem.required ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-c4c-sage" />
                    Required
                  </>
                ) : (
                  <>
                    <Circle className="h-3 w-3 mr-1 text-c4c-petrol" />
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
        <Card className="border-c4c-petrol/30 bg-gradient-to-br from-c4c-tint-cyan to-c4c-tint-sage">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-c4c-petrol rounded-lg p-2">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-black">
                    Survey Structure Guide
                  </CardTitle>
                  <CardDescription className="text-c4c-petrol">
                    Best practices for organizing your questions
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {showHelp ? (
                    <ChevronUp className="h-4 w-4 text-c4c-petrol" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-c4c-petrol" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-c4c-sage" />
                    <h4 className="font-semibold text-black text-sm">Sections</h4>
                  </div>
                  <p className="text-xs text-c4c-petrol">
                    Group related questions into logical sections (e.g., "Demographics", "Project Impact", "Feedback")
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-c4c-sage" />
                    <h4 className="font-semibold text-black text-sm">Required Questions</h4>
                  </div>
                  <p className="text-xs text-c4c-petrol">
                    Mark critical questions as required, but don't make too many required - it reduces completion rates
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                  <div className="flex items-center gap-2 mb-2">
                    <Move3D className="h-4 w-4 text-c4c-sage" />
                    <h4 className="font-semibold text-black text-sm">Organization</h4>
                  </div>
                  <p className="text-xs text-c4c-petrol">
                    Start with easier questions, progress to more complex ones. Keep related questions together
                  </p>
                </div>
              </div>

              <Alert className="border-c4c-sage bg-c4c-tint-sage">
                <Info className="h-4 w-4 text-c4c-sage" />
                <AlertDescription className="text-sm text-c4c-petrol">
                  <strong>Pro Tip:</strong> You can always edit the survey structure later. 
                  Focus on basic organization now - fine-tuning can happen after creation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="bg-white border-c4c-rule">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-c4c-petrol" />
                Survey Structure
              </CardTitle>
              <p className="text-sm text-c4c-petrol">
                Organize your questions into sections for better clarity
              </p>
            </div>
            <Button
              onClick={() => setNewSectionDialog(true)}
              size="sm"
              className="bg-c4c-petrol hover:bg-black text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Info Alert */}
          <Alert className="border-c4c-petrol/30 bg-c4c-tint-cyan">
            <AlertCircle className="h-4 w-4 text-c4c-petrol" />
            <AlertDescription className="text-sm text-c4c-petrol">
              Use the dropdowns to assign questions to sections. Mark important questions as required.
              Survey flow: <strong className="text-black">Sections (in order) → Unassigned Questions</strong>
            </AlertDescription>
          </Alert>

          {/* Sections */}
          {sections.map(section => (
            <Collapsible
              key={section._id}
              open={section.isExpanded}
              onOpenChange={() => toggleSectionExpanded(section._id!)}
            >
              <div className="border border-c4c-petrol rounded-lg">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 bg-c4c-tint-cyan rounded-t-lg hover:bg-c4c-tint-cyan cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      {section.isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-c4c-petrol" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-c4c-petrol" />
                      )}
                      <div>
                        <h3 className="font-medium text-black">
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-c4c-petrol mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-c4c-petrol/30 text-c4c-petrol">
                        {section.questions.length} questions
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section._id!);
                        }}
                        className="text-c4c-petrol hover:text-c4c-burgundy hover:bg-c4c-tint-coral"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 space-y-3">
                    {section.questions.length === 0 ? (
                      <div className="text-center py-8 text-c4c-petrol">
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
          <div className="border border-c4c-rule rounded-lg">
            <div className="p-4 bg-c4c-grey-bg rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black">
                    Unassigned Questions
                  </h3>
                  <p className="text-sm text-c4c-petrol mt-1">
                    Questions not organized into sections
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-c4c-rule">
                  {unassignedQuestions.length} questions
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {unassignedQuestions.length === 0 ? (
                <div className="text-center py-8 text-c4c-petrol">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-c4c-sage" />
                  <p className="text-sm font-medium text-black">All questions organized!</p>
                  <p className="text-xs text-c4c-petrol mt-1">All questions have been assigned to sections</p>
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
        <Button variant="outline" onClick={onBack} className="border-c4c-rule">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back: Survey Details
        </Button>
        <Button onClick={onNext} className="bg-c4c-petrol hover:bg-black text-white">
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
                className="mt-1 border-c4c-rule focus:border-c4c-petrol"
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
                className="mt-1 border-c4c-rule focus:border-c4c-petrol"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSectionDialog(false)} className="border-c4c-rule">
              Cancel
            </Button>
            <Button 
              onClick={createSection} 
              disabled={!newSectionTitle.trim()}
              className="bg-c4c-petrol hover:bg-black text-white"
            >
              Create Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}