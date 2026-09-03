'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IndicatorSummaryRow } from '@/types';
import { STATUS_COLORS, STATUS_LABELS, formatSignedPct } from '@/components/charts/analytics/colors';

interface ExecutiveSummaryProps {
  text: string;
  indicators: IndicatorSummaryRow[];
}

export default function ExecutiveSummary({ text, indicators }: ExecutiveSummaryProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-stratosphere mb-3">Executive Summary</h2>
      <Card className="border-sky-200 bg-white mb-4">
        <CardContent className="pt-6">
          <p className="text-sm text-stratosphere leading-relaxed">{text}</p>
        </CardContent>
      </Card>
      {indicators.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {indicators.map((ir) => (
            <Card key={ir.indicatorId} className="border-sky-200 bg-white">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-sky-500 truncate" title={ir.indicatorName}>
                  {ir.indicatorName}
                </p>
                <p className="text-2xl font-semibold text-stratosphere mt-1">
                  {ir.aggregatedScore != null ? `${ir.aggregatedScore.toFixed(0)}%` : '—'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[ir.status] }} />
                  <span className="text-xs text-sky-500">{STATUS_LABELS[ir.status]}</span>
                  {ir.delta != null && <span className="text-xs text-sky-400">{formatSignedPct(ir.delta)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
