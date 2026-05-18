// components/admin/QuestionBuilderContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Check,
  MoreVertical,
  Trash2,
  FileText,
  Sparkles,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import QuestionForm from '@/components/admin/QuestionForm';
import PreviewQuestion from '@/components/admin/PreviewQuestion';
import MetadataPanel from '@/components/admin/MetadataPanel';
import ValidationPanel from '@/components/admin/ValidationPanel';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { fetchQuestion, createQuestion, updateQuestion } from '@/lib/api/question';
import { fetchIndicators } from "@/lib/api/indicator";
import { fetchThemes } from '@/lib/api/theme';
import { fetchSubThemes } from '@/lib/api/subtheme';
import { fetchSDGs } from '@/lib/api/sdg';
import { fetchStandards } from '@/lib/api/standard';
import { fetchESGCategories } from '@/lib/api/esgCategory';
import { fetchResilienceDimensions } from '@/lib/api/resilienceDimension';
import { fetchCategories } from '@/lib/api/category';
import { QuestionType, QUESTION_TYPE_CONFIG } from '@/types';
import { 
  Theme, 
  SubTheme, 
  Indicator,
  SDG,
  Standard,
  ESGCategory,
  ResilienceDimension,
  Category
} from '@/types/taxonomy';

// ── defaultQuestion object ──
const defaultQuestion = {
  tempId: '',
  text: 'Untitled Question',
  description: '',
  type: 'radio' as QuestionType,
  required: false,
  options: [{ value: '1', label: 'Option 1' }],
  validation: {},
  categories: [],          // was: category: ''
  theme: '',
  subThemes: [],           // was: subTheme: ''
  targetAudience: 'both',
  tags: [],
  selectedIndicatorTags: [],
  selectedSdgTags: [],
  selectedResilienceTags: [],
  selectedEsgTags: [],
  selectedStandardTags: [],
  status: 'draft',
  _id: undefined
};

const EXAMPLE_QUESTION = {
  text: "How satisfied are you with the community's waste management services?",
  description: "Please rate your overall satisfaction with the frequency, reliability, and quality of waste collection in your area.",
  type: "scale",
  category: "Community Feedback",
  theme: "Environmental Sustainability",
  subTheme: "Waste Management",
  tags: ["satisfaction", "service quality", "environmental"]
};

interface QuestionBuilderContentProps {
  questionId?: string;
}

// Transforms frontend question state into a clean API payload.
// - Strips `tempId`
// - For scale: moves scaleOptions → options and strips scaleOptions from scaleConfig
// - For matrix: strips `description` from rows/columns (backend doesn't store it)
// - Normalises conditionalLogic: always included so the backend can clear it when needed.
//   undefined  → null  (explicit clear; backend will $unset or $set null)
//   { ... }    → sent as-is
const prepareQuestionForApi = (q: any) => {
  const { tempId, ...data } = q;

  if (data.type === 'scale' && data.scaleConfig) {
    const { scaleOptions, ...backendScaleConfig } = data.scaleConfig;
    data.scaleConfig = backendScaleConfig;
    if (Array.isArray(scaleOptions) && scaleOptions.length > 0) {
      data.options = scaleOptions.map((opt: any) => ({
        value: String(opt.value),
        label: opt.label || ''
      }));
    }
  }

  if (data.type === 'matrix' && data.matrixConfig) {
    data.matrixConfig = {
      rows: (data.matrixConfig.rows || []).map(({ label }: any) => ({ label })),
      columns: (data.matrixConfig.columns || []).map(({ value, label }: any) => ({ value, label }))
    };
  }

  // Always include conditionalLogic explicitly so the backend doesn't silently
  // ignore a cleared value. JSON.stringify strips `undefined`, so without this
  // the field would be omitted and old logic would persist after editing.
  if (data.conditionalLogic === undefined) {
    data.conditionalLogic = null;
  }

  return data;
};

