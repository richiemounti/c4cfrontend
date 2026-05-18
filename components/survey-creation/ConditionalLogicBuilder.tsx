// components/survey-creation/ConditionalLogicBuilder.tsx
'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SurveyQuestionItem } from '@/types/survey-creation';

interface ConditionalLogicBuilderProps {
  question: SurveyQuestionItem;
  onSave: (logic: ConditionalLogicType) => void;
  onClose: () => void;
  allQuestions: SurveyQuestionItem[];
}

// ✅ UPDATED: Changed to camelCase operators
interface ConditionalLogicType {
  enabled: boolean;
  conditions: Array<{
    questionId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
  action: 'show' | 'hide';
}

export default function ConditionalLogicBuilder({ 
  question, 
  onSave, 
  onClose, 
  allQuestions 
}: ConditionalLogicBuilderProps) {
  const [logic, setLogic] = useState<ConditionalLogicType>(
    question.conditionalLogic || {
      enabled: false,
      conditions: [],
      action: 'show'
    }
  );

  const addCondition = () => {
    setLogic(prev => ({
      ...prev,
      conditions: [...prev.conditions, { questionId: '', operator: 'equals', value: '' }]
    }));
  };

  const removeCondition = (index: number) => {
    setLogic(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setLogic(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const handleSave = () => {
    onSave(logic);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Conditional Logic</DialogTitle>
        <DialogDescription>
          Configure when this question should be shown or hidden based on other answers
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center space-x-2">
          <Switch
            checked={logic.enabled}
            onCheckedChange={(enabled) => setLogic(prev => ({ ...prev, enabled }))}
          />
          <Label>Enable conditional logic</Label>
        </div>
        
        {logic.enabled && (
          <div className="space-y-4 border rounded-lg p-4">
            <div>
              <Label>Action</Label>
              <Select 
                value={logic.action} 
                onValueChange={(action: 'show' | 'hide') => setLogic(prev => ({ ...prev, action }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">Show this question</SelectItem>
                  <SelectItem value="hide">Hide this question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>When these conditions are met:</Label>
              <div className="space-y-2 mt-2">
                {logic.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded bg-stratosphere-50">
                    <Select 
                      value={condition.questionId} 
                      onValueChange={(questionId) => updateCondition(index, 'questionId', questionId)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select question" />
                      </SelectTrigger>
                      <SelectContent>
                        {allQuestions.map(q => (
                          <SelectItem key={q.questionId} value={q.questionId}>
                            <div className="max-w-64">
                              <div className="font-medium truncate">
                                {q.customText || q.question?.text}
                              </div>
                              <div className="text-xs text-sky-500">
                                {q.question?.type}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* ✅ UPDATED: Changed type annotation and values to camelCase */}
                    <Select 
                      value={condition.operator}
                      onValueChange={(operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan') => 
                        updateCondition(index, 'operator', operator)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="notEquals">Not equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="notContains">Not contains</SelectItem>
                        <SelectItem value="greaterThan">Greater than</SelectItem>
                        <SelectItem value="lessThan">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={condition.value || ''}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      className="text-ochre-500 hover:text-ochre-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </div>

            {logic.conditions.length > 1 && (
              <div className="text-sm text-sky-500 p-2 bg-sky-50 rounded">
                <strong>Note:</strong> All conditions must be met for the logic to trigger (AND logic).
              </div>
            )}
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600 text-white">
          Save Logic
        </Button>
      </DialogFooter>
    </>
  );
}