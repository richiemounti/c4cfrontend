// app/admin/sni-surveys/[id]/preview/page.tsx
// Staff-only preview — "Kate and Belinda cannot sanity-check a roster survey
// by reading the question list... without preview they are authoring blind"
// (brief §3). Walks the real roster engine (services/sni/sniRosterEngine.service.ts)
// via startSniPreview, which bypasses the draft/published status restriction
// and always marks the response isTestResponse.
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SniPreviewRunner from '@/components/sni/SniPreviewRunner';

export default function SniPreviewPage() {
  const params = useParams();
  const surveyId = params.id as string;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href={`/admin/sni-surveys/${surveyId}`} className="inline-flex items-center text-sm text-neutral-500 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to builder
      </Link>
      <h1 className="text-2xl font-semibold mb-1">Preview</h1>
      <p className="text-sm text-neutral-500 mb-6">Walks the actual runtime-generated sequence, including roster behaviour. Test responses only — never counted as real data.</p>
      <SniPreviewRunner surveyId={surveyId} />
    </div>
  );
}
