// app/admin/indicators/page.tsx - Fixed version
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
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
  fetchIndicators, 
  archiveIndicator, 
  restoreIndicator, 
  deleteIndicator 
} from '@/lib/api/indicator';

// Types
import { Indicator, TaxonomyStatus } from '@/types/taxonomy';

// Create a client component for the actual content
function IndicatorsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<{status: string}>({
    status: 'all'
  });

  // Add a type guard function to validate if a string is a valid TaxonomyStatus
  function isTaxonomyStatus(value: string | null): value is TaxonomyStatus {
    return value === 'active' || value === 'inactive' || value === 'draft' || value === 'published' || value === 'archived' || value === 'all';
  }
  
  // Function to update URL with current filters - memoized to prevent re-renders
  const updateURLParams = useCallback((newPage?: number, newSearchTerm?: string, newFilters?: {status: string}) => {
    const params = new URLSearchParams();
    const currentPage = newPage ?? page;
    const currentSearch = newSearchTerm ?? searchTerm;
    const currentFilters = newFilters ?? filters;
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (currentSearch) params.set('search', currentSearch);
    if (currentFilters.status !== 'all') params.set('status', currentFilters.status);
    
    router.push(`/admin/indicators?${params.toString()}`);
  }, [page, searchTerm, filters, router]);
  
  // Function to fetch data - memoized to prevent re-renders
  const fetchData = useCallback(async (fetchPage: number, fetchSearch: string, fetchStatus: string) => {
    setLoading(true);
    try {
      const indicatorsResponse = await fetchIndicators({
        page: fetchPage,
        limit,
        search: fetchSearch || undefined,
        status: fetchStatus !== 'all' ? fetchStatus as Exclude<TaxonomyStatus, 'all'> : undefined
      });
      
      setIndicators(indicatorsResponse.data);
      setTotal(indicatorsResponse.total);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch indicators. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [limit, toast]);
  
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

  // ADD THIS: Debounced live search effect
  useEffect(() => {
    // Don't trigger on initial render or if search term matches URL
    if (searchTerm === (searchParams.get('search') || '')) {
      return;
    }

    // Create a timeout to debounce the search
    const delaySearch = setTimeout(() => {
      const newPage = 1;
      setPage(newPage);
      updateURLParams(newPage, searchTerm, filters);
      fetchData(newPage, searchTerm, filters.status);
    }, 500); // 500ms delay

    // Cleanup function to clear timeout if searchTerm changes again
    return () => clearTimeout(delaySearch);
  }, [searchTerm, filters, updateURLParams, fetchData, searchParams]);
  
  // Function to handle search
  const handleSearch = useCallback(() => {
    const newPage = 1;
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters.status);
  }, [searchTerm, filters, updateURLParams, fetchData]);
  
  // Function to handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    let newFilters = { ...filters };
    const newPage = 1;
    
    if (key === 'reset') {
      // Reset all filters
      newFilters = { status: 'all' };
    } else {
      // Normal filter change
      newFilters[key as keyof typeof filters] = value;
    }
    
    setFilters(newFilters);
    setPage(newPage);
    updateURLParams(newPage, searchTerm, newFilters);
    fetchData(newPage, searchTerm, newFilters.status);
  }, [filters, searchTerm, updateURLParams, fetchData]);
  
  // Function to handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    updateURLParams(newPage, searchTerm, filters);
    fetchData(newPage, searchTerm, filters.status);
  }, [searchTerm, filters, updateURLParams, fetchData]);
  
  // Function to handle indicator actions
  const handleArchive = async (id: string) => {
    try {
      await archiveIndicator(id);
      
      // Update the local state - fix the status type issue
      setIndicators(indicators.map(i => 
        i._id === id ? { ...i, archived: true, archivedAt: new Date() } : i
      ));
      
      toast({
        title: "Success",
        description: "Indicator archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving indicator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive indicator. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreIndicator(id);
      
      // Update the local state - fix the status type issue
      setIndicators(indicators.map(i => 
        i._id === id ? { ...i, archived: false, archivedAt: undefined } : i
      ));
      
      toast({
        title: "Success",
        description: "Indicator restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring indicator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore indicator. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteIndicator(id);
      
      // Remove the indicator from the local state
      setIndicators(indicators.filter(i => i._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "Indicator deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting indicator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete indicator. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Indicators</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild className='text-white bg-stratosphere hover:bg-stratosphere-900'>
            <Link href="/admin/indicators/builder">
              <Plus className="mr-2 h-4 w-4" /> Create Indicator
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
                type="indicator"
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
              placeholder="Search indicators..."
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
                    type="indicator"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Indicator list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : indicators.length === 0 ? (
            <div className="text-center p-12 border border-stratosphere rounded-lg bg-background">
              <h3 className="text-lg font-medium">No indicators found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new indicator"}
              </p>
              <Button asChild className="mt-4 bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Link href="/admin/indicators/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create Indicator
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stratosphere-500 text-muted-foreground mb-4">
                Showing {indicators.length} of {total} indicators
              </p>
              
              {indicators.map((indicator) => (
                <TaxonomyCard
                  key={indicator._id}
                  item={indicator}
                  type="indicator"
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
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

// Fallback for loading state
const LoadingFallback = () => (
  <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Indicators</h1>
    </div>
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-stratosphere border-t-transparent rounded-full"></div>
    </div>
  </div>
);

// Main component with Suspense boundary
const IndicatorsPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IndicatorsContent />
    </Suspense>
  );
};

export default IndicatorsPage;