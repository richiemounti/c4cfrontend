'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BinBar } from '@/types';
import { PRIMARY_COLOR, SURFACE_GRID_COLOR } from './colors';

interface HistogramProps {
  bins: BinBar[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const bin = payload[0].payload as BinBar;
    return (
      <div className="bg-white p-3 border border-c4c-rule rounded-lg">
        <p className="text-sm font-medium text-black">{bin.label}</p>
        <p className="text-sm text-c4c-petrol">
          Count: <span className="font-bold">{bin.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Histogram({ bins, height = 280 }: HistogramProps) {
  if (!bins.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-c4c-petrol text-sm">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bins} margin={{ bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={SURFACE_GRID_COLOR} vertical={false} />
        <XAxis dataKey="label" angle={-35} textAnchor="end" height={60} tick={{ fill: '#1a1814', fontSize: 11 }} />
        <YAxis tick={{ fill: '#1a1814', fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
