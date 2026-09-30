'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OptionBar } from '@/types';
import { categoricalColor } from './colors';

interface DonutChartProps {
  bars: OptionBar[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const bar = payload[0].payload as OptionBar;
    return (
      <div className="bg-white p-3 border border-c4c-rule rounded-lg">
        <p className="text-sm font-medium text-black">{bar.label}</p>
        <p className="text-sm text-c4c-petrol">
          {bar.percentage.toFixed(1)}% <span className="text-c4c-petrol">(n={bar.count})</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DonutChart({ bars, height = 280 }: DonutChartProps) {
  const data = bars.filter((b) => b.count > 0);
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-c4c-petrol text-sm">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data as unknown as Record<string, unknown>[]}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="percentage"
          nameKey="label"
          label={({ percentage }: any) => `${percentage.toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color && entry.color !== '#272236' ? entry.color : categoricalColor(index)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={48}
          formatter={(value) => <span className="text-sm text-black">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
