'use client';

import type { ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { PRIMARY_COLOR, SURFACE_GRID_COLOR } from './colors';

export interface HorizontalBarItem {
  label: string;
  value: number;
  color?: string;
  count?: number;
}

interface HorizontalBarChartProps {
  items: HorizontalBarItem[];
  valueSuffix?: string;
  height?: number;
  emptyLabel?: string;
  domain?: [number, number];
}

const CustomTooltip = ({ active, payload, valueSuffix }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as HorizontalBarItem;
    return (
      <div className="bg-white p-3 border border-sky-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-stratosphere">{item.label}</p>
        <p className="text-sm text-sky-600">
          {item.value.toFixed(1)}
          {valueSuffix}
          {item.count != null && <span className="text-sky-400"> · n={item.count}</span>}
        </p>
      </div>
    );
  }
  return null;
};

export default function HorizontalBarChart({ items, valueSuffix = '%', height = 280, emptyLabel = 'No data available', domain = [0, 100] }: HorizontalBarChartProps) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sky-400 text-sm">{emptyLabel}</p>
      </div>
    );
  }

  const chartHeight = Math.max(height, items.length * 44);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={items} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={SURFACE_GRID_COLOR} horizontal={false} />
        <XAxis type="number" domain={domain} tick={{ fill: '#272236', fontSize: 12 }} unit={valueSuffix} />
        <YAxis type="category" dataKey="label" width={160} tick={{ fill: '#272236', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip valueSuffix={valueSuffix} />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {items.map((item, index) => (
            <Cell key={`cell-${index}`} fill={item.color || PRIMARY_COLOR} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={((v: number) => `${v.toFixed(0)}${valueSuffix}`) as unknown as (label: ReactNode) => ReactNode}
            style={{ fill: '#272236', fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
