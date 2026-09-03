// components/survey/SurveyForm.tsx
// The single interactive survey-taking experience. Rendered in `mode="live"`
// by the real public respondent page (app/survey/[surveyId]/page.tsx) and in
// `mode="preview"` by the dashboard survey preview
// (app/dashboard/project/[id]/surveys/[surveyId]/preview/page.tsx) so both
// surfaces are pixel-for-pixel identical except for whether answers are
// actually persisted.
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Send, CheckCircle, AlertCircle, Clock, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionInput, Question, TranslationOverrides } from './SurveyQuestionInput';

const defaultLogo = (
  <span
    style={{
      fontFamily: 'var(--font-rajdhani), sans-serif',
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '0.03em',
      color: '#1a1814',
    }}
  >
    Citizens for <span className="c4c-grad-text">Change</span>
  </span>
);

interface SurveyFormProps {
  survey?: { title?: string; description?: string } | null;
  questions: Question[];
  mode: 'live' | 'preview';
  translationMap?: Record<string, any>;
  translatedSurveyMeta?: { title?: string; description?: string };
  logo?: React.ReactNode;
  onSubmitAnswer?: (question: Question, answerValue: any, descriptorAnswers: Record<string, string>) => Promise<void>;
  onComplete?: () => Promise<void>;
}

export function SurveyForm({
  survey,
  questions,
  mode,
  translationMap = {},
  translatedSurveyMeta = {},
  logo = defaultLogo,
  onSubmitAnswer,
  onComplete,
}: SurveyFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [descriptorAnswers, setDescriptorAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const q = questions[currentIndex];
    if (q) {
      setCurrentAnswer(answers[q.question._id] ?? '');
      setCurrentFile(null);
      setDescriptorAnswers({});
      setValidationError('');
    }
  }, [currentIndex, questions]);

  const validateCurrent = (): boolean => {
    const q = questions[currentIndex];
    if (!q) return true;
    const isRequired = q.required || q.question.validation?.required;
    const val = currentFile || currentAnswer;
    if (isRequired && (!val || val === '' || (Array.isArray(val) && val.length === 0))) {
      setValidationError('This question is required');
      return false;
    }
    if (q.question.type === 'email' && currentAnswer) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentAnswer)) {
        setValidationError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrent()) return;
    const q = questions[currentIndex];
    const answerValue = currentFile || currentAnswer;
    if (q && (answerValue || answerValue === 0)) {
      setAnswers(prev => ({ ...prev, [q.question._id]: answerValue }));
      if (mode === 'live' && onSubmitAnswer) {
        try {
          await onSubmitAnswer(q, answerValue, descriptorAnswers);
        } catch (err) {
          console.error('Error submitting answer:', err);
        }
      }
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (mode === 'live' && onComplete) {
        await onComplete();
      }
      setIsComplete(true);
    } catch (err) {
      console.error('Error completing survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartPreview = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-forest-50 rounded flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-forest-500" />
            </div>
            <h2 className="text-2xl text-stratosphere-900 mb-3">
              {mode === 'preview' ? 'Preview complete' : 'Thank you!'}
            </h2>
            <p className="text-sky-500 mb-2">
              {mode === 'preview'
                ? 'This is the confirmation respondents will see. Nothing was saved.'
                : 'Your response has been submitted successfully.'}
            </p>
            {survey?.title && (
              <p className="text-sm text-concrete-500 mt-4">Survey: {survey.title}</p>
            )}
            {mode === 'preview' && (
              <Button variant="outline" className="mt-6" onClick={restartPreview}>
                Restart Preview
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-concrete-500/50 mx-auto mb-4" />
            <h2 className="text-xl text-stratosphere-900 mb-2">No Questions</h2>
            <p className="text-sky-500">This survey has no questions yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const tq = translationMap[currentQ._id] ?? null;
  const displayText = tq?.translatedText || currentQ.customText || currentQ.question.text;
  const displayDescription = tq?.translatedDescription || currentQ.customDescription || currentQ.question.description;
  const displayOptions = tq?.translatedOptions?.length ? tq.translatedOptions : undefined;
  const translationOverrides: TranslationOverrides | undefined = tq ? {
    scaleConfig: tq.translatedScaleConfig,
    matrixConfig: tq.translatedMatrixConfig,
  } : undefined;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 to-sky-50">
      {mode === 'preview' && (
        <div className="sticky top-0 z-20 bg-ochre-500 text-white px-6 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md">
          <Sparkles className="h-4 w-4" />
          Preview mode — this is exactly what respondents will see. Nothing you enter is saved.
        </div>
      )}

      <div className="bg-white border-b border-concrete-500/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo}
          </div>
          <div className="flex items-center gap-2 text-sm text-sky-500">
            <Clock className="h-4 w-4" />
            <span>{questions.length} questions</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {currentIndex === 0 && (survey?.title || translatedSurveyMeta.title) && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl text-stratosphere-900 mb-2">
              {translatedSurveyMeta.title || survey?.title}
            </h1>
            {(translatedSurveyMeta.description || survey?.description) && (
              <p className="text-sky-500">{translatedSurveyMeta.description || survey?.description}</p>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between text-sm text-sky-500 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-white border-concrete-500/20 shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {currentIndex + 1}
                </span>
                <h2 className="text-xl font-medium text-stratosphere-900 leading-tight">
                  {displayText}
                  {(currentQ.required || currentQ.question.validation?.required) && (
                    <span className="text-coral-500 ml-1">*</span>
                  )}
                </h2>
              </div>
              {displayDescription && (
                <p className="text-sky-500 text-sm ml-11">{displayDescription}</p>
              )}
            </div>

            <div className="ml-11">
              <QuestionInput
                question={displayOptions ? { ...currentQ, customOptions: displayOptions } : currentQ}
                value={currentAnswer}
                onChange={v => {
                  if (v instanceof File) { setCurrentFile(v); setCurrentAnswer(v.name); }
                  else { setCurrentAnswer(v); setCurrentFile(null); }
                  setValidationError('');
                }}
                onDescriptorChange={(optVal, text) => setDescriptorAnswers(prev => ({ ...prev, [optVal]: text }))}
                descriptorAnswers={descriptorAnswers}
                hasError={!!validationError}
                translationOverrides={translationOverrides}
              />

              {validationError && (
                <div className="flex items-center gap-2 mt-3 text-ochre-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {validationError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="border-concrete-500/30 text-sky-500 hover:bg-sky-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className={isLast ? 'bg-forest-500 hover:bg-forest-600 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}
          >
            {isSubmitting ? (
              <><div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />Submitting...</>
            ) : isLast ? (
              <><Send className="h-4 w-4 mr-2" />Submit</>
            ) : (
              <>Next<ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
