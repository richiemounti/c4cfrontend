'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Filter } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

// Custom components
import TaxonomyCard from '@/components/admin/taxonomy/TaxonomyCard';
import TaxonomyFilterPanel from '@/components/admin/taxonomy/TaxonomyFilterPanel';
import TaxonomySearchBar from '@/components/admin/taxonomy/TaxonomySearchBar';
import PaginationComponent from '@/components/admin/questions/PaginationComponent';

// API functions
import { 
  fetchSubThemes, 
  archiveSubTheme, 
  restoreSubTheme, 
  deleteSubTheme,
  getAvailableTags  // Add this import
} from '@/lib/api/subtheme';
import { fetchThemes } from '@/lib/api/theme';

// Types
import { SubTheme, TaxonomyStatus, Theme, SDG, ResilienceDimension, ESGCategory, Standard, Indicator } from '@/types/taxonomy';

// Import useSearchParams at the component level where it's used
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function SubThemesContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [subThemes, setSubThemes] = useState<SubTheme[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
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
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Enhanced filters with new fields
  const [filters, setFilters] = useState<{
    status: string;
    parentId?: string;
    theoryOfChangeStage?: string;
    sdgTags?: string[];
    resilienceTags?: string[];
    esgTags?: string[];
    standardTags?: string[];
  }>({
    status: 'all',
    parentId: 'all',
    theoryOfChangeStage: 'all',
    sdgTags: [],
    resilienceTags: [],
    esgTags: [],
    standardTags: []
  });
  
  // Add this type guard at the top of your file
  function isTaxonomyStatus(value: string | null): value is TaxonomyStatus {
    return value === 'draft' || value === 'published' || value === 'archived' || value === 'all';
  }

  // Effect to load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const initialPage = parseInt(searchParams.get('page') || '1');
      const initialSearch = searchParams.get('search') || '';
      let initialStatus = searchParams.get('status') || 'all';
      const initialTheme = searchParams.get('theme') || 'all';
      const initialStage = searchParams.get('stage') || 'all';
      
      const initialSdgTags = searchParams.get('sdgTags')?.split(',').filter(Boolean) || [];
      const initialResilienceTags = searchParams.get('resilienceTags')?.split(',').filter(Boolean) || [];
      const initialEsgTags = searchParams.get('esgTags')?.split(',').filter(Boolean) || [];
      const initialStandardTags = searchParams.get('standardTags')?.split(',').filter(Boolean) || [];
      
      if (!isTaxonomyStatus(initialStatus)) {
        initialStatus = 'all';
      }

      const initialFilters = {
        status: initialStatus,
        parentId: initialTheme,
        theoryOfChangeStage: initialStage,
        sdgTags: initialSdgTags,
        resilienceTags: initialResilienceTags,
        esgTags: initialEsgTags,
        standardTags: initialStandardTags
      };

      if (page !== initialPage) setPage(initialPage);
      if (searchTerm !== initialSearch) setSearchTerm(initialSearch);
      setFilters(initialFilters);
      
      try {
        const [themesResponse, tagsResponse] = await Promise.all([
          fetchThemes({ 
            limit: 1000,
            status: 'published'
          }),
          getAvailableTags()
        ]);
        
        setThemes(themesResponse.data);
        setAvailableTags(tagsResponse.data);
        
        await fetchData(initialPage, initialSearch, initialFilters);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, [searchParams]);
  
  // Function to update URL with current filters
  const updateURLParams = (newPage?: number, newSearchTerm?: string, newFilters?: typeof filters) => {
    const params = new URLSearchParams();
    const currentPage = newPage ?? page;
    const currentSearch = newSearchTerm ?? searchTerm;
    const currentFilters = newFilters ?? filters;
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (currentSearch) params.set('search', currentSearch);
    if (currentFilters.status !== 'all') params.set('status', currentFilters.status);
    if (currentFilters.parentId && currentFilters.parentId !== 'all') params.set('theme', currentFilters.parentId);
    if (currentFilters.theoryOfChangeStage && currentFilters.theoryOfChangeStage !== 'all') {
      params.set('stage', currentFilters.theoryOfChangeStage);
    }
    
    if (currentFilters.sdgTags && currentFilters.sdgTags.length > 0) {
      params.set('sdgTags', currentFilters.sdgTags.join(','));
    }
    if (currentFilters.resilienceTags && currentFilters.resilienceTags.length > 0) {
      params.set('resilienceTags', currentFilters.resilienceTags.join(','));
    }
    if (currentFilters.esgTags && currentFilters.esgTags.length > 0) {
      params.set('esgTags', currentFilters.esgTags.join(','));
    }
    if (currentFilters.standardTags && currentFilters.standardTags.length > 0) {
      params.set('standardTags', currentFilters.standardTags.join(','));
    }
    
    router.push(`/admin/subthemes?${params.toString()}`);
  };

  // Function to fetch data
  const fetchData = async (
    fetchPage: number,
    fetchSearch: string,
    fetchFilters: typeof filters
  ) => {
    setLoading(true);
    try {
      const subThemesResponse = await fetchSubThemes({
        page: fetchPage,
        limit,
        search: fetchSearch || undefined,
        status: fetchFilters.status !== 'all' ? fetchFilters.status as Exclude<TaxonomyStatus, 'all'> : undefined,
        theme: fetchFilters.parentId !== 'all' ? fetchFilters.parentId : undefined,
        theoryOfChangeStage: fetchFilters.theoryOfChangeStage !== 'all' ? fetchFilters.theoryOfChangeStage as 'Stage 1 - Output' | 'Stage 2 - Outcome' : undefined,
        sdgTags: fetchFilters.sdgTags && fetchFilters.sdgTags.length > 0 ? fetchFilters.sdgTags : undefined,
        resilienceTags: fetchFilters.resilienceTags && fetchFilters.resilienceTags.length > 0 ? fetchFilters.resilienceTags : undefined,
        esgTags: fetchFilters.esgTags && fetchFilters.esgTags.length > 0 ? fetchFilters.esgTags : undefined,
        standardTags: fetchFilters.standardTags && fetchFilters.standardTags.length > 0 ? fetchFilters.standardTags : undefined,
        populate: 'tags,theme'
      });
      
      setSubThemes(subThemesResponse.data);
      setTotal(subThemesResponse.total);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subthemes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // ADD THIS: Debounced live search effect
  useEffect(() => {
    // Don't trigger on initial render or if search term matches URL
    if (searchTerm === (searchParams.get('search') || '')) {
      return;
    }

    const delaySearch = setTimeout(() => {
      const newPage = 1;
      setPage(newPage);
      updateURLParams(newPage, searchTerm, filters);
      fetchData(newPage, searchTerm, filters);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);


  // Function to handle search (manual)
  const handleSearch = () => {
    const newPage = 1;
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters);
  };
  
  // Function to handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    let newFilters = { ...filters };
    const newPage = 1;
    
    if (key === 'reset') {
      newFilters = {
        status: 'all',
        parentId: 'all',
        theoryOfChangeStage: 'all',
        sdgTags: [],
        resilienceTags: [],
        esgTags: [],
        standardTags: []
      };
    } else {
      newFilters = {
        ...newFilters,
        [key]: value
      };
    }
    
    setFilters(newFilters);
    setPage(newPage);
    updateURLParams(newPage, searchTerm, newFilters);
    fetchData(newPage, searchTerm, newFilters);
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters);
  };
  
  // Function to handle subtheme actions
  const handleArchive = async (id: string) => {
    try {
      await archiveSubTheme(id);
      
      // Update the local state
      setSubThemes(subThemes.map(s => 
        s._id === id ? { ...s, status: 'archived' } : s
      ));
      
      toast({
        title: "Success",
        description: "SubTheme archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving subtheme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive subtheme. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreSubTheme(id);
      
      // Update the local state
      setSubThemes(subThemes.map(s => 
        s._id === id ? { ...s, status: 'draft' } : s
      ));
      
      toast({
        title: "Success",
        description: "SubTheme restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring subtheme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore subtheme. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteSubTheme(id);
      
      // Remove the subtheme from the local state
      setSubThemes(subThemes.filter(s => s._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "SubTheme deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting subtheme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subtheme. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  // Get theme name for each subtheme
  const getSubThemeWithTheme = (subTheme: SubTheme) => {
    const themeId = !subTheme.theme ? null : typeof subTheme.theme === 'string' ? subTheme.theme : subTheme.theme._id;
    const theme = themes.find(t => t._id === themeId);
    return {
      ...subTheme,
      themeName: theme?.name || 'Unknown Theme'
    };
  };

  // Helper function to render tag badges
  const renderTagBadges = (subTheme: SubTheme) => {
    const badges = [];
    
    // Theory of Change Stage badge
    if (subTheme.theoryOfChangeStage) {
      badges.push(
        <span 
          key="stage" 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
        >
          {subTheme.theoryOfChangeStage}
        </span>
      );
    }
    
    // SDG tags
    if (Array.isArray(subTheme.sdgTags) && subTheme.sdgTags.length > 0) {
      subTheme.sdgTags.forEach((tag: any, index: number) => {
        const tagName = typeof tag === 'string' ? tag : tag.code || tag.name;
        badges.push(
          <span 
            key={`sdg-${index}`} 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
          >
            SDG: {tagName}
          </span>
        );
      });
    }
    
    return badges.length > 0 ? (
      <div className="mt-2">
        {badges.slice(0, 3)} {/* Show only first 3 badges */}
        {badges.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{badges.length - 3} more
          </span>
        )}
      </div>
    ) : null;
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stratosphere">SubThemes</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild className='text-white bg-stratosphere hover:bg-stratosphere-900'>
            <Link href="/admin/subthemes/builder">
              <Plus className="mr-2 h-4 w-4" /> Create SubTheme
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar on larger screens */}
        <div className="hidden md:block">
          <Card className='bg-white border border-stratosphere text-stratosphere shadow-sm'>
            <CardContent className="pt-6">
              <TaxonomyFilterPanel 
                filters={filters}
                onFilterChange={handleFilterChange}
                type="subtheme"
                parentItems={themes}
                parentLabel="Theme"
                availableTags={availableTags}  // Pass available tags for filtering
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <TaxonomySearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              placeholder="Search subthemes..."
            />
            
            {/* Mobile filter button */}
            <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden border-stratosphere text-stratosphere hover:bg-stratosphere hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <TaxonomyFilterPanel 
                    filters={filters}
                    onFilterChange={(key, value) => {
                      handleFilterChange(key, value);
                      if (key === 'reset') {
                        setFilterPanelOpen(false);
                      }
                    }}
                    type="subtheme"
                    parentItems={themes}
                    parentLabel="Theme"
                    availableTags={availableTags}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* SubTheme list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : subThemes.length === 0 ? (
            <div className="text-center p-12 border border-stratosphere rounded-lg bg-background">
              <h3 className="text-lg font-medium">No subthemes found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all' || filters.parentId !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new subtheme"}
              </p>
              <Button asChild className="mt-4 bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Link href="/admin/subthemes/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create SubTheme
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stratosphere-500 text-muted-foreground mb-4">
                Showing {subThemes.length} of {total} subthemes
              </p>
              
              {subThemes.map((subTheme) => (
                <div key={subTheme._id} className="mb-4">
                  <TaxonomyCard
                    item={subTheme}
                    type="subtheme"
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                  />
                  <div className="text-xs text-stratosphere-500 text-muted-foreground-mt-2 ml-4 mb-2">
                    Theme: {getSubThemeWithTheme(subTheme).themeName}
                  </div>
                  {/* Render tag badges */}
                  <div className="ml-4 mb-4 text-stratosphere-500">
                    {renderTagBadges(subTheme)}
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              <PaginationComponent 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
const SubThemesPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stratosphere">SubThemes</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-stratosphere border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <SubThemesContent />
    </Suspense>
  );
};

export default SubThemesPage;