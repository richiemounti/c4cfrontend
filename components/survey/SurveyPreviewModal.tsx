// components/survey/SurveyPreviewModal.tsx
'use client';

import { X, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionPreview } from './QuestionPreview';

interface SurveyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  structure: any;
}

export const SurveyPreviewModal = ({ isOpen, onClose, structure }: SurveyPreviewModalProps) => {
  if (!isOpen) return null;

  const allSections = [
    ...(structure.sections || []),
    ...(structure.noSectionQuestions?.length > 0 ? [{
      _id: 'no-section',
      title: 'Additional Questions',
      description: '',
      questions: structure.noSectionQuestions,
    }] : []),
  ];

  const totalQuestions = allSections.reduce(
    (total: number, section: any) => total + (section.questions?.length || 0),
    0
  );

  const getOptions = (question: any) => {
    const questionType = question.question?.type || 'text';
    if (questionType === 'scale') {
      const sc = question.question?.scaleConfig;
      if (sc?.scaleOptions?.length) {
        return sc.scaleOptions.map((opt: any) => ({
          value: String(opt.value),
          label: String(opt.label ?? opt.value),
        }));
      }
      if (question.question?.options?.length) {
        return question.question.options.map((opt: any) => ({
          value: String(opt.value ?? opt),
          label: String(opt.label ?? opt.value ?? opt),
        }));
      }
      return undefined;
    }
    return question.question?.options?.map((opt: any) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-concrete-500/20">
          <div>
            <h2 className="text-xl font-semibold text-stratosphere-900">Survey Preview</h2>
            <p className="text-sm text-sky-500 mt-0.5">{totalQuestions} questions</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Survey title card — mirrors the edit page header */}
            <Card className="border-2 border-clay-500/20 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="border-l-4 border-clay-500 pl-6">
                  <h1 className="text-3xl font-bold text-stratosphere-900">
                    {structure.survey?.title}
                  </h1>
                  {structure.survey?.description && (
                    <p className="text-sky-500 mt-2">{structure.survey.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sections + questions */}
            {allSections.map((section: any) => (
              <div key={section._id} className="space-y-4">
                {section._id !== 'no-section' && (
                  <Card className="border border-concrete-500/20 bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-stratosphere-900">
                        <FileText className="h-5 w-5 text-clay-500" />
                        {section.title}
                        <Badge className="ml-auto bg-concrete-50 text-sky-500 border-concrete-500/20 text-xs">
                          {section.questions?.length || 0} questions
                        </Badge>
                      </CardTitle>
                      {section.description && (
                        <p className="text-sm text-sky-500">{section.description}</p>
                      )}
                    </CardHeader>
                  </Card>
                )}

                {section.questions?.map((question: any, index: number) => {
                  const questionType = question.question?.type || 'text';
                  const questionText = question.customText || question.question?.text || '';

                  return (
                    <Card
                      key={question._id}
                      className="border border-concrete-500/20 shadow-md bg-white"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-sky-50 rounded-full text-sm font-medium text-sky-500 flex-shrink-0 mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-stratosphere-900 text-lg">
                                {questionText}
                                {question.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </h4>
                              {question.customDescription && (
                                <p className="text-sky-500 mt-1 text-sm">
                                  {question.customDescription}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-12">
                            <QuestionPreview
                              type={questionType}
                              options={getOptions(question)}
                              scaleConfig={question.question?.scaleConfig}
                              matrixConfig={question.question?.matrixConfig}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
