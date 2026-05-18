// app/admin/sdgs/page.tsx
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
  fetchSDGs, 
  archiveSDG, 
  restoreSDG, 
  deleteSDG 
} from '@/lib/api/sdg';

// Types
import { SDG } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function SDGsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [sdgs, setSDGs] = useState<SDG[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(17); // SDGs typically have 17 items, show all
  const [total, setTotal] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<{status: string}>({
    status: 'all'
  });
  
  // Effect to load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Initialize search params
        const initialPage = parseInt(searchParams.get('page') || '1');
        const initialSearch = searchParams.get('search') || '';
        const initialStatus = searchParams.get('status') || 'all';
        
        setPage(initialPage);
        setSearchTerm(initialSearch);
        setFilters({
          status: initialStatus
        });
        
        // Fetch SDGs
        const sdgsResponse = await fetchSDGs({
            page: initialPage,
            limit,
            search: initialSearch,
            status: initialStatus !== 'all' ? initialStatus : undefined
        });
        
        setSDGs(sdgsResponse.data);
        setTotal(sdgsResponse.total || sdgsResponse.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch SDGs. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams, limit, toast]);
  
  // Function to update URL with current filters
  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (filters.status !== 'all') params.set('status', filters.status);
    
    router.push(`/admin/sdgs?${params.toString()}`);
  };
  
  // Function to handle search
  const handleSearch = () => {
    setPage(1);
    updateURLParams();
  };
  
  // Function to handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'reset') {
      // Reset all filters
      setFilters({
        status: 'all'
      });
      setPage(1);
    } else {
      // Normal filter change
      setFilters({
        ...filters,
        [key]: value
      });
      setPage(1);
    }
    
    updateURLParams();
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams();
  };
  
  // Function to handle SDG actions
  const handleArchive = async (id: string) => {
    try {
      await archiveSDG(id);
      
      // Update the local state
      setSDGs(sdgs.map(sdg => 
        sdg._id === id ? { ...sdg, status: 'inactive', archived: true } : sdg
      ));
      
      toast({
        title: "Success",
        description: "SDG archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving SDG:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive SDG. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreSDG(id);
      
      // Update the local state
      setSDGs(sdgs.map(sdg => 
        sdg._id === id ? { ...sdg, status: 'active', archived: false } : sdg
      ));
      
      toast({
        title: "Success",
        description: "SDG restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring SDG:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore SDG. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteSDG(id);
      
      // Remove the SDG from the local state
      setSDGs(sdgs.filter(sdg => sdg._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "SDG deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting SDG:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete SDG. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Sustainable Development Goals (SDGs)</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild className='text-white bg-stratosphere hover:bg-stratosphere-900'>
            <Link href="/admin/sdgs/builder">
              <Plus className="mr-2 h-4 w-4" /> Create SDG
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
                type="sdg"
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
              placeholder="Search SDGs..."
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
                    type="sdg"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* SDG list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : sdgs.length === 0 ? (
            <div className="text-center p-12 border border-stratosphere rounded-lg bg-background">
              <h3 className="text-lg font-medium">No SDGs found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new SDG"}
              </p>
              <Button asChild className="mt-4 bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Link href="/admin/sdgs/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create SDG
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stratosphere-500 text-muted-foreground mb-4">
                Showing {sdgs.length} of {total} SDGs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sdgs.map((sdg) => (
                  <div key={sdg._id}>
                    <TaxonomyCard
                      item={sdg}
                      type="sdg"
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                      extraInfo={
                        <div className="flex items-center mt-2">
                          {sdg.iconUrl && (
                            <img 
                              src={sdg.iconUrl} 
                              alt={sdg.name} 
                              className="h-8 w-8 mr-3"
                              style={{ background: sdg.color || 'transparent' }}
                            />
                          )}
                          <span className="text-sm font-medium">{sdg.code}</span>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <PaginationComponent 
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
const SDGsPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Sustainable Development Goals (SDGs)</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <SDGsContent />
    </Suspense>
  );
};

export default SDGsPage;