'use client';

import HorizontalBarChart from './HorizontalBarChart';
import { PRIMARY_COLOR } from './colors';

interface BigramBarChartProps {
  bigrams: [string, number][];
  height?: number;
}

export default function BigramBarChart({ bigrams, height = 280 }: BigramBarChartProps) {
  const max = Math.max(...bigrams.map(([, count]) => count), 1);
  const items = bigrams.slice(0, 10).map(([phrase, count]) => ({
    label: phrase,
    value: count,
    color: PRIMARY_COLOR,
  }));

  return <HorizontalBarChart items={items} valueSuffix="" domain={[0, max]} height={height} emptyLabel="No phrases available" />;
}
