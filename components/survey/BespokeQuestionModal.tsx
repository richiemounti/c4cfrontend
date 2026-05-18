// components/survey/BespokeQuestionModal.tsx - Bespoke question creation in survey editor
'use client';

import { useState } from 'react';
import { Wand2, Plus, X, CheckCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface BespokeQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuestion: (data: any) => Promise<void>;
  projectId: string;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'radio', label: 'Multiple Choice (Single)', description: 'Select one option' },
  { value: 'checkbox', label: 'Multiple Choice (Many)', description: 'Select multiple options' },
  { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown list' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'rating', label: 'Rating', description: 'Star or scale rating' },
];

export const BespokeQuestionModal = ({
  isOpen,
  onClose,
  onCreateQuestion,
  projectId
}: BespokeQuestionModalProps) => {
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    type: 'text',
    options: [{ label: '', value: '', descriptor: '', placeholder: '' }],
    targetAudience: 'both',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(formData.type);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    } else if (formData.text.length < 10) {
      newErrors.text = 'Question text must be at least 10 characters';
    } else if (formData.text.length > 500) {
      newErrors.text = 'Question text must be less than 500 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Question type is required';
    }

    if (requiresOptions) {
      const validOptions = formData.options.filter(opt => opt.label.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required for this question type';
      }
      
      const optionLabels = validOptions.map(opt => opt.label.toLowerCase().trim());
      const uniqueLabels = new Set(optionLabels);
      if (optionLabels.length !== uniqueLabels.size) {
        newErrors.options = 'Option labels must be unique';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '', descriptor: '', placeholder: '' }]
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, label: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = {
        ...newOptions[index],                              // ← preserve descriptor & placeholder
        label,
        value: label.toLowerCase().replace(/\s+/g, '_')
      };
      return { ...prev, options: newOptions };
    });
  };

  const handleOptionDescriptorChange = (index: number, descriptor: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], descriptor };
      return { ...prev, options: newOptions };
    });
  };

  const handleOptionPlaceholderChange = (index: number, placeholder: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], placeholder };
      return { ...prev, options: newOptions };
    });
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const questionData: any = {
        text: formData.text.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        targetAudience: formData.targetAudience,
        required: false
      };

      if (requiresOptions) {
        questionData.options = formData.options
          .filter(opt => opt.label.trim())
          .map(opt => ({
            label: opt.label.trim(),
            value: opt.value || opt.label.toLowerCase().replace(/\s+/g, '_'),
            ...(opt.descriptor && opt.descriptor.trim()
              ? { descriptor: opt.descriptor.trim() }
              : {}),
            ...(opt.placeholder && opt.placeholder.trim()
              ? { placeholder: opt.placeholder.trim() }
              : {}),
          }));
      }

      await onCreateQuestion(questionData);
      
      // Reset form
      setFormData({
        text: '',
        description: '',
        type: 'text',
        options: [{ label: '', value: '', descriptor: '', placeholder: '' }],
        targetAudience: 'both',
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      text: '',
      description: '',
      type: 'text',
      options: [{ label: '', value: '', descriptor: '', placeholder: '' }],
      targetAudience: 'both',
    });
    setErrors({});
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-clay-500" />
            Create Custom Question
          </SheetTitle>
          <SheetDescription>
            Create a bespoke question specific to your project needs. It will be submitted for approval before use.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">
              Question Text <span className="text-clay-500">*</span>
            </Label>
            <Textarea
              id="question-text"
              placeholder="What would you like to ask?"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className={`min-h-[100px] ${errors.text ? 'border-sand-500' : ''}`}
            />
            {errors.text && (
              <p className="text-sm text-sand-500">{errors.text}</p>
            )}
            <p className="text-xs text-sky-500">
              {formData.text.length}/500 characters (minimum 10)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="question-description">
              Description (Optional)
            </Label>
            <Textarea
              id="question-description"
              placeholder="Provide additional context or instructions..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
            <p className="text-xs text-sky-500">
              Help respondents understand what you're asking
            </p>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="question-type">
              Question Type <span className="text-clay-500">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className={errors.type ? 'border-sand-500' : ''}>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-sky-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-sand-500">{errors.type}</p>
            )}
          </div>

          {/* Options for choice-based questions */}
          {requiresOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Answer Options <span className="text-clay-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="rounded-lg border border-stratosphere-100 overflow-hidden">
                    {/* Label row */}
                    <div className="flex items-center gap-2 p-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {/* Toggle descriptor */}
                      <button
                        type="button"
                        title={option.descriptor !== undefined && option.descriptor !== '' ? 'Remove follow-up prompt' : 'Add follow-up prompt'}
                        onClick={() => {
                          handleOptionDescriptorChange(index, option.descriptor ? '' : ' ');
                        }}
                        className={`h-8 w-8 flex items-center justify-center rounded transition-colors flex-shrink-0 border ${
                          option.descriptor
                            ? 'text-stratosphere border-stratosphere bg-sky-50'
                            : 'text-sky-400 border-gray-200 hover:text-stratosphere hover:bg-sky-50'
                        }`}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      {formData.options.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="text-sand-500 hover:text-sand-600 hover:bg-sand-50 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {/* Descriptor fields — shown when toggled on */}
                    {option.descriptor !== undefined && option.descriptor !== '' && (
                      <div className="px-2 pb-2 pt-1 bg-sky-50 border-t border-sky-100 space-y-1.5">
                        <Input
                          value={option.descriptor === ' ' ? '' : option.descriptor}
                          onChange={(e) => handleOptionDescriptorChange(index, e.target.value || ' ')}
                          placeholder='Follow-up prompt e.g. "Please tell us more"'
                          className="h-8 text-sm border-stratosphere-200 bg-white"
                        />
                        <Input
                          value={option.placeholder || ''}
                          onChange={(e) => handleOptionPlaceholderChange(index, e.target.value)}
                          placeholder='Custom input placeholder (optional)'
                          className="h-8 text-sm border-stratosphere-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {errors.options && (
                <p className="text-sm text-sand-500">{errors.options}</p>
              )}
              <p className="text-xs text-sky-500">
                Minimum 2 options required
              </p>
            </div>
          )}

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Select 
              value={formData.targetAudience}
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Stakeholders</SelectItem>
                <SelectItem value="external">External Communities</SelectItem>
                <SelectItem value="both">Both Internal & External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert className="border-sky-500/30 bg-sky-50">
            <Info className="h-4 w-4 text-sky-500" />
            <AlertDescription className="text-sm text-sky-500">
              Your custom question will be immediately available for use in this project's surveys. 
              Project managers can also promote it for use across the wider platform.
            </AlertDescription>
          </Alert>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-clay-500 hover:bg-clay-600 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Question
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};