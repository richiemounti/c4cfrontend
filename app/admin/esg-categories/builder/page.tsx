// app/admin/esg-categories/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ESGCategoryForm from '@/components/admin/taxonomy/ESGCategoryForm';
import { fetchESGCategory, createESGCategory, updateESGCategory } from '@/lib/api/esgCategory';
import { ESGCategory } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function ESGCategoryBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  const { toast } = useToast();
  
  const [category, setCategory] = useState<Partial<ESGCategory>>({
    code: '',
    name: '',
    description: '',
    type: 'Environmental',
    status: 'active'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch ESG category data if editing existing category
  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchESGCategory(categoryId);
        setCategory(response.data);
      } catch (error) {
        console.error('Error loading ESG category:', error);
        toast({
          title: 'Error',
          description: 'Failed to load ESG category',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategory();
  }, [categoryId, toast]);
  
  const handleSubmit = async (data: Partial<ESGCategory>) => {
    setIsLoading(true);
    
    try {
      if (categoryId) {
        // Update existing ESG category
        await updateESGCategory(categoryId, data);
        toast({
          title: 'Success',
          description: 'ESG Category updated successfully'
        });
      } else {
        // Create new ESG category
        const response = await createESGCategory(data);
        toast({
          title: 'Success',
          description: 'ESG Category created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/esg-categories/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving ESG category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save ESG category',
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
            onClick={() => router.push('/admin/esg-categories')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {categoryId ? 'Edit ESG Category' : 'Create ESG Category'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save ESG Category
        </Button>
      </div>
      
      {isLoading && !category.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <ESGCategoryForm
            initialData={category}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
const ESGCategoryBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading ESG Category Builder...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ESGCategoryBuilderContent />
    </Suspense>
  );
};

export default ESGCategoryBuilderPage;