// app/dashboard/stakeholders/site/[siteId]/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import StakeholderMappingView from '@/components/stakeholders/StakeholderMappingView';

const SiteStakeholderMappingPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;  // ✅ From route
  const projectId = searchParams.get('projectId');  // ✅ From query string

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Missing Project ID</h2>
          <p className="text-gray-600 mt-2">Please provide a valid project ID in the URL.</p>
        </div>
      </div>
    );
  }

  return <StakeholderMappingView projectId={projectId} siteId={siteId} context="site" />;
};

export default SiteStakeholderMappingPage;