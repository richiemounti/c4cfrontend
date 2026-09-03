'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LikertSegment } from '@/types';

interface DivergingBarChartProps {
  segments: LikertSegment[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white p-3 border border-sky-200 rounded-lg shadow-lg space-y-1">
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm text-stratosphere">
          {p.payload[`${p.dataKey}_label`]}: <span className="font-medium">{Math.abs(p.value).toFixed(1)}%</span>
        </p>
      ))}
    </div>
  );
};

export default function DivergingBarChart({ segments, height = 120 }: DivergingBarChartProps) {
  const scored = segments.filter((s) => s.position !== 'na');
  const naSegment = segments.find((s) => s.position === 'na');

  if (!scored.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sky-400 text-sm">No data available</p>
      </div>
    );
  }

  const row: Record<string, number | string> = { name: 'response' };
  const bars: { key: string; color: string }[] = [];
  let maxAbs = 10;

  scored.forEach((seg, i) => {
    if (seg.position === 'neutral') {
      const half = seg.percentage / 2;
      row[`neg_${i}`] = -half;
      row[`neg_${i}_label`] = seg.label;
      row[`pos_${i}`] = half;
      row[`pos_${i}_label`] = seg.label;
      bars.push({ key: `neg_${i}`, color: seg.color }, { key: `pos_${i}`, color: seg.color });
      maxAbs = Math.max(maxAbs, half);
    } else {
      const negative = seg.position.includes('negative');
      const key = `seg_${i}`;
      row[key] = negative ? -seg.percentage : seg.percentage;
      row[`${key}_label`] = seg.label;
      bars.push({ key, color: seg.color });
      maxAbs = Math.max(maxAbs, seg.percentage);
    }
  });

  const domain = Math.ceil((maxAbs + 5) / 10) * 10;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={[row]} layout="vertical" stackOffset="sign" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis type="number" domain={[-domain, domain]} tick={{ fill: '#272236', fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" hide />
          <ReferenceLine x={0} stroke="#272236" strokeWidth={1} />
          <Tooltip content={<CustomTooltip />} />
          {bars.map((b) => (
            <Bar key={b.key} dataKey={b.key} stackId="likert" fill={b.color} maxBarSize={40} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
        {scored.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-stratosphere">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: seg.color }} />
            {seg.label} ({seg.percentage.toFixed(0)}%)
          </span>
        ))}
        {naSegment && naSegment.count > 0 && (
          <span className="text-xs text-sky-400">N/A: {naSegment.percentage.toFixed(0)}%</span>
        )}
      </div>
    </div>
  );
}
