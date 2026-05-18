// components/admin/PreviewQuestion.tsx - Updated with Scale/Matrix descriptions
import { useState } from 'react';
import { 
  AlertCircle, 
  Info, 
  FileText,
  Hash,
  Calendar,
  Clock,
  CheckSquare,
  Radio,
  ChevronDown,
  Star,
  Grid3X3,
  Paperclip,
  MapPin,
  Users,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuestionType, QUESTION_TYPE_CONFIG } from '@/types';

interface PreviewQuestionProps {
  question: any;
}

const PreviewQuestion = ({ question }: PreviewQuestionProps) => {
  const [value, setValue] = useState<any>('');
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [descriptorAnswers, setDescriptorAnswers] = useState<Record<string, string>>({}); // ← add

  // Helper function to validate the input based on question validation rules
  const validateInput = (input: any) => {
    if (!question.validation) return true;
    
    // If required and empty
    if (question.required && (input === '' || input === null || input === undefined)) {
      setValidationMessage('This field is required');
      return false;
    }
    
    switch (question.type) {
      case 'text':
      case 'textarea':
        if (question.validation.min && input.length < question.validation.min) {
          setValidationMessage(`Minimum length is ${question.validation.min} characters`);
          return false;
        }
        if (question.validation.max && input.length > question.validation.max) {
          setValidationMessage(`Maximum length is ${question.validation.max} characters`);
          return false;
        }
        if (question.validation.pattern && !new RegExp(question.validation.pattern).test(input)) {
          setValidationMessage(question.validation.errorMessage || 'Input format is invalid');
          return false;
        }
        break;
        
      case 'number':
        const num = parseFloat(input);
        if (isNaN(num)) {
          setValidationMessage('Please enter a valid number');
          return false;
        }
        if (question.validation.min !== undefined && num < question.validation.min) {
          setValidationMessage(`Minimum value is ${question.validation.min}`);
          return false;
        }
        if (question.validation.max !== undefined && num > question.validation.max) {
          setValidationMessage(`Maximum value is ${question.validation.max}`);
          return false;
        }
        break;
        
      case 'checkbox':
        if (question.validation.min && Array.isArray(input) && input.length < question.validation.min) {
          setValidationMessage(`Please select at least ${question.validation.min} options`);
          return false;
        }
        if (question.validation.max && Array.isArray(input) && input.length > question.validation.max) {
          setValidationMessage(`Please select no more than ${question.validation.max} options`);
          return false;
        }
        break;
    }
    
    setValidationMessage('');
    return true;
  };

  const handleChange = (newValue: any) => {
    setValue(newValue);
    setIsValid(validateInput(newValue));
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    const icons = {
      text: <FileText className="h-4 w-4" />,
      textarea: <FileText className="h-4 w-4" />,
      number: <Hash className="h-4 w-4" />,
      date: <Calendar className="h-4 w-4" />,
      time: <Clock className="h-4 w-4" />,
      datetime: <Calendar className="h-4 w-4" />,
      radio: <Radio className="h-4 w-4" />,
      checkbox: <CheckSquare className="h-4 w-4" />,
      dropdown: <ChevronDown className="h-4 w-4" />,
      scale: <Star className="h-4 w-4" />,
      matrix: <Grid3X3 className="h-4 w-4" />,
      file: <Paperclip className="h-4 w-4" />,
      location: <MapPin className="h-4 w-4" />
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const handleDescriptorChange = (optionValue: string, text: string) => {
  setDescriptorAnswers(prev => ({ ...prev, [optionValue]: text }));
};

  // Render the appropriate input type based on question type
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input 
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'textarea':
        return (
          <textarea 
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Your answer..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'number':
        return (
          <input 
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter a number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={question.validation?.min}
            max={question.validation?.max}
            step={question.validation?.step || 'any'}
          />
        );
        
      case 'date':
        return (
          <input 
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );
        
      case 'time':
        return (
          <input 
            type="time"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'datetime':
        return (
          <input 
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {(question.options || []).map((opt: any, index: number) => (
              <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                <label className="flex items-center space-x-3 cursor-pointer px-3 py-2 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name={`preview-radio-${question.tempId}`}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-900">{opt.label}</span>
                </label>

                {/* Descriptor input — only shown when this option is selected AND has a descriptor */}
                {opt.descriptor !== undefined && opt.descriptor !== null && value === opt.value && (
                  <div className="px-3 pb-3 pt-1 bg-sky-50 border-t border-sky-100">
                    {opt.descriptor && (
                      <p className="text-xs text-sky-700 mb-1.5">{opt.descriptor}</p>
                    )}
                    <input
                      type="text"
                      value={descriptorAnswers[opt.value] || ''}
                      onChange={(e) => handleDescriptorChange(opt.value, e.target.value)}
                      placeholder={opt.placeholder || 'Your answer…'}
                      className="w-full px-3 py-1.5 text-sm border border-stratosphere-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {(question.options || []).map((opt: any, index: number) => {
              const isChecked = Array.isArray(value) && value.includes(opt.value);

              return (
                <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                  <label className="flex items-center space-x-3 cursor-pointer px-3 py-2 hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newValue = Array.isArray(value) ? [...value] : [];
                        if (e.target.checked) {
                          newValue.push(opt.value);
                        } else {
                          const idx = newValue.indexOf(opt.value);
                          if (idx !== -1) newValue.splice(idx, 1);
                          // Clear descriptor answer when unchecked
                          setDescriptorAnswers(prev => {
                            const next = { ...prev };
                            delete next[opt.value];
                            return next;
                          });
                        }
                        handleChange(newValue);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-900">{opt.label}</span>
                  </label>

                  {/* Descriptor input — only shown when this option is checked AND has a descriptor */}
                  {opt.descriptor !== undefined && opt.descriptor !== null && isChecked && (
                    <div className="px-3 pb-3 pt-1 bg-sky-50 border-t border-sky-100">
                      {opt.descriptor && (
                        <p className="text-xs text-sky-700 mb-1.5">{opt.descriptor}</p>
                      )}
                      <input
                        type="text"
                        value={descriptorAnswers[opt.value] || ''}
                        onChange={(e) => handleDescriptorChange(opt.value, e.target.value)}
                        placeholder={opt.placeholder || 'Your answer…'}
                        className="w-full px-3 py-1.5 text-sm border border-stratosphere-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
        
      case 'dropdown':
        const selectedDropdownOption = (question.options || []).find(
          (opt: any) => opt.value === value
        );
        const hasDropdownDescriptor =
          selectedDropdownOption &&
          selectedDropdownOption.descriptor !== undefined &&
          selectedDropdownOption.descriptor !== null;

        return (
          <div className="space-y-3">
            <select
              value={value}
              onChange={(e) => {
                handleChange(e.target.value);
                // Clear stale descriptor answer when selection changes
                setDescriptorAnswers({});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an option...</option>
              {(question.options || []).map((opt: any, index: number) => (
                <option key={index} value={opt.value}>
                  {opt.label}
                  {/* Show a hint in the option text if a descriptor exists */}
                  {opt.descriptor !== undefined && opt.descriptor !== null ? ' ✎' : ''}
                </option>
              ))}
            </select>

            {/* Descriptor input shown beneath the select when selected option has one */}
            {hasDropdownDescriptor && (
              <div className="px-3 pb-3 pt-2 bg-sky-50 border border-sky-200 rounded-lg">
                {selectedDropdownOption.descriptor && (
                  <p className="text-xs text-sky-700 mb-1.5">{selectedDropdownOption.descriptor}</p>
                )}
                <input
                  type="text"
                  value={descriptorAnswers[value] || ''}
                  onChange={(e) => handleDescriptorChange(value, e.target.value)}
                  placeholder={selectedDropdownOption.placeholder || 'Your answer…'}
                  className="w-full px-3 py-1.5 text-sm border border-stratosphere-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            )}
          </div>
        );
        
      case 'scale': {
        const scaleConfig = question.scaleConfig || {};
        const minValue = scaleConfig.min ?? 1;
        const maxValue = scaleConfig.max ?? 5;
        const step = scaleConfig.step ?? 1;
        const scaleOptions = scaleConfig.scaleOptions || [];
        const currentValue = value || minValue;

        return (
          <div className="space-y-6">
            {/* Scale Labels */}
            {(scaleConfig.minLabel || scaleConfig.maxLabel) && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{scaleConfig.minLabel || minValue}</span>
                <span>{scaleConfig.maxLabel || maxValue}</span>
              </div>
            )}
            
            {/* Scale Slider */}
            <div className="relative">
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={step}
                value={currentValue}
                onChange={(e) => handleChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {Array.from({ length: Math.floor((maxValue - minValue) / step) + 1 }, (_, i) => (
                  <span key={i}>{minValue + (i * step)}</span>
                ))}
              </div>
            </div>
            
            {/* Current Value Display */}
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-800 rounded-md font-medium">
                {currentValue}
              </span>
            </div>
            
            {/* Scale Options with Descriptions */}
            {scaleOptions.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-medium text-gray-700">Rating Scale:</h4>
                {scaleOptions.map((option: any, index: number) => {
                  const isSelected = currentValue === option.value;
                  return (
                    <div 
                      key={option.value} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChange(option.value)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500 text-white' 
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {option.value}
                        </div>
                        <div className="flex-1">
                          {option.label && (
                            <div className="font-medium text-gray-900 text-sm">
                              {option.label}
                            </div>
                          )}
                          {option.description && (
                            <div className="text-gray-600 text-sm mt-1">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.validation?.pattern || 'Any file type'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleChange(e.target.files?.[0])}
                  accept={question.validation?.pattern}
                />
              </label>
            </div>
            {question.validation?.maxSize && (
              <p className="text-xs text-gray-500">
                Maximum file size: {question.validation.maxSize}
              </p>
            )}
          </div>
        );
        
      case 'location':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Location selector would appear here</p>
            <p className="text-xs text-gray-500 mt-1">GPS coordinates: {value || 'Not selected'}</p>
          </div>
        );
        
      case 'matrix': {
        const matrixConfig = question.matrixConfig || {};
        const matrixRows = matrixConfig.rows || [{ label: 'Row 1', description: '' }];
        const matrixColumns = matrixConfig.columns || [{ value: '1', label: 'Column 1', description: '' }];
        
        return (
          <div className="space-y-4">
            {/* Column descriptions if available */}
            {matrixColumns.some((col: any) => col.description) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Options:</h4>
                <div className="grid gap-2">
                  {matrixColumns.map((column: any, index: number) => (
                    column.description && (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{column.label}:</span> {column.description}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[200px]">
                      Questions
                    </th>
                    {matrixColumns.map((column: any, index: number) => (
                      <th key={index} className="border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[120px]">
                        <div>{column.label}</div>
                        {column.description && (
                          <div className="text-xs text-gray-500 font-normal mt-1">
                            {column.description}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map((row: any, qIndex: number) => (
                    <tr key={qIndex} className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{row.label}</div>
                        {row.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {row.description}
                          </div>
                        )}
                      </td>
                      {matrixColumns.map((column: any, oIndex: number) => (
                        <td key={oIndex} className="border border-gray-300 px-3 py-3 text-center">
                          <input
                            type="radio"
                            name={`matrix-${qIndex}`}
                            value={column.value}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            onChange={(e) => {
                              const newValue = { ...value };
                              newValue[qIndex] = e.target.value;
                              handleChange(newValue);
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
              {getQuestionTypeIcon(question.type)}
            </div>
            <p className="text-sm text-gray-600">
              Preview not available for {QUESTION_TYPE_CONFIG[question.type as QuestionType]?.label || question.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {question.text || 'Question text will appear here'}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {question.description && (
              <p className="text-gray-600 text-sm mt-1">{question.description}</p>
            )}
            
            {/* NEW: Demographics indicator */}
            {question.isStandardDemographic && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  <Users className="h-3 w-3 mr-1" />
                  Standard Demographic
                </Badge>
                {question.demographicType && (
                  <Badge variant="outline" className="text-xs">
                    {question.demographicType}
                  </Badge>
                )}
                {question.isGlobalStandard && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Global Standard
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg ml-4">
            {getQuestionTypeIcon(question.type)}
          </div>
        </div>
      </div>
      
      {/* Question Input */}
      <div className="mb-6">
        {renderInput()}
        
        {!isValid && validationMessage && (
          <div className="mt-3 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{validationMessage}</p>
          </div>
        )}
      </div>
      
      {/* Preview Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2 text-blue-500" />
          <span>This is how respondents will see this question</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewQuestion;