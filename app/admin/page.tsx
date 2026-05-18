// app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to dashboard on component mount
    router.push('/admin/dashboard');
    
    // Optional: Show a toast notification when redirecting
    toast({
      title: "Welcome to Admin",
      description: "Redirecting you to the dashboard",
      variant: "default",
    });
  }, [router, toast]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}