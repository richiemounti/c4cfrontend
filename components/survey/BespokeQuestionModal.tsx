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

// Kept in sync with the backend Question.type enum (question.model.ts) and the canonical
// QuestionType union (types/index.ts).
const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'radio', label: 'Multiple Choice (Single)', description: 'Select one option' },
  { value: 'checkbox', label: 'Multiple Choice (Many)', description: 'Select multiple options' },
  { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown list' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'time', label: 'Time', description: 'Time picker' },
  { value: 'datetime', label: 'Date & Time', description: 'Combined date and time picker' },
  { value: 'file', label: 'File Upload', description: 'Attach a file' },
  { value: 'location', label: 'Location', description: 'Location / GPS coordinates' },
  { value: 'scale', label: 'Rating Scale', description: 'Numeric scale (e.g. 1-5)' },
  { value: 'matrix', label: 'Matrix Grid', description: 'Grid of rows and columns' },
];

const DEFAULT_FORM_DATA = {
  text: '',
  description: '',
  type: 'text',
  options: [{ label: '', value: '', descriptor: '', placeholder: '' }],
  targetAudience: 'both',
  scaleMin: 1,
  scaleMax: 5,
  scaleStep: 1,
  scaleMinLabel: '',
  scaleMaxLabel: '',
  matrixRows: [{ label: '' }],
  matrixColumns: [{ label: '' }],
};

export const BespokeQuestionModal = ({
  isOpen,
  onClose,
  onCreateQuestion,
  projectId
}: BespokeQuestionModalProps) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
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

    if (formData.type === 'scale' && formData.scaleMin >= formData.scaleMax) {
      newErrors.scale = 'Min value must be less than max value';
    }

    if (formData.type === 'matrix') {
      const validRows = formData.matrixRows.filter(r => r.label.trim());
      const validColumns = formData.matrixColumns.filter(c => c.label.trim());
      if (validRows.length === 0 || validColumns.length === 0) {
        newErrors.matrix = 'At least one row and one column are required';
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

  // Scale config handlers
  const handleScaleFieldChange = (field: 'scaleMin' | 'scaleMax' | 'scaleStep', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScaleLabelChange = (field: 'scaleMinLabel' | 'scaleMaxLabel', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Matrix config handlers
  const handleAddMatrixItem = (type: 'matrixRows' | 'matrixColumns') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { label: '' }]
    }));
  };

  const handleRemoveMatrixItem = (type: 'matrixRows' | 'matrixColumns', index: number) => {
    setFormData(prev => {
      if (prev[type].length <= 1) return prev;
      return { ...prev, [type]: prev[type].filter((_, i) => i !== index) };
    });
  };

  const handleMatrixItemChange = (type: 'matrixRows' | 'matrixColumns', index: number, label: string) => {
    setFormData(prev => {
      const items = [...prev[type]];
      items[index] = { label };
      return { ...prev, [type]: items };
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

      if (formData.type === 'scale') {
        questionData.scaleConfig = {
          min: formData.scaleMin,
          max: formData.scaleMax,
          step: formData.scaleStep,
          minLabel: formData.scaleMinLabel.trim() || undefined,
          maxLabel: formData.scaleMaxLabel.trim() || undefined,
        };
      }

      if (formData.type === 'matrix') {
        questionData.matrixConfig = {
          rows: formData.matrixRows.filter(r => r.label.trim()).map(r => ({ label: r.label.trim() })),
          columns: formData.matrixColumns
            .filter(c => c.label.trim())
            .map((c, i) => ({ value: `${i + 1}`, label: c.label.trim() })),
        };
      }

      await onCreateQuestion(questionData);

      // Reset form
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_FORM_DATA);
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
              <p className="text-sm text-clay">{errors.text}</p>
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
              <p className="text-sm text-clay">{errors.type}</p>
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
                          className="text-clay hover:text-sand-600 hover:bg-sand-50 h-8 w-8 p-0"
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
                <p className="text-sm text-clay">{errors.options}</p>
              )}
              <p className="text-xs text-sky-500">
                Minimum 2 options required
              </p>
            </div>
          )}

          {/* Scale configuration */}
          {formData.type === 'scale' && (
            <div className="space-y-3 border border-ochre-200 rounded-lg p-3 bg-ochre-50/50">
              <Label>Scale Configuration</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Min Value</Label>
                  <Input
                    type="number"
                    value={formData.scaleMin}
                    onChange={(e) => handleScaleFieldChange('scaleMin', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Value</Label>
                  <Input
                    type="number"
                    value={formData.scaleMax}
                    onChange={(e) => handleScaleFieldChange('scaleMax', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Step</Label>
                  <Input
                    type="number"
                    value={formData.scaleStep}
                    onChange={(e) => handleScaleFieldChange('scaleStep', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Min Label (optional)</Label>
                  <Input
                    value={formData.scaleMinLabel}
                    onChange={(e) => handleScaleLabelChange('scaleMinLabel', e.target.value)}
                    placeholder="e.g., Strongly Disagree"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Label (optional)</Label>
                  <Input
                    value={formData.scaleMaxLabel}
                    onChange={(e) => handleScaleLabelChange('scaleMaxLabel', e.target.value)}
                    placeholder="e.g., Strongly Agree"
                  />
                </div>
              </div>
              {errors.scale && (
                <p className="text-sm text-clay">{errors.scale}</p>
              )}
            </div>
          )}

          {/* Matrix configuration */}
          {formData.type === 'matrix' && (
            <div className="space-y-4 border border-forest-200 rounded-lg p-3 bg-forest-50/50">
              <Label>Matrix Configuration</Label>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Rows (Questions)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMatrixItem('matrixRows')}
                    className="h-7 border-forest-500/30 text-forest-600 hover:bg-forest-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.matrixRows.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Row ${index + 1}`}
                        value={row.label}
                        onChange={(e) => handleMatrixItemChange('matrixRows', index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.matrixRows.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMatrixItem('matrixRows', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Columns (Answer Options)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMatrixItem('matrixColumns')}
                    className="h-7 border-forest-500/30 text-forest-600 hover:bg-forest-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.matrixColumns.map((column, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Column ${index + 1}`}
                        value={column.label}
                        onChange={(e) => handleMatrixItemChange('matrixColumns', index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.matrixColumns.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMatrixItem('matrixColumns', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {errors.matrix && (
                <p className="text-sm text-clay">{errors.matrix}</p>
              )}
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