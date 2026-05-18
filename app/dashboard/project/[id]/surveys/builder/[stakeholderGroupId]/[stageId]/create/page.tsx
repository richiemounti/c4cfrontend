// app/dashboard/project/[id]/surveys/builder/[stakeholderGroupId]/[stageId]/create/page.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { useToast } from "@/hooks/use-toast";

// Import our components (SurveyStructureStep removed — only available in edit)
import SurveyDetailsStep from '@/components/survey-creation/SurveyDetailsStep';
import SurveySettingsStep from '@/components/survey-creation/SurveySettingsStep';
import SurveyReviewStep from '@/components/survey-creation/SurveyReviewStep';
import SurveySidebar from '@/components/survey-creation/SurveySidebar';

// Import types and APIs
import { 
  PageParams, 
  Question,
  SurveyQuestionItem, 
  SurveyCreationStep,
  SurveyCreationContextType,
  SurveySection,
  SurveyFormData,
  SurveyCreationResult,
  transformToBackendRequest,
  calculateSurveyDuration
} from '@/types/survey-creation';
import { getProject, getProjectSites  } from '@/lib/api/project';
import { fetchQuestions } from '@/lib/api/question';
import { createSurvey, getSurvey } from '@/lib/api/survey';
import { createSurveySection } from '@/lib/api/surveySection';
import { addQuestionToSurvey } from '@/lib/api/surveyQuestion';
import { 
  CreateSurveySectionRequest, 
  AddQuestionToSurveyRequest,
  Survey,
  ApiResponse
} from '@/types';

