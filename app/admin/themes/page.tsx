// app/admin/themes/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  fetchThemes, 
  archiveTheme, 
  restoreTheme, 
  deleteTheme 
} from '@/lib/api/theme';

// Types
import { Theme, TaxonomyStatus } from '@/types/taxonomy';

// Add this type guard at the top of your file
function isTaxonomyStatus(value: string | null): value is TaxonomyStatus {
  return value === 'draft' || value === 'published' || value === 'archived' || value === 'all';
}

// Main content component that uses useSearchParams
function ThemesContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Filters (simplified - no category filter)
  const [filters, setFilters] = useState<{status: string}>({
    status: 'all'
  });
  
  // Effect to load initial data from URL params
  useEffect(() => {
    const initialPage = parseInt(searchParams.get('page') || '1');
    const initialSearch = searchParams.get('search') || '';
    let initialStatus = searchParams.get('status') || 'all';

    if (!isTaxonomyStatus(initialStatus)) {
      initialStatus = 'all';
    }
    
    if (page !== initialPage) setPage(initialPage);
    if (searchTerm !== initialSearch) setSearchTerm(initialSearch);
    if (filters.status !== initialStatus) {
      setFilters({ status: initialStatus });
    }
    
    fetchData(initialPage, initialSearch, initialStatus);
  }, [searchParams]);

  
  // Function to update URL with current filters
  const updateURLParams = (newPage?: number, newSearchTerm?: string, newFilters?: {status: string}) => {
    const params = new URLSearchParams();
    const currentPage = newPage ?? page;
    const currentSearch = newSearchTerm ?? searchTerm;
    const currentFilters = newFilters ?? filters;
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (currentSearch) params.set('search', currentSearch);
    if (currentFilters.status !== 'all') params.set('status', currentFilters.status);
    
    router.push(`/admin/themes?${params.toString()}`);
  };

  // Function to fetch themes
  const fetchData = async (fetchPage: number, fetchSearch: string, fetchStatus: string) => {
    setLoading(true);
    try {
      const themesResponse = await fetchThemes({
        page: fetchPage,
        limit,
        search: fetchSearch || undefined,
        status: fetchStatus !== 'all' ? fetchStatus as Exclude<TaxonomyStatus, 'all'> : undefined
      });
      
      setThemes(themesResponse.data);
      setTotal(themesResponse.total);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch themes. Please try again.",
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
      fetchData(newPage, searchTerm, filters.status);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);
  
  // Function to handle search (manual search via button/Enter)
  const handleSearch = () => {
    const newPage = 1;
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters.status);
  };
  
  // Function to handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    let newFilters = { ...filters };
    const newPage = 1;
    
    if (key === 'reset') {
      newFilters = { status: 'all' };
    } else {
      newFilters[key as keyof typeof filters] = value;
    }
    
    setFilters(newFilters);
    setPage(newPage);
    updateURLParams(newPage, searchTerm, newFilters);
    fetchData(newPage, searchTerm, newFilters.status);
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters.status);
  };
  
  // Function to handle theme actions
  const handleArchive = async (id: string) => {
    try {
      await archiveTheme(id);
      
      // Update the local state
      setThemes(themes.map(t => 
        t._id === id ? { ...t, status: 'archived' } : t
      ));
      
      toast({
        title: "Success",
        description: "Theme archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving theme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive theme. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreTheme(id);
      
      // Update the local state
      setThemes(themes.map(t => 
        t._id === id ? { ...t, status: 'draft' } : t
      ));
      
      toast({
        title: "Success",
        description: "Theme restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring theme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore theme. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteTheme(id);
      
      // Remove the theme from the local state
      setThemes(themes.filter(t => t._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "Theme deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete theme. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Themes</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild className='text-white bg-stratosphere hover:bg-stratosphere-900'>
            <Link href="/admin/themes/builder">
              <Plus className="mr-2 h-4 w-4" /> Create Theme
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
                type="theme"
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
              placeholder="Search themes..."
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
                    type="theme"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Theme list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-background">
              <h3 className="text-lg font-medium">No themes found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new theme"}
              </p>
              <Button asChild className="mt-4 bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Link href="/admin/themes/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create Theme
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stratosphere-500 text-muted-foreground mb-4">
                Showing {themes.length} of {total} themes
              </p>
              
              {themes.map((theme) => (
                <div key={theme._id} className="mb-4">
                  <TaxonomyCard
                    item={theme}
                    type="theme"
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                  />
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

// Main component with Suspense boundary
const ThemesPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-stratosphere border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ThemesContent />
    </Suspense>
  );
};

export default ThemesPage;