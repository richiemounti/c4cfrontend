'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ReviewDetail from '@/components/reviews/ReviewDetail';
import { useAuth } from '@/contexts/AuthContext';

const AdminReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const reviewId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }
    if (user && !user.isConnectGoStaff) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleBack = () => {
    router.push('/admin/dashboard/review');
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" /></div>;
  }

  if (!isAuthenticated || !user?.isConnectGoStaff) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Escalated Reviews</span>
        </button>
      </div>

      <ReviewDetail
        reviewId={reviewId}
        onBack={handleBack}
        embedded={false}
      />
    </div>
  );
};

export default AdminReviewDetailPage;