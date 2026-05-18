// app/dashboard/stakeholders/project/[projectId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import StakeholderMappingView from '@/components/stakeholders/StakeholderMappingView';

const StakeholderMappingPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  return <StakeholderMappingView projectId={projectId} context="project" />;
};

export default StakeholderMappingPage;