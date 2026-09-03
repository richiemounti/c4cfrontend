'use client';

import { TextStats } from '@/types';
import { STATUS_COLORS } from './colors';

interface WordCloudBlockProps {
  stats: TextStats;
  sample: string[];
}

export default function WordCloudBlock({ stats, sample }: WordCloudBlockProps) {
  if (!stats.responseCount) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sky-400 text-sm">No responses yet</p>
      </div>
    );
  }

  const maxWordCount = stats.topWords[0]?.[1] ?? 1;

  return (
    <div className="space-y-4">
      {/* Sentiment bar */}
      <div>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div style={{ width: `${stats.sentimentPositivePct}%`, backgroundColor: STATUS_COLORS.on_track }} title={`Positive ${stats.sentimentPositivePct}%`} />
          <div style={{ width: `${stats.sentimentNeutralPct}%`, backgroundColor: STATUS_COLORS.neutral }} title={`Neutral ${stats.sentimentNeutralPct}%`} />
          <div style={{ width: `${stats.sentimentNegativePct}%`, backgroundColor: STATUS_COLORS.risk }} title={`Negative ${stats.sentimentNegativePct}%`} />
        </div>
        <div className="flex justify-between text-xs text-sky-500 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS.on_track }} />
            Positive {stats.sentimentPositivePct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS.neutral }} />
            Neutral {stats.sentimentNeutralPct}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS.risk }} />
            Negative {stats.sentimentNegativePct}%
          </span>
        </div>
      </div>

      {/* Top words */}
      {stats.topWords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-sky-500 mb-1.5">Frequently mentioned words</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topWords.slice(0, 12).map(([word, count]) => (
              <span
                key={word}
                className="px-2 py-1 rounded-full bg-sky-50 text-stratosphere"
                style={{ fontSize: `${11 + (count / maxWordCount) * 6}px` }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample quotes */}
      {sample.length > 0 && (
        <div>
          <p className="text-xs font-medium text-sky-500 mb-1.5">Sample responses</p>
          <ul className="space-y-1.5">
            {sample.map((quote, i) => (
              <li key={i} className="text-sm text-stratosphere italic border-l-2 border-sky-200 pl-2">
                &ldquo;{quote}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-sky-400">
        {stats.responseCount} responses · {stats.validResponseRate}% response rate · avg {stats.avgLengthWords} words
      </p>
    </div>
  );
}
