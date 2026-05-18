// app/(dashboard)/dashboard/project/[projectId]/review/[reviewId]/page.tsx
'use client';

import React from 'react';
import { use } from 'react';
import ReviewDetail from '@/components/reviews/ReviewDetail';
import ProjectSidebar from '@/components/project/ProjectSidebar';

interface ReviewDetailPageProps {
    id: string;
    reviewId: string;
}

export default function ReviewDetailPage({ params }: { params: ReviewDetailPageProps}) {
  const { id: projectId, reviewId } = params;

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      <ProjectSidebar 
        projectId={projectId}
        projectName="Project" // ReviewDetail will fetch the full details
      />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ReviewDetail reviewId={reviewId} />
        </div>
      </div>
    </div>
  );
}