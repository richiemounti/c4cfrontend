// app/admin/questions/builder/page.tsx - SIMPLIFIED VERSION
'use client';

import { Suspense } from 'react';
import QuestionBuilderContent from '@/components/admin/QuestionBuilderContent';

const QuestionBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-c4c-grey-bg via-white to-c4c-grey-bg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    }>
      <QuestionBuilderContent />
    </Suspense>
  );
};

export default QuestionBuilderPage;