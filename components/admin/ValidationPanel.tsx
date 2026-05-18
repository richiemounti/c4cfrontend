// components/admin/ValidationPanel.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QuestionType } from '@/types';

interface ValidationPanelProps {
  question: any;
  onChange: (updatedQuestion: any) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  question, 
  onChange 
}) => {
  const handleValidationChange = (field: string, value: any) => {
    const updatedValidation = {
      ...question.validation,
      [field]: value
    };
    
    onChange({ ...question, validation: updatedValidation });
  };
  
  // For numeric inputs, ensure we store numbers not strings
  const handleNumericValidationChange = (field: string, value: string) => {
    const numericValue = value === '' ? undefined : Number(value);
    handleValidationChange(field, numericValue);
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="requirements">
          <AccordionTrigger>Requirements</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* For text inputs */}
              {['text', 'textarea'].includes(question.type) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minLength">Min Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        min="0"
                        value={question.validation?.minLength || ''}
                        onChange={(e) => handleNumericValidationChange('minLength', e.target.value)}
                        placeholder="Min characters"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLength">Max Length</Label>
                      <Input
                        id="maxLength"
                        type="number"
                        min="0"
                        value={question.validation?.maxLength || ''}
                        onChange={(e) => handleNumericValidationChange('maxLength', e.target.value)}
                        placeholder="Max characters"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pattern">Pattern (RegEx)</Label>
                    <Input
                      id="pattern"
                      value={question.validation?.pattern || ''}
                      onChange={(e) => handleValidationChange('pattern', e.target.value)}
                      placeholder="e.g. ^[A-Za-z0-9]+$"
                    />
                  </div>
                </>
              )}
              
              {/* For number inputs */}
              {question.type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min">Min Value</Label>
                    <Input
                      id="min"
                      type="number"
                      value={question.validation?.min ?? ''}
                      onChange={(e) => handleNumericValidationChange('min', e.target.value)}
                      placeholder="Min value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">Max Value</Label>
                    <Input
                      id="max"
                      type="number"
                      value={question.validation?.max ?? ''}
                      onChange={(e) => handleNumericValidationChange('max', e.target.value)}
                      placeholder="Max value"
                    />
                  </div>
                </div>
              )}
              
              {/* For date inputs */}
              {question.type === 'date' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minDate">Min Date</Label>
                    <Input
                      id="minDate"
                      type="date"
                      value={question.validation?.minDate || ''}
                      onChange={(e) => handleValidationChange('minDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDate">Max Date</Label>
                    <Input
                      id="maxDate"
                      type="date"
                      value={question.validation?.maxDate || ''}
                      onChange={(e) => handleValidationChange('maxDate', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {/* Selection limits for checkboxes/multi-select */}
              {question.type === 'checkbox' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSelect">Min Selections</Label>
                    <Input
                      id="minSelect"
                      type="number"
                      min="0"
                      max={question.options?.length || 0}
                      value={question.validation?.minSelect || ''}
                      onChange={(e) => handleNumericValidationChange('minSelect', e.target.value)}
                      placeholder="Min selections"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSelect">Max Selections</Label>
                    <Input
                      id="maxSelect"
                      type="number"
                      min="0"
                      max={question.options?.length || 0}
                      value={question.validation?.maxSelect || ''}
                      onChange={(e) => handleNumericValidationChange('maxSelect', e.target.value)}
                      placeholder="Max selections"
                    />
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="error-messages">
          <AccordionTrigger>Error Messages</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="requiredMessage">Required Field Message</Label>
                <Input
                  id="requiredMessage"
                  value={question.validation?.requiredMessage || ''}
                  onChange={(e) => handleValidationChange('requiredMessage', e.target.value)}
                  placeholder="This field is required"
                />
              </div>
              
              <div>
                <Label htmlFor="invalidMessage">Invalid Input Message</Label>
                <Input
                  id="invalidMessage"
                  value={question.validation?.invalidMessage || ''}
                  onChange={(e) => handleValidationChange('invalidMessage', e.target.value)}
                  placeholder="Please enter a valid value"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ValidationPanel;