// components/survey/SurveyPreview.tsx - Reusable Survey Preview Component
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send, FileText, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Question {
  _id: string;
  customText?: string;
  required: boolean;
  question: {
    text: string;
    type: string;
    options?: Array<string | {
      value: string;
      label: string;
      descriptor?: string;
      placeholder?: string;
    }>;
    validation?: any;
    scaleConfig?: {
      min: number;
      max: number;
      step?: number;
      minLabel?: string;
      maxLabel?: string;
      scaleOptions?: Array<{ value: string | number; label: string }>;
    };
    matrixConfig?: {
      rows: Array<{ label: string; description?: string }>;
      columns: Array<{ value: string; label: string }>;
    };
  };
}

interface Section {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface SurveyStructure {
  survey: {
    title: string;
    description?: string;
  };
  sections: Section[];
  noSectionQuestions: Question[];
}

interface SurveyPreviewProps {
  structure: SurveyStructure;
  isModal?: boolean;
  onClose?: () => void;
}

const QuestionRenderer = ({ question, value, onChange }: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) => {
  const questionText = question.customText || question.question.text;
  const questionType = question.question.type;

  const [descriptorAnswers, setDescriptorAnswers] = useState<Record<string, string>>({});

  const handleDescriptorChange = (optionValue: string, text: string) => {
    setDescriptorAnswers(prev => ({ ...prev, [optionValue]: text }));
  };
  
  // Handle options - they might be objects {value, label} or strings
  const rawOptions = question.question.options || [];
  const options = rawOptions.map((option: any) => {
    if (typeof option === 'string') {
      return option;
    }
    // If it's an object with value/label, use the label for display
    return option.label || option.value || option;
  });

  switch (questionType) {
    case 'text':
      return (
        <Input
          placeholder="Type your answer here..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );

    case 'textarea':
      return (
        <Textarea
          placeholder="Type your detailed answer here..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full"
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder="Enter a number..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );

    case 'radio':
      return (
        <RadioGroup value={value || ''} onValueChange={(val) => {
          onChange(val);
          setDescriptorAnswers({}); // clear stale descriptors on selection change
        }}>
          {rawOptions.map((opt: any, index: number) => {
            const optionValue = typeof opt === 'string' ? opt : opt.value || opt.label;
            const optionLabel = typeof opt === 'string' ? opt : opt.label || opt.value;
            const descriptor = typeof opt === 'object' ? opt.descriptor : undefined;
            const placeholder = typeof opt === 'object' ? opt.placeholder : undefined;
            const isSelected = value === optionValue;

            return (
              <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={optionValue} id={`${question._id}-${index}`} />
                  <Label htmlFor={`${question._id}-${index}`} className="cursor-pointer flex-1">
                    {optionLabel}
                  </Label>
                </div>
                {descriptor !== undefined && descriptor !== null && isSelected && (
                  <div className="px-3 pb-3 pt-1 bg-sky-50 border-t border-sky-100">
                    {descriptor && (
                      <p className="text-xs text-sky-700 mb-1.5">{descriptor}</p>
                    )}
                    <Input
                      value={descriptorAnswers[optionValue] || ''}
                      onChange={(e) => handleDescriptorChange(optionValue, e.target.value)}
                      placeholder={placeholder || 'Your answer…'}
                      className="h-8 text-sm border-stratosphere-200 bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      );

    case 'checkbox':
      return (
        <div className="space-y-3">
          {rawOptions.map((opt: any, index: number) => {
            const optionValue = typeof opt === 'string' ? opt : opt.value || opt.label;
            const optionLabel = typeof opt === 'string' ? opt : opt.label || opt.value;
            const descriptor = typeof opt === 'object' ? opt.descriptor : undefined;
            const placeholder = typeof opt === 'object' ? opt.placeholder : undefined;
            const isChecked = (value || []).includes(optionValue);

            return (
              <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={`${question._id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        onChange([...currentValues, optionValue]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== optionValue));
                        setDescriptorAnswers(prev => {
                          const next = { ...prev };
                          delete next[optionValue];
                          return next;
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`${question._id}-${index}`} className="cursor-pointer flex-1">
                    {optionLabel}
                  </Label>
                </div>
                {descriptor !== undefined && descriptor !== null && isChecked && (
                  <div className="px-3 pb-3 pt-1 bg-sky-50 border-t border-sky-100">
                    {descriptor && (
                      <p className="text-xs text-sky-700 mb-1.5">{descriptor}</p>
                    )}
                    <Input
                      value={descriptorAnswers[optionValue] || ''}
                      onChange={(e) => handleDescriptorChange(optionValue, e.target.value)}
                      placeholder={placeholder || 'Your answer…'}
                      className="h-8 text-sm border-stratosphere-200 bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case 'dropdown':
    case 'select':
      const selectedSelectOpt = rawOptions.find((opt: any) =>
        (typeof opt === 'string' ? opt : opt.value) === value
      ) as any;
      const selectDescriptor = selectedSelectOpt && typeof selectedSelectOpt === 'object'
        ? selectedSelectOpt.descriptor : undefined;
      const selectPlaceholder = selectedSelectOpt && typeof selectedSelectOpt === 'object'
        ? selectedSelectOpt.placeholder : undefined;

      return (
        <div className="space-y-3">
          <Select value={value || ''} onValueChange={(val) => {
            onChange(val);
            setDescriptorAnswers({});
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {rawOptions.map((opt: any, index: number) => {
                const optionValue = typeof opt === 'string' ? opt : opt.value || opt.label;
                const optionLabel = typeof opt === 'string' ? opt : opt.label || opt.value;
                const hasDesc = typeof opt === 'object' && opt.descriptor !== undefined;
                return (
                  <SelectItem key={index} value={optionValue}>
                    {optionLabel}{hasDesc ? ' ✎' : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectDescriptor !== undefined && selectDescriptor !== null && value && (
            <div className="px-3 pb-3 pt-2 bg-sky-50 border border-sky-200 rounded-lg">
              {selectDescriptor && (
                <p className="text-xs text-sky-700 mb-1.5">{selectDescriptor}</p>
              )}
              <Input
                value={descriptorAnswers[value] || ''}
                onChange={(e) => handleDescriptorChange(value, e.target.value)}
                placeholder={selectPlaceholder || 'Your answer…'}
                className="h-8 text-sm border-stratosphere-200 bg-white"
              />
            </div>
          )}
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          {options.map((option, index) => {
            const optionValue = typeof option === 'string' ? option : option.value || option.label;
            const optionLabel = typeof option === 'string' ? option : option.label || option.value;
            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question._id}-${index}`}
                  checked={(value || []).includes(optionValue)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, optionValue]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== optionValue));
                    }
                  }}
                />
                <Label htmlFor={`${question._id}-${index}`} className="cursor-pointer">
                  {optionLabel}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'boolean':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${question._id}-yes`} />
            <Label htmlFor={`${question._id}-yes`} className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${question._id}-no`} />
            <Label htmlFor={`${question._id}-no`} className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      );

    case 'rating':
      const maxRating = question.question.validation?.max || 5;
      return (
        <div className="flex items-center space-x-2">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
            <Button
              key={rating}
              variant={value === rating ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(rating)}
              className="w-10 h-10"
            >
              {rating}
            </Button>
          ))}
        </div>
      );

    case 'scale': {
      const sc = question.question.scaleConfig;
      const scaleOpts = sc?.scaleOptions || [];
      const hasLabels = scaleOpts.length > 0 &&
        scaleOpts.some(o => o.label && String(o.label) !== String(o.value));

      if (hasLabels) {
        return (
          <div className="space-y-3">
            {(sc?.minLabel || sc?.maxLabel) && (
              <div className="flex justify-between text-xs text-sky-500">
                <span>{sc?.minLabel}</span>
                <span>{sc?.maxLabel}</span>
              </div>
            )}
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                {scaleOpts.map((opt, i) => {
                  const selected = String(value) === String(opt.value);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onChange(opt.value)}
                      className={`flex flex-col items-center gap-1 w-14 flex-shrink-0 rounded-lg p-1 transition-colors ${
                        selected ? 'bg-sky-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg text-sm font-bold transition-colors ${
                        selected
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}>
                        {opt.value}
                      </div>
                      <span className="text-xs text-center leading-tight w-14 break-words text-gray-500">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      const min = sc?.min ?? 1;
      const max = sc?.max ?? 5;
      const step = sc?.step ?? 1;
      const points: number[] = [];
      for (let i = min; i <= max; i += step) points.push(i);
      return (
        <div className="space-y-3">
          {(sc?.minLabel || sc?.maxLabel) && (
            <div className="flex justify-between text-xs text-sky-500">
              <span>{sc?.minLabel || String(min)}</span>
              <span>{sc?.maxLabel || String(max)}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {points.map(pt => (
              <Button
                key={pt}
                type="button"
                variant={value === pt ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(pt)}
                className={`w-10 h-10 ${value === pt ? 'bg-sky-500 border-sky-500' : ''}`}
              >
                {pt}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    case 'matrix': {
      const mc = question.question.matrixConfig;
      if (!mc?.rows?.length || !mc?.columns?.length) {
        return <Input placeholder="Your answer" className="w-full" onChange={(e) => onChange(e.target.value)} />;
      }
      const matrixValue: Record<string, string> = value || {};
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left border-b border-gray-200 w-1/3" />
                {mc.columns.map((col, i) => (
                  <th key={i} className="p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mc.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm font-medium text-gray-900 border-r border-gray-100">
                    {row.label}
                    {row.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>
                    )}
                  </td>
                  {mc.columns.map((col, ci) => (
                    <td key={ci} className="p-3 text-center">
                      <input
                        type="radio"
                        name={`${question._id}-row-${ri}`}
                        value={col.value}
                        checked={matrixValue[row.label] === col.value}
                        onChange={() => onChange({ ...matrixValue, [row.label]: col.value })}
                        className="w-4 h-4 accent-sky-500 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'location':
      return (
        <Input
          placeholder="Enter your location..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Question type "{questionType}" not yet supported in preview</p>
        </div>
      );
  }
};

export const SurveyPreview = ({ structure, isModal = false, onClose }: SurveyPreviewProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showThankYou, setShowThankYou] = useState(false);

  // Flatten all questions for navigation
  const allSections = [
    ...structure.sections,
    ...(structure.noSectionQuestions.length > 0 ? [{
      _id: 'no-section',
      title: 'Additional Questions',
      description: '',
      questions: structure.noSectionQuestions
    }] : [])
  ];

  const totalQuestions = allSections.reduce((total, section) => total + section.questions.length, 0);
  const currentSection = allSections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  
  // Calculate progress
  const questionsAnswered = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < allSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      setShowThankYou(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(allSections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const isFirstQuestion = currentSectionIndex === 0 && currentQuestionIndex === 0;
  const isLastQuestion = currentSectionIndex === allSections.length - 1 && 
                         currentQuestionIndex === currentSection?.questions.length - 1;

  if (showThankYou) {
    return (
      <div className={`${isModal ? 'p-6' : 'max-w-2xl mx-auto'}`}>
        <Card className="text-center bg-gradient-to-br from-coral-50 to-sky-50">
          <CardContent className="p-12">
            <CheckCircle className="h-16 w-16 text-coral-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-stratosphere-900 mb-4">
              Thank You!
            </h2>
            <p className="text-sky-500 mb-6">
              Your survey preview is complete. This is how respondents will experience your survey.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => {
                  setShowThankYou(false);
                  setCurrentSectionIndex(0);
                  setCurrentQuestionIndex(0);
                  setResponses({});
                }}
                variant="outline"
                className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
              >
                Start Over
              </Button>
              {isModal && (
                <Button onClick={onClose} className="bg-coral-500 hover:bg-coral-600 text-white">
                  Close Preview
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isModal ? 'p-6' : 'max-w-2xl mx-auto'}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-sky-500">Survey Progress</span>
          <span className="text-sm text-stratosphere-900 font-medium">
            {questionsAnswered} of {totalQuestions} answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Survey Header */}
      <Card className="mb-6 bg-gradient-to-br from-white to-stratosphere-50/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-stratosphere-900">
            {structure.survey.title}
          </CardTitle>
          {structure.survey.description && (
            <p className="text-sky-500 mt-2">{structure.survey.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Current Section Header */}
      {currentSection && currentSection._id !== 'no-section' && (
        <Card className="mb-6 bg-gradient-to-r from-forest-50 to-grass-50">
          <CardHeader>
            <CardTitle className="text-lg text-forest-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {currentSection.title}
            </CardTitle>
            {currentSection.description && (
              <p className="text-forest-600 text-sm">{currentSection.description}</p>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-sky-50 rounded-full text-sm font-medium text-sky-500 mt-1">
                  {questionsAnswered + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
                    {currentQuestion.customText || currentQuestion.question.text}
                    {currentQuestion.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  
                  <QuestionRenderer
                    question={currentQuestion}
                    value={responses[currentQuestion._id]}
                    onChange={(value) => updateResponse(currentQuestion._id, value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-sky-500">
          <span>Section {currentSectionIndex + 1} of {allSections.length}</span>
          <span>•</span>
          <span>Question {currentQuestionIndex + 1} of {currentSection?.questions.length || 0}</span>
        </div>

        <Button
          onClick={goToNextQuestion}
          className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          {isLastQuestion ? (
            <>
              <Send className="h-4 w-4 mr-1" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
