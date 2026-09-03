'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartData } from '@/types';
import HorizontalBarChart from '@/components/charts/analytics/HorizontalBarChart';
import DonutChart from '@/components/charts/analytics/DonutChart';
import DivergingBarChart from '@/components/charts/analytics/DivergingBarChart';
import Histogram from '@/components/charts/analytics/Histogram';
import MatrixHeatmap from '@/components/charts/analytics/MatrixHeatmap';
import BoxPlot from '@/components/charts/analytics/BoxPlot';
import BigramBarChart from '@/components/charts/analytics/BigramBarChart';
import WordCloudBlock from '@/components/charts/analytics/WordCloudBlock';
import { STATUS_COLORS, STATUS_LABELS, formatSignedPct } from '@/components/charts/analytics/colors';

interface ChartCardProps {
  chart: ChartData;
}

function StatusBadge({ chart }: { chart: ChartData }) {
  if (chart.status === 'neutral' || chart.computedValue == null) return null;
  return (
    <Badge
      className="text-white"
      style={{ backgroundColor: STATUS_COLORS[chart.status] }}
    >
      {STATUS_LABELS[chart.status]}
      {chart.delta != null && <span className="ml-1 opacity-90">{formatSignedPct(chart.delta)}</span>}
    </Badge>
  );
}

export default function ChartCard({ chart }: ChartCardProps) {
  return (
    <Card className="border-sky-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-stratosphere leading-snug">{chart.questionText}</CardTitle>
            {chart.insightHeadline && <p className="text-sm text-sky-600 mt-1">{chart.insightHeadline}</p>}
          </div>
          <StatusBadge chart={chart} />
        </div>
        <p className="text-xs text-sky-400 mt-1">
          n={chart.nAnswered} of {chart.nRespondents} respondents
        </p>
      </CardHeader>
      <CardContent>
        {chart.chartType === 'horizontal_bar' && (
          <HorizontalBarChart
            items={chart.optionBars.map((b) => ({ label: b.label, value: b.percentage, color: b.color, count: b.count }))}
          />
        )}
        {chart.chartType === 'donut' && <DonutChart bars={chart.optionBars} />}
        {chart.chartType === 'diverging_bar' && <DivergingBarChart segments={chart.likertSegments} />}
        {chart.chartType === 'kpi_histogram' && chart.questionType === 'number' && <Histogram bins={chart.numericBins} />}
        {chart.chartType === 'kpi_histogram' && chart.questionType === 'number' && chart.numericStats && (
          <div className="mt-4 border-t border-sky-100 pt-3">
            <BoxPlot stats={chart.numericStats} height={90} />
          </div>
        )}
        {chart.chartType === 'matrix_bar' && <MatrixHeatmap rows={chart.matrixRows} />}
        {chart.chartType === 'word_cloud' && chart.textStats && (
          <>
            <WordCloudBlock stats={chart.textStats} sample={chart.textSample} />
            {chart.textStats.topBigrams.length > 0 && (
              <div className="mt-4 border-t border-sky-100 pt-3">
                <p className="text-xs font-medium text-sky-500 mb-1.5">Common phrases</p>
                <BigramBarChart bigrams={chart.textStats.topBigrams} height={Math.min(chart.textStats.topBigrams.length, 10) * 36} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
