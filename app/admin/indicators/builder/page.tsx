// app/admin/indicators/builder/page.tsx
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import IndicatorForm from '@/components/admin/taxonomy/IndicatorForm';
import { fetchIndicator, createIndicator, updateIndicator } from '@/lib/api/indicator';
import { Indicator } from '@/types/taxonomy';

// Create a client component that uses useSearchParams
function IndicatorBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const indicatorId = searchParams.get('id');
  const { toast } = useToast();
  
  const [indicator, setIndicator] = useState<Partial<Indicator>>({
    name: '',
    description: '',
    status: 'active',
    evidence: { // Initialize evidence with empty values
      source: '',
      url: [],
      details: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  
  // Memoized function to load indicator data
  const loadIndicator = useCallback(async () => {
    if (!indicatorId) return;
    
    setIsInitialLoading(true);
    try {
      const response = await fetchIndicator(indicatorId);
      
      // Ensure the status is correctly set and evidence is initialized
      const indicatorData = {
        ...response.data,
        status: response.data.status || 'active',
        evidence: response.data.evidence || {
          source: '',
          url: [],
          details: ''
        }
      };
      
      setIndicator(indicatorData);
    } catch (error) {
      console.error('Error loading indicator:', error);
      toast({
        title: 'Error',
        description: 'Failed to load indicator. Please try again.',
        variant: 'destructive'
      });
      // Redirect back to indicators list on error
      router.push('/admin/indicators');
    } finally {
      setIsInitialLoading(false);
    }
  }, [indicatorId, toast, router]);
  
  // Load indicator data if editing existing indicator
  useEffect(() => {
    loadIndicator();
  }, [loadIndicator]);
  
  const handleSubmit = async (data: Partial<Indicator>) => {
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!data.name?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Indicator name is required.',
          variant: 'destructive'
        });
        return;
      }

      // Ensure status is valid
      const validStatuses = ['active', 'inactive'];
      if (data.status && !validStatuses.includes(data.status)) {
        data.status = 'active';
      }

      if (indicatorId) {
        // Update existing indicator
        const response = await updateIndicator(indicatorId, data);
        
        // Update local state with response data
        setIndicator(response.data);
        
        toast({
          title: 'Success',
          description: 'Indicator updated successfully'
        });
        
        // ✅ ADD THIS: Redirect to indicators list after successful update
        router.push('/admin/indicators');
        
      } else {
        // Create new indicator
        const response = await createIndicator(data);
        
        toast({
          title: 'Success',
          description: 'Indicator created successfully'
        });
        
        // Redirect to edit mode with the new ID
        router.push(`/admin/indicators/builder?id=${response.data._id}`);
      }
    } catch (error: any) {
      console.error('Error saving indicator:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to save indicator. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/admin/indicators');
  }, [router]);

  // Handle form submit trigger
  const handleFormSubmitTrigger = useCallback(() => {
    const form = document.querySelector('form');
    if (form) {
      // Create and dispatch a submit event
      const submitEvent = new Event('submit', { 
        bubbles: true, 
        cancelable: true 
      });
      form.dispatchEvent(submitEvent);
    }
  }, []);
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {indicatorId ? 'Edit Indicator' : 'Create Indicator'}
          </h1>
        </div>
        
        <Button
          onClick={handleFormSubmitTrigger}
          disabled={isLoading || isInitialLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Indicator'}
        </Button>
      </div>
      
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto"> {/* Changed from max-w-2xl to max-w-3xl for better width */}
          <IndicatorForm
            initialData={indicator}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
const IndicatorBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <div className="h-10 w-10 mr-2 bg-muted animate-pulse rounded"></div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <IndicatorBuilderContent />
    </Suspense>
  );
};

export default IndicatorBuilderPage;