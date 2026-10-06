// app/dashboard/project/[id]/sni/[surveyId]/preview/page.tsx
// Client-facing preview — reuses the same SniSurveyRunner + backend
// preview-start endpoint as the staff admin preview page
// (app/admin/sni-surveys/[id]/preview/page.tsx). The backend route now
// checks project-access-or-staff rather than staff-only (see
// startSniPreview in controllers/sniSurvey.controller.ts), so the identical
// component works unmodified here — only the page chrome/back-link differs.
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SniSurveyRunner from '@/components/sni/SniSurveyRunner';

export default function SniClientPreviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const surveyId = params.surveyId as string;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/dashboard/project/${projectId}/sni`} className="inline-flex items-center text-sm text-c4c-petrol mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to Social Networks Instrument
      </Link>
      <h1 className="text-2xl font-semibold mb-1">Preview</h1>
      <p className="text-sm text-c4c-petrol mb-6">Walks the actual runtime-generated sequence, including roster behaviour. Test responses only — never counted as real data.</p>
      <SniSurveyRunner surveyId={surveyId} />
    </div>
  );
}
