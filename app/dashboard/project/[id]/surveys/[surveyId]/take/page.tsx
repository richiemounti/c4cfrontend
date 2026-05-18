// app/dashboard/project/[id]/surveys/[surveyId]/take/page.tsx - REVAMPED DESIGN
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileText,
  Users,
  Info,
  Star,
  Upload,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Hash,
  Type,
  List,
  Grid3X3,
  BarChart3,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSurveyTaking } from '@/hooks/useSurvey';
import * as surveyApi from '@/lib/api/survey';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

interface PageParams {
  id: string;
  surveyId: string;
}

interface Question {
  _id: string;
  question: {
    _id: string;
    text: string;
    description?: string;
    type: string;
    options?: Array<{
      value: string;
      label: string;
      descriptor?: string;    // ← add
      placeholder?: string;   // ← add
    } | string>;
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
  customOptions?: Array<{
    value: string;
    label: string;
    descriptor?: string;      // ← add
    placeholder?: string;     // ← add
  }>;
  required?: boolean;
  order: number;
  section?: {
    _id: string;
    title: string;
    description?: string;
  };
}

// Enhanced Question Input Component with improved styling
const QuestionInput = ({ question, value, onChange, onDescriptorChange, descriptorAnswers, hasError }: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onDescriptorChange: (optionValue: string, text: string) => void;  // ← add
  descriptorAnswers: Record<string, string>;                         // ← add
  hasError: boolean;
}) => {
  const questionType = question.question.type;
  const questionOptions = question.customOptions || question.question.options || [];
  
  const normalizedOptions = questionOptions.map((option: any) => {
    if (typeof option === 'string') {
      return { value: option, label: option, descriptor: undefined, placeholder: undefined };
    }
    return {
      value: option.value || option.label,
      label: option.label || option.value,
      descriptor: option.descriptor,      // ← add
      placeholder: option.placeholder     // ← add
    };
  });

  const baseInputClasses = `
    border-2 rounded-xl
    ${hasError 
      ? 'border-ochre-500 focus:border-ochre-500 focus:ring-4 focus:ring-ochre-50' 
      : 'border-concrete-500/30 focus:border-forest-500 focus:ring-4 focus:ring-forest-50'
    }
    bg-white hover:border-forest-400
  `;

  switch (questionType) {
    case 'text':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Type className="absolute left-4 top-4 h-5 w-5 text-sky-500 group-focus-within:text-forest-500 transition-colors" />
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className={`pl-12 h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );

    case 'email':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Mail className="absolute left-4 top-4 h-5 w-5 text-sky-500 group-focus-within:text-forest-500 transition-colors" />
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="your.email@example.com"
            className={`pl-12 h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );

    case 'phone':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Phone className="absolute left-4 top-4 h-5 w-5 text-sky-500 group-focus-within:text-forest-500 transition-colors" />
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`pl-12 h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );

    case 'textarea':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Share your detailed thoughts here..."
            rows={5}
            className={`resize-none text-lg ${baseInputClasses}`}
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-sky-500">
              {value?.length || 0} characters
            </span>
          </div>
        </motion.div>
      );

    case 'number':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Hash className="absolute left-4 top-4 h-5 w-5 text-sky-500 group-focus-within:text-forest-500 transition-colors" />
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter a number..."
            min={question.question.validation?.min}
            max={question.question.validation?.max}
            className={`pl-12 h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );

    case 'date':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Calendar className="absolute left-4 top-4 h-5 w-5 text-sky-500 group-focus-within:text-forest-500 transition-colors pointer-events-none z-10" />
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`pl-12 h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );

    case 'radio':
      return (
        <RadioGroup
          value={value || ''}
          onValueChange={(val) => {
            onChange(val);
          }}
          className="space-y-3"
        >
          {normalizedOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border-2 overflow-hidden transition-all duration-300"
            >
              <div className={`
                relative flex items-center space-x-4 p-5 cursor-pointer
                ${value === option.value
                  ? 'border-forest-500 bg-forest-50 shadow-lg shadow-forest-500/10'
                  : 'border-concrete-500/30 bg-white hover:border-forest-300 hover:shadow-md'
                }
              `}>
                <RadioGroupItem
                  value={option.value}
                  id={`${question._id}-${index}`}
                  className="border-2 border-forest-500 text-forest-500 data-[state=checked]:bg-forest-500 h-5 w-5"
                />
                <Label
                  htmlFor={`${question._id}-${index}`}
                  className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg"
                >
                  {option.label}
                </Label>
                {value === option.value && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-5">
                    <Check className="h-5 w-5 text-forest-500" />
                  </motion.div>
                )}
              </div>

              {/* Descriptor input */}
              {option.descriptor !== undefined && option.descriptor !== null && value === option.value && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100"
                >
                  {option.descriptor && (
                    <p className="text-sm text-sky-700 mb-2">{option.descriptor}</p>
                  )}
                  <Input
                    value={descriptorAnswers[option.value] || ''}
                    onChange={(e) => onDescriptorChange(option.value, e.target.value)}
                    placeholder={option.placeholder || 'Your answer…'}
                    className="border-stratosphere-200 focus:border-forest-500 bg-white"
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </RadioGroup>
      );

    case 'checkbox':
      const selectedOptions = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          {normalizedOptions.map((option, index) => {
            const isSelected = selectedOptions.includes(option.value);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border-2 overflow-hidden transition-all duration-300"
              >
                <div className={`
                  relative flex items-center space-x-4 p-5 cursor-pointer
                  ${isSelected
                    ? 'border-grass-500 bg-grass-50 shadow-lg shadow-grass-500/10'
                    : 'border-concrete-500/30 bg-white hover:border-grass-300 hover:shadow-md'
                  }
                `}>
                  <Checkbox
                    id={`${question._id}-${index}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange([...selectedOptions, option.value]);
                      } else {
                        onChange(selectedOptions.filter((o: string) => o !== option.value));
                        onDescriptorChange(option.value, ''); // clear on uncheck
                      }
                    }}
                    className="border-2 border-grass-500 data-[state=checked]:bg-grass-500 data-[state=checked]:border-grass-500 h-5 w-5"
                  />
                  <Label
                    htmlFor={`${question._id}-${index}`}
                    className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg"
                  >
                    {option.label}
                  </Label>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-5">
                      <Check className="h-5 w-5 text-grass-500" />
                    </motion.div>
                  )}
                </div>

                {/* Descriptor input */}
                {option.descriptor !== undefined && option.descriptor !== null && isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100"
                  >
                    {option.descriptor && (
                      <p className="text-sm text-sky-700 mb-2">{option.descriptor}</p>
                    )}
                    <Input
                      value={descriptorAnswers[option.value] || ''}
                      onChange={(e) => onDescriptorChange(option.value, e.target.value)}
                      placeholder={option.placeholder || 'Your answer…'}
                      className="border-stratosphere-200 focus:border-grass-500 bg-white"
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
          {selectedOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-4 p-3 bg-grass-50 rounded-lg border border-grass-500/20"
            >
              <CheckCircle className="h-4 w-4 text-grass-500" />
              <span className="text-sm text-grass-600 font-medium">
                {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
              </span>
            </motion.div>
          )}
        </div>
      );

    case 'boolean':
      return (
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          className="grid grid-cols-2 gap-4"
        >
          {['true', 'false'].map((boolValue, index) => {
            const isYes = boolValue === 'true';
            const isSelected = value === boolValue;
            return (
              <motion.div
                key={boolValue}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isSelected
                    ? 'border-forest-500 bg-forest-50 shadow-xl shadow-forest-500/20' 
                    : 'border-concrete-500/30 bg-white hover:border-forest-300 hover:shadow-lg'
                  }
                `}
              >
                <RadioGroupItem 
                  value={boolValue} 
                  id={`${question._id}-${boolValue}`}
                  className="sr-only"
                />
                <Label 
                  htmlFor={`${question._id}-${boolValue}`}
                  className="cursor-pointer text-center"
                >
                  <div className={`
                    mb-3 p-4 rounded-full transition-colors
                    ${isSelected ? 'bg-forest-500' : 'bg-concrete-100'}
                  `}>
                    {isYes ? (
                      <CheckCircle className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-forest-500'}`} />
                    ) : (
                      <AlertCircle className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-concrete-500'}`} />
                    )}
                  </div>
                  <span className={`
                    text-2xl font-bold transition-colors
                    ${isSelected ? 'text-forest-500' : 'text-stratosphere-900'}
                  `}>
                    {isYes ? 'Yes' : 'No'}
                  </span>
                </Label>
              </motion.div>
            );
          })}
        </RadioGroup>
      );

    case 'rating':
      const maxRating = question.question.validation?.max || 5;
      const currentRating = parseInt(value) || 0;
      return (
        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-2">
            {Array.from({ length: maxRating }, (_, index) => (
              <motion.button
                key={index}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange((index + 1).toString())}
                className={`
                  p-2 rounded-full transition-all duration-300
                  ${currentRating >= index + 1
                    ? 'text-sand-500' 
                    : 'text-concrete-300 hover:text-sand-400'
                  }
                `}
              >
                <Star className={`h-10 w-10 ${currentRating >= index + 1 ? 'fill-current' : ''}`} />
              </motion.button>
            ))}
          </div>
          <div className="text-center">
            <span className="inline-block px-6 py-2 bg-sand-50 text-sand-600 rounded-full text-sm font-medium">
              {currentRating > 0 ? `${currentRating} out of ${maxRating} stars` : `Rate from 1 to ${maxRating} stars`}
            </span>
          </div>
        </div>
      );

    case 'scale':
      const min = question.question.validation?.min || 1;
      const max = question.question.validation?.max || 10;
      const scaleValue = value ? [parseInt(value)] : [min];
      return (
        <div className="space-y-6 px-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ochre-500">Strongly Disagree ({min})</span>
            <span className="text-forest-500">Strongly Agree ({max})</span>
          </div>
          <Slider
            value={scaleValue}
            onValueChange={(newValue) => onChange(newValue[0].toString())}
            min={min}
            max={max}
            step={1}
            className="w-full"
          />
          <div className="text-center">
            <motion.span 
              key={scaleValue[0]}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-block text-3xl font-bold text-forest-500 bg-forest-50 px-8 py-4 rounded-2xl shadow-lg"
            >
              {scaleValue[0]}
            </motion.span>
          </div>
        </div>
      );

    case 'file':
      const [fileInfo, setFileInfo] = useState<{name: string, size: number} | null>(
        value?.filename ? { name: value.filename, size: value.size } : null
      );

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
              ${hasError
                ? 'border-ochre-500 bg-ochre-50/30'
                : 'border-forest-500/40 bg-gradient-to-br from-forest-50 to-grass-50 hover:border-forest-500 hover:shadow-xl'
              }
            `}
            onClick={() => document.getElementById(`file-${question._id}`)?.click()}
          >
            <Upload className="h-16 w-16 text-forest-500 mx-auto mb-4" />
            <div className="space-y-3">
              <p className="text-stratosphere-900 font-semibold text-lg">Upload a file</p>
              <p className="text-sky-500">Click to browse or drag and drop</p>
              
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Store the actual File object, not just the name
                    setFileInfo({ name: file.name, size: file.size });
                    onChange(file); // Pass the File object
                  }
                }}
                className="hidden"
                id={`file-${question._id}`}
                accept="*/*" // You can restrict file types here if needed
              />
              
              <div className="mt-4">
                <span className="inline-block px-6 py-3 bg-forest-500 hover:bg-forest-600 text-white rounded-lg font-semibold">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Choose File
                </span>
              </div>
              
              {fileInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white rounded-lg border border-forest-500/20 flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-forest-500" />
                  <div className="text-left flex-1">
                    <p className="text-sm text-stratosphere-900 font-medium">
                      📎 {fileInfo.name}
                    </p>
                    <p className="text-xs text-sky-500">
                      {(fileInfo.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      );
    
    case 'dropdown': {
      const selectedDropOpt = normalizedOptions.find(o => o.value === value);
      return (
        <div className="space-y-3">
          <Select
            value={value || ''}
            onValueChange={(val) => {
              onChange(val);
              // clear stale descriptor when selection changes
              Object.keys(descriptorAnswers).forEach(k => onDescriptorChange(k, ''));
            }}
          >
            <SelectTrigger className={`h-14 text-lg ${baseInputClasses}`}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {normalizedOptions.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}{option.descriptor ? ' ✎' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDropOpt?.descriptor !== undefined && selectedDropOpt.descriptor !== null && value && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-4 pt-3 bg-sky-50 border border-sky-200 rounded-xl"
            >
              {selectedDropOpt.descriptor && (
                <p className="text-sm text-sky-700 mb-2">{selectedDropOpt.descriptor}</p>
              )}
              <Input
                value={descriptorAnswers[value] || ''}
                onChange={(e) => onDescriptorChange(value, e.target.value)}
                placeholder={selectedDropOpt.placeholder || 'Your answer…'}
                className="border-stratosphere-200 focus:border-forest-500 bg-white"
              />
            </motion.div>
          )}
        </div>
      );
    }

    default:
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Please provide your answer..."
            className={`h-14 text-lg ${baseInputClasses}`}
          />
        </motion.div>
      );
  }
};

const SurveyTakingPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;
  
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const {
    currentResponse,
    currentQuestion,
    answers,
    startSurvey,
    submitAnswer,
    completeSurvey,
    saveDraft,
    nextQuestion,
    previousQuestion,
  } = useSurveyTaking(surveyId);

  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [descriptorAnswers, setDescriptorAnswers] = useState<Record<string, string>>({});  // ← add
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchSurveyData();
    
    const urlParams = new URLSearchParams(window.location.search);
    setIsPreview(urlParams.get('preview') === 'true');
  }, [surveyId]);

  useEffect(() => {
    if (questions.length > 0 && !currentResponse && !isPreview) {
      handleStartSurvey();
    }
  }, [questions, isPreview]);

  useEffect(() => {
    if (questions[currentQuestion]) {
      const questionId = questions[currentQuestion].question._id;
      setCurrentAnswer(answers[questionId] || '');
      setCurrentFile(null);
      setDescriptorAnswers({});    // ← add
      setValidationErrors({});
    }
  }, [currentQuestion, questions, answers]);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      
      const surveyResponse = await surveyApi.getSurvey(surveyId);
      setSurvey(surveyResponse.data);
      
      const questionsResponse = await surveyApi.getSurveyQuestions(surveyId, {
        populate: 'question,section'
      });
      
      const sortedQuestions = questionsResponse.data.sort((a: Question, b: Question) => {
        if (a.section && b.section) {
          if (a.section._id !== b.section._id) {
            return a.section.title.localeCompare(b.section.title);
          }
        }
        return a.order - b.order;
      });
      
      setQuestions(sortedQuestions);
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = async () => {
    try {
      await startSurvey();
    } catch (err) {
      console.error('Error starting survey:', err);
      toast({
        title: 'Error',
        description: 'Failed to start survey',
        variant: 'destructive',
      });
    }
  };

  const validateAnswer = (question: Question, answer: any): string | null => {
    const validation = question.question.validation;
    const isRequired = question.required || validation?.required;
    
    if (isRequired && (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
      return 'This question is required';
    }
    
    if (answer && validation) {
      if (validation.minLength && answer.length < validation.minLength) {
        return `Minimum ${validation.minLength} characters required`;
      }
      
      if (validation.maxLength && answer.length > validation.maxLength) {
        return `Maximum ${validation.maxLength} characters allowed`;
      }
      
      if (validation.min && Number(answer) < validation.min) {
        return `Minimum value is ${validation.min}`;
      }
      
      if (validation.max && Number(answer) > validation.max) {
        return `Maximum value is ${validation.max}`;
      }

      if (question.question.type === 'email' && answer) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(answer)) {
          return 'Please enter a valid email address';
        }
      }
    }
    
    return null;
  };

 const handleAnswerChange = (value: any) => {
    // ✅ Handle File objects specially
    if (value instanceof File) {
      setCurrentFile(value);
      setCurrentAnswer(value.name); // Store filename in answer for validation/display
    } else {
      setCurrentAnswer(value);
      setCurrentFile(null);
    }
    
    const questionId = questions[currentQuestion]?.question._id;
    if (questionId && validationErrors[questionId]) {
      setValidationErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const handleDescriptorChange = (optionValue: string, text: string) => {
    setDescriptorAnswers(prev => ({ ...prev, [optionValue]: text }));
  };

  const handleNext = async () => {
    const question = questions[currentQuestion];
    if (!question) return;
    
    // ✅ Use currentFile for file questions, currentAnswer for others
    const answerToValidate = currentFile || currentAnswer;
    const validationError = validateAnswer(question, answerToValidate);
    
    if (validationError) {
      setValidationErrors({
        [question.question._id]: validationError
      });
      return;
    }
    
    if (!isPreview && currentResponse) {
      try {
        // ✅ Submit the file if it exists, otherwise submit the regular answer
        const answerToSubmit = currentFile || currentAnswer;
        
        console.log('Submitting answer:', {
          questionId: question.question._id,
          surveyQuestionId: question._id,
          answerType: answerToSubmit instanceof File ? 'File' : typeof answerToSubmit,
          fileName: answerToSubmit instanceof File ? answerToSubmit.name : 'N/A'
        });
        
        await submitAnswer(
          question.question._id,
          question._id,
          answerToSubmit,
          descriptorAnswers   // ← add as 4th arg
        );
      } catch (err) {
        console.error('Error submitting answer:', err);
        toast({
          title: 'Error',
          description: 'Failed to save answer',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      nextQuestion();
    }
  };

  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      previousQuestion();
    }
  };

  const handleSaveDraft = async () => {
    if (isPreview) {
      toast({
        title: 'Preview Mode',
        description: 'Cannot save draft in preview mode',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await saveDraft();
      toast({
        title: 'Draft Saved',
        description: 'Your progress has been saved',
      });
    } catch (err) {
      console.error('Error saving draft:', err);
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (isPreview) {
      toast({
        title: 'Preview Complete',
        description: 'You have previewed all questions in this survey',
      });
      router.push(`/dashboard/project/${projectId}/surveys/${surveyId}`);
      return;
    }
    
    const question = questions[currentQuestion];
    if (question) {
      const validationError = validateAnswer(question, currentAnswer);
      if (validationError) {
        setValidationErrors({
          [question.question._id]: validationError
        });
        return;
      }
      
      try {
        await submitAnswer(
          question.question._id,
          question._id,
          currentAnswer,
          descriptorAnswers   // ← add as 4th arg
        );
      } catch (err) {
        console.error('Error submitting final answer:', err);
        toast({
          title: 'Error',
          description: 'Failed to save final answer',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsCompleting(true);
    try {
      await completeSurvey();
      toast({
        title: 'Survey Completed',
        description: 'Thank you for completing the survey!',
      });
      router.push(`/dashboard/project/${projectId}/surveys`);
    } catch (err) {
      console.error('Error completing survey:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete survey',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round(((currentQuestion + 1) / questions.length) * 100);
  };

  const getCurrentSection = () => {
    const question = questions[currentQuestion];
    return question?.section;
  };

  const getQuestionTypeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'text': Type,
      'textarea': FileText,
      'radio': List,
      'checkbox': Grid3X3,
      'number': Hash,
      'email': Mail,
      'phone': Phone,
      'date': Calendar,
      'time': Clock,
      'rating': Star,
      'scale': BarChart3,
      'dropdown': List,
      'file': Upload,
      'location': MapPin,
      'boolean': CheckCircle
    };
    
    const Icon = iconMap[type] || AlertCircle;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-forest-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-stratosphere-900 mb-2">Loading Survey</h2>
          <p className="text-sky-500">Preparing your survey experience...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-ochre-500/30 shadow-2xl">
          <CardContent className="text-center p-10">
            <AlertCircle className="h-20 w-20 text-ochre-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-stratosphere-900 mb-3">Survey Unavailable</h2>
            <p className="text-sky-500 mb-6">{error || 'The survey you\'re looking for is not available'}</p>
            <Link href={`/dashboard/project/${projectId}/surveys`}>
              <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                Back to Surveys
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-concrete-500/30 shadow-2xl">
          <CardContent className="text-center p-10">
            <FileText className="h-20 w-20 text-concrete-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-stratosphere-900 mb-3">No Questions Available</h2>
            <p className="text-sky-500 mb-6">This survey does not have any questions yet</p>
            <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}`}>
              <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                Back to Survey Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const currentSection = getCurrentSection();
  const isLastQuestion = currentQuestion === questions.length - 1;
  const questionError = validationErrors[currentQuestionData?.question._id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20">
      {/* Fixed Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-concrete-500/20 shadow-lg"
      >
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link 
              href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
              className="flex items-center text-sky-500 hover:text-forest-500 font-medium group"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Survey
            </Link>
            
            <div className="flex items-center gap-4">
              {isPreview && (
                <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20 px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Preview Mode
                </Badge>
              )}
              <div className="text-sm font-medium text-sky-500 bg-sky-50 px-4 py-2 rounded-full">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Survey Header - Only show on first question */}
        {currentQuestion === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-white via-forest-50/30 to-grass-50/30 backdrop-blur-sm border-forest-500/20 shadow-2xl">
              <CardContent className="p-10">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-forest-500 rounded-2xl shadow-lg mb-4"
                  >
                    <FileText className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl font-bold text-stratosphere-900 mb-3">{survey.title}</h1>
                  
                  {survey.description && (
                    <p className="text-xl text-sky-500 max-w-2xl mx-auto leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center gap-8 text-sm text-sky-500 pt-4">
                    <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                      <Users className="h-4 w-4 text-forest-500" />
                      {survey.stakeholderGroup?.name || 'Survey'}
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                      <Clock className="h-4 w-4 text-forest-500" />
                      ~{survey.estimatedDuration || Math.ceil(questions.length * 1.5)} min
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
                      <FileText className="h-4 w-4 text-forest-500" />
                      {questions.length} questions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-concrete-500/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-sky-500">Your Progress</span>
                <span className="text-sm font-bold text-forest-500 bg-forest-50 px-3 py-1 rounded-full">
                  {getProgressPercentage()}% Complete
                </span>
              </div>
              <Progress 
                value={getProgressPercentage()} 
                className="h-3 bg-concrete-100"
              />
              <div className="flex justify-between text-xs text-sky-500 mt-3 font-medium">
                <span>Started</span>
                <span>In Progress</span>
                <span>Complete</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Header */}
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="bg-gradient-to-r from-forest-50 via-grass-50 to-sand-50 border-forest-500/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <FileText className="h-6 w-6 text-forest-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        {currentSection.title}
                      </h2>
                      {currentSection.description && (
                        <p className="text-sm text-forest-600 mt-1">{currentSection.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-concrete-500/10 overflow-hidden">
              <CardHeader className="border-b border-concrete-500/10 bg-gradient-to-r from-stratosphere-50 to-sky-50">
                <div className="flex items-start gap-5">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center w-14 h-14 bg-forest-500 rounded-2xl shadow-lg flex-shrink-0"
                  >
                    <span className="text-white font-bold text-lg">{currentQuestion + 1}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-2xl font-bold text-stratosphere-900 leading-tight">
                        {currentQuestionData.customText || currentQuestionData.question.text}
                      </CardTitle>
                      {(currentQuestionData.required || currentQuestionData.question.validation?.required) && (
                        <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/30 text-xs font-semibold">
                          Required
                        </Badge>
                      )}
                    </div>
                    
                    {(currentQuestionData.customDescription || currentQuestionData.question.description) && (
                      <p className="text-sky-500 text-lg leading-relaxed">
                        {currentQuestionData.customDescription || currentQuestionData.question.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-10">
                <div className="space-y-6">
                  <QuestionInput
                    question={currentQuestionData}
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    onDescriptorChange={handleDescriptorChange}   // ← add
                    descriptorAnswers={descriptorAnswers}          // ← add
                    hasError={!!questionError}
                  />

                  <AnimatePresence>
                    {questionError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Alert className="border-ochre-500/50 bg-ochre-50 shadow-lg">
                          <AlertCircle className="h-5 w-5 text-ochre-500" />
                          <AlertDescription className="text-ochre-700 font-semibold ml-2">
                            {questionError}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            size="lg"
            className="border-2 border-concrete-500/30 text-sky-500 hover:bg-sky-50 hover:border-sky-500 disabled:opacity-30 disabled:cursor-not-allowed px-8 py-6 text-lg font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {!isPreview && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                size="lg"
                className="border-2 border-concrete-500/30 text-stratosphere-900 hover:bg-concrete-50 hover:border-concrete-500 px-8 py-6 text-lg font-semibold"
              >
                {isSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-stratosphere-900 border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Save Draft
              </Button>
            )}

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                size="lg"
                className="bg-grass-500 hover:from-grass-600 hover:to-forest-600 text-white shadow-2xl px-10 py-6 text-lg font-bold"
              >
                {isCompleting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {isPreview ? 'Finish Preview' : 'Complete Survey'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-forest-500 hover:from-forest-600 hover:to-grass-600 text-white shadow-2xl px-10 py-6 text-lg font-bold"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Survey Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4"
        >
          {isPreview ? (
            <Alert className="border-sky-500/50 bg-sky-50 shadow-lg">
              <Info className="h-5 w-5 text-sky-500" />
              <AlertDescription className="text-sky-700 font-medium ml-2">
                You are previewing this survey. Your answers will not be saved permanently.
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border-concrete-500/20 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-sky-500">
                  <CheckCircle className="h-4 w-4 text-forest-500" />
                  <p className="font-medium">
                    Your responses are automatically saved as you progress through the survey.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SurveyTakingPage;