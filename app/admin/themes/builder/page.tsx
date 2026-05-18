// app/admin/themes/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TaxonomyForm from '@/components/admin/taxonomy/TaxonomyForm';
import { fetchTheme, createTheme, updateTheme } from '@/lib/api/theme';
import { Theme } from '@/types/taxonomy';

// Component that uses useSearchParams
function ThemeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeId = searchParams.get('id');
  const { toast } = useToast();
  
  const [theme, setTheme] = useState<Partial<Theme>>({
    name: '',
    description: '',
    theoryOfChangeStage: 'Stage 1 - Output',
    status: 'draft'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch theme data if editing existing theme
  useEffect(() => {
    const loadTheme = async () => {
      if (!themeId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchTheme(themeId);
        setTheme(response.data);
      } catch (error) {
        console.error('Error loading theme:', error);
        toast({
          title: 'Error',
          description: 'Failed to load theme',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, [themeId, toast]);
  
  const handleSubmit = async (data: Partial<Theme>) => {
    setIsLoading(true);
    
    try {
      if (themeId) {
        // Update existing theme
        await updateTheme(themeId, data);
        toast({
          title: 'Success',
          description: 'Theme updated successfully'
        });
      } else {
        // Create new theme
        const response = await createTheme(data);
        toast({
          title: 'Success',
          description: 'Theme created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/themes/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save theme',
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
            onClick={() => router.push('/admin/themes')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {themeId ? 'Edit Theme' : 'Create Theme'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Theme
        </Button>
      </div>
      
      {isLoading && !theme.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <TaxonomyForm
            type="theme"
            initialData={theme}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
const ThemeBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ThemeBuilderContent />
    </Suspense>
  );
};

export default ThemeBuilderPage;