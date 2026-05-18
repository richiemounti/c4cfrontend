// app/admin/resilience-dimensions/page.tsx
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
  fetchResilienceDimensions, 
  archiveResilienceDimension, 
  restoreResilienceDimension, 
  deleteResilienceDimension,
  fetchResilienceCategories 
} from '@/lib/api/resilienceDimension';

// Types
import { ResilienceDimension } from '@/types/taxonomy';

// Import useSearchParams at the component level
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function ResilienceDimensionsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [dimensions, setDimensions] = useState<ResilienceDimension[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<{status: string, capacityType?: string, category?: string}>({
    status: 'all',
    capacityType: 'all',
    category: 'all'
  });
  
  // Load available categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await fetchResilienceCategories();
        setAvailableCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  // Effect to load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Initialize search params
        const initialPage = parseInt(searchParams.get('page') || '1');
        const initialSearch = searchParams.get('search') || '';
        const initialStatus = searchParams.get('status') || 'all';
        const initialCapacityType = searchParams.get('capacityType') || 'all';
        const initialCategory = searchParams.get('category') || 'all';
        
        setPage(initialPage);
        setSearchTerm(initialSearch);
        setFilters({
          status: initialStatus,
          capacityType: initialCapacityType,
          category: initialCategory
        });
        
        // Fetch resilience dimensions
        const dimensionsResponse = await fetchResilienceDimensions({
            page: initialPage,
            limit,
            search: initialSearch,
            status: initialStatus !== 'all' ? initialStatus : undefined,
            capacityType: initialCapacityType !== 'all' ? initialCapacityType : undefined,
            category: initialCategory !== 'all' ? initialCategory : undefined
        });
        
        setDimensions(dimensionsResponse.data);
        setTotal(dimensionsResponse.total || dimensionsResponse.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch resilience dimensions. Please try again.",
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
    if (filters.capacityType && filters.capacityType !== 'all') params.set('capacityType', filters.capacityType);
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    
    router.push(`/admin/resilience-dimensions?${params.toString()}`);
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
        capacityType: 'all',
        category: 'all'
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
  
  // Function to handle resilience dimension actions
  const handleArchive = async (id: string) => {
    try {
      await archiveResilienceDimension(id);
      
      // Update the local state
      setDimensions(dimensions.map(dimension => 
        dimension._id === id ? { ...dimension, status: 'inactive', archived: true } : dimension
      ));
      
      toast({
        title: "Success",
        description: "Resilience dimension archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving resilience dimension:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive resilience dimension. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreResilienceDimension(id);
      
      // Update the local state
      setDimensions(dimensions.map(dimension => 
        dimension._id === id ? { ...dimension, status: 'active', archived: false } : dimension
      ));
      
      toast({
        title: "Success",
        description: "Resilience dimension restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring resilience dimension:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore resilience dimension. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteResilienceDimension(id);
      
      // Remove the dimension from the local state
      setDimensions(dimensions.filter(dimension => dimension._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "Resilience dimension deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting resilience dimension:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resilience dimension. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  // Capacity type options for filter
  const capacityTypeOptions = [
    { value: 'all', label: 'All Capacity Types' },
    { value: 'absorptive_capacity', label: 'Absorptive Capacity' },
    { value: 'adaptive_capacity', label: 'Adaptive Capacity' },
    { value: 'transformative_capacity', label: 'Transformative Capacity' }
  ];
  
  // Dynamic category options for filter based on available categories
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...availableCategories.map(category => ({
      value: category,
      label: category.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }))
  ];
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Resilience Dimensions</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild className='text-white bg-stratosphere hover:bg-stratosphere-900'>
            <Link href="/admin/resilience-dimensions/builder">
              <Plus className="mr-2 h-4 w-4" /> Create Dimension
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
                type="resilience-dimension"
                customFilters={[
                  {
                    key: 'capacityType',
                    label: 'Capacity Type',
                    options: capacityTypeOptions
                  },
                  {
                    key: 'category',
                    label: 'Category',
                    options: categoryOptions
                  }
                ]}
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
              placeholder="Search resilience dimensions..."
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
                    type="resilience-dimension"
                    customFilters={[
                      {
                        key: 'capacityType',
                        label: 'Capacity Type',
                        options: capacityTypeOptions
                      },
                      {
                        key: 'category',
                        label: 'Category',
                        options: categoryOptions
                      }
                    ]}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Resilience Dimensions list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : dimensions.length === 0 ? (
            <div className="text-center p-12 border border-stratosphere rounded-lg bg-background">
              <h3 className="text-lg font-medium">No resilience dimensions found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all' || filters.capacityType !== 'all' || filters.category !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new resilience dimension"}
              </p>
              <Button asChild className="mt-4 bg-stratosphere hover:bg-stratosphere-900 text-white">
                <Link href="/admin/resilience-dimensions/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create Dimension
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stratosphere-500 text-muted-foreground mb-4">
                Showing {dimensions.length} of {total} resilience dimensions
              </p>
              
              {dimensions.map((dimension) => (
                <div key={dimension._id} className="mb-4">
                  <TaxonomyCard
                    item={dimension}
                    type="resilience-dimension"
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    extraInfo={`Category: ${dimension.category}, Capacity: ${Array.isArray(dimension.capacityTypes) ? dimension.capacityTypes.join(', ') : dimension.capacityTypes}`}
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
const ResilienceDimensionsPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stratosphere">Resilience Dimensions</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-stratosphere border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ResilienceDimensionsContent />
    </Suspense>
  );
};

export default ResilienceDimensionsPage;