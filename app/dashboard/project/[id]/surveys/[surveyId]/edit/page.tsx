// app/dashboard/project/[id]/surveys/[surveyId]/edit/page.tsx - Updated with improvements
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SurveyHeader } from '@/components/survey/SurveyHeader';
import { SurveyContentArea } from '@/components/survey/SurveyContentArea';
import { QuestionPropertiesPanel } from '@/components/survey/QuestionPropertiesPanel';
import { ConditionalLogicModal } from '@/components/survey/ConditionalLogicModal';
import { SectionCreationModal } from '@/components/survey/SectionCreationModal';
import { BespokeQuestionModal } from '@/components/survey/BespokeQuestionModal';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Info, HelpCircle, Wand2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

// API imports
import { getSurvey, updateSurvey, getSurveyStructure } from '@/lib/api/survey';
import { createSurveySection, deleteSurveySection, updateSurveySection, reorderSurveySections } from '@/lib/api/surveySection';
import { moveQuestionToSection, reorderSurveyQuestions } from '@/lib/api/surveyQuestion';
import { createBespokeQuestion } from '@/lib/api/question';

interface PageParams {
  id: string;
  surveyId: string;
}

const SurveyEditPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;
  
  // Data state
  const [survey, setSurvey] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  
  // Survey editing state
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveySettings, setSurveySettings] = useState({
    isPublic: false,
    allowAnonymous: false,
    allowMultipleResponses: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modal states
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [selectedQuestionForLogic, setSelectedQuestionForLogic] = useState<string | null>(null);
  const [showSectionCreationModal, setShowSectionCreationModal] = useState(false);
  const [showBespokeModal, setShowBespokeModal] = useState(false);

  // Fetch survey data
  const fetchSurvey = async () => {
    try {
      const response = await getSurvey(surveyId, 'project,stakeholderGroup,theoryOfChangeStage,projectSite,creator');
      setSurvey(response.data);
      setSurveyTitle(response.data.title || '');
      setSurveyDescription(response.data.description || '');
      setSurveySettings({
        isPublic: response.data.settings?.isPublic ?? false,
        allowAnonymous: response.data.settings?.allowAnonymous ?? false,
        allowMultipleResponses: response.data.settings?.allowMultipleResponses ?? false,
      });
    } catch (error) {
      console.error('Failed to fetch survey:', error);
      setError('Failed to load survey');
    }
  };

  // Fetch survey structure
  const fetchStructure = async () => {
    try {
      const response = await getSurveyStructure(surveyId);
      setStructure(response.data);
    } catch (error) {
      console.error('Failed to fetch survey structure:', error);
      setError('Failed to load survey structure');
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSurvey(), fetchStructure()]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      initializeData();
    }
  }, [surveyId]);

  // Main handlers
  const handleSaveSurvey = async () => {
    try {
      await updateSurvey(surveyId, {
        title: surveyTitle,
        description: surveyDescription,
        settings: surveySettings,
      });
      setHasUnsavedChanges(false);
      toast({
        title: 'Changes saved',
        description: 'Your survey has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to save survey:', error);
      toast({
        title: 'Save failed',
        description: 'There was an error saving your changes',
        variant: 'destructive',
      });
    }
  };

  const handleSettingsChange = (key: keyof typeof surveySettings, value: boolean) => {
    setSurveySettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (title: string) => {
    setSurveyTitle(title);
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (description: string) => {
    setSurveyDescription(description);
    setHasUnsavedChanges(true);
  };

  const handleCreateSection = async (data: { title: string; description: string }) => {
    try {
      await createSurveySection(surveyId, {
        title: data.title,
        description: data.description,
        order: (structure?.sections?.length || 0) + 1
      });
      
      await fetchStructure();
      toast({
        title: 'Section created',
        description: 'New section has been added to your survey',
      });
    } catch (error) {
      console.error('Failed to create section:', error);
      toast({
        title: 'Error',
        description: 'Failed to create section',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleShowCreateSectionModal = () => {
    setShowSectionCreationModal(true);
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSurveySection(surveyId, sectionId);
      await fetchStructure();
      toast({
        title: 'Section deleted',
        description: 'Section has been removed from your survey',
      });
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSectionTitle = async (sectionId: string, newTitle: string) => {
    try {
      await updateSurveySection(surveyId, sectionId, { title: newTitle });
      await fetchStructure();
      toast({
        title: 'Section updated',
        description: 'Section title has been updated',
      });
    } catch (error) {
      console.error('Failed to update section title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section title',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuestionText = async (_questionId: string, _newText: string) => {
    await fetchStructure();
  };

  const handleDeleteQuestion = async (_questionId: string) => {
    await fetchStructure();
    setSelectedQuestion(null);
  };

  const handleToggleQuestionRequired = async (_questionId: string, _required: boolean) => {
    await fetchStructure();
  };

  const handleToggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleOpenConditionalLogic = (questionId: string) => {
    setSelectedQuestionForLogic(questionId);
    setShowConditionalLogicModal(true);
  };

  const handleReorderSections = async (newSectionIds: string[]) => {
    try {
      await reorderSurveySections(surveyId, newSectionIds);
      await fetchStructure();
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder sections',
        variant: 'destructive',
      });
    }
  };

  const handleMoveQuestionToSection = async (questionId: string, sectionId: string | null) => {
    try {
      await moveQuestionToSection(surveyId, questionId, sectionId);
      await fetchStructure();
      toast({
        title: 'Question moved',
        description: sectionId ? 'Question moved to section successfully' : 'Question moved to unorganized questions',
      });
    } catch (error) {
      console.error('Failed to move question:', error);
      toast({
        title: 'Error',
        description: 'Failed to move question',
        variant: 'destructive',
      });
    }
  };

  const handleReorderQuestionsInSection = async (sectionId: string | null, questionIds: string[]) => {
    try {
      await reorderSurveyQuestions(surveyId, {
        questions: questionIds.map(id => ({ id })),
        sectionId,
      });
      await fetchStructure();
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder questions',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBespokeQuestion = async (questionData: any) => {
    try {
      const response = await createBespokeQuestion({
        ...questionData,
        projectId: projectId
      });

      toast({
        title: 'Custom Question Created',
        description: 'Your question has been submitted for approval',
      });

      setShowBespokeModal(false);
      await fetchStructure();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create custom question',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-500 mx-auto mb-4"></div>
          <p className="text-stratosphere-900 font-medium">Loading survey editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !survey) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Survey Not Found</h2>
          <p className="text-sky-500 mb-6">{error || 'The survey you\'re trying to edit doesn\'t exist'}</p>
          <Link href={`/dashboard/project/${projectId}/surveys`}>
            <Button className="bg-clay-500 hover:bg-clay-600 text-white shadow-md">
              Back to Surveys
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get all questions for conditional logic
  const allQuestions = [
    ...(structure?.sections?.flatMap((s: any) => s.questions) || []),
    ...(structure?.noSectionQuestions || [])
  ];

  return (
    <div className="min-h-screen bg-stratosphere-50">
      {/* Header */}
      <SurveyHeader
        projectId={projectId}
        surveyId={surveyId}
        surveyTitle={surveyTitle}
        surveyDescription={surveyDescription}
        surveySettings={surveySettings}
        hasUnsavedChanges={hasUnsavedChanges}
        previewMode={previewMode}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onSettingsChange={handleSettingsChange}
        onPreviewModeChange={setPreviewMode}
        onSave={handleSaveSurvey}
      />

      {/* Main Content */}
      <div className="flex">
        {/* Main Content Area - Full Width */}
        <div className="flex-1 min-w-0">
          {/* Help Section */}
          <div className="px-8 py-6 border-b border-concrete-500/20">
            <div className="max-w-4xl mx-auto">
            <Collapsible open={showHelp} onOpenChange={setShowHelp}>
              <Card className="border-clay-500/30 bg-clay-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-clay-500" />
                      <h3 className="font-semibold text-stratosphere-900">Survey Editor Guide</h3>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4 text-clay-500" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="space-y-3 text-sm text-sky-500">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-concrete-500/10">
                          <p className="font-medium text-stratosphere-900 mb-1">Organize with Sections</p>
                          <p className="text-xs">Group related questions into sections for better flow. Click "Create Section" at the bottom.</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg border border-concrete-500/10">
                          <p className="font-medium text-stratosphere-900 mb-1">Customize Questions</p>
                          <p className="text-xs">Click any question to edit text, set as required, or add conditional logic in the right panel.</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg border border-concrete-500/10">
                          <p className="font-medium text-stratosphere-900 mb-1">Move Questions</p>
                          <p className="text-xs">Drag and drop questions between sections or use the dropdown menu to reorganize.</p>
                        </div>
                      </div>
                      
                      <Alert className="border-sky-500/30 bg-sky-50">
                        <Info className="h-4 w-4 text-sky-500" />
                        <AlertDescription className="text-xs text-sky-500">
                          <strong>Tip:</strong> Use conditional logic to show/hide questions based on previous answers. 
                          Create custom bespoke questions if you need something specific to your project.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
            </div>
          </div>

          <SurveyContentArea
            structure={structure}
            surveyTitle={surveyTitle}
            surveyDescription={surveyDescription}
            expandedSections={expandedSections}
            selectedQuestion={selectedQuestion}
            previewMode={previewMode}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onToggleSection={handleToggleSection}
            onSelectQuestion={setSelectedQuestion}
            onUpdateSectionTitle={handleUpdateSectionTitle}
            onDeleteSection={handleDeleteSection}
            onUpdateQuestionText={handleUpdateQuestionText}
            onDeleteQuestion={handleDeleteQuestion}
            onToggleQuestionRequired={handleToggleQuestionRequired}
            onOpenConditionalLogic={handleOpenConditionalLogic}
            onCreateSection={handleShowCreateSectionModal}
            onDropQuestionOnSection={handleMoveQuestionToSection}
            onMoveQuestionToSection={handleMoveQuestionToSection}
            onReorderSections={handleReorderSections}
            onReorderQuestionsInSection={handleReorderQuestionsInSection}
            onCreateBespokeQuestion={() => setShowBespokeModal(true)}
            onRefreshStructure={fetchStructure}
          />
        </div>

        {/* Right Sidebar - Question Properties */}
        {selectedQuestion && (
          <div className="w-80 flex-shrink-0 bg-white border-l border-concrete-500/20 p-6 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
            <QuestionPropertiesPanel
              questionId={selectedQuestion}
              surveyId={surveyId}
              onClose={() => setSelectedQuestion(null)}
              onUpdate={() => fetchStructure()}
              onOpenConditionalLogic={() => handleOpenConditionalLogic(selectedQuestion)}
            />
          </div>
        )}
      </div>

      {/* Section Creation Modal */}
      <SectionCreationModal
        isOpen={showSectionCreationModal}
        onClose={() => setShowSectionCreationModal(false)}
        onCreateSection={handleCreateSection}
      />

      {/* Conditional Logic Modal */}
      {showConditionalLogicModal && selectedQuestionForLogic && (
        <ConditionalLogicModal
          isOpen={showConditionalLogicModal}
          onClose={() => {
            setShowConditionalLogicModal(false);
            setSelectedQuestionForLogic(null);
          }}
          questionId={selectedQuestionForLogic}
          surveyId={surveyId}
          allQuestions={allQuestions}
          onUpdate={() => fetchStructure()}
        />
      )}

      {/* Bespoke Question Modal */}
      <BespokeQuestionModal
        isOpen={showBespokeModal}
        onClose={() => setShowBespokeModal(false)}
        onCreateQuestion={handleCreateBespokeQuestion}
        projectId={projectId}
      />
    </div>
  );
};

export default SurveyEditPage;