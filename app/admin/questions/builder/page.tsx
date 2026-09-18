// app/admin/questions/builder/page.tsx - SIMPLIFIED VERSION
'use client';

import { Suspense } from 'react';
import QuestionBuilderContent from '@/components/admin/QuestionBuilderContent';

const QuestionBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-coral-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    }>
      <QuestionBuilderContent />
    </Suspense>
  );
};

export default QuestionBuilderPage;