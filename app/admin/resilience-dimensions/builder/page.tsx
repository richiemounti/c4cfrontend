// app/admin/resilience-dimensions/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ResilienceDimensionForm from '@/components/admin/taxonomy/ResilienceDimensionForm';
import { fetchResilienceDimension, createResilienceDimension, updateResilienceDimension } from '@/lib/api/resilienceDimension';
import { ResilienceDimension } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function ResilienceDimensionBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dimensionId = searchParams.get('id');
  const { toast } = useToast();
  
  const [dimension, setDimension] = useState<Partial<ResilienceDimension>>({
    code: '',
    name: '',
    description: '',
    capacityTypes: 'adaptive_capacity',
    category: '',
    linkToPvModel: '',
    resilienceIndexCriteria: '',
    indicatorExamples: '',
    status: 'active'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch dimension data if editing existing dimension
  useEffect(() => {
    const loadDimension = async () => {
      if (!dimensionId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchResilienceDimension(dimensionId);
        setDimension(response.data);
      } catch (error) {
        console.error('Error loading resilience dimension:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resilience dimension',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDimension();
  }, [dimensionId, toast]);
  
  const handleSubmit = async (data: Partial<ResilienceDimension>) => {
    setIsLoading(true);
    
    try {
      if (dimensionId) {
        // Update existing dimension
        await updateResilienceDimension(dimensionId, data);
        toast({
          title: 'Success',
          description: 'Resilience dimension updated successfully'
        });
      } else {
        // Create new dimension
        const response = await createResilienceDimension(data);
        toast({
          title: 'Success',
          description: 'Resilience dimension created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/resilience-dimensions/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving resilience dimension:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resilience dimension',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/resilience-dimensions')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {dimensionId ? 'Edit Resilience Dimension' : 'Create Resilience Dimension'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Dimension
        </Button>
      </div>
      
      {isLoading && !dimension.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          <ResilienceDimensionForm
            initialData={dimension}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
const ResilienceDimensionBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading Resilience Dimension Builder...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ResilienceDimensionBuilderContent />
    </Suspense>
  );
};

export default ResilienceDimensionBuilderPage;