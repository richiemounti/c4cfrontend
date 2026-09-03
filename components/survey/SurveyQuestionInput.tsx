// components/survey/SurveyQuestionInput.tsx
// The single, canonical question renderer for anything that puts a real
// respondent (or a preview of one) in front of survey questions. Used by
// both app/survey/[surveyId]/page.tsx (live) and the dashboard survey
// preview (components/survey/SurveyForm.tsx), so question-type support
// never drifts between the two again.
'use client';

import { useState } from 'react';
import {
  Star, Upload, Calendar, Mail, Phone, Hash, Type, Check, CheckCircle, AlertCircle,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface QuestionOption {
  value: string;
  label: string;
  descriptor?: string;
  placeholder?: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface MatrixConfig {
  rows: Array<{ label: string }>;
  columns: Array<{ value: string; label: string }>;
  allowMultiple?: boolean;
}

export interface Question {
  _id: string;
  order: number;
  required?: boolean;
  section?: string | { _id: string; title: string; description?: string };
  question: {
    _id: string;
    text: string;
    description?: string;
    type: string;
    options?: Array<QuestionOption | string>;
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
    scaleConfig?: ScaleConfig;
    matrixConfig?: MatrixConfig;
  };
  customText?: string;
  customDescription?: string;
  customOptions?: QuestionOption[];
}

export interface TranslationOverrides {
  scaleConfig?: { minLabel?: string; maxLabel?: string };
  matrixConfig?: { rows: Array<{ label: string }>; columns: Array<{ value: string; label: string }> };
}

export const normalizeOptions = (opts: Array<QuestionOption | string> = []): QuestionOption[] =>
  opts.map(o => typeof o === 'string' ? { value: o, label: o } : { value: o.value || o.label, label: o.label || o.value, descriptor: o.descriptor, placeholder: o.placeholder });

export const QuestionInput = ({
  question,
  value,
  onChange,
  onDescriptorChange,
  descriptorAnswers,
  hasError,
  translationOverrides,
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  onDescriptorChange: (optionValue: string, text: string) => void;
  descriptorAnswers: Record<string, string>;
  hasError: boolean;
  translationOverrides?: TranslationOverrides;
}) => {
  const type = question.question.type;
  const options = normalizeOptions(question.customOptions || question.question.options);

  const base = `border-2 rounded-xl ${hasError
    ? 'border-ochre-500 focus:border-ochre-500'
    : 'border-concrete-500/30 focus:border-forest-500 focus:ring-4 focus:ring-forest-50'} bg-white`;

  switch (type) {
    case 'text':
      return (
        <div className="relative group">
          <Type className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Type your answer here..." className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'email':
      return (
        <div className="relative group">
          <Mail className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="your.email@example.com" className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'phone':
      return (
        <div className="relative group">
          <Phone className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="tel" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="+1 (555) 123-4567" className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Share your thoughts here..." rows={5} className={`resize-none text-lg ${base}`} />
          <div className="flex justify-end mt-2"><span className="text-sm text-sky-500">{value?.length || 0} characters</span></div>
        </div>
      );
    case 'number':
      return (
        <div className="relative group">
          <Hash className="absolute left-4 top-4 h-5 w-5 text-sky-500" />
          <Input type="number" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Enter a number..." min={question.question.validation?.min} max={question.question.validation?.max} className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'date':
      return (
        <div className="relative group">
          <Calendar className="absolute left-4 top-4 h-5 w-5 text-sky-500 pointer-events-none z-10" />
          <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={`pl-12 h-14 text-lg ${base}`} />
        </div>
      );
    case 'radio':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange} className="space-y-3">
          {options.map((opt, i) => (
            <div key={i} className={`rounded-xl border-2 overflow-hidden ${value === opt.value ? 'border-forest-500 bg-forest-50' : 'border-concrete-500/30 bg-white hover:border-forest-300'}`}>
              <div className="flex items-center space-x-4 p-5 cursor-pointer">
                <RadioGroupItem value={opt.value} id={`${question._id}-${i}`} className="border-2 border-forest-500 text-forest-500 data-[state=checked]:bg-forest-500 h-5 w-5" />
                <Label htmlFor={`${question._id}-${i}`} className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg">{opt.label}</Label>
                {value === opt.value && <Check className="h-5 w-5 text-forest-500" />}
              </div>
              {opt.descriptor !== undefined && opt.descriptor !== null && value === opt.value && (
                <div className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100">
                  {opt.descriptor && <p className="text-sm text-sky-700 mb-2">{opt.descriptor}</p>}
                  <Input value={descriptorAnswers[opt.value] || ''} onChange={e => onDescriptorChange(opt.value, e.target.value)} placeholder={opt.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      );
    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          {options.map((opt, i) => {
            const isChecked = selected.includes(opt.value);
            return (
              <div key={i} className={`rounded-xl border-2 overflow-hidden ${isChecked ? 'border-grass-500 bg-grass-50' : 'border-concrete-500/30 bg-white hover:border-grass-300'}`}>
                <div className="flex items-center space-x-4 p-5 cursor-pointer">
                  <Checkbox id={`${question._id}-${i}`} checked={isChecked} onCheckedChange={checked => {
                    if (checked) onChange([...selected, opt.value]);
                    else { onChange(selected.filter((o: string) => o !== opt.value)); onDescriptorChange(opt.value, ''); }
                  }} className="border-2 border-grass-500 data-[state=checked]:bg-grass-500 h-5 w-5" />
                  <Label htmlFor={`${question._id}-${i}`} className="text-stratosphere-900 cursor-pointer font-medium flex-1 text-lg">{opt.label}</Label>
                  {isChecked && <Check className="h-5 w-5 text-forest" />}
                </div>
                {opt.descriptor !== undefined && opt.descriptor !== null && isChecked && (
                  <div className="px-5 pb-4 pt-2 bg-sky-50 border-t border-sky-100">
                    {opt.descriptor && <p className="text-sm text-sky-700 mb-2">{opt.descriptor}</p>}
                    <Input value={descriptorAnswers[opt.value] || ''} onChange={e => onDescriptorChange(opt.value, e.target.value)} placeholder={opt.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    case 'boolean':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange} className="grid grid-cols-2 gap-4">
          {(['true', 'false'] as const).map((bv) => (
            <div key={bv} className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 cursor-pointer ${value === bv ? 'border-forest-500 bg-forest-50' : 'border-concrete-500/30 bg-white hover:border-forest-300'}`}>
              <RadioGroupItem value={bv} id={`${question._id}-${bv}`} className="sr-only" />
              <Label htmlFor={`${question._id}-${bv}`} className="cursor-pointer text-center">
                <div className={`mb-3 p-4 rounded ${value === bv ? 'bg-forest-500' : 'bg-concrete-100'}`}>
                  {bv === 'true' ? <CheckCircle className={`h-8 w-8 ${value === bv ? 'text-white' : 'text-forest-500'}`} /> : <AlertCircle className={`h-8 w-8 ${value === bv ? 'text-white' : 'text-concrete-500'}`} />}
                </div>
                <span className={`text-2xl font-light ${value === bv ? 'text-forest-500' : 'text-stratosphere-900'}`}>{bv === 'true' ? 'Yes' : 'No'}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'rating': {
      const max = question.question.validation?.max || 5;
      const current = parseInt(value) || 0;
      return (
        <div className="space-y-6">
          <div className="flex justify-center items-center space-x-2">
            {Array.from({ length: max }, (_, i) => (
              <button key={i} type="button" onClick={() => onChange((i + 1).toString())} className={`p-2 rounded transition-all ${current >= i + 1 ? 'text-clay' : 'text-concrete-300 hover:text-sand-400'}`}>
                <Star className={`h-10 w-10 ${current >= i + 1 ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          <div className="text-center">
            <span className="px-6 py-2 bg-sand-50 text-sand-600 rounded text-sm font-medium">
              {current > 0 ? `${current} out of ${max} stars` : `Rate from 1 to ${max} stars`}
            </span>
          </div>
        </div>
      );
    }
    case 'scale': {
      const sc = question.question.scaleConfig;
      const min = sc?.min ?? question.question.validation?.min ?? 1;
      const max = sc?.max ?? question.question.validation?.max ?? 10;
      const step = sc?.step ?? 1;
      const minLabel = translationOverrides?.scaleConfig?.minLabel || sc?.minLabel || String(min);
      const maxLabel = translationOverrides?.scaleConfig?.maxLabel || sc?.maxLabel || String(max);
      const sv = value ? [parseInt(value)] : [min];
      return (
        <div className="space-y-6 px-4">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ochre-500">{minLabel}</span>
            <span className="text-forest-500">{maxLabel}</span>
          </div>
          <Slider value={sv} onValueChange={v => onChange(v[0].toString())} min={min} max={max} step={step} className="w-full" />
          <div className="text-center">
            <span className="inline-block text-3xl font-light text-forest-500 bg-forest-50 px-8 py-4 rounded-2xl shadow-lg">{sv[0]}</span>
          </div>
        </div>
      );
    }
    case 'matrix': {
      const mc = question.question.matrixConfig;
      const rows = translationOverrides?.matrixConfig?.rows ?? mc?.rows ?? [];
      const cols = translationOverrides?.matrixConfig?.columns ?? mc?.columns ?? [];
      const selected: Record<string, string> = typeof value === 'object' && value !== null ? value : {};
      return (
        <div className={`overflow-x-auto rounded-xl border-2 ${hasError ? 'border-ochre-500' : 'border-concrete-500/30'}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stratosphere-50">
                <th className="px-4 py-3 text-left font-medium text-stratosphere-900 border-b border-r border-concrete-500/20 w-40" />
                {cols.map((col, i) => (
                  <th key={col.value ?? i} className="px-4 py-3 text-center font-medium text-stratosphere-900 border-b border-concrete-500/20">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-stratosphere-50/40'}>
                  <td className="px-4 py-3 text-stratosphere-900 font-medium border-r border-concrete-500/10">{row.label}</td>
                  {cols.map((col, ci) => (
                    <td key={col.value ?? ci} className="px-4 py-3 text-center">
                      {mc?.allowMultiple ? (
                        <Checkbox
                          checked={Array.isArray(selected[String(ri)]) ? (selected[String(ri)] as unknown as string[]).includes(col.value) : false}
                          onCheckedChange={checked => {
                            const prev: string[] = Array.isArray(selected[String(ri)]) ? (selected[String(ri)] as unknown as string[]) : [];
                            const next = checked ? [...prev, col.value] : prev.filter((v: string) => v !== col.value);
                            onChange({ ...selected, [String(ri)]: next as unknown as string });
                          }}
                          className="border-2 border-grass-500 data-[state=checked]:bg-grass-500"
                        />
                      ) : (
                        <input
                          type="radio"
                          name={`matrix-row-${ri}`}
                          value={col.value}
                          checked={selected[String(ri)] === col.value}
                          onChange={() => onChange({ ...selected, [String(ri)]: col.value })}
                          className="h-4 w-4 accent-forest-500 cursor-pointer"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'file': {
      const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(
        value?.filename ? { name: value.filename, size: value.size } : null
      );
      return (
        <div>
          <div className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer ${hasError ? 'border-ochre-500 bg-ochre-50/30' : 'border-forest-500/40 bg-gradient-to-br from-forest-50 to-grass-50 hover:border-forest-500'}`} onClick={() => document.getElementById(`file-${question._id}`)?.click()}>
            <Upload className="h-16 w-16 text-forest-500 mx-auto mb-4" />
            <p className="text-stratosphere-900 font-semibold text-lg">Upload a file</p>
            <p className="text-sky-500 mt-1">Click to browse or drag and drop</p>
            <input type="file" id={`file-${question._id}`} className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setFileInfo({ name: f.name, size: f.size }); onChange(f); }
            }} />
            <div className="mt-4">
              <span className="inline-block px-6 py-3 bg-forest-500 text-white rounded-lg font-semibold"><Upload className="h-4 w-4 inline mr-2" />Choose File</span>
            </div>
            {fileInfo && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-forest-500/20 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-forest-500" />
                <div className="text-left flex-1">
                  <p className="text-sm text-stratosphere-900 font-medium">{fileInfo.name}</p>
                  <p className="text-xs text-sky-500">{(fileInfo.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'dropdown': {
      const selected = options.find(o => o.value === value);
      return (
        <div className="space-y-3">
          <Select value={value || ''} onValueChange={val => { onChange(val); Object.keys(descriptorAnswers).forEach(k => onDescriptorChange(k, '')); }}>
            <SelectTrigger className={`h-14 text-lg ${base}`}><SelectValue placeholder="Select an option..." /></SelectTrigger>
            <SelectContent>
              {options.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}{opt.descriptor ? ' ✎' : ''}</SelectItem>)}
            </SelectContent>
          </Select>
          {selected?.descriptor !== undefined && selected.descriptor !== null && value && (
            <div className="px-4 pb-4 pt-3 bg-sky-50 border border-sky-200 rounded-xl">
              {selected.descriptor && <p className="text-sm text-sky-700 mb-2">{selected.descriptor}</p>}
              <Input value={descriptorAnswers[value] || ''} onChange={e => onDescriptorChange(value, e.target.value)} placeholder={selected.placeholder || 'Your answer…'} className="border-stratosphere-200 bg-white" />
            </div>
          )}
        </div>
      );
    }
    default:
      return <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Please provide your answer..." className={`h-14 text-lg ${base}`} />;
  }
};