// Enhanced survey creation function with database consistency handling
const handleCreateSurvey = async (
  surveyData: SurveyFormData,
  sectionsData: SurveySection[],
  questionsData: SurveyQuestionItem[],
  projectContext: {
    projectId: string;
    stakeholderGroupId?: string;
    stageId?: string;
  }
): Promise<SurveyCreationResult> => {
  let surveyId: string | null = null;
  const errors: string[] = [];
  
  try {
    // Step 1: Transform SurveyFormData to the format expected by unified survey controller
    const createSurveyRequest = transformToBackendRequest(surveyData, projectContext);

    console.log('📝 Creating survey with data:', JSON.stringify(createSurveyRequest, null, 2));
    const surveyResponse: ApiResponse<Survey> = await createSurvey(createSurveyRequest);
    console.log('📤 Survey creation response:', JSON.stringify(surveyResponse, null, 2));
    
    if (!surveyResponse.success || !surveyResponse.data?._id) {
      throw new Error('Failed to create survey');
    }
    
    surveyId = surveyResponse.data._id;
    console.log('✅ Survey created with ID:', surveyId);
    
    // Step 2: Enhanced verification with longer waits and retries
    console.log('⏳ Waiting for database transaction and replication to complete...');
    
    const maxVerificationAttempts = 5;
    let verificationAttempt = 0;
    let surveyVerified = false;
    
    while (verificationAttempt < maxVerificationAttempts && !surveyVerified) {
      verificationAttempt++;
      const waitTime = Math.min(1000 * Math.pow(2, verificationAttempt - 1), 8000);
      
      console.log(`🔍 Verification attempt ${verificationAttempt}: Waiting ${waitTime}ms then checking if survey exists...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      try {
        const verificationResponse: ApiResponse<Survey> = await getSurvey(surveyId);
        if (verificationResponse.success && verificationResponse.data?._id === surveyId) {
          console.log(`✅ Survey verified on attempt ${verificationAttempt}`);
          surveyVerified = true;
          
          console.log('⏳ Additional consistency wait...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log(`❌ Survey verification failed on attempt ${verificationAttempt}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Survey verification error on attempt ${verificationAttempt}:`, errorMessage);
      }
    }
    
    if (!surveyVerified) {
      throw new Error('Survey could not be verified after creation');
    }
    
    // Step 3: Create sections with enhanced error handling and retries
    // NOTE: In the create flow sections will always be empty — structure is managed in edit
    const sectionResults: Array<{ success: boolean; sectionId?: string; originalIndex: number }> = [];
    
    for (let i = 0; i < sectionsData.length; i++) {
      const sectionData = sectionsData[i];
      console.log(`📁 Creating section ${i + 1}/${sectionsData.length}: ${sectionData.title}`);
      
      let sectionCreated = false;
      let sectionId: string | undefined = undefined;
      const maxSectionAttempts = 5;
      
      for (let attempt = 1; attempt <= maxSectionAttempts; attempt++) {
        try {
          console.log(`📁 Section creation attempt ${attempt} for section ${i + 1}`);
          
          if (attempt > 1) {
            const retryWait = 2000 * attempt;
            console.log(`⏳ Waiting ${retryWait}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryWait));
          }
          
          const createSectionRequest: CreateSurveySectionRequest = {
            title: sectionData.title,
            description: sectionData.description,
            order: sectionData.order
          };
          
          const sectionResponse: ApiResponse<any> = await createSurveySection(surveyId, createSectionRequest);
          
          if (sectionResponse.success && sectionResponse.data?._id) {
            sectionId = sectionResponse.data._id;
            sectionCreated = true;
            console.log(`✅ Section ${i + 1} created successfully with ID: ${sectionId}`);
            break;
          } else {
            console.log(`❌ Section creation failed on attempt ${attempt}:`, sectionResponse);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Section creation error on attempt ${attempt}:`, errorMessage);
          
          if (errorMessage.toLowerCase().includes('survey not found')) {
            console.log('🔍 Survey not found error detected, adding extra consistency wait...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          if (attempt === maxSectionAttempts) {
            errors.push(`Failed to create section ${i + 1} after ${maxSectionAttempts} attempts`);
          }
        }
      }
      
      sectionResults.push({
        success: sectionCreated,
        sectionId: sectionId,
        originalIndex: i
      });
      
      if (i < sectionsData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 4: Create questions with section mapping and retries
    const questionResults: Array<{ success: boolean; originalIndex: number }> = [];
    
    for (let i = 0; i < questionsData.length; i++) {
      const questionItem = questionsData[i];
      console.log(`❓ Creating question ${i + 1}/${questionsData.length}`);
      
      let targetSectionId: string | undefined = undefined;
      if (questionItem.sectionId) {
        const sectionResult = sectionResults.find((result, index) => {
          const originalSection = sectionsData[index];
          return result.success && (
            originalSection._id === questionItem.sectionId ||
            originalSection.title === sectionsData.find(s => s._id === questionItem.sectionId)?.title
          );
        });
        
        if (sectionResult && sectionResult.success) {
          targetSectionId = sectionResult.sectionId;
        } else {
          console.log(`⚠️ Question ${i + 1} references non-existent section ${questionItem.sectionId}, adding to survey without section`);
        }
      }
      
      let questionCreated = false;
      const maxQuestionAttempts = 3;
      
      for (let attempt = 1; attempt <= maxQuestionAttempts; attempt++) {
        try {
          console.log(`❓ Question creation attempt ${attempt} for question ${i + 1}`);
          
          if (attempt > 1) {
            const retryWait = 1500 * attempt;
            await new Promise(resolve => setTimeout(resolve, retryWait));
          }
          
          const questionPayload: AddQuestionToSurveyRequest = {
            questionId: questionItem.questionId,
            sectionId: targetSectionId,
            required: questionItem.required,
            order: questionItem.order,
            customText: questionItem.customText,
            customDescription: questionItem.customDescription,
            customOptions: questionItem.customOptions,
            conditionalLogic: questionItem.conditionalLogic
          };
          
          const questionResponse: ApiResponse<any> = await addQuestionToSurvey(surveyId, questionPayload);
          
          if (questionResponse.success) {
            questionCreated = true;
            console.log(`✅ Question ${i + 1} created successfully`);
            break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Question creation error on attempt ${attempt}:`, errorMessage);
          
          if (attempt === maxQuestionAttempts) {
            errors.push(`Failed to create question ${i + 1} after ${maxQuestionAttempts} attempts: ${errorMessage}`);
          }
        }
      }
      
      questionResults.push({
        success: questionCreated,
        originalIndex: i
      });
      
      if (i < questionsData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const successfulSections = sectionResults.filter(r => r.success).length;
    const successfulQuestions = questionResults.filter(r => r.success).length;
    
    console.log(`📊 Survey creation completed:
            - Sections: ${successfulSections}/${sectionsData.length}
            - Questions: ${successfulQuestions}/${questionsData.length}
            - Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.warn('⚠️ Survey creation completed with errors:', errors);
    }
    
    return {
      success: true,
      surveyId,
      sections: successfulSections,
      questions: successfulQuestions,
      errors
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('❌ Survey creation failed:', error);
    
    return {
      success: false,
      error: errorMessage,
      surveyId: surveyId || undefined,
      sections: 0,
      questions: 0,
      errors: [...errors, errorMessage]
    };
  }
};

// Create React Context for survey creation state
const SurveyCreationContext = createContext<SurveyCreationContextType | null>(null);

// Step definitions for the 3-step create flow
// NOTE: 'structure' is intentionally excluded here — sections/ordering are managed in edit
type CreateFlowStep = 'details' | 'settings' | 'review';

const STEP_CONFIG: { step: CreateFlowStep; label: string; progress: number }[] = [
  { step: 'details',  label: 'Survey Details',  progress: 33  },
  { step: 'settings', label: 'Survey Settings', progress: 66  },
  { step: 'review',   label: 'Review & Create', progress: 100 },
];

const SurveyCreationPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, stakeholderGroupId, stageId } = params;
  
  // Core state
  const [project, setProject] = useState<any>(null);
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreateFlowStep>('details');
  
  // Survey structure state
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [unassignedQuestions, setUnassignedQuestions] = useState<SurveyQuestionItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form data state
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    category: 'baseline',
    customCategoryName: '',
    estimatedDuration: 10,
    settings: {
      isPublic: false,
      requiresAuth: true,
      allowAnonymous: false,
      allowMultipleResponses: false,
      maxResponses: undefined,
      startDate: undefined,
      endDate: undefined,
      showProgressBar: true,
      allowSaveAndContinue: true,
      randomizeQuestions: false,
      sendConfirmationEmail: false,
      notifyOnResponse: false,
    }
  });

  // Context value
  const contextValue: SurveyCreationContextType = {
    formData,
    setFormData,
    sections,
    setSections,
    unassignedQuestions,
    setUnassignedQuestions,
    questionsData,
    validationErrors,
    setValidationErrors,
    getAllQuestions: () => {
      const allQuestions: SurveyQuestionItem[] = [];
      sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
      allQuestions.push(...unassignedQuestions);
      return allQuestions;
    },
    moveQuestionToSection: (questionItem: SurveyQuestionItem, targetSectionId: string | null) => {
      const matchItem = (q: SurveyQuestionItem) =>
        questionItem._id ? q._id === questionItem._id : q.questionId === questionItem.questionId;
      setSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          questions: section.questions ? section.questions.filter(q => !matchItem(q)) : []
        }))
      );
      setUnassignedQuestions(prev => prev.filter(q => !matchItem(q)));

      if (targetSectionId) {
        setSections(prevSections =>
          prevSections.map(section => {
            if (section._id === targetSectionId) {
              return {
                ...section,
                questions: [...(section.questions || []), { ...questionItem, sectionId: targetSectionId }]
              };
            }
            return section;
          })
        );
      } else {
        setUnassignedQuestions(prev => [...prev, { ...questionItem, sectionId: undefined }]);
      }
    },
    updateQuestionLogic: (questionItem: SurveyQuestionItem, logic: any) => {
      const matchItem = (q: SurveyQuestionItem) =>
        questionItem._id ? q._id === questionItem._id : q.questionId === questionItem.questionId;
      const updateQuestion = (q: SurveyQuestionItem) =>
        matchItem(q)
          ? { ...q, conditionalLogic: logic }
          : q;

      setSections(prevSections => 
        prevSections.map(section => ({
          ...section,
          questions: section.questions ? section.questions.map(updateQuestion) : []
        }))
      );
      setUnassignedQuestions(prev => prev.map(updateQuestion));
    },
    handleInputChange: (field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    },
    handleSettingsChange: (field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: value
        }
      }));
    }
  };

  // Load project data
  const loadProject = async () => {
    try {
      setLoading(true);
      const projectResponse = await getProject(projectId);
      setProject(projectResponse.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load questions data from session storage
  const loadQuestionsData = async () => {
    try {
      const storedQuestions = sessionStorage.getItem('selectedQuestions');
      const storedDemographics = sessionStorage.getItem('selectedDemographics');
      
      if (!storedQuestions && !storedDemographics) {
        router.push(`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}`);
        return;
      }
      
      const questionIds: string[] = storedQuestions ? JSON.parse(storedQuestions) : [];
      const demographicIds: string[] = storedDemographics ? JSON.parse(storedDemographics) : [];

      if (questionIds.length === 0 && demographicIds.length === 0) {
        router.push(`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}`);
        return;
      }

      // Deduplicate IDs for the API fetch (same question may appear multiple times)
      const uniqueIds = [...new Set([...demographicIds, ...questionIds])];

      const response = await fetchQuestions({
        ids: uniqueIds.join(','),
        populate: 'theme,subTheme'
      });

      const allQuestions = response.data || [];
      setQuestionsData(allQuestions);

      const demographics = allQuestions.filter((q: Question) =>
        demographicIds.includes(q._id)
      );
      // Build one item per entry in questionIds (preserving duplicates across subthemes)
      const regularQuestionsOrdered = questionIds
        .map(id => allQuestions.find((q: Question) => q._id === id))
        .filter(Boolean) as Question[];
      
      // Process location demographics — fetch project sites
      let processedDemographics = [...demographics];
      
      const locationDemographics = demographics.filter((q: Question) => 
        q.isStandardDemographic && q.demographicType === 'location'
      );
      
      if (locationDemographics.length > 0) {
        try {
          const sitesResponse = await getProjectSites(projectId, 1, 100);
          const sites = sitesResponse.data;
          
          if (sites && sites.length > 0) {
            processedDemographics = demographics.map((q: Question) => {
              if (q.isStandardDemographic && q.demographicType === 'location') {
                return {
                  ...q,
                  type: 'dropdown' as const,
                  options: sites.map(site => ({
                    _id: site._id,
                    value: site._id,
                    label: site.name
                  })),
                  usingProjectSites: true
                };
              }
              return q;
            });
          } else {
            processedDemographics = demographics.map((q: Question) => {
              if (q.isStandardDemographic && q.demographicType === 'location') {
                return {
                  ...q,
                  type: 'text' as const,
                  options: undefined,
                  description: (q.description || '') + ' (No project sites available - free text entry)'
                };
              }
              return q;
            });
            
            toast({
              title: 'Info',
              description: 'No project sites found. Location demographics will use text input.',
              variant: 'default',
            });
          }
        } catch (error) {
          console.error('Failed to fetch project sites:', error);
          processedDemographics = demographics.map((q: Question) => {
            if (q.isStandardDemographic && q.demographicType === 'location') {
              return {
                ...q,
                type: 'text' as const,
                options: undefined,
                description: (q.description || '') + ' (Unable to load project sites - free text entry)'
              };
            }
            return q;
          });
          
          toast({
            title: 'Warning',
            description: 'Could not load project sites. Location demographics will use text input.',
            variant: 'default',
          });
        }
      }
      
      // Demographics first, then regular questions
      const demographicItems: SurveyQuestionItem[] = processedDemographics.map((q: Question, index: number) => ({
        _id: `inst_demo_${q._id}_${index}`,
        questionId: q._id,
        question: q,
        order: index + 1,
        required: q.demographicMetadata?.isRequired || false,
        customOptions: (q as any).usingProjectSites ? q.options?.map(opt => ({
          value: opt.value,
          label: opt.label
        })) : undefined,
        conditionalLogic: {
          enabled: false,
          conditions: [],
          action: 'show'
        }
      }));
      
      const regularQuestionItems: SurveyQuestionItem[] = regularQuestionsOrdered.map((q: Question, index: number) => ({
        _id: `inst_${q._id}_${index}`,
        questionId: q._id,
        question: q,
        order: processedDemographics.length + index + 1,
        required: false,
        conditionalLogic: {
          enabled: false,
          conditions: [],
          action: 'show'
        }
      }));
      
      const orderedQuestions = [...demographicItems, ...regularQuestionItems];
      setUnassignedQuestions(orderedQuestions);
      
      const totalTime = calculateSurveyDuration([], orderedQuestions, allQuestions);
      setFormData(prev => ({ ...prev, estimatedDuration: totalTime }));
      
    } catch (err) {
      console.error('Error loading questions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load question details',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadProject();
    loadQuestionsData();
  }, [projectId, stakeholderGroupId, stageId, router]);

  // Step navigation — 3-step flow: details → settings → review
  const handleNext = () => {
    if (currentStep === 'details') setCurrentStep('settings');
    else if (currentStep === 'settings') setCurrentStep('review');
  };

  const handleBack = () => {
    if (currentStep === 'settings') setCurrentStep('details');
    else if (currentStep === 'review') setCurrentStep('settings');
  };

  // Survey submission
  const handleCreateSurveySubmission = async () => {
    setIsCreating(true);
    
    try {
      const allQuestions = contextValue.getAllQuestions();
      
      const result = await handleCreateSurvey(
        formData,
        sections,
        allQuestions,
        {
          projectId,
          stakeholderGroupId,
          stageId
        }
      );

      if (result.success) {
        if (result.errors.length > 0) {
          toast({
            title: 'Survey Created with Issues',
            description: `Survey created with ${result.questions} questions. ${result.errors.length} items failed and can be added manually.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Survey Created Successfully',
            description: `Survey created with ${result.questions} questions. You can now organise them into sections from the survey editor.`,
          });
        }
        
        sessionStorage.removeItem('selectedQuestions');
        sessionStorage.removeItem('selectedDemographics');
        router.push(`/dashboard/project/${projectId}/surveys/${result.surveyId}`);
      } else {
        toast({
          title: 'Survey Creation Failed',
          description: result.error || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Survey creation error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during survey creation',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const currentStepConfig = STEP_CONFIG.find(s => s.step === currentStep)!;
  const currentStepNumber = STEP_CONFIG.findIndex(s => s.step === currentStep) + 1;

  if (questionsData.length === 0 && !loading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">No Questions Selected</h2>
            <p className="text-sky-500 mb-4">Please select questions before creating a survey</p>
            <Link href={`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}`}>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Back to Question Selection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SurveyCreationContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />

        <div className="flex-1">
          {/* Header */}
          <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
            <Link 
              href={`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}`}
              className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Question Selection
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-stratosphere-900">Create Survey</h1>
                <p className="text-sm text-sky-500 mt-1">
                  Configure your survey details and settings. You can organise questions into sections after creation.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm text-sky-500">
                  Step {currentStepNumber} of {STEP_CONFIG.length}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stratosphere-900">
                  {currentStepConfig.label}
                </span>
                <span className="text-sm text-sky-500">{currentStepConfig.progress}% complete</span>
              </div>
              <Progress value={currentStepConfig.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-2">
                {currentStep === 'details' && (
                  <SurveyDetailsStep
                    context={contextValue}
                    onNext={handleNext}
                  />
                )}

                {currentStep === 'settings' && (
                  <SurveySettingsStep
                    context={contextValue}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}

                {currentStep === 'review' && (
                  <SurveyReviewStep
                    context={contextValue}
                    onBack={handleBack}
                    onSubmit={handleCreateSurveySubmission}
                    isCreating={isCreating}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1">
                <SurveySidebar
                  context={contextValue}
                  currentStep={currentStep}
                  project={project}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurveyCreationContext.Provider>
  );
};

export default SurveyCreationPage;