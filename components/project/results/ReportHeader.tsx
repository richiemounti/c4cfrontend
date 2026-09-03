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
    <div className="border-b border-sky-200 pb-4 mb-6">
      <p className="text-xs uppercase tracking-wide text-sky-500 font-medium">
        {meta.projectName}
        {siteName ? ` · ${siteName}` : ' · Project-level'}
        {meta.collectionPeriod ? ` · ${meta.collectionPeriod}` : ''}
      </p>
      <h1 className="text-2xl font-bold text-stratosphere mt-1">{meta.title}</h1>
      <div className="flex items-center gap-3 mt-2">
        <Badge variant="secondary" className="bg-sky-50 text-stratosphere">
          {meta.nRespondents} respondents
        </Badge>
        <Badge variant="outline" className="border-sky-200 text-sky-600">
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
