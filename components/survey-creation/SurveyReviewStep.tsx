// components/survey-creation/SurveyReviewStep.tsx
'use client';

import { 
  CheckCircle, 
  ArrowLeft, 
  FileText, 
  Layers, 
  Settings, 
  Users, 
  Clock, 
  Globe, 
  Lock,
  Mail,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SurveyCreationContextType, categoryOptions } from '@/types/survey-creation';

interface SurveyReviewStepProps {
  context: SurveyCreationContextType;
  onBack: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export default function SurveyReviewStep({ 
  context, 
  onBack, 
  onSubmit, 
  isCreating 
}: SurveyReviewStepProps) {
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

  const getCategoryLabel = () => {
    const category = categoryOptions.find(cat => cat.value === formData.category);
    return formData.category === 'custom' 
      ? formData.customCategoryName 
      : category?.label || formData.category;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Survey Overview */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-c4c-petrol" />
            Survey Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-black">
              {formData.title}
            </h3>
            <p className="text-c4c-petrol mt-1">{formData.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-c4c-petrol">{totalQuestions}</div>
              <div className="text-sm text-c4c-petrol">Total Questions</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-c4c-petrol">{requiredQuestions}</div>
              <div className="text-sm text-c4c-petrol">Required</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-c4c-cobalt">{questionsWithLogic}</div>
              <div className="text-sm text-c4c-petrol">Conditional</div>
            </div>
            <div className="text-center p-3 bg-c4c-grey-bg rounded-lg">
              <div className="text-2xl font-bold text-c4c-sage">{formData.estimatedDuration}</div>
              <div className="text-sm text-c4c-petrol">Minutes</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-c4c-rule text-c4c-petrol">
              {getCategoryLabel()}
            </Badge>
            {formData.settings.isPublic ? (
              <Badge className="bg-c4c-tint-sage text-c4c-petrol">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            {formData.settings.allowAnonymous && (
              <Badge className="bg-c4c-tint-cyan text-c4c-petrol">
                Anonymous Allowed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Structure Overview */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-c4c-petrol" />
            Survey Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section._id} className="border border-c4c-rule rounded-lg p-4 bg-c4c-grey-bg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-black">
                    Section {index + 1}: {section.title}
                  </h4>
                  <Badge variant="outline">
                    {section.questions.length} questions
                  </Badge>
                </div>
                {section.description && (
                  <p className="text-sm text-c4c-petrol mb-3">{section.description}</p>
                )}
                <div className="space-y-2">
                  {section.questions.map((questionItem, qIndex) => (
                    <div key={questionItem.questionId} className="flex items-center gap-2 text-sm">
                      <span className="text-c4c-petrol font-mono">
                        {index + 1}.{qIndex + 1}
                      </span>
                      <span className="flex-1 text-black">
                        {questionItem.customText || questionItem.question?.text}
                      </span>
                      <div className="flex gap-1">
                        {questionItem.required && (
                          <Badge variant="outline" className="text-xs bg-c4c-tint-gold text-c4c-petrol">
                            Required
                          </Badge>
                        )}
                        {questionItem.conditionalLogic?.enabled && (
                          <Badge variant="outline" className="text-xs bg-c4c-tint-cyan text-c4c-petrol">
                            Conditional
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Unassigned Questions */}
            {unassignedQuestions.length > 0 && (
              <div className="border border-c4c-rule rounded-lg p-4 bg-c4c-grey-bg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-black">
                    Unassigned Questions
                  </h4>
                  <Badge variant="outline">
                    {unassignedQuestions.length} questions
                  </Badge>
                </div>
                <div className="space-y-2">
                  {unassignedQuestions.map((questionItem, index) => (
                    <div key={questionItem.questionId} className="flex items-center gap-2 text-sm">
                      <span className="text-c4c-petrol font-mono">
                        {sections.length + 1}.{index + 1}
                      </span>
                      <span className="flex-1 text-black">
                        {questionItem.customText || questionItem.question?.text}
                      </span>
                      <div className="flex gap-1">
                        {questionItem.required && (
                          <Badge variant="outline" className="text-xs bg-c4c-tint-gold text-c4c-petrol">
                            Required
                          </Badge>
                        )}
                        {questionItem.conditionalLogic?.enabled && (
                          <Badge variant="outline" className="text-xs bg-c4c-tint-cyan text-c4c-petrol">
                            Conditional
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card className="bg-white border-c4c-rule">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-c4c-petrol" />
            Settings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Access Control */}
            <div>
              <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Access Control
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Visibility:</span>
                  <span className="text-black">
                    {formData.settings.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Requires Auth:</span>
                  <span className="text-black">
                    {formData.settings.requiresAuth ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Anonymous:</span>
                  <span className="text-black">
                    {formData.settings.allowAnonymous ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Response Settings */}
            <div>
              <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Response Settings
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Multiple Responses:</span>
                  <span className="text-black">
                    {formData.settings.allowMultipleResponses ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
                {formData.settings.allowMultipleResponses && (
                  <div className="flex justify-between">
                    <span className="text-c4c-petrol">Max per User:</span>
                    <span className="text-black">
                      {formData.settings.maxResponses || 'Unlimited'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Start Date:</span>
                  <span className="text-black">
                    {formatDate(formData.settings.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">End Date:</span>
                  <span className="text-black">
                    {formatDate(formData.settings.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* User Experience */}
            <div>
              <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                User Experience
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Progress Bar:</span>
                  <span className="text-black">
                    {formData.settings.showProgressBar ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Save & Continue:</span>
                  <span className="text-black">
                    {formData.settings.allowSaveAndContinue ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-c4c-petrol">Random Order:</span>
                  <span className="text-black">
                    {formData.settings.randomizeQuestions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Notifications */}
          <div>
            <h4 className="font-medium text-black mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-c4c-petrol">Confirmation Email:</span>
                <span className="text-black">
                  {formData.settings.sendConfirmationEmail ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-c4c-petrol">Response Notifications:</span>
                <span className="text-black">
                  {formData.settings.notifyOnResponse ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {totalQuestions === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your survey has no questions. Please go back to add questions before creating.
          </AlertDescription>
        </Alert>
      )}

      {unassignedQuestions.length > 0 && sections.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {unassignedQuestions.length} unassigned questions. These will appear after all sections.
          </AlertDescription>
        </Alert>
      )}

      {questionsWithLogic > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {questionsWithLogic} questions have conditional logic. Make sure the logic is configured correctly.
          </AlertDescription>
        </Alert>
      )}

      {/* Final Actions */}
      <Card className="bg-c4c-grey-bg border-c4c-rule">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-c4c-petrol">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to Create Survey</span>
            </div>
            <p className="text-sm text-c4c-petrol max-w-md mx-auto">
              Review the details above and click "Create Survey" to finalize your survey. 
              You can make changes after creation if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back: Survey Settings
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isCreating || totalQuestions === 0}
          className="bg-c4c-coral text-black hover:bg-c4c-petrol hover:text-white"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Survey...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Survey
            </>
          )}
        </Button>
      </div>
    </div>
  );
}