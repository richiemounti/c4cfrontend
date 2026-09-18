'use client';

import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnalyticsReportPayload } from '@/types';

interface ReportHeaderProps {
  meta: AnalyticsReportPayload['meta'];
  siteName?: string;
}

export default function ReportHeader({ meta, siteName }: ReportHeaderProps) {
  return (
    <div className="border-b border-neutral-200 pb-4 mb-6">
      <p className="text-xs uppercase tracking-wide text-neutral-500 font-medium">
        {meta.projectName}
        {siteName ? ` · ${siteName}` : ' · Project-level'}
        {meta.collectionPeriod ? ` · ${meta.collectionPeriod}` : ''}
      </p>
      <h1 className="text-2xl font-bold text-ink mt-1">{meta.title}</h1>
      <div className="flex items-center gap-3 mt-2">
        <Badge variant="secondary" className="bg-neutral-50 text-ink">
          {meta.nRespondents} respondents
        </Badge>
        <Badge variant="outline" className="border-neutral-200 text-neutral-600">
          {meta.activeFilterLabel}
        </Badge>
        {meta.isLegacy && (
          <Badge variant="outline" className="border-amber-300 text-amber-700 flex items-center gap-1">
            <History size={12} />
            Legacy / archived survey
          </Badge>
        )}
      </div>
    </div>
  );
}
