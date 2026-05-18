// app/admin/sdgs/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SDGForm from '@/components/admin/taxonomy/SDGForm';
import { fetchSDG, createSDG, updateSDG } from '@/lib/api/sdg';
import { SDG } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function SDGBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sdgId = searchParams.get('id');
  const { toast } = useToast();
  
  const [sdg, setSDG] = useState<Partial<SDG>>({
    code: '',
    name: '',
    description: '',
    iconUrl: '',
    color: '#1F77B4', // Default color
    status: 'active'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch SDG data if editing existing SDG
  useEffect(() => {
    const loadSDG = async () => {
      if (!sdgId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchSDG(sdgId);
        setSDG(response.data);
      } catch (error) {
        console.error('Error loading SDG:', error);
        toast({
          title: 'Error',
          description: 'Failed to load SDG',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSDG();
  }, [sdgId, toast]);
  
  const handleSubmit = async (data: Partial<SDG>) => {
    setIsLoading(true);
    
    try {
      if (sdgId) {
        // Update existing SDG
        await updateSDG(sdgId, data);
        toast({
          title: 'Success',
          description: 'SDG updated successfully'
        });
      } else {
        // Create new SDG
        const response = await createSDG(data);
        toast({
          title: 'Success',
          description: 'SDG created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/sdgs/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving SDG:', error);
      toast({
        title: 'Error',
        description: 'Failed to save SDG',
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
            onClick={() => router.push('/admin/sdgs')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {sdgId ? 'Edit SDG' : 'Create SDG'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save SDG
        </Button>
      </div>
      
      {isLoading && !sdg.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <SDGForm
            initialData={sdg}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
const SDGBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading SDG Builder...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <SDGBuilderContent />
    </Suspense>
  );
};

export default SDGBuilderPage;