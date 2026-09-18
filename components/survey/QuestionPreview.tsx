// components/survey/QuestionPreview.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

interface QuestionPreviewProps {
  type: string;
  options?: any[];
  scaleConfig?: {
    min: number;
    max: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
  };
  matrixConfig?: {
    rows: { label: string; description?: string }[];
    columns: { value: string; label: string }[];
  };
}

export const QuestionPreview = ({ type, options, scaleConfig, matrixConfig }: QuestionPreviewProps) => {
  switch (type) {
    case 'text':
    case 'email':
      return <Input placeholder="Your answer" disabled className="bg-ink-50" />;

    case 'textarea':
      return <Textarea placeholder="Your answer" disabled rows={3} className="bg-ink-50" />;

    case 'select':
    case 'dropdown':
      return (
        <select className="w-full p-3 border border-stone-500/20 rounded-lg bg-ink-50" disabled>
          <option>Choose an option</option>
          {options?.map((opt, i) => (
            <option key={i}>{opt.label || opt.value}</option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="space-y-3">
          {(options || [{ label: 'Option 1' }, { label: 'Option 2' }]).map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="radio" disabled className="text-coral-500" />
              <span className="text-ink-900">{opt.label || opt.value || opt}</span>
            </div>
          ))}
        </div>
      );

    case 'checkbox':
    case 'multiselect':
      return (
        <div className="space-y-3">
          {(options || [{ label: 'Option 1' }, { label: 'Option 2' }]).map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="checkbox" disabled className="text-coral-500" />
              <span className="text-ink-900">{opt.label || opt.value || opt}</span>
            </div>
          ))}
        </div>
      );

    case 'number':
      return <Input type="number" placeholder="0" disabled className="bg-ink-50" />;

    case 'date':
      return <Input type="date" disabled className="bg-ink-50" />;

    case 'rating':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className="h-6 w-6 text-gold-500" />
          ))}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <input type="radio" disabled className="text-coral-500" />
            <span className="text-ink-900">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <input type="radio" disabled className="text-coral-500" />
            <span className="text-ink-900">No</span>
          </div>
        </div>
      );

    case 'scale': {
      if (options && options.length > 0) {
        return (
          <div className="space-y-2">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                {options.map((opt: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-16 flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-neutral-300 rounded-lg bg-neutral-50 text-sm font-bold text-neutral-700">
                      {opt.value}
                    </div>
                    {opt.label && (
                      <span className="text-xs text-neutral-500 text-center leading-tight w-16 break-words">
                        {opt.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      const min = scaleConfig?.min ?? 1;
      const max = scaleConfig?.max ?? 5;
      const step = scaleConfig?.step ?? 1;
      const points: number[] = [];
      for (let i = min; i <= max; i += step) points.push(i);
      return (
        <div className="flex gap-2 flex-wrap">
          {points.map(i => (
            <div
              key={i}
              className="flex items-center justify-center w-9 h-9 border border-stone-300 rounded-lg bg-ink-50 text-sm font-medium text-ink-700"
            >
              {i}
            </div>
          ))}
        </div>
      );
    }

    case 'matrix': {
      if (!matrixConfig?.rows?.length || !matrixConfig?.columns?.length) {
        return <Input placeholder="Matrix question" disabled className="bg-ink-50" />;
      }
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 w-1/3" />
                {matrixConfig.columns.map((col, i) => (
                  <th key={i} className="p-2 text-center text-ink-700 font-medium border-b border-stone-200">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixConfig.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                  <td className="p-2 text-ink-900 border-r border-stone-200">{row.label}</td>
                  {matrixConfig.columns.map((_, j) => (
                    <td key={j} className="p-2 text-center">
                      <input type="radio" disabled className="opacity-40" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return <Input placeholder="Your answer" disabled className="bg-ink-50" />;
  }
};