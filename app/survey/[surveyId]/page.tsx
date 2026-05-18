'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight, Send, CheckCircle, AlertCircle, Clock,
  FileText, Star, Upload, Calendar, Mail, Phone, Hash, Type,
  Check, ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { getPublicSurveyData } from '@/lib/api/survey';
import { apiClient } from '@/lib/api/client';
import Image from 'next/image';

interface QuestionOption {
  value: string;
  label: string;
  descriptor?: string;
  placeholder?: string;
}

interface Question {
  _id: string;
  order: number;
  required?: boolean;
  section?: string;
  question: {
    _id: string;
    text: string;
    description?: string;
    type: string;
    options?: Array<QuestionOption | string>;
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
  };
  customText?: string;
  customDescription?: string;
  customOptions?: QuestionOption[];
}

const normalizeOptions = (opts: Array<QuestionOption | string> = []): QuestionOption[] =>
  opts.map(o => typeof o === 'string' ? { value: o, label: o } : { value: o.value || o.label, label: o.label || o.value, descriptor: o.descriptor, placeholder: o.placeholder });

const QuestionInput = ({
  question,
  value,
  onChange,
  onDescriptorChange,
  descriptorAnswers,
  hasError
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  onDescriptorChange: (optionValue: string, text: string) => void;
  descriptorAnswers: Record<string, string>;
  hasError: boolean;
}) => {
  const type = question.question.type;
  const options = normalizeOptions(question.customOptions || question.question.options);

  const base = `border-2 rounded-xl ${hasError
    ? 'border-ochre-500 focus:border-ochre-500'
    : 'border-concrete-500/30 focus:border-forest-500 focus:ring-4 focus:ring-forest-50'} bg-white`;

  switch (type) {
    case 'text':
      return (
        <div className="relative group">
          <Type className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Type your answer here..." className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'email':
      return (
        <div className="relative group">
          <Mail className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="your.email@example.com" className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'phone':
      return (
        <div className="relative group">
          <Phone className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="tel" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="+1 (555) 123-4567" className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Share your thoughts here..." rows={5} className={`resize-none text-lg ${base}`} />
          <div className="flex justify-end mt-2"><span className="text-sm text-sky-500">{value?.length || 0} characters</span></div>
        </div>
      );
    case 'number':
      return (
        <div className="relative group">
          <Hash className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Enter a number..." min={question.question.validation?.min} max={question.question.validation?.max} className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'date':
      return (
        <div className="relative group">
          <Calendar className="absolute left-4 top-4 h-5 w-5 text-sky-500 pointer-events-none z-10" />
          <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'radio':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange} className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className={`rounded-xl border-2 overflow-hidden ${value === opt.value ? 'border-forest-500 bg-forest-50' : 'border-concrete-500/30 bg-white hover:border-forest-300'}`}>
              <div className="flex items-center space-x-4 p-5 cursor-pointer">
                <RadioGroupItem value={opt.value} id={`${question._id}-${i}`} className="border-2 border-forest-500 text-forest-500 data-[state=checked]:bg-forest-500 h-5 w-5" />
                <Label htmlFor={`${question._id}-${i}`} className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg">{opt.label}</Label>
                {value === opt.value && <Check className="h-5 w-5 text-forest-500" />}
              </div>
              {opt.descriptor !== undefined && opt.descriptor !== null && value === opt.value && (
                <div className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100">
                  {opt.descriptor && <p className="text-sm text-sky-700 mb-2">{opt.descriptor}</p>}
                  <Input value={descriptorAnswers[opt.value] || ''} onChange={e => onDescriptorChange(opt.value, e.target.value)} placeholder={opt.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      );
    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          {options.map((opt, i) => {
            const isChecked = selected.includes(opt.value);
            return (
              <div key={i} className={`rounded-xl border-2 overflow-hidden ${isChecked ? 'border-grass-500 bg-grass-50' : 'border-concrete-500/30 bg-white hover:border-grass-300'}`}>
                <div className="flex items-center space-x-4 p-5 cursor-pointer">
                  <Checkbox id={`${question._id}-${i}`} checked={isChecked} onCheckedChange={checked => {
                    if (checked) onChange([...selected, opt.value]);
                    else { onChange(selected.filter((o: string) => o !== opt.value)); onDescriptorChange(opt.value, ''); }
                  }} className="border-2 border-grass-500 data-[state=checked]:bg-grass-500 h-5 w-5" />
                  <Label htmlFor={`${question._id}-${i}`} className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg">{opt.label}</Label>
                  {isChecked && <Check className="h-5 w-5 text-grass-500" />}
                </div>
                {opt.descriptor !== undefined && opt.descriptor !== null && isChecked && (
                  <div className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100">
                    {opt.descriptor && <p className="text-sm text-sky-700 mb-2">{opt.descriptor}</p>}
                    <Input value={descriptorAnswers[opt.value] || ''} onChange={e => onDescriptorChange(opt.value, e.target.value)} placeholder={opt.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    case 'boolean':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange} className="grid grid-cols-2 gap-4">
          {(['true', 'false'] as const).map((bv, i) => (
            <div key={bv} className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 cursor-pointer ${value === bv ? 'border-forest-500 bg-forest-50' : 'border-concrete-500/30 bg-white hover:border-forest-300'}`}>
              <RadioGroupItem value={bv} id={`${question._id}-${bv}`} className="sr-only" />
              <Label htmlFor={`${question._id}-${bv}`} className="cursor-pointer text-center">
                <div className={`mb-3 p-4 rounded-full ${value === bv ? 'bg-forest-500' : 'bg-concrete-100'}`}>
                  {bv === 'true' ? <CheckCircle className={`h-8 w-8 ${value === bv ? 'text-white' : 'text-forest-500'}`} /> : <AlertCircle className={`h-8 w-8 ${value === bv ? 'text-white' : 'text-concrete-500'}`} />}
                </div>
                <span className={`text-2xl font-bold ${value === bv ? 'text-forest-500' : 'text-stratosphere-900'}`}>{bv === 'true' ? 'Yes' : 'No'}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'rating': {
      const max = question.question.validation?.max || 5;
      const current = parseInt(value) || 0;
      return (
        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-2">
            {Array.from({ length: max }, (_, i) => (
              <button key={i} type="button" onClick={() => onChange((i + 1).toString())} className={`p-2 rounded-full transition-all ${current >= i + 1 ? 'text-sand-500' : 'text-concrete-300 hover:text-sand-400'}`}>
                <Star className={`h-10 w-10 ${current >= i + 1 ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          <div className="text-center">
            <span className="px-6 py-2 bg-sand-50 text-sand-600 rounded-full text-sm font-medium">
              {current > 0 ? `${current} out of ${max} stars` : `Rate from 1 to ${max} stars`}
            </span>
          </div>
        </div>
      );
    }
    case 'scale': {
      const min = question.question.validation?.min || 1;
      const max = question.question.validation?.max || 10;
      const sv = value ? [parseInt(value)] : [min];
      return (
        <div className="space-y-6 px-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ochre-500">Strongly Disagree ({min})</span>
            <span className="text-forest-500">Strongly Agree ({max})</span>
          </div>
          <Slider value={sv} onValueChange={v => onChange(v[0].toString())} min={min} max={max} step={1} className="w-full" />
          <div className="text-center">
            <span className="inline-block text-3xl font-bold text-forest-500 bg-forest-50 px-8 py-4 rounded-2xl shadow-lg">{sv[0]}</span>
          </div>
        </div>
      );
    }
    case 'file': {
      const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(
        value?.filename ? { name: value.filename, size: value.size } : null
      );
      return (
        <div>
          <div className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer ${hasError ? 'border-ochre-500 bg-ochre-50/30' : 'border-forest-500/40 bg-gradient-to-br from-forest-50 to-grass-50 hover:border-forest-500'}`} onClick={() => document.getElementById(`file-${question._id}`)?.click()}>
            <Upload className="h-16 w-16 text-forest-500 mx-auto mb-4" />
            <p className="text-stratosphere-900 font-semibold text-lg">Upload a file</p>
            <p className="text-sky-500 mt-1">Click to browse or drag and drop</p>
            <input type="file" id={`file-${question._id}`} className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFileInfo({ name: f.name, size: f.size }); onChange(f); }
            }} />
            <div className="mt-4">
              <span className="inline-block px-6 py-3 bg-forest-500 text-white rounded-lg font-semibold"><Upload className="h-4 w-4 inline mr-2" />Choose File</span>
            </div>
            {fileInfo && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-forest-500/20 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-forest-500" />
                <div className="text-left flex-1">
                  <p className="text-sm text-stratosphere-900 font-medium">{fileInfo.name}</p>
                  <p className="text-xs text-sky-500">{(fileInfo.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'dropdown': {
      const selected = options.find(o => o.value === value);
      return (
        <div className="space-y-3">
          <Select value={value || ''} onValueChange={val => { onChange(val); Object.keys(descriptorAnswers).forEach(k => onDescriptorChange(k, '')); }}>
            <SelectTrigger className={`h-14 text-lg ${base}`}><SelectValue placeholder="Select an option..." /></SelectTrigger>
            <SelectContent>
              {options.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}{opt.descriptor ? ' ✎' : ''}</SelectItem>)}
            </SelectContent>
          </Select>
          {selected?.descriptor !== undefined && selected.descriptor !== null && value && (
            <div className="px-4 pb-4 pt-3 bg-sky-50 border border-sky-200 rounded-xl">
              {selected.descriptor && <p className="text-sm text-sky-700 mb-2">{selected.descriptor}</p>}
              <Input value={descriptorAnswers[value] || ''} onChange={e => onDescriptorChange(value, e.target.value)} placeholder={selected.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
            </div>
          )}
        </div>
      );
    }
    default:
      return <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Please provide your answer..." className={`h-14 text-lg ${base}`} />;
  }
};

export default function PublicSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const surveyId = params.surveyId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [responseId, setResponseId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [descriptorAnswers, setDescriptorAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  useEffect(() => {
    const q = questions[currentIndex];
    if (q) {
      setCurrentAnswer(answers[q.question._id] || '');
      setCurrentFile(null);
      setDescriptorAnswers({});
      setValidationError('');
    }
  }, [currentIndex, questions]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const result = await getPublicSurveyData(surveyId);
      const data = result.data;

      if (data.requiresAuth) {
        // Private survey — redirect to login, come back after
        router.push(`/account/login?from=/survey/${surveyId}`);
        return;
      }

      setSurveyData(data);

      // Flatten sections + noSectionQuestions into ordered list
      const allQuestions: Question[] = [];
      if (data.sections?.length) {
        data.sections.forEach((section: any) => {
          section.questions?.forEach((q: Question) => allQuestions.push(q));
        });
      }
      data.noSectionQuestions?.forEach((q: Question) => allQuestions.push(q));
      allQuestions.sort((a, b) => a.order - b.order);
      setQuestions(allQuestions);

      // Start response immediately
      const startRes = await apiClient.post(`/surveys/${surveyId}/responses/start`, {
        respondentInfo: { anonymous: true }
      });
      setResponseId(startRes.data.data._id);
    } catch (err: any) {
      console.error('Error loading survey:', err);
      setError('Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const submitCurrentAnswer = async () => {
    if (!responseId) return;
    const q = questions[currentIndex];
    if (!q) return;
    const answerValue = currentFile || currentAnswer;
    if (!answerValue && answerValue !== 0) return;

    try {
      if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('questionId', q.question._id);
        formData.append('surveyQuestionId', q._id);
        await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/answers`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/answers`, {
          questionId: q.question._id,
          surveyQuestionId: q._id,
          answer: answerValue,
          descriptorAnswers: Object.keys(descriptorAnswers).length ? descriptorAnswers : undefined
        });
      }
      setAnswers(prev => ({ ...prev, [q.question._id]: answerValue }));
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleNext = async () => {
    if (!validateCurrent()) return;
    await submitCurrentAnswer();
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
    if (!responseId) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`/surveys/${surveyId}/responses/${responseId}/complete`, {});
      setIsComplete(true);
    } catch (err) {
      console.error('Error completing survey:', err);
      toast({ title: 'Error', description: 'Failed to submit survey. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-stratosphere-900 font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Survey Unavailable</h2>
            <p className="text-sky-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-forest-500" />
            </div>
            <h2 className="text-2xl font-semibold text-stratosphere-900 mb-3">Thank you!</h2>
            <p className="text-sky-500 mb-2">Your response has been submitted successfully.</p>
            {surveyData?.survey?.title && (
              <p className="text-sm text-concrete-500 mt-4">Survey: {surveyData.survey.title}</p>
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
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">No Questions</h2>
            <p className="text-sky-500">This survey has no questions yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const displayText = currentQ.customText || currentQ.question.text;
  const displayDescription = currentQ.customDescription || currentQ.question.description;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 to-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-concrete-500/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/levelogo.PNG" alt="LEVEL" width={80} height={20} className="h-6 w-auto" />
          </div>
          <div className="flex items-center gap-2 text-sm text-sky-500">
            <Clock className="h-4 w-4" />
            <span>{questions.length} questions</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Survey title (shown only on first question) */}
        {currentIndex === 0 && surveyData?.survey && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-stratosphere-900 mb-2">{surveyData.survey.title}</h1>
            {surveyData.survey.description && (
              <p className="text-sky-500">{surveyData.survey.description}</p>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-sky-500 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
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
                question={currentQ}
                value={currentAnswer}
                onChange={v => {
                  if (v instanceof File) { setCurrentFile(v); setCurrentAnswer(v.name); }
                  else { setCurrentAnswer(v); setCurrentFile(null); }
                  setValidationError('');
                }}
                onDescriptorChange={(optVal, text) => setDescriptorAnswers(prev => ({ ...prev, [optVal]: text }))}
                descriptorAnswers={descriptorAnswers}
                hasError={!!validationError}
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

        {/* Navigation */}
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
