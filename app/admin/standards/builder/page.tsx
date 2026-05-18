// app/admin/standards/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StandardForm from '@/components/admin/taxonomy/StandardForm';
import { fetchStandard, createStandard, updateStandard } from '@/lib/api/standard';
import { Standard } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function StandardBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const standardId = searchParams.get('id');
  const { toast } = useToast();
  
  const [standard, setStandard] = useState<Partial<Standard>>({
    code: '',
    name: '',
    description: '',
    issuingBody: '',
    website: '',
    version: '',
    publishedYear: undefined,
    status: 'active'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch standard data if editing existing standard
  useEffect(() => {
    const loadStandard = async () => {
      if (!standardId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchStandard(standardId);
        setStandard(response.data);
      } catch (error) {
        console.error('Error loading standard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load standard',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStandard();
  }, [standardId, toast]);
  
  const handleSubmit = async (data: Partial<Standard>) => {
    setIsLoading(true);
    
    try {
      if (standardId) {
        // Update existing standard
        await updateStandard(standardId, data);
        toast({
          title: 'Success',
          description: 'Standard updated successfully'
        });
      } else {
        // Create new standard
        const response = await createStandard(data);
        toast({
          title: 'Success',
          description: 'Standard created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/standards/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving standard:', error);
      toast({
        title: 'Error',
        description: 'Failed to save standard',
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
            onClick={() => router.push('/admin/standards')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {standardId ? 'Edit Standard' : 'Create Standard'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Standard
        </Button>
      </div>
      
      {isLoading && !standard.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <StandardForm
            initialData={standard}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
const StandardBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading Standard Builder...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <StandardBuilderContent />
    </Suspense>
  );
};

export default StandardBuilderPage;