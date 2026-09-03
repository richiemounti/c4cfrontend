'use client';

import { MatrixRowStats } from '@/types';

interface MatrixHeatmapProps {
  rows: MatrixRowStats[];
}

// Single-hue sequential ramp (brand primary at increasing opacity) — magnitude only.
function cellStyle(percentage: number) {
  const alpha = 0.08 + (Math.min(Math.max(percentage, 0), 100) / 100) * 0.75;
  return { backgroundColor: `rgba(39, 34, 54, ${alpha.toFixed(2)})` };
}

export default function MatrixHeatmap({ rows }: MatrixHeatmapProps) {
  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sky-400 text-sm">No data available</p>
      </div>
    );
  }

  const columns = rows[0].optionBars;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-sky-500 pb-2 pr-3">Row</th>
            {columns.map((col) => (
              <th key={col.value} className="text-center text-xs font-medium text-sky-500 pb-2 px-1">
                {col.label}
              </th>
            ))}
            <th className="text-right text-xs font-medium text-sky-500 pb-2 pl-3">Mean</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="text-stratosphere text-xs pr-3 py-1 max-w-[160px] truncate" title={row.label}>
                {row.label}
              </td>
              {row.optionBars.map((cell) => (
                <td key={cell.value} className="p-1">
                  <div
                    className="rounded text-center text-xs py-2 text-stratosphere"
                    style={cellStyle(cell.percentage)}
                    title={`${cell.label}: ${cell.percentage.toFixed(0)}% (n=${cell.count})`}
                  >
                    {cell.percentage > 0 ? `${cell.percentage.toFixed(0)}%` : ''}
                  </div>
                </td>
              ))}
              <td className="text-right text-xs font-medium text-stratosphere pl-3">{row.meanScore.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
