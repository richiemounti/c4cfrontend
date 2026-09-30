// components/survey-creation/SurveySidebar.tsx
'use client';

import { 
  FileText, 
  Layers, 
  Settings, 
  Eye, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SurveyCreationContextType, SurveyCreationStep } from '@/types/survey-creation';

interface SurveySidebarProps {
  context: SurveyCreationContextType;
  currentStep: SurveyCreationStep;
  project: any;
}

export default function SurveySidebar({ context, currentStep, project }: SurveySidebarProps) {
  const { 
    formData, 
    sections, 
    unassignedQuestions, 
    questionsData,
    getAllQuestions 
  } = context;

  const allQuestions = getAllQuestions();
  const totalQuestions = allQuestions.length;
  const requiredQuestions = allQuestions.filter(q => q.required).length;
  const questionsWithLogic = allQuestions.filter(q => q.conditionalLogic?.enabled).length;
  const totalSections = sections.length;

  const getStepStatus = (step: SurveyCreationStep) => {
    const stepOrder = ['details', 'structure', 'settings', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (step: SurveyCreationStep) => {
    const status = getStepStatus(step);
    const iconClass = "h-4 w-4";
    
    switch (step) {
      case 'details':
        return <FileText className={iconClass} />;
      case 'structure':
        return <Layers className={iconClass} />;
      case 'settings':
        return <Settings className={iconClass} />;
      case 'review':
        return <Eye className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const stepProgress = () => {
    const stepOrder = ['details', 'structure', 'settings', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return ((currentIndex + 1) / stepOrder.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-black">
            Project Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-c4c-petrol">Project:</span>
            <div className="font-medium text-black mt-1">
              {project?.name || 'Loading...'}
            </div>
          </div>
          <div>
            <span className="text-c4c-petrol">Survey Category:</span>
            <div className="font-medium text-black mt-1">
              {formData.category === 'custom' ? formData.customCategoryName : formData.category}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-black">
            Creation Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-c4c-petrol">Overall Progress</span>
              <span className="text-black">{Math.round(stepProgress())}%</span>
            </div>
            <Progress value={stepProgress()} className="h-2" />
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'details', label: 'Survey Details' },
              { key: 'structure', label: 'Survey Structure' },
              { key: 'settings', label: 'Survey Settings' },
              { key: 'review', label: 'Review & Create' }
            ].map(step => {
              const status = getStepStatus(step.key as SurveyCreationStep);
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs
                    ${status === 'completed' ? 'bg-c4c-tint-sage text-c4c-petrol' :
                      status === 'current' ? 'bg-c4c-rule text-c4c-petrol' :
                      'bg-c4c-grey-bg text-c4c-petrol'}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      getStepIcon(step.key as SurveyCreationStep)
                    )}
                  </div>
                  <span className={`text-sm ${
                    status === 'current' ? 'font-medium text-black' : 'text-c4c-petrol'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Survey Summary */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-black flex items-center gap-2">
            <Info className="h-4 w-4" />
            Survey Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          {formData.title && (
            <div>
              <span className="text-c4c-petrol text-sm">Title:</span>
              <div className="font-medium text-black text-sm mt-1 line-clamp-2">
                {formData.title}
              </div>
            </div>
          )}

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-lg font-bold text-c4c-petrol">{totalQuestions}</div>
              <div className="text-xs text-c4c-petrol">Questions</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-lg font-bold text-c4c-petrol">{totalSections}</div>
              <div className="text-xs text-c4c-petrol">Sections</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-c4c-petrol">Required:</span>
              <Badge variant="outline" className="text-xs">
                {requiredQuestions}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-c4c-petrol">Conditional:</span>
              <Badge variant="outline" className="text-xs">
                {questionsWithLogic}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-c4c-petrol">Unassigned:</span>
              <Badge variant="outline" className="text-xs">
                {unassignedQuestions.length}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Duration */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-c4c-petrol" />
            <span className="text-sm text-c4c-petrol">Estimated Duration:</span>
            <Badge className="bg-c4c-tint-sage text-c4c-petrol text-xs">
              {formData.estimatedDuration} min
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {currentStep === 'structure' && (
        <Card className="bg-white border-c4c-rule">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-black flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-c4c-petrol" />
              Structure Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-c4c-petrol">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-c4c-petrol rounded-full mt-2 flex-shrink-0"></div>
              <span>Organize related questions into sections for better user experience</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-c4c-petrol rounded-full mt-2 flex-shrink-0"></div>
              <span>Use conditional logic to show/hide questions based on responses</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-c4c-petrol rounded-full mt-2 flex-shrink-0"></div>
              <span>Mark important questions as required</span>
            </div>
          </CardContent>
        </Card>
      )}

      {unassignedQuestions.length > 0 && currentStep === 'review' && (
        <Card className="bg-c4c-tint-gold border-c4c-yellow">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-black text-sm">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {unassignedQuestions.length} unassigned questions
              </span>
            </div>
            <p className="text-xs text-c4c-petrol mt-1">
              These questions will appear after all sections
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}