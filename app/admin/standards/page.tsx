// app/admin/standards/page.tsx
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
  fetchStandards, 
  archiveStandard, 
  restoreStandard, 
  deleteStandard 
} from '@/lib/api/standard';

// Types
import { Standard } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function StandardsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<{status: string, issuingBody?: string}>({
    status: 'all',
    issuingBody: 'all'
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
        const initialIssuingBody = searchParams.get('issuingBody') || 'all';
        
        setPage(initialPage);
        setSearchTerm(initialSearch);
        setFilters({
          status: initialStatus,
          issuingBody: initialIssuingBody
        });
        
        // Fetch standards
        const standardsResponse = await fetchStandards({
            page: initialPage,
            limit,
            search: initialSearch,
            status: initialStatus !== 'all' ? initialStatus : undefined,
            issuingBody: initialIssuingBody !== 'all' ? initialIssuingBody : undefined
        });
        
        setStandards(standardsResponse.data);
        setTotal(standardsResponse.total || standardsResponse.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch standards. Please try again.",
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
    if (filters.issuingBody && filters.issuingBody !== 'all') params.set('issuingBody', filters.issuingBody);
    
    router.push(`/admin/standards?${params.toString()}`);
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
        status: 'all',
        issuingBody: 'all'
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
  
  // Function to handle standard actions
  const handleArchive = async (id: string) => {
    try {
      await archiveStandard(id);
      
      // Update the local state
      setStandards(standards.map(standard => 
        standard._id === id ? { ...standard, status: 'inactive', archived: true } : standard
      ));
      
      toast({
        title: "Success",
        description: "Standard archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving standard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive standard. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreStandard(id);
      
      // Update the local state
      setStandards(standards.map(standard => 
        standard._id === id ? { ...standard, status: 'active', archived: false } : standard
      ));
      
      toast({
        title: "Success",
        description: "Standard restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring standard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore standard. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteStandard(id);
      
      // Remove the standard from the local state
      setStandards(standards.filter(standard => standard._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "Standard deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting standard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete standard. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  // Get unique issuing bodies for filter
  const issuingBodies = Array.from(new Set(standards.map(s => s.issuingBody)))
    .filter(Boolean)
    .sort();
  
  const issuingBodyOptions = [
    { value: 'all', label: 'All Issuing Bodies' },
    ...issuingBodies.map(body => ({ value: body, label: body }))
  ];
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Standards</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/admin/standards/builder">
              <Plus className="mr-2 h-4 w-4" /> Create Standard
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
                type="standard"
                customFilters={
                  issuingBodies.length > 0 ? [
                    {
                      key: 'issuingBody',
                      label: 'Issuing Body',
                      options: issuingBodyOptions
                    }
                  ] : undefined
                }
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
              placeholder="Search standards..."
            />
            
            {/* Mobile filter button */}
            <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
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
                    type="standard"
                    customFilters={
                      issuingBodies.length > 0 ? [
                        {
                          key: 'issuingBody',
                          label: 'Issuing Body',
                          options: issuingBodyOptions
                        }
                      ] : undefined
                    }
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Standards list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : standards.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-background">
              <h3 className="text-lg font-medium">No standards found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all' || filters.issuingBody !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new standard"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/standards/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create Standard
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {standards.length} of {total} standards
              </p>
              
              {standards.map((standard) => (
                <div key={standard._id} className="mb-4">
                  <TaxonomyCard
                    item={standard}
                    type="standard"
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    extraInfo={
                      <div className="mt-1 text-sm text-muted-foreground">
                        {standard.issuingBody && (
                          <div><span className="font-medium">Issuing Body:</span> {standard.issuingBody}</div>
                        )}
                        {standard.version && (
                          <div><span className="font-medium">Version:</span> {standard.version}</div>
                        )}
                        {standard.publishedYear && (
                          <div><span className="font-medium">Published:</span> {standard.publishedYear}</div>
                        )}
                      </div>
                    }
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

// Main page component with Suspense boundary
const StandardsPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Standards</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <StandardsContent />
    </Suspense>
  );
};

export default StandardsPage;