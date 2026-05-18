// components/survey/SurveyContentArea.tsx - Updated with bespoke questions and clay colors
'use client';

import { useState } from 'react';
import { Plus, FileText, Wand2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from './SectionCard';
import { QuestionCard } from './QuestionCard';
import type { SurveyStructure } from '@/types/survey-edit';

interface SurveyContentAreaProps {
  structure: SurveyStructure | null;
  surveyTitle: string;
  surveyDescription: string;
  expandedSections: Set<string>;
  selectedQuestion: string | null;
  previewMode: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onToggleSection: (sectionId: string) => void;
  onSelectQuestion: (questionId: string | null) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateQuestionText: (questionId: string, text: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onToggleQuestionRequired: (questionId: string, required: boolean) => void;
  onOpenConditionalLogic: (questionId: string) => void;
  onCreateSection: () => void;
  onDropQuestionOnSection: (questionId: string, sectionId: string) => void;
  onMoveQuestionToSection?: (questionId: string, sectionId: string | null) => Promise<void>;
  onReorderSections?: (newSectionIds: string[]) => Promise<void>;
  onCreateBespokeQuestion?: () => void;
  onRefreshStructure?: () => void;
  onReorderQuestionsInSection?: (sectionId: string | null, questionIds: string[]) => Promise<void>;
}

export const SurveyContentArea = ({
  structure,
  surveyTitle,
  surveyDescription,
  expandedSections,
  selectedQuestion,
  previewMode,
  onTitleChange,
  onDescriptionChange,
  onToggleSection,
  onSelectQuestion,
  onUpdateSectionTitle,
  onDeleteSection,
  onUpdateQuestionText,
  onDeleteQuestion,
  onToggleQuestionRequired,
  onOpenConditionalLogic,
  onCreateSection,
  onDropQuestionOnSection,
  onMoveQuestionToSection,
  onReorderSections,
  onCreateBespokeQuestion,
  onRefreshStructure,
  onReorderQuestionsInSection,
}: SurveyContentAreaProps) => {
  const [isDropProcessing, setIsDropProcessing] = useState(false);

  const withDropLoading = async (fn: () => Promise<void>) => {
    setIsDropProcessing(true);
    try {
      await fn();
    } finally {
      setIsDropProcessing(false);
    }
  };

  const handleDropOnQuestion = (
    sectionId: string | null,
    sectionQuestions: any[],
    draggedId: string,
    targetId: string,
    position: 'before' | 'after'
  ) => {
    withDropLoading(async () => {
      const currentIds: string[] = sectionQuestions.map((q: any) => q._id);

      if (currentIds.includes(draggedId)) {
        // Same section — reorder
        const newIds = [...currentIds];
        newIds.splice(newIds.indexOf(draggedId), 1);
        const newTargetIdx = newIds.indexOf(targetId);
        const insertAt = position === 'before' ? newTargetIdx : newTargetIdx + 1;
        newIds.splice(insertAt, 0, draggedId);
        await onReorderQuestionsInSection?.(sectionId, newIds);
      } else {
        // Cross-section drop onto a question — move to that section
        await onMoveQuestionToSection?.(draggedId, sectionId);
      }
    });
  };

  const handleDropSection = (draggedSectionId: string, targetSectionId: string) => {
    if (!structure?.sections || draggedSectionId === targetSectionId) return;
    const sections = structure.sections;
    const draggedIndex = sections.findIndex(s => s._id === draggedSectionId);
    const targetIndex = sections.findIndex(s => s._id === targetSectionId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newOrder = [...sections];
    const [dragged] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, dragged);
    withDropLoading(() => onReorderSections?.(newOrder.map(s => s._id)) ?? Promise.resolve());
  };
  
  // Prepare available sections for moving questions
  const availableSections = structure?.sections || [];

  const getProjectId = (structure: SurveyStructure | null): string | undefined => {
    if (!structure?.survey?.project) return undefined;
    
    // If project is a string (just ID)
    if (typeof structure.survey.project === 'string') {
      return structure.survey.project;
    }
    
    // If project is a populated object
    return structure.survey.project._id;
  };

  // Then use it when rendering QuestionCard:
  const projectId = getProjectId(structure);
  
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Beautiful Survey Header */}
        <Card className="border-2 border-clay-500/20 shadow-xl bg-white">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="border-l-4 border-clay-500 pl-6">
                <Input
                  value={surveyTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="text-3xl font-bold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent text-stratosphere-900 placeholder:text-concrete-500"
                  placeholder="Untitled Survey"
                />
                <Textarea
                  value={surveyDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Add a description to help respondents understand your survey"
                  className="border-none shadow-none px-0 focus-visible:ring-0 resize-none bg-transparent text-sky-500 placeholder:text-concrete-500 mt-2"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Structure */}
        {structure && (
          <div className="relative">
            {isDropProcessing && (
              <div className="absolute inset-0 z-20 rounded-lg pointer-events-none">
                <div className="sticky top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2 py-4">
                  <div className="flex items-center gap-3 px-5 py-3 bg-white border border-concrete-500/20 rounded-full shadow-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-500 border-t-transparent flex-shrink-0" />
                    <span className="text-sm font-medium text-stratosphere-900 whitespace-nowrap">Moving question…</span>
                  </div>
                </div>
              </div>
            )}
            <div className={`space-y-6 ${isDropProcessing ? 'pointer-events-none opacity-50 select-none' : ''}`}>
            {/* Sections */}
            {structure.sections?.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                isExpanded={expandedSections.has(section._id)}
                onToggleExpanded={() => onToggleSection(section._id)}
                onUpdateTitle={(title) => onUpdateSectionTitle(section._id, title)}
                onDelete={() => onDeleteSection(section._id)}
                onDropQuestion={(questionId) => {
                  withDropLoading(async () => {
                    await Promise.resolve(onDropQuestionOnSection(questionId, section._id));
                  });
                }}
                onDropSection={(draggedId) => handleDropSection(draggedId, section._id)}
              >
                {section.questions?.map((question, questionIndex) => (
                  <QuestionCard
                    key={question._id}
                    question={question}
                    isSelected={selectedQuestion === question._id}
                    onSelect={() => onSelectQuestion(question._id)}
                    onDelete={() => onDeleteQuestion(question._id)}
                    onUpdateText={(newText) => onUpdateQuestionText(question._id, newText)}
                    onToggleRequired={(required) => onToggleQuestionRequired(question._id, required)}
                    onOpenConditionalLogic={() => onOpenConditionalLogic(question._id)}
                    previewMode={previewMode}
                    index={questionIndex}
                    surveyId={structure.survey._id}
                    availableSections={availableSections}
                    onMoveToSection={onMoveQuestionToSection}
                    projectId={projectId}
                    onRefresh={onRefreshStructure}
                    onDropOnQuestion={(draggedId, targetId, pos) =>
                      handleDropOnQuestion(section._id, section.questions, draggedId, targetId, pos)
                    }
                  />
                ))}
              </SectionCard>
            ))}

            {/* Unorganized Questions */}
            {structure.noSectionQuestions && structure.noSectionQuestions.length > 0 && (
              <Card className="border border-ochre-500/20 shadow-lg bg-white">
                <CardHeader className="bg-ochre-50">
                  <CardTitle className="text-lg flex items-center gap-3 text-ochre-900">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="h-5 w-5 text-ochre-500" />
                    </div>
                    Unorganized Questions
                    <Badge className="bg-ochre-100 text-ochre-600 border-ochre-500/20">
                      {structure.noSectionQuestions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {structure.noSectionQuestions.map((question, index) => (
                      <QuestionCard
                        key={question._id}
                        question={question}
                        isSelected={selectedQuestion === question._id}
                        onSelect={() => onSelectQuestion(question._id)}
                        onDelete={() => onDeleteQuestion(question._id)}
                        onUpdateText={(newText) => onUpdateQuestionText(question._id, newText)}
                        onToggleRequired={(required) => onToggleQuestionRequired(question._id, required)}
                        onOpenConditionalLogic={() => onOpenConditionalLogic(question._id)}
                        previewMode={previewMode}
                        index={index}
                        isOrphaned={true}
                        surveyId={structure.survey._id}
                        availableSections={availableSections}
                        onMoveToSection={onMoveQuestionToSection}
                        projectId={projectId}
                        onRefresh={onRefreshStructure}
                        onDropOnQuestion={(draggedId, targetId, pos) =>
                          handleDropOnQuestion(null, structure.noSectionQuestions, draggedId, targetId, pos)
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Add Section and Create Bespoke Question */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Add Section Button */}
              <Card className="border-2 border-dashed border-clay-500/30 hover:border-clay-500/60 bg-white cursor-pointer">
                <CardContent className="p-6">
                  <Button
                    variant="ghost"
                    className="w-full h-auto py-4 text-clay-500 hover:text-clay-600 hover:bg-clay-50"
                    onClick={onCreateSection}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-clay-50 rounded-lg">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Add New Section</div>
                        <div className="text-xs opacity-70">Organize questions into groups</div>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Create Bespoke Question Button */}
              {onCreateBespokeQuestion && (
                <Card className="border-2 border-dashed border-grass-500/30 hover:border-grass-500/60 bg-white cursor-pointer">
                  <CardContent className="p-6">
                    <Button
                      variant="ghost"
                      className="w-full h-auto py-4 text-grass-500 hover:text-grass-600 hover:bg-grass-50"
                      onClick={onCreateBespokeQuestion}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-grass-50 rounded-lg">
                          <Wand2 className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Create Custom Question</div>
                          <div className="text-xs opacity-70">Add a project-specific question</div>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};