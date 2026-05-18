// components/admin/ConditionalLogicBuilder.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  Link as LinkIcon,
  Info,
  ChevronDown,
  Check,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  ConditionalLogic,
  ConditionalLogicCondition,
  Question,
  getValidOperatorsForQuestionType,
  operatorLabels,
  getConditionDisplayText
} from '@/types';
import { getQuestionsForConditionalLogic } from '@/lib/api/question';

interface ConditionalLogicBuilderProps {
  value?: ConditionalLogic;
  onChange: (logic: ConditionalLogic | undefined) => void;
  currentQuestionId?: string; // For editing existing questions
  currentQuestionType?: string;
  disabled?: boolean;
}

const ConditionalLogicBuilder: React.FC<ConditionalLogicBuilderProps> = ({
  value,
  onChange,
  currentQuestionId,
  currentQuestionType,
  disabled = false
}) => {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<{[key: string]: string}>({});
  const [questionPopoverOpen, setQuestionPopoverOpen] = useState<{[key: number]: boolean}>({});
  const [questionSearches, setQuestionSearches] = useState<{[key: number]: string}>({});

  // Load available questions for conditional logic
  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const response = await getQuestionsForConditionalLogic(currentQuestionId);
        const questions: Question[] = response.data || [];
        setAvailableQuestions(questions);

        // Seed selectedQuestionTypes from any existing conditions so the
        // operator dropdown and value input render correctly on first open.
        if (value?.conditions?.length) {
          const types: { [key: string]: string } = {};
          value.conditions.forEach((condition, index) => {
            const qId = typeof condition.questionId === 'object' && condition.questionId !== null
              ? (condition.questionId as any)._id
              : condition.questionId;
            const matched = questions.find(q => q._id === qId);
            if (matched) types[index] = matched.type;
          });
          setSelectedQuestionTypes(types);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        setAvailableQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [currentQuestionId]); // value intentionally omitted — only seed on initial load

  // Initialize with default values if enabled but empty
  const conditionalLogic = value || {
    enabled: false,
    conditions: [],
    action: 'show' as const,
    logicOperator: 'AND' as const
  };

  const handleEnableChange = (enabled: boolean) => {
    if (enabled) {
      onChange({
        enabled: true,
        conditions: [createEmptyCondition()],
        action: 'show',
        logicOperator: 'AND'
      });
    } else {
      onChange({
        enabled: false,
        conditions: [],
        action: 'show',
        logicOperator: 'AND'
      });
    }
  };

  const createEmptyCondition = (): ConditionalLogicCondition => ({
    questionId: '',
    operator: 'equals',
    value: ''
  });

  const handleConditionChange = (index: number, field: keyof ConditionalLogicCondition, value: any) => {
    const newConditions = [...conditionalLogic.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };

    // If changing questionId, update the selected question type
    if (field === 'questionId' && value) {
      const selectedQuestion = availableQuestions.find(q => q._id === value);
      if (selectedQuestion) {
        setSelectedQuestionTypes(prev => ({
          ...prev,
          [index]: selectedQuestion.type
        }));
        
        // Reset operator to a valid one for this question type
        const validOperators = getValidOperatorsForQuestionType(selectedQuestion.type as any);
        if (!validOperators.includes(newConditions[index].operator as any)) {
          newConditions[index].operator = validOperators[0];
        }
      }
    }

    onChange({
      ...conditionalLogic,
      conditions: newConditions
    });
  };

  const handleAddCondition = () => {
    onChange({
      ...conditionalLogic,
      conditions: [...conditionalLogic.conditions, createEmptyCondition()]
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = conditionalLogic.conditions.filter((_, i) => i !== index);
    
    if (newConditions.length === 0) {
      onChange(undefined);
    } else {
      onChange({
        ...conditionalLogic,
        conditions: newConditions
      });
    }
  };

  const handleActionChange = (action: 'show' | 'hide') => {
    onChange({
      ...conditionalLogic,
      action
    });
  };

  const handleLogicOperatorChange = (logicOperator: 'AND' | 'OR') => {
    onChange({
      ...conditionalLogic,
      logicOperator
    });
  };

  const getAvailableOperators = (conditionIndex: number) => {
    const questionType = selectedQuestionTypes[conditionIndex];
    if (!questionType) return [];
    
    return getValidOperatorsForQuestionType(questionType as any);
  };

  const renderValueInput = (condition: ConditionalLogicCondition, index: number) => {
    const questionType = selectedQuestionTypes[index];
    const selectedQuestion = availableQuestions.find(q => q._id === condition.questionId);

    // For radio, checkbox, dropdown - show options
    if (selectedQuestion && ['radio', 'checkbox', 'dropdown'].includes(selectedQuestion.type)) {
      return (
        <Select
          value={condition.value?.toString() || ''}
          onValueChange={(value) => handleConditionChange(index, 'value', value)}
          disabled={disabled}
        >
          <SelectTrigger className="border-stratosphere-200 h-9">
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-stratosphere">
            {(selectedQuestion.options || []).map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For number type
    if (questionType === 'number' || questionType === 'scale') {
      return (
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
          placeholder="Enter number..."
          className="border-stratosphere-200 h-9"
          disabled={disabled}
        />
      );
    }

    // For date type
    if (questionType === 'date') {
      return (
        <Input
          type="date"
          value={condition.value || ''}
          onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
          className="border-stratosphere-200 h-9"
          disabled={disabled}
        />
      );
    }

    // Default text input
    return (
      <Input
        type="text"
        value={condition.value || ''}
        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
        placeholder="Enter value..."
        className="border-stratosphere-200 h-9"
        disabled={disabled}
      />
    );
  };

  return (
    <Card className="border-stratosphere-200 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-sky-50 to-stratosphere-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-stratosphere" />
            <div>
              <CardTitle className="text-sm text-stratosphere">Conditional Logic</CardTitle>
              <CardDescription className="text-xs">
                Show or hide this question based on other question responses
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={conditionalLogic.enabled}
            onCheckedChange={handleEnableChange}
            disabled={disabled}
            className="data-[state=checked]:bg-stratosphere"
          />
        </div>
      </CardHeader>

      {conditionalLogic.enabled && (
        <CardContent className="pt-4 space-y-4">
          <Alert className="bg-sky-50 border-sky-200">
            <Info className="h-4 w-4 text-sky-700" />
            <AlertDescription className="text-xs text-sky-700">
              This question will be {conditionalLogic.action === 'show' ? 'shown' : 'hidden'} when the conditions below are met.
              {conditionalLogic.conditions.length > 1 && (
                <span> All conditions must be {conditionalLogic.logicOperator === 'AND' ? 'true' : 'met (any)'}.</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Action Selection */}
          <div>
            <Label className="text-xs font-medium text-stratosphere mb-2 block">
              Action
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={conditionalLogic.action === 'show' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionChange('show')}
                disabled={disabled}
                className={conditionalLogic.action === 'show' 
                  ? 'bg-stratosphere hover:bg-stratosphere-900' 
                  : 'border-stratosphere text-stratosphere'
                }
              >
                Show Question
              </Button>
              <Button
                type="button"
                variant={conditionalLogic.action === 'hide' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleActionChange('hide')}
                disabled={disabled}
                className={conditionalLogic.action === 'hide' 
                  ? 'bg-stratosphere hover:bg-stratosphere-900' 
                  : 'border-stratosphere text-stratosphere'
                }
              >
                Hide Question
              </Button>
            </div>
          </div>

          {/* Logic Operator (if multiple conditions) */}
          {conditionalLogic.conditions.length > 1 && (
            <div>
              <Label className="text-xs font-medium text-stratosphere mb-2 block">
                Match
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={conditionalLogic.logicOperator === 'AND' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLogicOperatorChange('AND')}
                  disabled={disabled}
                  className={conditionalLogic.logicOperator === 'AND' 
                    ? 'bg-stratosphere hover:bg-stratosphere-900' 
                    : 'border-stratosphere text-stratosphere'
                  }
                >
                  All Conditions (AND)
                </Button>
                <Button
                  type="button"
                  variant={conditionalLogic.logicOperator === 'OR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLogicOperatorChange('OR')}
                  disabled={disabled}
                  className={conditionalLogic.logicOperator === 'OR' 
                    ? 'bg-stratosphere hover:bg-stratosphere-900' 
                    : 'border-stratosphere text-stratosphere'
                  }
                >
                  Any Condition (OR)
                </Button>
              </div>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-stratosphere">
                Conditions {conditionalLogic.conditions.length > 0 && `(${conditionalLogic.conditions.length})`}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
                disabled={disabled || loadingQuestions}
                className="h-7 text-xs border-stratosphere text-stratosphere hover:bg-sky-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Condition
              </Button>
            </div>

            {loadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-stratosphere border-t-transparent rounded-full"></div>
              </div>
            ) : availableQuestions.length === 0 ? (
              <Alert className="bg-ochre-50 border-ochre-200">
                <AlertCircle className="h-4 w-4 text-ochre-700" />
                <AlertDescription className="text-xs text-ochre-700">
                  No other questions found in the question bank. Create additional questions first to use them as conditions.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {conditionalLogic.conditions.map((condition, index) => (
                  <div key={index} className="p-3 bg-concrete-50 rounded-lg border border-stratosphere-200">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="bg-white border-stratosphere">
                        Condition {index + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCondition(index)}
                        disabled={disabled}
                        className="h-6 w-6 text-sand-700 hover:text-sand-900 hover:bg-sand-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {/* Question Selection — searchable combobox */}
                      <div>
                        <Label className="text-xs font-medium text-stratosphere mb-1 block">
                          If question
                        </Label>
                        <Popover
                          open={!!questionPopoverOpen[index]}
                          onOpenChange={(open) =>
                            setQuestionPopoverOpen(prev => ({ ...prev, [index]: open }))
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={disabled}
                              className="w-full justify-between border-stratosphere-200 h-9 bg-white font-normal text-left"
                            >
                              <span className="truncate text-sm text-stratosphere">
                                {condition.questionId
                                  ? availableQuestions.find(q => q._id === condition.questionId)?.text ?? 'Select a question...'
                                  : 'Select a question...'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[380px] p-0 border-stratosphere-200 shadow-lg" align="start">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-stratosphere-100">
                              <Search className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                              <input
                                placeholder="Search questions..."
                                value={questionSearches[index] || ''}
                                onChange={(e) =>
                                  setQuestionSearches(prev => ({ ...prev, [index]: e.target.value }))
                                }
                                className="flex-1 text-sm outline-none bg-transparent placeholder:text-sky-300 text-stratosphere"
                              />
                              {questionSearches[index] && (
                                <button
                                  onClick={() => setQuestionSearches(prev => ({ ...prev, [index]: '' }))}
                                  className="text-sky-400 hover:text-stratosphere"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {availableQuestions
                                .filter(q =>
                                  !questionSearches[index] ||
                                  q.text.toLowerCase().includes(questionSearches[index].toLowerCase())
                                )
                                .map((q) => (
                                  <div
                                    key={q._id}
                                    className="flex items-start gap-2 px-3 py-2 hover:bg-sky-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      handleConditionChange(index, 'questionId', q._id);
                                      setQuestionPopoverOpen(prev => ({ ...prev, [index]: false }));
                                      setQuestionSearches(prev => ({ ...prev, [index]: '' }));
                                    }}
                                  >
                                    <div className={`flex items-center justify-center w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 transition-colors ${
                                      condition.questionId === q._id
                                        ? 'bg-stratosphere border-stratosphere'
                                        : 'border-stratosphere-300'
                                    }`}>
                                      {condition.questionId === q._id && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-stratosphere line-clamp-2">{q.text}</span>
                                        {q.status !== 'published' && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-concrete-100 text-stratosphere border border-concrete-300 capitalize flex-shrink-0">
                                            {q.status}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-sky-500">
                                        {q.type}{(q.theme as any)?.name ? ` • ${(q.theme as any).name}` : ''}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              }
                              {availableQuestions.filter(q =>
                                !questionSearches[index] ||
                                q.text.toLowerCase().includes(questionSearches[index].toLowerCase())
                              ).length === 0 && (
                                <p className="text-xs text-sky-500 p-3 text-center">No questions match your search</p>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Operator Selection */}
                      {condition.questionId && (
                        <div>
                          <Label className="text-xs font-medium text-stratosphere mb-1 block">
                            Is
                          </Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => handleConditionChange(index, 'operator', value)}
                            disabled={disabled}
                          >
                            <SelectTrigger className="border-stratosphere-200 h-9 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-stratosphere">
                              {getAvailableOperators(index).map((op) => (
                                <SelectItem key={op} value={op}>
                                  {operatorLabels[op]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Value Input */}
                      {condition.questionId && condition.operator && (
                        <div>
                          <Label className="text-xs font-medium text-stratosphere mb-1 block">
                            Value
                          </Label>
                          {renderValueInput(condition, index)}
                        </div>
                      )}
                    </div>

                    {/* Condition Preview */}
                    {condition.questionId && condition.operator && condition.value && (
                      <div className="mt-3 p-2 bg-sky-50 rounded border border-sky-200">
                        <p className="text-xs text-sky-700">
                          <strong>Preview:</strong> {getConditionDisplayText(
                            condition,
                            availableQuestions.find(q => q._id === condition.questionId)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {conditionalLogic.conditions.length > 0 && 
           conditionalLogic.conditions.every(c => c.questionId && c.operator && c.value) && (
            <Alert className="bg-grass-50 border-grass-200">
              <Info className="h-4 w-4 text-grass-700" />
              <AlertDescription className="text-xs text-grass-700">
                <strong>Summary:</strong> This question will be <strong>{conditionalLogic.action}n</strong> when{' '}
                {conditionalLogic.conditions.length === 1 ? (
                  'the condition above is met'
                ) : (
                  <>
                    <strong>{conditionalLogic.logicOperator === 'AND' ? 'all' : 'any'}</strong> of the {conditionalLogic.conditions.length} conditions above {conditionalLogic.logicOperator === 'AND' ? 'are' : 'is'} met
                  </>
                )}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ConditionalLogicBuilder;