// components/survey/ConditionalLogicModal.tsx - Updated with explanations and clay colors
'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { updateSurveyQuestion } from '@/lib/api/surveyQuestion';
import { useToast } from "@/hooks/use-toast";
import type { ConditionalLogicModalProps } from '@/types/survey-edit';

export const ConditionalLogicModal = ({
  isOpen,
  onClose,
  questionId,
  surveyId,
  allQuestions,
  onUpdate
}: ConditionalLogicModalProps) => {
  const { toast } = useToast();
  const [conditions, setConditions] = useState<any[]>([]);
  const [action, setAction] = useState<'show' | 'hide'>('show');
  const [saving, setSaving] = useState(false);
  const [showExamples, setShowExamples] = useState(true);

  useEffect(() => {
    if (isOpen && questionId) {
      const question = allQuestions.find(q => q._id === questionId);
      if (question?.conditionalLogic?.enabled) {
        setConditions(question.conditionalLogic.conditions || []);
        setAction(question.conditionalLogic.action || 'show');
      } else {
        setConditions([]);
        setAction('show');
      }
    }
  }, [isOpen, questionId, allQuestions]);

  const addCondition = () => {
    setConditions([...conditions, {
      questionId: '',
      operator: 'equals',
      value: ''
    }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const saveConditionalLogic = async () => {
    try {
      setSaving(true);
      const conditionalLogic = {
        enabled: conditions.length > 0,
        conditions,
        action
      };
      
      await updateSurveyQuestion(surveyId, questionId, { conditionalLogic });
      onUpdate();
      onClose();
      toast({
        title: 'Conditional logic saved',
        description: 'Question logic has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to save conditional logic:', error);
      toast({
        title: 'Error',
        description: 'Failed to save conditional logic',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      'equals': 'equals',
      'notEquals': 'not equals',
      'contains': 'contains',
      'notContains': 'does not contain',
      'greaterThan': 'greater than',
      'lessThan': 'less than'
    };
    return labels[operator] || operator;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="bg-clay-50 border-b border-clay-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-stratosphere-900 flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-clay-500" />
                Conditional Logic Builder
              </CardTitle>
              <p className="text-sm text-sky-500">Show or hide questions dynamically based on previous answers</p>
            </div>
          </div>
          
          {/* Explanation Card */}
          <Collapsible open={showExamples} onOpenChange={setShowExamples} className="mt-4">
            <Card className="bg-white border-sky-500/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-sky-500" />
                    <h4 className="text-sm font-semibold text-stratosphere-900">
                      How Conditional Logic Works
                    </h4>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {showExamples ? (
                        <ChevronUp className="h-4 w-4 text-sky-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-sky-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <p className="text-xs text-sky-500 mb-3">
                    Control when questions appear or disappear based on how respondents answer previous questions. 
                    You can create simple rules or combine multiple conditions for complex logic.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <div className="font-semibold text-stratosphere-900 mb-1">Common Use Cases:</div>
                      
                      <div className="space-y-2 pl-3 border-l-2 border-clay-500/20">
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1 bg-grass-50 text-grass-700 border-grass-500/20">
                            Example 1: Skip Logic
                          </Badge>
                          <p className="text-sky-500">
                            <strong>SHOW</strong> "What crops do you grow?" <strong>WHEN</strong> "Are you a farmer?" <strong>EQUALS</strong> "Yes"
                          </p>
                          <p className="text-xs text-concrete-500 mt-0.5">
                            → Only farmers see crop-related questions
                          </p>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1 bg-ochre-50 text-ochre-700 border-ochre-500/20">
                            Example 2: Privacy Protection
                          </Badge>
                          <p className="text-sky-500">
                            <strong>HIDE</strong> "Income details" <strong>WHEN</strong> "Share personal info" <strong>EQUALS</strong> "Prefer not to say"
                          </p>
                          <p className="text-xs text-concrete-500 mt-0.5">
                            → Respect respondent privacy preferences
                          </p>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1 bg-sky-50 text-sky-700 border-sky-500/20">
                            Example 3: Multiple Conditions
                          </Badge>
                          <p className="text-sky-500">
                            <strong>SHOW</strong> "Employee count" <strong>WHEN</strong> "Are you a business owner?" <strong>EQUALS</strong> "Yes" 
                            <strong> AND</strong> "Years in business" <strong>GREATER THAN</strong> "2"
                          </p>
                          <p className="text-xs text-concrete-500 mt-0.5">
                            → Only established business owners see this question
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-concrete-500/10 text-xs text-sky-500">
                      <strong>Note:</strong> All conditions must be true (AND logic) for the rule to apply. 
                      Questions without conditions are always visible.
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Action Selection */}
            <div>
              <Label className="text-stratosphere-900 font-medium mb-2 block">
                Question Visibility Action
              </Label>
              <p className="text-xs text-sky-500 mb-3">
                Choose whether to show or hide this question when conditions are met
              </p>
              <div className="flex gap-3">
                <Button
                  variant={action === 'show' ? 'default' : 'outline'}
                  onClick={() => setAction('show')}
                  className={action === 'show' ? 'bg-clay-500 hover:bg-clay-600 text-white' : 'border-concrete-500/30'}
                  disabled={saving}
                >
                  Show Question
                </Button>
                <Button
                  variant={action === 'hide' ? 'default' : 'outline'}
                  onClick={() => setAction('hide')}
                  className={action === 'hide' ? 'bg-clay-500 hover:bg-clay-600 text-white' : 'border-concrete-500/30'}
                  disabled={saving}
                >
                  Hide Question
                </Button>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-stratosphere-900 font-medium">When these conditions are met:</Label>
                  <p className="text-xs text-sky-500 mt-1">
                    Add one or more conditions. All conditions must be true (AND logic).
                  </p>
                </div>
                <Button 
                  onClick={addCondition} 
                  size="sm" 
                  className="bg-grass-500 hover:bg-grass-600 text-white"
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              {conditions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-concrete-500/30 rounded-lg bg-stratosphere-50">
                  <Zap className="h-10 w-10 text-concrete-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-stratosphere-900 mb-1">No Conditions Set</p>
                  <p className="text-xs text-sky-500 mb-4">
                    This question will always be visible. Click "Add Condition" to create logic rules.
                  </p>
                  <Button 
                    onClick={addCondition}
                    variant="outline"
                    size="sm"
                    className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Condition
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <Card key={index} className="border border-concrete-500/20 bg-stratosphere-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs bg-white border-clay-500/30 text-clay-700">
                            Condition {index + 1}
                          </Badge>
                          {index > 0 && (
                            <Badge className="text-xs bg-sky-100 text-sky-700 border-0">
                              AND
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div className="md:col-span-1">
                            <Label className="text-xs text-sky-500 mb-1.5 block">If this question</Label>
                            <select
                              value={condition.questionId}
                              onChange={(e) => updateCondition(index, 'questionId', e.target.value)}
                              className="w-full p-2 border border-concrete-500/20 rounded-md text-sm bg-white focus:border-clay-500 focus:ring-1 focus:ring-clay-500"
                              disabled={saving}
                            >
                              <option value="">Select question</option>
                              {allQuestions
                                .filter(q => q._id !== questionId)
                                .map(q => (
                                  <option key={q._id} value={q._id}>
                                    {q.customText || q.question?.text || 'Untitled Question'}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                          
                          <div className="md:col-span-1">
                            <Label className="text-xs text-sky-500 mb-1.5 block">Condition</Label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                              className="w-full p-2 border border-concrete-500/20 rounded-md text-sm bg-white focus:border-clay-500 focus:ring-1 focus:ring-clay-500"
                              disabled={saving}
                            >
                              <option value="equals">Equals</option>
                              <option value="notEquals">Not Equals</option>
                              <option value="contains">Contains</option>
                              <option value="notContains">Does Not Contain</option>
                              <option value="greaterThan">Greater Than</option>
                              <option value="lessThan">Less Than</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-1">
                            <Label className="text-xs text-sky-500 mb-1.5 block">This value</Label>
                            <Input
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder="Enter value"
                              className="text-sm focus:border-clay-500 focus:ring-1 focus:ring-clay-500"
                              disabled={saving}
                            />
                          </div>
                          
                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(index)}
                              className="text-sand-500 hover:bg-sand-50 hover:text-sand-600"
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Logic Preview */}
            {conditions.length > 0 && (
              <Card className="bg-clay-50 border-clay-500/20">
                <CardContent className="p-4">
                  <Label className="text-stratosphere-900 font-medium mb-2 block">Logic Preview:</Label>
                  <div className="text-sm text-sky-500 space-y-1">
                    <p className="font-medium text-stratosphere-900">
                      {action === 'show' ? '✓ SHOW' : '✗ HIDE'} this question when:
                    </p>
                    {conditions.map((condition, index) => {
                      const question = allQuestions.find(q => q._id === condition.questionId);
                      const questionText = question?.customText || question?.question?.text || 'selected question';
                      return (
                        <div key={index} className="flex items-start gap-2 pl-4">
                          {index > 0 && (
                            <Badge className="text-xs bg-sky-100 text-sky-700 border-0 mt-0.5">AND</Badge>
                          )}
                          <p className="flex-1">
                            "<strong className="text-stratosphere-900">{questionText}</strong>" {getOperatorLabel(condition.operator)} "<strong className="text-stratosphere-900">{condition.value}</strong>"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
        
        <div className="flex justify-between items-center gap-3 p-6 border-t border-concrete-500/20 bg-stratosphere-50">
          <p className="text-xs text-sky-500">
            {conditions.length === 0 
              ? 'No conditions - question is always visible' 
              : `${conditions.length} condition${conditions.length > 1 ? 's' : ''} configured`
            }
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={saving}
              className="border-concrete-500/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveConditionalLogic}
              className="bg-clay-500 hover:bg-clay-600 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                'Save Logic'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};