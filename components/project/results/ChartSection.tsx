'use client';

import { SectionGroup } from '@/types';
import ChartCard from './ChartCard';

interface ChartSectionProps {
  section: SectionGroup;
}

export default function ChartSection({ section }: ChartSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-stratosphere mb-3 pb-2 border-b border-sky-200">{section.theme}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {section.charts.map((chart) => (
          <ChartCard key={chart.surveyQuestionId} chart={chart} />
        ))}
      </div>
    </section>
  );
}
