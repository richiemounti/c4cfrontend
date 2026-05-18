// components/admin/QuestionForm.tsx - Enhanced with Scale/Matrix descriptions
import { useState } from 'react';
import { 
  ChevronDown, 
  Trash2, 
  GripVertical,
  Tag,
  Plus,
  Info,
  AlertCircle,
  CheckSquare,
  FileText,
  Grid3X3,
  Layers,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Category, 
  Theme, 
  SubTheme,
  Indicator,
  SDG,
  Standard,
  ESGCategory,
  ResilienceDimension
} from '@/types/taxonomy';
import { QuestionType } from '@/types';
import { Alert, AlertDescription } from '../ui/alert';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

interface QuestionFormProps {
  question: any;
  onChange: (updatedQuestion: any) => void;
  categories?: Category[];
  themes: Theme[];
  subThemes: SubTheme[];
  // Taxonomy data for tag display
  indicators: Indicator[];
  sdgs: SDG[];
  standards: Standard[];
  esgCategories: ESGCategory[];
  resilienceDimensions: ResilienceDimension[];
  condensed?: boolean;
}

const questionTypes = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'radio', label: 'Single Choice' },
  { value: 'checkbox', label: 'Multiple Choice' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'scale', label: 'Linear Scale' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'file', label: 'File Upload' },
  { value: 'location', label: 'Location' },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ 
  question, 
  onChange, 
  categories,
  themes,
  subThemes,
  indicators,
  sdgs,
  standards,
  esgCategories,
  resilienceDimensions,
  condensed = false
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [scaleSettingsOpen, setScaleSettingsOpen] = useState(false);
  const [matrixSettingsOpen, setMatrixSettingsOpen] = useState(false);

  const filteredSubThemes = subThemes.filter(subTheme => {
    if (!question.theme) return false;
    return typeof subTheme.theme === 'string' 
      ? subTheme.theme === question.theme 
      : (subTheme.theme as any)._id === question.theme;
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...question, [e.target.name]: e.target.value });
  };

  const handleRequiredChange = (checked: boolean) => {
    onChange({ ...question, required: checked });
  };

  const handleTypeChange = (type: string) => {
    let updatedQuestion = { ...question, type };

    // Initialize options if switching to a type that needs them
    if (['radio', 'checkbox', 'dropdown'].includes(type) && (!question.options || question.options.length === 0)) {
      updatedQuestion.options = [{ value: '1', label: 'Option 1' }];
    }

    // Initialize scale-specific config
    if (type === 'scale') {
      if (!question.scaleConfig) {
        updatedQuestion.scaleConfig = {
          min: 1,
          max: 5,
          step: 1,
          minLabel: '',
          maxLabel: '',
          showNAOption: false,
          scaleOptions: [
            { value: 1, label: '', description: '' },
            { value: 2, label: '', description: '' },
            { value: 3, label: '', description: '' },
            { value: 4, label: '', description: '' },
            { value: 5, label: '', description: '' }
          ]
        };
      }
    }

    // Initialize matrix-specific config and open the panel immediately
    if (type === 'matrix') {
      if (!question.matrixConfig) {
        updatedQuestion.matrixConfig = {
          rows: [{ label: 'Row 1', description: '' }],
          columns: [{ value: '1', label: 'Column 1', description: '' }]
        };
      }
      setMatrixSettingsOpen(true);
    }

    onChange(updatedQuestion);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], label: value, value: `${index + 1}` };
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const newOptions = [
      ...question.options,
      {
        value: `${question.options.length + 1}`,
        label: `Option ${question.options.length + 1}`,
        descriptor: undefined,
        placeholder: undefined,
      }
    ];
    onChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (question.options.length <= 1) return;
    
    const newOptions = question.options.filter((_: any, i: number) => i !== index);
    onChange({ ...question, options: newOptions });
  };

  const handleOptionDescriptorChange = (index: number, value: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], descriptor: value || undefined };
    onChange({ ...question, options: updatedOptions });
  };

  const handleOptionPlaceholderChange = (index: number, value: string) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], placeholder: value || undefined };
    onChange({ ...question, options: updatedOptions });
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    
    const newOptions = [...question.options];
    const draggedOption = newOptions[draggingIndex];
    
    newOptions.splice(draggingIndex, 1);
    newOptions.splice(index, 0, draggedOption);
    
    onChange({ ...question, options: newOptions });
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  // Scale settings handlers
  const handleScaleSettingChange = (field: string, value: any) => {
    const updatedScaleConfig = { ...question.scaleConfig, [field]: value };

    // Regenerate scale options when min, max, or step changes
    if (field === 'min' || field === 'max' || field === 'step') {
      const min = field === 'min' ? value : (updatedScaleConfig.min ?? 1);
      const max = field === 'max' ? value : (updatedScaleConfig.max ?? 5);
      const step = field === 'step' ? value : (updatedScaleConfig.step ?? 1);

      if (typeof min === 'number' && typeof max === 'number' && typeof step === 'number' && step > 0 && min < max) {
        const scaleOptions = [];
        for (let i = min; i <= max; i += step) {
          const existing = question.scaleConfig?.scaleOptions?.find((opt: any) => opt.value === i);
          scaleOptions.push({
            value: i,
            label: existing?.label || '',
            description: existing?.description || ''
          });
        }
        updatedScaleConfig.scaleOptions = scaleOptions;
      }
    }

    onChange({ ...question, scaleConfig: updatedScaleConfig });
  };

  const handleScaleOptionChange = (index: number, field: string, value: string) => {
    const updatedOptions = [...(question.scaleConfig?.scaleOptions || [])];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };

    onChange({
      ...question,
      scaleConfig: {
        ...question.scaleConfig,
        scaleOptions: updatedOptions
      }
    });
  };

  // Matrix settings handlers
  const handleMatrixSettingChange = (type: 'rows' | 'columns', index: number, field: string, value: string) => {
    const updatedItems = [...(question.matrixConfig?.[type] || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    onChange({
      ...question,
      matrixConfig: {
        ...question.matrixConfig,
        [type]: updatedItems
      }
    });
  };

  const handleAddMatrixItem = (type: 'rows' | 'columns') => {
    const currentItems = question.matrixConfig?.[type] || [];
    const newItem = type === 'rows'
      ? { label: `Row ${currentItems.length + 1}`, description: '' }
      : { value: `${currentItems.length + 1}`, label: `Column ${currentItems.length + 1}`, description: '' };

    onChange({
      ...question,
      matrixConfig: {
        ...question.matrixConfig,
        [type]: [...currentItems, newItem]
      }
    });
  };

  const handleRemoveMatrixItem = (type: 'rows' | 'columns', index: number) => {
    const currentItems = question.matrixConfig?.[type] || [];
    if (currentItems.length <= 1) return;

    onChange({
      ...question,
      matrixConfig: {
        ...question.matrixConfig,
        [type]: currentItems.filter((_: any, i: number) => i !== index)
      }
    });
  };

  // Helper functions to display selected tags
  const getSelectedTagNames = (tagType: string, tagIds: string[]) => {
    if (!tagIds || tagIds.length === 0) return [];
    
    let items: any[] = [];
    let nameField = 'name';
    
    switch (tagType) {
      case 'selectedIndicatorTags':
        items = indicators;
        break;
      case 'selectedSdgTags':
        items = sdgs;
        nameField = 'code';
        break;
      case 'selectedResilienceTags':
        items = resilienceDimensions;
        nameField = 'code';
        break;
      case 'selectedEsgTags':
        items = esgCategories;
        nameField = 'code';
        break;
      case 'selectedStandardTags':
        items = standards;
        nameField = 'code';
        break;
    }
    
    return items
      .filter(item => tagIds.includes(item._id))
      .map(item => item[nameField]);
  };

  const getTotalSelectedTags = () => {
    const counts = [
      question.selectedIndicatorTags?.length || 0,
      question.selectedSdgTags?.length || 0,
      question.selectedResilienceTags?.length || 0,
      question.selectedEsgTags?.length || 0,
      question.selectedStandardTags?.length || 0
    ];
    return counts.reduce((sum, count) => sum + count, 0);
  };


return (
  <div className="space-y-4">
    {/* Question Text & Description Card */}
    <Card className="border-stratosphere-200 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-stratosphere-50 to-sky-50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-stratosphere" />
          <div>
            <CardTitle className="text-sm text-stratosphere">Question Content</CardTitle>
            <CardDescription className="text-xs">
              Write a clear, specific question that's easy to understand
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div>
          <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
            Question Text <span className="text-sand-700">*</span>
          </Label>
          <Input
            name="text"
            value={question.text}
            onChange={handleTextChange}
            placeholder="e.g., How satisfied are you with the community services?"
            className="text-base font-medium border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere"
          />
        </div>
        
        <div>
          <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
            Description <span className="text-sky-500">(Optional)</span>
          </Label>
          <Textarea
            name="description"
            value={question.description || ''}
            onChange={handleTextChange}
            placeholder="Add context or instructions to help respondents answer accurately..."
            className="resize-none border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere"
            rows={3}
          />
          <p className="text-xs text-sky-500 mt-1">
            Provide additional context or clarification for respondents
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Question Type & Classification Card */}
    <Card className="border-stratosphere-200 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-sky-50 to-forest-50">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-700" />
          <div>
            <CardTitle className="text-sm text-stratosphere">Question Type & Classification</CardTitle>
            <CardDescription className="text-xs">
              Select how respondents will answer and organize the question
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className={`grid ${condensed ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
          <div>
            <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
              Answer Type <span className="text-sand-700">*</span>
            </Label>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-stratosphere">
                {questionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span className="text-stratosphere">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {!condensed && (
            <>
              <div>
                <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
                  Theme <span className="text-sand-700">*</span>
                </Label>
                <Select 
                  value={question.theme} 
                  onValueChange={(value) => onChange({ 
                    ...question, 
                    theme: value, 
                    subThemes: [],
                    selectedIndicatorTags: [],
                    selectedSdgTags: [],
                    selectedResilienceTags: [],
                    selectedEsgTags: [],
                    selectedStandardTags: []
                  })}
                >
                  <SelectTrigger className="border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere h-9">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stratosphere">
                    {themes.map(theme => (
                      <SelectItem key={theme._id} value={theme._id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
                  Subtheme <span className="text-sand-700">*</span>
                </Label>
                <Select 
                  value={question.subThemes?.[0] || ''}   // show first selected for single-display
                  onValueChange={(value) => onChange({ 
                    ...question, 
                    subThemes: value ? [value] : [],       // wrap in array
                    selectedIndicatorTags: [],
                    selectedSdgTags: [],
                    selectedResilienceTags: [],
                    selectedEsgTags: [],
                    selectedStandardTags: []
                  })}
                  disabled={!question.theme}
                >
                  <SelectTrigger className="border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere h-9 disabled:opacity-50">
                    <SelectValue placeholder={question.theme ? "Select subtheme" : "Select theme first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stratosphere">
                    {filteredSubThemes.map(subTheme => (
                      <SelectItem key={subTheme._id} value={subTheme._id}>
                        {subTheme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Display selected tags summary */}
    {getTotalSelectedTags() > 0 && (
      <Alert className="bg-gradient-to-r from-grass-50 to-forest-50 border-grass-300">
        <Tag className="h-4 w-4 text-grass-700" />
        <AlertDescription>
          <div className="space-y-2">
            <span className="text-sm font-medium text-grass-900 block">
              Selected Tags ({getTotalSelectedTags()})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {/* Indicators */}
              {getSelectedTagNames('selectedIndicatorTags', question.selectedIndicatorTags || []).map(name => (
                <Badge key={name} variant="outline" className="text-xs bg-sky-100 text-sky-800 border-sky-300">
                  {name}
                </Badge>
              ))}
              {/* SDGs */}
              {getSelectedTagNames('selectedSdgTags', question.selectedSdgTags || []).map(code => (
                <Badge key={code} variant="outline" className="text-xs bg-grass-100 text-grass-800 border-grass-300">
                  {code}
                </Badge>
              ))}
              {/* Resilience */}
              {getSelectedTagNames('selectedResilienceTags', question.selectedResilienceTags || []).map(code => (
                <Badge key={code} variant="outline" className="text-xs bg-clay-100 text-clay-800 border-clay-300">
                  {code}
                </Badge>
              ))}
              {/* ESG */}
              {getSelectedTagNames('selectedEsgTags', question.selectedEsgTags || []).map(code => (
                <Badge key={code} variant="outline" className="text-xs bg-forest-100 text-forest-800 border-forest-300">
                  {code}
                </Badge>
              ))}
              {/* Standards */}
              {getSelectedTagNames('selectedStandardTags', question.selectedStandardTags || []).map(code => (
                <Badge key={code} variant="outline" className="text-xs bg-sand-100 text-sand-800 border-sand-300">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )}
    
    {/* Options for multiple choice type questions */}
    {['radio', 'checkbox', 'dropdown'].includes(question.type) && (
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-clay-50 to-sand-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-clay-700" />
              <div>
                <CardTitle className="text-sm text-stratosphere">Answer Options</CardTitle>
                <CardDescription className="text-xs">
                  Add and organize the choices respondents can select
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleAddOption}
              size="sm"
              className="border-stratosphere text-stratosphere hover:bg-sky-50 h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {question.options.map((option: any, index: number) => (
              <div
                key={index}
                className="rounded-lg border border-stratosphere-100 bg-white hover:border-stratosphere-300 transition-colors overflow-hidden"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={() => handleDragOver(index)}
                onDragEnd={handleDragEnd}
              >
                {/* ── Option label row ── */}
                <div className="flex items-center gap-2 p-2">
                  <div className="cursor-move text-sky-400 hover:text-stratosphere">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="flex-grow flex items-center gap-2">
                    {question.type === 'radio' && (
                      <div className="h-4 w-4 rounded-full border-2 border-stratosphere-300 flex-shrink-0" />
                    )}
                    {question.type === 'checkbox' && (
                      <div className="h-4 w-4 rounded border-2 border-stratosphere-300 flex-shrink-0" />
                    )}
                    <Input
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="border-stratosphere-200 focus:border-stratosphere h-8"
                    />
                  </div>

                  {/* Toggle descriptor on/off */}
                  <button
                    type="button"
                    title={option.descriptor !== undefined ? 'Remove follow-up prompt' : 'Add follow-up prompt'}
                    onClick={() => {
                      if (option.descriptor !== undefined) {
                        // Remove descriptor entirely
                        const updatedOptions = [...question.options];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          descriptor: undefined,
                          placeholder: undefined,
                        };
                        onChange({ ...question, options: updatedOptions });
                      } else {
                        // Enable with empty string so the fields appear
                        const updatedOptions = [...question.options];
                        updatedOptions[index] = { ...updatedOptions[index], descriptor: '' };
                        onChange({ ...question, options: updatedOptions });
                      }
                    }}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors flex-shrink-0 ${
                      option.descriptor !== undefined
                        ? 'text-stratosphere bg-sky-100 hover:bg-sky-200'
                        : 'text-sky-400 hover:text-stratosphere hover:bg-sky-50'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    disabled={question.options.length <= 1}
                    className="h-8 w-8 text-sky-400 hover:text-sand-700 hover:bg-sand-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* ── Descriptor / placeholder fields (shown only when descriptor is enabled) ── */}
                {option.descriptor !== undefined && (
                  <div className="px-3 pb-3 pt-1 bg-sky-50 border-t border-stratosphere-100 space-y-2">
                    <div>
                      <Label className="text-xs font-medium text-stratosphere mb-1 block">
                        Follow-up prompt
                        <span className="text-sky-500 font-normal ml-1">(shown beneath this option)</span>
                      </Label>
                      <Input
                        value={option.descriptor}
                        onChange={(e) => handleOptionDescriptorChange(index, e.target.value)}
                        placeholder='e.g. "Please tell us more about your choice"'
                        className="border-stratosphere-200 focus:border-stratosphere h-8 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-stratosphere mb-1 block">
                        Input placeholder
                        <span className="text-sky-500 font-normal ml-1">(optional — default: "Your answer…")</span>
                      </Label>
                      <Input
                        value={option.placeholder || ''}
                        onChange={(e) => handleOptionPlaceholderChange(index, e.target.value)}
                        placeholder='e.g. "Describe the specific issue you encountered"'
                        className="border-stratosphere-200 focus:border-stratosphere h-8 bg-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-sky-500 mt-3">
            💡 Tip: Drag options to reorder them
          </p>
        </CardContent>
      </Card>
    )}

    {/* Scale Configuration - Keep existing but update Card styling */}
    {question.type === 'scale' && (
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-ochre-50 to-sand-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-ochre-700" />
              <div>
                <CardTitle className="text-sm text-stratosphere">Scale Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Set the range and labels for your rating scale
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScaleSettingsOpen(!scaleSettingsOpen)}
              className="h-8"
            >
              <Info className="h-4 w-4 text-stratosphere" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Min Value</Label>
              <Input
                type="number"
                value={question.scaleConfig?.min ?? 1}
                onChange={(e) => handleScaleSettingChange('min', parseInt(e.target.value) || 1)}
                className="h-8 border-stratosphere-200"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Max Value</Label>
              <Input
                type="number"
                value={question.scaleConfig?.max ?? 5}
                onChange={(e) => handleScaleSettingChange('max', parseInt(e.target.value) || 5)}
                className="h-8 border-stratosphere-200"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Step</Label>
              <Input
                type="number"
                value={question.scaleConfig?.step ?? 1}
                onChange={(e) => handleScaleSettingChange('step', parseInt(e.target.value) || 1)}
                className="h-8 border-stratosphere-200"
              />
            </div>
          </div>

          <Collapsible open={scaleSettingsOpen} onOpenChange={setScaleSettingsOpen}>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Min Label</Label>
                  <Input
                    value={question.scaleConfig?.minLabel || ''}
                    onChange={(e) => handleScaleSettingChange('minLabel', e.target.value)}
                    placeholder="e.g., Strongly Disagree"
                    className="h-8 border-stratosphere-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Max Label</Label>
                  <Input
                    value={question.scaleConfig?.maxLabel || ''}
                    onChange={(e) => handleScaleSettingChange('maxLabel', e.target.value)}
                    placeholder="e.g., Strongly Agree"
                    className="h-8 border-stratosphere-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-stratosphere mb-2 block">Scale Point Descriptions</Label>
                <div className="space-y-3">
                  {(question.scaleConfig?.scaleOptions || []).map((option: any, index: number) => (
                    <div key={option.value} className="border rounded-lg p-3 bg-ochre-50 border-ochre-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-white border-stratosphere">{option.value}</Badge>
                        <Input
                          value={option.label}
                          onChange={(e) => handleScaleOptionChange(index, 'label', e.target.value)}
                          placeholder={`Label for ${option.value}`}
                          className="h-8 border-stratosphere-200"
                        />
                      </div>
                      <Textarea
                        value={option.description}
                        onChange={(e) => handleScaleOptionChange(index, 'description', e.target.value)}
                        placeholder={`Description for scale point ${option.value}`}
                        className="text-xs border-stratosphere-200"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    )}

    {/* Matrix Configuration - Keep existing but update Card styling */}
    {question.type === 'matrix' && (
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-forest-50 to-grass-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-forest-700" />
              <div>
                <CardTitle className="text-sm text-stratosphere">Matrix Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Set up rows (questions) and columns (answer options)
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMatrixSettingsOpen(!matrixSettingsOpen)}
              className="h-8"
            >
              <Info className="h-4 w-4 text-stratosphere" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Collapsible open={matrixSettingsOpen} onOpenChange={setMatrixSettingsOpen}>
            <CollapsibleContent className="space-y-4">
              {/* Keep existing matrix configuration content with updated styling */}
              {/* Matrix Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-stratosphere">Matrix Rows (Questions)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMatrixItem('rows')}
                    className="h-8 border-stratosphere text-stratosphere hover:bg-sky-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
                <div className="space-y-2">
                  {(question.matrixConfig?.rows || []).map((row: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-forest-50 border-forest-200">
                      <div className="flex-grow space-y-2">
                        <Input
                          value={row.label}
                          onChange={(e) => handleMatrixSettingChange('rows', index, 'label', e.target.value)}
                          placeholder={`Row ${index + 1} question`}
                          className="h-8 border-stratosphere-200 bg-white"
                        />
                        <Textarea
                          value={row.description || ''}
                          onChange={(e) => handleMatrixSettingChange('rows', index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="text-xs border-stratosphere-200 bg-white"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMatrixItem('rows', index)}
                        disabled={(question.matrixConfig?.rows || []).length <= 1}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matrix Columns */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-stratosphere">Matrix Columns (Answer Options)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMatrixItem('columns')}
                    className="h-8 border-stratosphere text-stratosphere hover:bg-sky-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                </div>
                <div className="space-y-2">
                  {(question.matrixConfig?.columns || []).map((column: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-grass-50 border-grass-200">
                      <div className="flex-grow space-y-2">
                        <Input
                          value={column.label}
                          onChange={(e) => handleMatrixSettingChange('columns', index, 'label', e.target.value)}
                          placeholder={`Column ${index + 1} option`}
                          className="h-8 border-stratosphere-200 bg-white"
                        />
                        <Textarea
                          value={column.description || ''}
                          onChange={(e) => handleMatrixSettingChange('columns', index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="text-xs border-stratosphere-200 bg-white"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMatrixItem('columns', index)}
                        disabled={(question.matrixConfig?.columns || []).length <= 1}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    )}
    
    {/* Required toggle */}
    <Card className="border-stratosphere-200 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-sand-700" />
            <div>
              <Label htmlFor="required" className="text-sm font-medium text-stratosphere cursor-pointer">
                Make this question required
              </Label>
              <p className="text-xs text-sky-500">Respondents must answer to proceed</p>
            </div>
          </div>
          <Switch
            id="required"
            checked={question.required}
            onCheckedChange={handleRequiredChange}
            className="data-[state=checked]:bg-stratosphere"
          />
        </div>
      </CardContent>
    </Card>

    
    { /* Conditional Logic Section - ADD THIS */}
    <ConditionalLogicBuilder 
      value = { question.conditionalLogic }
      onChange = {(conditionalLogic) => onChange({ ...question, conditionalLogic })}
      currentQuestionId = { question._id }
      currentQuestionType = { question.type }  
      disabled = { false }
    />
  </div>
);
};

export default QuestionForm;