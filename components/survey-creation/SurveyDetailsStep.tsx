// components/survey-creation/SurveyDetailsStep.tsx
'use client';

import { FileText, Info, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SurveyCreationContextType, categoryOptions } from '@/types/survey-creation';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SurveyDetailsStepProps {
  context: SurveyCreationContextType;
  onNext: () => void;
}

export default function SurveyDetailsStep({ context, onNext }: SurveyDetailsStepProps) {
  const { 
    formData, 
    validationErrors, 
    handleInputChange, 
    questionsData 
  } = context;

  const [showHelp, setShowHelp] = useState(true);

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Survey title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Survey title must be less than 200 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Survey description is required';
    } else if (formData.description.length > 1000) {
      errors.description = 'Survey description must be less than 1000 characters';
    }
    
    if (formData.category === 'custom' && !formData.customCategoryName.trim()) {
      errors.customCategoryName = 'Custom category name is required';
    }

    context.setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Guide */}
      <Collapsible open={showHelp} onOpenChange={setShowHelp}>
        <Card className="border-petrol-500/30 bg-gradient-to-br from-petrol-50 to-sage-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-petrol-500 rounded-lg p-2">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-ink-900">
                    Survey Details Guide
                  </CardTitle>
                  <CardDescription className="text-petrol-500">
                    Tips for creating an effective survey
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {showHelp ? (
                    <ChevronUp className="h-4 w-4 text-petrol-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-petrol-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-stone-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-sage-500" />
                    <h4 className="font-semibold text-ink-900">Title Tips</h4>
                  </div>
                  <ul className="text-sm text-neutral-500 space-y-1">
                    <li>• Be clear and specific</li>
                    <li>• Include the survey purpose</li>
                    <li>• Keep it under 100 characters</li>
                    <li>• Example: "Baseline Community Impact Survey - Q1 2024"</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-stone-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-sage-500" />
                    <h4 className="font-semibold text-ink-900">Description Best Practices</h4>
                  </div>
                  <ul className="text-sm text-neutral-500 space-y-1">
                    <li>• Explain the survey's purpose</li>
                    <li>• Mention who should complete it</li>
                    <li>• State how data will be used</li>
                    <li>• Highlight confidentiality measures</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-sage-500/30 bg-sage-50">
                <Info className="h-4 w-4 text-sage-500" />
                <AlertDescription className="text-sm text-petrol-500">
                  <strong>Category Selection:</strong> Choose a category that best matches your survey's 
                  timing and purpose. This helps organize multiple surveys for the same stakeholder group.
                  Use "Custom" if none of the standard categories fit your needs.
                </AlertDescription>
              </Alert>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Form Card */}
      <Card className="bg-white border-stone-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-petrol-500" />
            Survey Details
          </CardTitle>
          <CardDescription>
            Basic information about your survey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-ink-900">
              Survey Title <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a clear, descriptive title..."
              className={`mt-1 border-stone-500/30 focus:border-petrol-500 ${
                validationErrors.title ? 'border-gold-500' : ''
              }`}
            />
            {validationErrors.title && (
              <p className="text-sm text-gold-500 mt-1">{validationErrors.title}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-ink-900">
              Survey Description <span className="text-gold-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the purpose, scope, and intended audience of this survey..."
              rows={4}
              className={`mt-1 border-stone-500/30 focus:border-petrol-500 ${
                validationErrors.description ? 'border-gold-500' : ''
              }`}
            />
            {validationErrors.description && (
              <p className="text-sm text-gold-500 mt-1">{validationErrors.description}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium text-ink-900">
              Survey Category <span className="text-gold-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="mt-1 border-stone-500/30 focus:border-petrol-500">
                <SelectValue placeholder="Select survey category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-neutral-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category === 'custom' && (
            <div>
              <Label htmlFor="customCategory" className="text-sm font-medium text-ink-900">
                Custom Category Name <span className="text-gold-500">*</span>
              </Label>
              <Input
                id="customCategory"
                value={formData.customCategoryName}
                onChange={(e) => handleInputChange('customCategoryName', e.target.value)}
                placeholder="e.g., Mid-term Assessment, Annual Review..."
                className={`mt-1 border-stone-500/30 focus:border-petrol-500 ${
                  validationErrors.customCategoryName ? 'border-gold-500' : ''
                }`}
              />
              {validationErrors.customCategoryName && (
                <p className="text-sm text-gold-500 mt-1">{validationErrors.customCategoryName}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="duration" className="text-sm font-medium text-ink-900">
              Estimated Duration (minutes) <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="480"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 0)}
              className="mt-1 border-stone-500/30 focus:border-petrol-500 w-32"
            />
            <p className="text-sm text-neutral-500 mt-1">
              Calculated from {questionsData.length} selected questions
              {formData.estimatedDuration > 30 && (
                <span className="text-gold-500 ml-2">
                  ⚠️ Surveys over 30 minutes may have lower completion rates
                </span>
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-500/20">
            <div className="text-center p-3 bg-ink-50 rounded-lg">
              <div className="text-2xl font-bold text-petrol-500">{questionsData.length}</div>
              <div className="text-xs text-neutral-500">Questions</div>
            </div>
            <div className="text-center p-3 bg-ink-50 rounded-lg">
              <div className="text-2xl font-bold text-sage-500">{formData.estimatedDuration}</div>
              <div className="text-xs text-neutral-500">Minutes</div>
            </div>
            <div className="text-center p-3 bg-ink-50 rounded-lg">
              <div className="text-2xl font-bold text-gold-500">
                {questionsData.filter(q => q.isBespoke).length || 0}
              </div>
              <div className="text-xs text-neutral-500">Bespoke</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="bg-petrol-500 hover:bg-petrol-900 text-white">
          Next: Survey Structure
        </Button>
      </div>
    </div>
  );
}