const QuestionBuilderContent: React.FC<QuestionBuilderContentProps> = ({ questionId }) => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('questions');
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [subThemes, setSubThemes] = useState<SubTheme[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [esgCategories, setEsgCategories] = useState<ESGCategory[]>([]);
  const [resilienceDimensions, setResilienceDimensions] = useState<ResilienceDimension[]>([]);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: { saving: boolean; publishing: boolean; unpublishing: boolean };
  }>({});
  const [errors, setErrors] = useState<{ [tempId: string]: string | null }>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeSettings, setActiveSettings] = useState<{
    questionId: string | null;
    panel: 'metadata' | 'validation' | null;
  }>({
    questionId: null,
    panel: null
  });
  const [showGuidance, setShowGuidance] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeBuilder = async () => {
      setLoading(true);
      try {
        const [
          categoriesData,
          themesData,
          subThemesData,
          indicatorsData,
          sdgsData,
          standardsData,
          esgData,
          resilienceData
        ] = await Promise.all([
          fetchCategories({ limit: 1000 }),
          fetchThemes({ limit: 1000 }),
          fetchSubThemes({ limit: 1000 }),
          fetchIndicators({ limit: 1000 }),
          fetchSDGs({ limit: 1000 }),
          fetchStandards({ limit: 1000 }),
          fetchESGCategories({ limit: 1000 }),
          fetchResilienceDimensions({ limit: 1000 })
        ]);
        
        setCategories(categoriesData.data);
        setThemes(themesData.data);
        setSubThemes(subThemesData.data);
        setIndicators(indicatorsData.data);
        setSdgs(sdgsData.data);
        setStandards(standardsData.data);
        setEsgCategories(esgData.data);
        setResilienceDimensions(resilienceData.data);
        
        // ── inside initializeBuilder, the edit-mode block ──
        if (questionId) {
          // Include conditionalLogic in populate so condition questionIds come
          // back with text/type/options — needed for the conditional logic UI.
          const questionData = await fetchQuestion(questionId, 'selectedTags,theme,subTheme,category,conditionalLogic');
          const raw = questionData.data;

          const loadedQuestion: any = {
            ...raw,
            tempId: uuidv4(),
            // categories: array of populated objects → array of ID strings
            categories: (raw.categories || []).map((cat: any) =>
              typeof cat === 'object' ? cat._id : cat
            ),
            theme: typeof raw.theme === 'object' ? raw.theme._id : raw.theme,
            subThemes: (raw.subThemes || []).map((st: any) =>
              typeof st === 'object' ? st._id : st
            ),
            selectedIndicatorTags: (raw.selectedIndicatorTags || []).map((t: any) =>
              typeof t === 'object' ? t._id : t
            ),
            selectedSdgTags: (raw.selectedSdgTags || []).map((t: any) =>
              typeof t === 'object' ? t._id : t
            ),
            selectedResilienceTags: (raw.selectedResilienceTags || []).map((t: any) =>
              typeof t === 'object' ? t._id : t
            ),
            selectedEsgTags: (raw.selectedEsgTags || []).map((t: any) =>
              typeof t === 'object' ? t._id : t
            ),
            selectedStandardTags: (raw.selectedStandardTags || []).map((t: any) =>
              typeof t === 'object' ? t._id : t
            ),
            // Preserve conditionalLogic. The backend populates conditions[].questionId
            // as a full object when 'conditionalLogic' is in the populate string — we
            // extract just the _id so ConditionalLogicBuilder always sees a string ID.
            conditionalLogic: raw.conditionalLogic
              ? {
                  ...raw.conditionalLogic,
                  conditions: (raw.conditionalLogic.conditions || []).map((c: any) => ({
                    ...c,
                    questionId: typeof c.questionId === 'object' && c.questionId !== null
                      ? c.questionId._id
                      : c.questionId
                  }))
                }
              : null,
          };

          // Restore scale config — merge scaleConfig with per-point labels from options
          if (raw.type === 'scale') {
            const sc = raw.scaleConfig || { min: 1, max: 5, step: 1 };
            const min = sc.min ?? 1;
            const max = sc.max ?? 5;
            const step = sc.step ?? 1;
            const existingOptions = (raw.options || []).map((opt: any) => ({
              value: parseInt(opt.value),
              label: opt.label || '',
              description: ''
            }));
            const defaultOptions = [];
            for (let i = min; i <= max; i += step) {
              defaultOptions.push({ value: i, label: '', description: '' });
            }
            loadedQuestion.scaleConfig = {
              ...sc,
              minLabel: sc.minLabel || '',
              maxLabel: sc.maxLabel || '',
              showNAOption: sc.showNAOption ?? false,
              scaleOptions: existingOptions.length > 0 ? existingOptions : defaultOptions
            };
          }

          // Restore matrix config — add description placeholder for UI
          if (raw.type === 'matrix') {
            const mc = raw.matrixConfig;
            loadedQuestion.matrixConfig = mc
              ? {
                  ...mc,
                  rows: (mc.rows || []).map((r: any) => ({ ...r, description: '' })),
                  columns: (mc.columns || []).map((c: any) => ({ ...c, description: '' }))
                }
              : {
                  rows: [{ label: 'Row 1', description: '' }],
                  columns: [{ value: '1', label: 'Column 1', description: '' }]
                };
          }

          setQuestions([loadedQuestion]);
          setShowGuidance(false);
        } else {
          const newQuestion = {
            ...defaultQuestion,
            tempId: uuidv4()
          };
          setQuestions([newQuestion]);
        }
      } catch (error) {
        console.error('Error initializing builder:', error);
        toast({
          title: 'Error',
          description: 'Failed to load initial data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    initializeBuilder();
  }, [questionId, toast]);
  
  const handleQuestionChange = (tempId: string, updatedQuestion: any) => {
    setQuestions(prev =>
      prev.map(q => q.tempId === tempId ? { ...q, ...updatedQuestion } : q)
    );
    setErrors(prev => ({ ...prev, [tempId]: null }));
  };
  
  const handleAddQuestion = (index: number) => {
    const newQuestion = {
      ...defaultQuestion,
      tempId: uuidv4()
    };
    
    setQuestions(prev => [
      ...prev.slice(0, index + 1),
      newQuestion,
      ...prev.slice(index + 1)
    ]);
  };
  
  const handleRemoveQuestion = (tempId: string) => {
    setQuestions(prev => prev.filter(q => q.tempId !== tempId));
    
    if (activeSettings.questionId === tempId) {
      setActiveSettings({ questionId: null, panel: null });
    }
  };
  
  const toggleSettingsPanel = (tempId: string, panel: 'metadata' | 'validation') => {
    if (activeSettings.questionId === tempId && activeSettings.panel === panel) {
      setActiveSettings({ questionId: null, panel: null });
    } else {
      setActiveSettings({ questionId: tempId, panel });
    }
  };
  
  const getApiErrorMessage = (error: any): string =>
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || 'An unexpected error occurred. Please try again.';

  const handleSaveQuestion = async (tempId: string) => {
    const questionToSave = questions.find(q => q.tempId === tempId);
    if (!questionToSave) return;
    
    setLoadingStates(prev => ({
      ...prev,
      [tempId]: { ...prev[tempId], saving: true }
    }));
    
    try {
      let savedQuestion: any;
      const questionData = prepareQuestionForApi(questionToSave);

      if (questionToSave._id) {
        savedQuestion = await updateQuestion(questionToSave._id, questionData);
      } else {
        savedQuestion = await createQuestion(questionData);
      }

      const saved = savedQuestion.data;
      setQuestions(prev =>
        prev.map(q => q.tempId === tempId ? {
          ...q,
          _id: saved._id,
          conditionalLogic: saved.conditionalLogic,
          isStandardDemographic: saved.isStandardDemographic,
          demographicType: saved.demographicType,
          demographicCategory: saved.demographicCategory,
          demographicMetadata: saved.demographicMetadata,
          status: saved.status,
        } : q)
      );
      setErrors(prev => ({ ...prev, [tempId]: null }));

      toast({
        title: 'Question Saved',
        description: 'Question saved successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving question:', error);
      const message = getApiErrorMessage(error);
      setErrors(prev => ({ ...prev, [tempId]: message }));
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [tempId]: { ...prev[tempId], saving: false }
      }));
    }
  };

  const handlePublishQuestion = async (tempId: string) => {
    const questionToPublish = questions.find(q => q.tempId === tempId);
    if (!questionToPublish) return;

    setLoadingStates(prev => ({
      ...prev,
      [tempId]: { ...prev[tempId], publishing: true }
    }));

    const publishedQuestion = { ...questionToPublish, status: 'published' };

    try {
      let savedQuestion: any;
      const questionData = prepareQuestionForApi(publishedQuestion);

      if (questionToPublish._id) {
        savedQuestion = await updateQuestion(questionToPublish._id, questionData);
      } else {
        savedQuestion = await createQuestion(questionData);
      }
      
      const saved = savedQuestion.data;
      setQuestions(prev =>
        prev.map(q => q.tempId === tempId ? {
          ...q,
          _id: saved._id,
          conditionalLogic: saved.conditionalLogic,
          isStandardDemographic: saved.isStandardDemographic,
          demographicType: saved.demographicType,
          demographicCategory: saved.demographicCategory,
          demographicMetadata: saved.demographicMetadata,
          status: saved.status ?? 'published',
        } : q)
      );
      setErrors(prev => ({ ...prev, [tempId]: null }));

      toast({
        title: 'Question Published',
        description: 'Question published successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error publishing question:', error);
      const message = getApiErrorMessage(error);
      setErrors(prev => ({ ...prev, [tempId]: message }));
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [tempId]: { ...prev[tempId], publishing: false }
      }));
    }
  };

  const handleUnpublishQuestion = async (tempId: string) => {
    const questionToUnpublish = questions.find(q => q.tempId === tempId);
    if (!questionToUnpublish?._id) return;

    setLoadingStates(prev => ({
      ...prev,
      [tempId]: { ...prev[tempId], unpublishing: true }
    }));

    const draftQuestion = { ...questionToUnpublish, status: 'draft' };

    try {
      const savedQuestion = await updateQuestion(questionToUnpublish._id, prepareQuestionForApi(draftQuestion));
      const saved = savedQuestion.data;
      setQuestions(prev =>
        prev.map(q => q.tempId === tempId ? { ...q, status: saved.status ?? 'draft' } : q)
      );
      setErrors(prev => ({ ...prev, [tempId]: null }));

      toast({
        title: 'Question Unpublished',
        description: 'Question returned to draft',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error unpublishing question:', error);
      const message = getApiErrorMessage(error);
      setErrors(prev => ({ ...prev, [tempId]: message }));
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [tempId]: { ...prev[tempId], unpublishing: false }
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-concrete-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-stratosphere border-t-transparent rounded-full"></div>
            <p className="text-sky-500">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-concrete-50">
      <div className="container mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/admin/questions')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white text-stratosphere hover:bg-sky-100 border border-stratosphere-200 transition-all shadow-sm hover:shadow-md mt-1"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-stratosphere mb-1">
                {questionId ? 'Edit Question' : 'Create Question'}
              </h1>
              <p className="text-sky-500">Build effective survey questions with proper metadata and validation</p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/admin/questions')}
            variant="outline"
            className="border-stratosphere text-stratosphere hover:bg-sky-50"
          >
            Back to Question Bank
          </Button>
        </div>

        {/* Guidance Card */}
        {showGuidance && !questionId && (
          <Alert className="mb-6 bg-gradient-to-r from-stratosphere-50 to-sky-50 border-stratosphere-200">
            <Sparkles className="h-4 w-4 text-stratosphere" />
            <AlertTitle className="text-stratosphere font-semibold">Creating Effective Questions</AlertTitle>
            <AlertDescription className="text-sky-700">
              <p className="mb-3">Great questions are clear, specific, and properly categorized. Here's an example:</p>
              <div className="bg-white rounded-lg p-4 border border-stratosphere-100 space-y-2">
                <div>
                  <span className="text-xs font-medium text-stratosphere">Question Text:</span>
                  <p className="text-sm text-stratosphere-900">{EXAMPLE_QUESTION.text}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-stratosphere">Description:</span>
                  <p className="text-sm text-sky-600">{EXAMPLE_QUESTION.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs px-2 py-1 bg-forest-50 text-forest-700 rounded border border-forest-200">
                    {EXAMPLE_QUESTION.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded border border-sky-200">
                    {EXAMPLE_QUESTION.theme}
                  </span>
                  <span className="text-xs px-2 py-1 bg-clay-50 text-clay-700 rounded border border-clay-200">
                    {EXAMPLE_QUESTION.subTheme}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGuidance(false)}
                className="text-xs text-stratosphere hover:text-stratosphere-900 underline mt-3"
              >
                Dismiss guidance
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-stratosphere-100 p-1 shadow-sm">
            <TabsTrigger 
              value="questions"
              className="data-[state=active]:bg-stratosphere data-[state=active]:text-white text-stratosphere"
            >
              <FileText className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="data-[state=active]:bg-stratosphere data-[state=active]:text-white text-stratosphere"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions" className="space-y-6">
            {/* Settings Sheet — single instance covers all questions */}
            {(() => {
              const activeQuestion = questions.find(q => q.tempId === activeSettings.questionId);
              return (
                <Sheet
                  open={activeSettings.questionId !== null && activeSettings.panel !== null}
                  onOpenChange={(open) => { if (!open) setActiveSettings({ questionId: null, panel: null }); }}
                >
                  <SheetContent
                    side="right"
                    className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto flex flex-col"
                  >
                    {activeQuestion && activeSettings.panel === 'metadata' && (
                      <>
                        <SheetHeader className="px-6 py-4 border-b border-stratosphere-100 bg-gradient-to-r from-stratosphere-50 to-sky-50 flex-shrink-0">
                          <SheetTitle className="text-stratosphere flex items-center gap-2 text-base">
                            <Settings className="h-4 w-4" />
                            Metadata Settings
                          </SheetTitle>
                        </SheetHeader>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                          <Alert className="bg-sky-50 border-sky-200">
                            <Info className="h-4 w-4 text-sky-700" />
                            <AlertDescription className="text-xs text-sky-700">
                              Add metadata to make your questions discoverable and properly categorized
                            </AlertDescription>
                          </Alert>
                          <MetadataPanel
                            question={activeQuestion}
                            onChange={(updatedQuestion) => handleQuestionChange(activeQuestion.tempId, updatedQuestion)}
                            categories={categories}
                            themes={themes}
                            subThemes={subThemes}
                            indicators={indicators}
                            sdgs={sdgs}
                            standards={standards}
                            esgCategories={esgCategories}
                            resilienceDimensions={resilienceDimensions}
                          />
                        </div>
                      </>
                    )}
                    {activeQuestion && activeSettings.panel === 'validation' && (
                      <>
                        <SheetHeader className="px-6 py-4 border-b border-stratosphere-100 bg-gradient-to-r from-ochre-50 to-sand-50 flex-shrink-0">
                          <SheetTitle className="text-stratosphere flex items-center gap-2 text-base">
                            <Eye className="h-4 w-4" />
                            Validation Settings
                          </SheetTitle>
                        </SheetHeader>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                          <Alert className="bg-ochre-50 border-ochre-200">
                            <Info className="h-4 w-4 text-ochre-700" />
                            <AlertDescription className="text-xs text-ochre-700">
                              Set validation rules to ensure respondents provide quality data
                            </AlertDescription>
                          </Alert>
                          <ValidationPanel
                            question={activeQuestion}
                            onChange={(updatedQuestion) => handleQuestionChange(activeQuestion.tempId, updatedQuestion)}
                          />
                        </div>
                      </>
                    )}
                  </SheetContent>
                </Sheet>
              );
            })()}

            {questions.map((question, index) => (
              <div key={question.tempId} className="bg-white rounded-xl border-2 border-stratosphere-100 shadow-md hover:shadow-lg transition-all overflow-hidden">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-stratosphere to-stratosphere-900 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg">
                          <span className="text-white font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{question.text || 'Untitled Question'}</h3>
                          <div className="flex items-center space-x-2 text-sm mt-1">
                            <span className="text-sky-100 capitalize">
                              {QUESTION_TYPE_CONFIG[question.type as QuestionType]?.icon} {QUESTION_TYPE_CONFIG[question.type as QuestionType]?.label}
                            </span>
                            {question.required && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sand-500 text-white">
                                Required
                              </span>
                            )}
                            {question.status === 'published' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-grass-500 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Published
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Form */}
                  <div className="p-6">
                    <QuestionForm 
                      question={question}
                      onChange={(updatedQuestion) => handleQuestionChange(question.tempId, updatedQuestion)}
                      categories={categories}
                      themes={themes}
                      subThemes={subThemes}
                      indicators={indicators}
                      sdgs={sdgs}
                      standards={standards}
                      esgCategories={esgCategories}
                      resilienceDimensions={resilienceDimensions}
                      condensed={true}
                    />
                  </div>

                  {/* Question Actions */}
                  <div className="bg-concrete-50 px-6 py-4 border-t border-stratosphere-100 space-y-3">
                    {errors[question.tempId] && (
                      <div className="flex items-start gap-2 rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-sand-800">
                        <AlertCircle className="h-4 w-4 text-sand-600 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{errors[question.tempId]}</span>
                        <button
                          onClick={() => setErrors(prev => ({ ...prev, [question.tempId]: null }))}
                          className="text-sand-500 hover:text-sand-700 flex-shrink-0"
                          aria-label="Dismiss error"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      onClick={() => handleAddQuestion(index)}
                      variant="outline"
                      size="sm"
                      className="border-stratosphere text-stratosphere hover:bg-sky-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => toggleSettingsPanel(question.tempId, 'validation')}
                        variant="outline"
                        size="sm"
                        className={`${
                          activeSettings.questionId === question.tempId && activeSettings.panel === 'validation'
                            ? 'bg-sky-100 text-stratosphere border-sky-300'
                            : 'border-stratosphere text-stratosphere hover:bg-sky-50'
                        }`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Validation
                      </Button>
                      
                      <Button
                        onClick={() => toggleSettingsPanel(question.tempId, 'metadata')}
                        variant="outline"
                        size="sm"
                        className={`${
                          activeSettings.questionId === question.tempId && activeSettings.panel === 'metadata'
                            ? 'bg-sky-100 text-stratosphere border-sky-300'
                            : 'border-stratosphere text-stratosphere hover:bg-sky-50'
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Metadata
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-stratosphere text-stratosphere hover:bg-sky-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-stratosphere">
                          <DropdownMenuItem 
                            onClick={() => handleRemoveQuestion(question.tempId)}
                            className="text-sand-700 focus:text-sand-900"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        onClick={() => handleSaveQuestion(question.tempId)}
                        disabled={loadingStates[question.tempId]?.saving}
                        variant="outline"
                        size="sm"
                        className="border-stratosphere text-stratosphere hover:bg-sky-50"
                      >
                        {loadingStates[question.tempId]?.saving ? (
                          <>
                            <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-stratosphere border-t-transparent" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>

                      {question.status === 'published' ? (
                        <Button
                          onClick={() => handleUnpublishQuestion(question.tempId)}
                          disabled={loadingStates[question.tempId]?.unpublishing}
                          size="sm"
                          variant="outline"
                          className="border-grass-500 text-grass-700 hover:bg-grass-50"
                        >
                          {loadingStates[question.tempId]?.unpublishing ? (
                            <>
                              <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-grass-600 border-t-transparent" />
                              Unpublishing...
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Unpublish
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePublishQuestion(question.tempId)}
                          disabled={loadingStates[question.tempId]?.publishing}
                          size="sm"
                          className="bg-stratosphere hover:bg-stratosphere-900 text-white"
                        >
                          {loadingStates[question.tempId]?.publishing ? (
                            <>
                              <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Publishing...
                            </>
                          ) : (
                            'Publish'
                          )}
                        </Button>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-stratosphere-200">
                <div className="mx-auto w-16 h-16 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-stratosphere" />
                </div>
                <h3 className="text-lg font-semibold text-stratosphere mb-2">No questions yet</h3>
                <p className="text-sky-500 mb-6">Get started by adding your first question</p>
                <Button 
                  onClick={() => handleAddQuestion(-1)}
                  className="bg-stratosphere hover:bg-stratosphere-900 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.tempId} className="bg-white rounded-xl border-2 border-stratosphere-100 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-stratosphere-50 to-sky-50 px-6 py-4 border-b border-stratosphere-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-stratosphere text-white rounded-lg font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stratosphere">{question.text}</h3>
                        <p className="text-sm text-sky-500 capitalize">
                          {QUESTION_TYPE_CONFIG[question.type as QuestionType]?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {question.required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sand-100 text-sand-900 border border-sand-300">
                          Required
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        question.status === 'published' 
                          ? 'bg-grass-100 text-grass-900 border border-grass-300' 
                          : 'bg-concrete-100 text-stratosphere border border-concrete-300'
                      }`}>
                        {question.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <PreviewQuestion question={question} />
                </div>
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="bg-white rounded-xl border-2 border-dashed border-stratosphere-200 p-16 text-center">
                <div className="mx-auto w-20 h-20 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="h-10 w-10 text-stratosphere" />
                </div>
                <h3 className="text-lg font-semibold text-stratosphere mb-2">No questions to preview</h3>
                <p className="text-sky-500 mb-6">Add some questions first to see how they'll look to respondents</p>
                <Button 
                  onClick={() => setActiveTab('questions')}
                  className="bg-stratosphere hover:bg-stratosphere-900 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestionBuilderContent;