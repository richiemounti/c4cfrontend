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
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-500" />
            Survey Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-stratosphere-900">
              {formData.title}
            </h3>
            <p className="text-sky-500 mt-1">{formData.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-stratosphere-50 rounded-lg">
              <div className="text-2xl font-bold text-sky-500">{totalQuestions}</div>
              <div className="text-sm text-stratosphere-600">Total Questions</div>
            </div>
            <div className="text-center p-3 bg-stratosphere-50 rounded-lg">
              <div className="text-2xl font-bold text-ochre-500">{requiredQuestions}</div>
              <div className="text-sm text-stratosphere-600">Required</div>
            </div>
            <div className="text-center p-3 bg-stratosphere-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{questionsWithLogic}</div>
              <div className="text-sm text-stratosphere-600">Conditional</div>
            </div>
            <div className="text-center p-3 bg-stratosphere-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-500">{formData.estimatedDuration}</div>
              <div className="text-sm text-stratosphere-600">Minutes</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-sky-100 text-sky-700">
              {getCategoryLabel()}
            </Badge>
            {formData.settings.isPublic ? (
              <Badge className="bg-emerald-100 text-emerald-700">
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
              <Badge className="bg-purple-100 text-purple-700">
                Anonymous Allowed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Structure Overview */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-500" />
            Survey Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section._id} className="border border-sky-200 rounded-lg p-4 bg-sky-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-stratosphere-900">
                    Section {index + 1}: {section.title}
                  </h4>
                  <Badge variant="outline">
                    {section.questions.length} questions
                  </Badge>
                </div>
                {section.description && (
                  <p className="text-sm text-sky-600 mb-3">{section.description}</p>
                )}
                <div className="space-y-2">
                  {section.questions.map((questionItem, qIndex) => (
                    <div key={questionItem.questionId} className="flex items-center gap-2 text-sm">
                      <span className="text-sky-500 font-mono">
                        {index + 1}.{qIndex + 1}
                      </span>
                      <span className="flex-1 text-stratosphere-700">
                        {questionItem.customText || questionItem.question?.text}
                      </span>
                      <div className="flex gap-1">
                        {questionItem.required && (
                          <Badge variant="outline" className="text-xs bg-ochre-100 text-ochre-700">
                            Required
                          </Badge>
                        )}
                        {questionItem.conditionalLogic?.enabled && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
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
              <div className="border border-concrete-500/20 rounded-lg p-4 bg-concrete-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-stratosphere-900">
                    Unassigned Questions
                  </h4>
                  <Badge variant="outline">
                    {unassignedQuestions.length} questions
                  </Badge>
                </div>
                <div className="space-y-2">
                  {unassignedQuestions.map((questionItem, index) => (
                    <div key={questionItem.questionId} className="flex items-center gap-2 text-sm">
                      <span className="text-sky-500 font-mono">
                        {sections.length + 1}.{index + 1}
                      </span>
                      <span className="flex-1 text-stratosphere-700">
                        {questionItem.customText || questionItem.question?.text}
                      </span>
                      <div className="flex gap-1">
                        {questionItem.required && (
                          <Badge variant="outline" className="text-xs bg-ochre-100 text-ochre-700">
                            Required
                          </Badge>
                        )}
                        {questionItem.conditionalLogic?.enabled && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
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
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-500" />
            Settings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Access Control */}
            <div>
              <h4 className="font-medium text-stratosphere-900 mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Access Control
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">Visibility:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Requires Auth:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.requiresAuth ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Anonymous:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.allowAnonymous ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Response Settings */}
            <div>
              <h4 className="font-medium text-stratosphere-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Response Settings
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">Multiple Responses:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.allowMultipleResponses ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
                {formData.settings.allowMultipleResponses && (
                  <div className="flex justify-between">
                    <span className="text-sky-600">Max per User:</span>
                    <span className="text-stratosphere-900">
                      {formData.settings.maxResponses || 'Unlimited'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h4 className="font-medium text-stratosphere-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">Start Date:</span>
                  <span className="text-stratosphere-900">
                    {formatDate(formData.settings.startDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">End Date:</span>
                  <span className="text-stratosphere-900">
                    {formatDate(formData.settings.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* User Experience */}
            <div>
              <h4 className="font-medium text-stratosphere-900 mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                User Experience
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sky-600">Progress Bar:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.showProgressBar ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Save & Continue:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.allowSaveAndContinue ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600">Random Order:</span>
                  <span className="text-stratosphere-900">
                    {formData.settings.randomizeQuestions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Notifications */}
          <div>
            <h4 className="font-medium text-stratosphere-900 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-sky-600">Confirmation Email:</span>
                <span className="text-stratosphere-900">
                  {formData.settings.sendConfirmationEmail ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-600">Response Notifications:</span>
                <span className="text-stratosphere-900">
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
      <Card className="bg-gradient-to-r from-sky-50 to-stratosphere-50 border-sky-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sky-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to Create Survey</span>
            </div>
            <p className="text-sm text-sky-500 max-w-md mx-auto">
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
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
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