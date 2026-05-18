// app/admin/esg-categories/page.tsx
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

// API functions - you'll need to create these
import { 
  fetchESGCategories, 
  archiveESGCategory, 
  restoreESGCategory, 
  deleteESGCategory 
} from '@/lib/api/esgCategory';

// Types
import { ESGCategory } from '@/types/taxonomy';

// Import useSearchParams at the component level where it's used
import { useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function ESGCategoriesContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [categories, setCategories] = useState<ESGCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Filters
  const [filters, setFilters] = useState<{status: string, type?: string}>({
    status: 'all',
    type: 'all'
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
        const initialType = searchParams.get('type') || 'all';
        
        setPage(initialPage);
        setSearchTerm(initialSearch);
        setFilters({
          status: initialStatus,
          type: initialType
        });
        
        // Fetch ESG categories
        const categoriesResponse = await fetchESGCategories({
            page: initialPage,
            limit,
            search: initialSearch,
            status: initialStatus !== 'all' ? initialStatus : undefined,
            type: initialType !== 'all' ? initialType : undefined
        });
        
        setCategories(categoriesResponse.data);
        setTotal(categoriesResponse.total || categoriesResponse.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch ESG categories. Please try again.",
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
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    
    router.push(`/admin/esg-categories?${params.toString()}`);
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
        type: 'all'
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
  
  // Function to handle ESG Category actions
  const handleArchive = async (id: string) => {
    try {
      await archiveESGCategory(id);
      
      // Update the local state
      setCategories(categories.map(category => 
        category._id === id ? { ...category, status: 'inactive', archived: true } : category
      ));
      
      toast({
        title: "Success",
        description: "ESG Category archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving ESG category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive ESG category. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreESGCategory(id);
      
      // Update the local state
      setCategories(categories.map(category => 
        category._id === id ? { ...category, status: 'active', archived: false } : category
      ));
      
      toast({
        title: "Success",
        description: "ESG Category restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring ESG category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore ESG category. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteESGCategory(id);
      
      // Remove the category from the local state
      setCategories(categories.filter(category => category._id !== id));
      setTotal(total - 1);
      
      toast({
        title: "Success",
        description: "ESG Category deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting ESG category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete ESG category. Please try again.",
      });
    }
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(total / limit);
  
  // ESG type options for filter
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Environmental', label: 'Environmental' },
    { value: 'Social', label: 'Social' },
    { value: 'Governance', label: 'Governance' }
  ];
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">ESG Categories</h1>
        
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/admin/esg-categories/builder">
              <Plus className="mr-2 h-4 w-4" /> Create ESG Category
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
                type="esg-category"
                customFilters={[
                  {
                    key: 'type',
                    label: 'Type',
                    options: typeOptions
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
              placeholder="Search ESG categories..."
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
                    type="esg-category"
                    customFilters={[
                      {
                        key: 'type',
                        label: 'Type',
                        options: typeOptions
                      }
                    ]}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* ESG Category list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-background">
              <h3 className="text-lg font-medium">No ESG categories found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || filters.status !== 'all' || filters.type !== 'all'
                  ? "Try changing your search or filters"
                  : "Get started by creating a new ESG category"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/esg-categories/builder">
                  <Plus className="mr-2 h-4 w-4" /> Create ESG Category
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Showing {categories.length} of {total} ESG categories
              </p>
              
              {categories.map((category) => (
                <div key={category._id} className="mb-4">
                  <TaxonomyCard
                    item={category}
                    type="esg-category"
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    extraInfo={`Type: ${category.type}`}
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
const ESGCategoriesPage = () => {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">ESG Categories</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <ESGCategoriesContent />
    </Suspense>
  );
};

export default ESGCategoriesPage;