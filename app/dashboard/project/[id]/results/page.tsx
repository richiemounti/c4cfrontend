'use client';

import { useParams } from 'next/navigation';
import MaintenancePage from '@/components/Maintenancepage';

export default function ResultsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <MaintenancePage 
      backUrl={`/dashboard/project/${projectId}`}
      title="Visualize results Coming Soon"
      message="We're building comprehensive analytics tools to help you visualize project data and measure impact effectively."
    />
  );
}