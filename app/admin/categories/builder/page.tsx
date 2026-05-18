// app/admin/categories/builder/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TaxonomyForm from '@/components/admin/taxonomy/TaxonomyForm';
import { fetchCategory, createCategory, updateCategory } from '@/lib/api/category';
import { Category } from '@/types/taxonomy';

// Component that uses useSearchParams
function CategoryBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  const { toast } = useToast();
  
  const [category, setCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    status: 'draft'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch category data if editing existing category
  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        const response = await fetchCategory(categoryId);
        setCategory(response.data);
      } catch (error) {
        console.error('Error loading category:', error);
        toast({
          title: 'Error',
          description: 'Failed to load category',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategory();
  }, [categoryId, toast]);
  
  const handleSubmit = async (data: Partial<Category>) => {
    setIsLoading(true);
    
    try {
      if (categoryId) {
        // Update existing category
        await updateCategory(categoryId, data);
        toast({
          title: 'Success',
          description: 'Category updated successfully'
        });
      } else {
        // Create new category
        const response = await createCategory(data);
        toast({
          title: 'Success',
          description: 'Category created successfully'
        });
        // Redirect to edit mode with the new ID
        router.push(`/admin/categories/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
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
            onClick={() => router.push('/admin/categories')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {categoryId ? 'Edit Category' : 'Create Category'}
          </h1>
        </div>
        
        <Button
          onClick={() => document.querySelector('form')?.requestSubmit()}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Category
        </Button>
      </div>
      
      {isLoading && !category.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <TaxonomyForm
            type="category"
            initialData={category}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
const CategoryBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <CategoryBuilderContent />
    </Suspense>
  );
};

export default CategoryBuilderPage;