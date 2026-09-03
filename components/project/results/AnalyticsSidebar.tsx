'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DemographicFilterOption, FrameworkCategory, FrameworkTagOption } from '@/types';

export interface RoundOption {
  surveyId: string;
  sequenceNumber: number;
  label: string;
}

interface AnalyticsSidebarProps {
  demographics: DemographicFilterOption[];
  selectedDemographic: { questionId: string; value: string } | null;
  onDemographicChange: (selection: { questionId: string; value: string } | null) => void;
  frameworks: FrameworkTagOption[];
  selectedFramework: FrameworkCategory | undefined;
  onFrameworkChange: (framework: FrameworkCategory | undefined) => void;
  roundOptions: RoundOption[];
  currentSurveyId: string;
}

const SELECT_ALL = '__all__';

export default function AnalyticsSidebar({
  demographics,
  selectedDemographic,
  onDemographicChange,
  frameworks,
  selectedFramework,
  onFrameworkChange,
  roundOptions,
  currentSurveyId,
}: AnalyticsSidebarProps) {
  const [checkedRounds, setCheckedRounds] = useState<Set<string>>(new Set([currentSurveyId]));

  // Resilience is a real, fully-tagged taxonomy elsewhere in the app — it's
  // only excluded from this dashboard's Framework Lens filter, not the data.
  const visibleFrameworks = frameworks.filter((f) => f.category !== 'resilience');

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-1">
      {demographics.length > 0 && (
        <Accordion type="single" collapsible defaultValue="demographics">
          <AccordionItem value="demographics">
            <AccordionTrigger className="text-sm font-semibold text-stratosphere">Demographic filters</AccordionTrigger>
            <AccordionContent className="space-y-3">
              {demographics.map((demo) => (
                <div key={demo.questionId}>
                  <Label className="text-xs text-sky-500">{demo.questionText}</Label>
                  <Select
                    value={selectedDemographic?.questionId === demo.questionId ? selectedDemographic.value : SELECT_ALL}
                    onValueChange={(value) => {
                      if (value === SELECT_ALL) onDemographicChange(null);
                      else onDemographicChange({ questionId: demo.questionId, value });
                    }}
                  >
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SELECT_ALL}>All respondents</SelectItem>
                      {demo.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {roundOptions.length > 1 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="rounds">
            <AccordionTrigger className="text-sm font-semibold text-stratosphere">Compare rounds</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {roundOptions.map((round) => (
                <div key={round.surveyId} className="flex items-center gap-2">
                  <Checkbox
                    id={`round-${round.surveyId}`}
                    checked={checkedRounds.has(round.surveyId)}
                    onCheckedChange={(checked) => {
                      setCheckedRounds((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(round.surveyId);
                        else next.delete(round.surveyId);
                        return next;
                      });
                    }}
                  />
                  <Label htmlFor={`round-${round.surveyId}`} className="text-sm text-stratosphere font-normal">
                    {round.label}
                  </Label>
                </div>
              ))}
              <p className="text-xs text-sky-400 italic">Round comparison is coming soon.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="py-4 border-t border-sky-100">
        <Label className="text-xs text-sky-500">Framework lens</Label>
        <Select
          value={selectedFramework ?? SELECT_ALL}
          onValueChange={(value) => onFrameworkChange(value === SELECT_ALL ? undefined : (value as FrameworkCategory))}
        >
          <SelectTrigger className="mt-1 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SELECT_ALL}>All frameworks</SelectItem>
            {visibleFrameworks.map((fw) => (
              <SelectItem key={fw.category} value={fw.category}>
                {fw.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
