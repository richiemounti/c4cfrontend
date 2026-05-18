'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TaxonomyForm from '@/components/admin/taxonomy/TaxonomyForm';
import { 
  fetchSubTheme, 
  createSubTheme, 
  updateSubTheme, 
  getAvailableTags 
} from '@/lib/api/subtheme';
import { fetchThemes } from '@/lib/api/theme';
import { SubTheme, Theme, SDG, ResilienceDimension, ESGCategory, Standard, Indicator } from '@/types/taxonomy';
import { useSearchParams } from 'next/navigation';

function SubThemeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subThemeId = searchParams.get('id');
  const { toast } = useToast();
  
  const [subTheme, setSubTheme] = useState<Partial<SubTheme>>({
    name: '',
    description: '',
    theme: '',
    theoryOfChangeStage: 'Stage 1 - Output',
    indicatorTags: [],
    sdgTags: [],
    resilienceTags: [],
    esgTags: [],
    standardTags: [],
    status: 'draft'
  });
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('Stage 1 - Output');

  const filteredThemes = themes.filter((t) => {
    if (selectedStage === 'Both') return t.theoryOfChangeStage === 'Both';
    return t.theoryOfChangeStage === 'Both' || t.theoryOfChangeStage === selectedStage;
  });
  const [availableTags, setAvailableTags] = useState<{
    indicators: Indicator[];
    sdgs: SDG[];
    resilienceDimensions: ResilienceDimension[];
    esgCategories: ESGCategory[];
    standards: Standard[];
  }>({
    indicators: [],
    sdgs: [],
    resilienceDimensions: [],
    esgCategories: [],
    standards: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  
  // Load initial data (themes and available tags)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [themesResponse, tagsResponse] = await Promise.all([
          fetchThemes({ 
            limit: 1000, // Set a high limit to get all themes
            status: 'published' // Only get published themes for the dropdown
          }),
          getAvailableTags()
        ]);
        
        setThemes(themesResponse.data);
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load required data',
          variant: 'destructive'
        });
      } finally {
        setInitialDataLoading(false);
      }
    };
    
    loadInitialData();
  }, [toast]);
  
  // Load subtheme data if editing
  useEffect(() => {
    if (!subThemeId || initialDataLoading) return;
    
    const loadSubTheme = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSubTheme(subThemeId, 'tags,theme');
        const subThemeData = response.data;
        
        // Extract tag IDs from populated objects
        const extractTagIds = (tags: any[]) => 
          Array.isArray(tags) ? tags.map((tag: any) => typeof tag === 'string' ? tag : tag._id) : [];
        
        setSubTheme({
          ...subThemeData,
          theme: typeof subThemeData.theme === 'string' ? subThemeData.theme : subThemeData.theme._id,
          indicatorTags: extractTagIds(subThemeData.indicatorTags),
          sdgTags: extractTagIds(subThemeData.sdgTags),
          resilienceTags: extractTagIds(subThemeData.resilienceTags),
          esgTags: extractTagIds(subThemeData.esgTags),
          standardTags: extractTagIds(subThemeData.standardTags)
        });
        if (subThemeData.theoryOfChangeStage) {
          setSelectedStage(subThemeData.theoryOfChangeStage);
        }
      } catch (error) {
        console.error('Error loading subtheme:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subtheme',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubTheme();
  }, [subThemeId, initialDataLoading, toast]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (data: Partial<SubTheme>) => {
    setIsLoading(true);
    
    try {
      const submitData = {
        ...data,
        indicatorTags: data.indicatorTags || [],
        sdgTags: data.sdgTags || [],
        resilienceTags: data.resilienceTags || [],
        esgTags: data.esgTags || [],
        standardTags: data.standardTags || []
      };
      
      if (subThemeId) {
        await updateSubTheme(subThemeId, submitData);
        toast({
          title: 'Success',
          description: 'SubTheme updated successfully'
        });
      } else {
        const response = await createSubTheme(submitData);
        toast({
          title: 'Success',
          description: 'SubTheme created successfully'
        });
        router.push(`/admin/subthemes/builder?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving subtheme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subtheme',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [subThemeId, toast, router]);
  
  // Handle form changes - only update if value actually changed
  const handleFormChange = useCallback((field: string, value: any) => {
    setSubTheme(prev => {
      if (prev[field as keyof typeof prev] === value) {
        return prev; // No change, return same object
      }
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);
  
  // Handle save button click
  const handleSaveClick = useCallback(() => {
  }, []);
  
  // Handle back button click
  const handleBackClick = useCallback(() => {
    router.push('/admin/subthemes');
  }, [router]);
  
 


  // Show loading state while initial data is being fetched
  if (initialDataLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {subThemeId ? 'Edit SubTheme' : 'Create SubTheme'}
          </h1>
        </div>
        
        <Button
          type="submit"
          form="taxonomy-form" // Add this to target the form
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save SubTheme'}
        </Button>
      </div>
      
      {isLoading && !subTheme.name ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          <TaxonomyForm
            type="subtheme"
            initialData={subTheme}
            onSubmit={handleSubmit}
            onStageChange={setSelectedStage}
            themes={filteredThemes}
            availableTags={availableTags}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

const SubThemeBuilderPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-bold">Loading SubTheme Builder...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <SubThemeBuilderContent />
    </Suspense>
  );
};

export default SubThemeBuilderPage;