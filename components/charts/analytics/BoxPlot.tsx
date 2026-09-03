'use client';

import { NumericStats } from '@/types';
import { PRIMARY_COLOR } from './colors';

interface BoxPlotProps {
  stats: NumericStats;
  height?: number;
}

export default function BoxPlot({ stats, height = 120 }: BoxPlotProps) {
  const { minVal, maxVal, p25, p75, median, mean } = stats;
  const range = maxVal - minVal || 1;
  const pct = (v: number) => ((v - minVal) / range) * 100;

  const boxLeft = pct(p25);
  const boxRight = pct(p75);
  const medianX = pct(median);
  const meanX = pct(mean);

  return (
    <div style={{ height }} className="flex flex-col justify-center px-4">
      <div className="relative h-8">
        {/* Whisker line */}
        <div className="absolute top-1/2 -translate-y-1/2 h-[2px]" style={{ left: '0%', width: '100%', backgroundColor: '#C9C5C1' }} />
        {/* Min/max caps */}
        <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-4 bg-sky-300" style={{ left: '0%' }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-4 bg-sky-300" style={{ left: '100%' }} />
        {/* Box (P25-P75) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-6 rounded"
          style={{ left: `${boxLeft}%`, width: `${Math.max(boxRight - boxLeft, 1)}%`, backgroundColor: PRIMARY_COLOR, opacity: 0.25 }}
        />
        {/* Median line */}
        <div className="absolute top-1/2 -translate-y-1/2 w-[2px] h-6" style={{ left: `${medianX}%`, backgroundColor: PRIMARY_COLOR }} />
        {/* Mean marker */}
        <div
          className="absolute top-1/2 rounded-full border-2 border-white"
          style={{ left: `${meanX}%`, width: 8, height: 8, transform: 'translate(-50%, -50%)', backgroundColor: '#89A0AE' }}
          title={`Mean: ${mean.toLocaleString()}`}
        />
      </div>
      <div className="flex justify-between text-xs text-sky-500 mt-2">
        <span>Min {minVal.toLocaleString()}</span>
        <span>P25 {p25.toLocaleString()}</span>
        <span className="font-medium text-stratosphere">Median {median.toLocaleString()}</span>
        <span>P75 {p75.toLocaleString()}</span>
        <span>Max {maxVal.toLocaleString()}</span>
      </div>
    </div>
  );
}
