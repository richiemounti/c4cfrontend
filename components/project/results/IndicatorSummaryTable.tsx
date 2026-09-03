'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IndicatorSummaryRow } from '@/types';
import { STATUS_COLORS, STATUS_LABELS, formatSignedPct } from '@/components/charts/analytics/colors';

interface IndicatorSummaryTableProps {
  indicators: IndicatorSummaryRow[];
}

export default function IndicatorSummaryTable({ indicators }: IndicatorSummaryTableProps) {
  if (!indicators.length) {
    return (
      <div className="text-center py-8 text-sky-400 text-sm">No indicators are tagged on this survey's questions yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicator</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Δ vs target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Frameworks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {indicators.map((ir) => (
            <TableRow key={ir.indicatorId}>
              <TableCell className="font-medium text-stratosphere">{ir.indicatorName}</TableCell>
              <TableCell className="text-right">{ir.aggregatedScore != null ? `${ir.aggregatedScore.toFixed(1)}%` : '—'}</TableCell>
              <TableCell className="text-right text-sky-500">{ir.targetValue != null ? `${ir.targetValue}%` : '—'}</TableCell>
              <TableCell className="text-right">{formatSignedPct(ir.delta)}</TableCell>
              <TableCell>
                <Badge className="text-white" style={{ backgroundColor: STATUS_COLORS[ir.status] }}>
                  {STATUS_LABELS[ir.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(ir.frameworkTags).map(([category, names]) => (
                    <Badge key={category} variant="outline" className="border-sky-200 text-sky-600 text-xs" title={names.join(', ')}>
                      {category.toUpperCase()} ({names.length})
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
