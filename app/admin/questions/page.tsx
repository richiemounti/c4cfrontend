'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Filter, Library } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Custom components
import QuestionCard from '@/components/admin/questions/QuestionCard';
import FilterPanel, { FilterState } from '@/components/admin/questions/FilterPanel';
import AddToLibraryModal from '@/components/admin/questions/AddToLibraryModal';
import SearchBar from '@/components/admin/questions/SearchBar';
import ActiveFilters from '@/components/admin/questions/ActiveFilters';
import EmptyState from '@/components/admin/questions/EmptyState';
import LoadingState from '@/components/admin/questions/LoadingState';
import PaginationComponent from '@/components/admin/questions/PaginationComponent';
import LibrariesPanel from '@/components/admin/questions/LibrariesPanel';

// API functions
import { 
  fetchQuestions, 
  archiveQuestion, 
  restoreQuestion, 
  cloneQuestion, 
  deleteQuestion,
  fetchQuestionsWithTags,
  searchQuestions
} from '@/lib/api/question';
import { fetchThemes } from '@/lib/api/theme';
import { fetchSubThemes } from '@/lib/api/subtheme';
import { 
  fetchQuestionLibraries, 
  addQuestionsToLibrary, 
  createQuestionLibrary,
  deleteQuestionLibrary,
  fetchQuestionLibrary
} from '@/lib/api/questionLibrary';

// NEW: Import taxonomy API functions for tag filtering
import { fetchSDGs } from '@/lib/api/sdg';
import { fetchStandards } from '@/lib/api/standard';
import { fetchESGCategories } from '@/lib/api/esgCategory';
import { fetchResilienceDimensions } from '@/lib/api/resilienceDimension';
import { fetchIndicators } from '@/lib/api/indicator';

// Types
import { Question, QuestionLibrary } from '@/types';
import {Theme, SubTheme, Indicator, SDG, Standard, ESGCategory, ResilienceDimension } from '@/types/taxonomy';

// UPDATED: FilterState interface to include selective tags
interface UpdatedFilterState {
  status: string;
  type: string;
  theme: string;
  subTheme: string;
  targetAudience: string;
  isTemplate: string;
  theoryOfChangeStage: string;
  selectedIndicatorTags: string;
  selectedSdgTags: string;
  selectedResilienceTags: string;
  selectedEsgTags: string;
  selectedStandardTags: string;
}

// Create a separate component that uses search params
function QuestionsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [subThemes, setSubThemes] = useState<SubTheme[]>([]);
  const [libraries, setLibraries] = useState<QuestionLibrary[]>([]);
  
  // NEW: Tag options for filtering
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [esgCategories, setEsgCategories] = useState<ESGCategory[]>([]);
  const [resilienceDimensions, setResilienceDimensions] = useState<ResilienceDimension[]>([]);
  
  const [activeTab, setActiveTab] = useState('questions');
  const [activeLibraryId, setActiveLibraryId] = useState<string | null>(null);
  const [activeLibrary, setActiveLibrary] = useState<QuestionLibrary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [showAddToLibrary, setShowAddToLibrary] = useState<boolean>(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // UPDATED: Filters with new selective tag fields
  const [filters, setFilters] = useState<UpdatedFilterState>({
    status: 'all',
    type: 'all',
    theme: 'all',
    subTheme: 'all',
    targetAudience: 'all',
    isTemplate: 'all',
    theoryOfChangeStage: 'all',
    selectedIndicatorTags: 'all',
    selectedSdgTags: 'all',
    selectedResilienceTags: 'all',
    selectedEsgTags: 'all',
    selectedStandardTags: 'all'
  });
  
  // Effect to load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Initialize search params with new tag filters
        const initialPage = parseInt(searchParams.get('page') || '1');
        const initialSearch = searchParams.get('search') || '';
        const initialStatus = searchParams.get('status') || 'all';
        const initialType = searchParams.get('type') || 'all';
        const initialTheme = searchParams.get('theme') || 'all';
        const initialSubTheme = searchParams.get('subTheme') || 'all';
        const initialTargetAudience = searchParams.get('targetAudience') || 'all';
        const initialIsTemplate = searchParams.get('isTemplate') || 'all';
        const initialTheoryOfChangeStage = searchParams.get('theoryOfChangeStage') || 'all';
        
        // NEW: Initialize tag filters from URL
        const initialSelectedIndicatorTags = searchParams.get('selectedIndicatorTags') || 'all';
        const initialSelectedSdgTags = searchParams.get('selectedSdgTags') || 'all';
        const initialSelectedResilienceTags = searchParams.get('selectedResilienceTags') || 'all';
        const initialSelectedEsgTags = searchParams.get('selectedEsgTags') || 'all';
        const initialSelectedStandardTags = searchParams.get('selectedStandardTags') || 'all';
        
        // Check if a library is being viewed
        const libraryId = searchParams.get('library');
        if (libraryId) {
          setActiveLibraryId(libraryId);
          setActiveTab('libraries');
        }
        
        setPage(initialPage);
        setSearchTerm(initialSearch);
        setFilters({
          status: initialStatus,
          type: initialType,
          theme: initialTheme,
          subTheme: initialSubTheme,
          targetAudience: initialTargetAudience,
          isTemplate: initialIsTemplate,
          theoryOfChangeStage: initialTheoryOfChangeStage,
          selectedIndicatorTags: initialSelectedIndicatorTags,
          selectedSdgTags: initialSelectedSdgTags,
          selectedResilienceTags: initialSelectedResilienceTags,
          selectedEsgTags: initialSelectedEsgTags,
          selectedStandardTags: initialSelectedStandardTags
        });
        
        // Prepare fetch parameters with new tag filters
        const fetchParams = {
          page: initialPage,
          limit,
          populate: 'selectedTags,theme,subTheme,category,creator',
          search: initialSearch || undefined,
          status: initialStatus !== 'all' ? initialStatus : undefined,
          type: initialType !== 'all' ? initialType : undefined,
          theme: initialTheme !== 'all' ? initialTheme : undefined,
          subTheme: initialSubTheme !== 'all' ? initialSubTheme : undefined,
          targetAudience: initialTargetAudience !== 'all' ? initialTargetAudience : undefined,
          isTemplate: initialIsTemplate !== 'all' ? initialIsTemplate : undefined,
          theoryOfChangeStage: initialTheoryOfChangeStage !== 'all' ? initialTheoryOfChangeStage : undefined,
          selectedIndicatorTags: initialSelectedIndicatorTags !== 'all' ? initialSelectedIndicatorTags : undefined,
          selectedSdgTags: initialSelectedSdgTags !== 'all' ? initialSelectedSdgTags : undefined,
          selectedResilienceTags: initialSelectedResilienceTags !== 'all' ? initialSelectedResilienceTags : undefined,
          selectedEsgTags: initialSelectedEsgTags !== 'all' ? initialSelectedEsgTags : undefined,
          selectedStandardTags: initialSelectedStandardTags !== 'all' ? initialSelectedStandardTags : undefined
        };
        
        // Fetch resources including new taxonomy data
        const [
          questionsResponse, 
          themesResponse, 
          subThemesResponse, 
          librariesResponse,
          indicatorsResponse,
          sdgsResponse,
          standardsResponse,
          esgResponse,
          resilienceResponse
        ] = await Promise.all([
          initialSearch ? searchQuestions(initialSearch, fetchParams) : fetchQuestionsWithTags(fetchParams),
          fetchThemes({ limit: 1000 }),
          fetchSubThemes({ limit: 1000 }),
          fetchQuestionLibraries(),
          fetchIndicators({ limit: 1000 }),
          fetchSDGs({ limit: 1000 }),
          fetchStandards({ limit: 1000 }),
          fetchESGCategories({ limit: 1000 }),
          fetchResilienceDimensions({ limit: 1000 })
        ]);
        
        setQuestions(questionsResponse.data);
        setTotal(questionsResponse.total);
        setThemes(themesResponse.data);
        setSubThemes(subThemesResponse.data);
        setLibraries(librariesResponse.data);
        setIndicators(indicatorsResponse.data);
        setSdgs(sdgsResponse.data);
        setStandards(standardsResponse.data);
        setEsgCategories(esgResponse.data);
        setResilienceDimensions(resilienceResponse.data);
        
        // Load the active library if one is selected
        if (libraryId) {
          await fetchLibraryData(libraryId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch questions. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams, limit, toast]);
  
  // Function to fetch library data
  const fetchLibraryData = async (libraryId: string) => {
    setLibraryLoading(true);
    try {
      const response = await fetchQuestionLibrary(libraryId);
      setActiveLibrary(response.data);
    } catch (error) {
      console.error('Error fetching library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch library details. Please try again.",
      });
    } finally {
      setLibraryLoading(false);
    }
  };
  
  // UPDATED: Function to update URL with current filters including new tag filters
  const updateURLParams = (params: { [key: string]: string | number | undefined | null }) => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        urlParams.set(key, String(value));
      }
    });
    
    router.push(`/admin/questions?${urlParams.toString()}`);
  };
  
  // UPDATED: Function to handle search with new tag support
  const handleSearch = async () => {
    setPage(1);
    setLoading(true);
    
    try {
      const searchParams = {
        page: 1,
        limit,
        populate: 'selectedTags,theme,subTheme,creator',
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        theme: filters.theme !== 'all' ? filters.theme : undefined,
        subTheme: filters.subTheme !== 'all' ? filters.subTheme : undefined,
        targetAudience: filters.targetAudience !== 'all' ? filters.targetAudience : undefined,
        isTemplate: filters.isTemplate !== 'all' ? filters.isTemplate : undefined,
        theoryOfChangeStage: filters.theoryOfChangeStage !== 'all' ? filters.theoryOfChangeStage : undefined,
        selectedIndicatorTags: filters.selectedIndicatorTags !== 'all' ? filters.selectedIndicatorTags : undefined,
        selectedSdgTags: filters.selectedSdgTags !== 'all' ? filters.selectedSdgTags : undefined,
        selectedResilienceTags: filters.selectedResilienceTags !== 'all' ? filters.selectedResilienceTags : undefined,
        selectedEsgTags: filters.selectedEsgTags !== 'all' ? filters.selectedEsgTags : undefined,
        selectedStandardTags: filters.selectedStandardTags !== 'all' ? filters.selectedStandardTags : undefined
      };
      
      const response = searchTerm 
        ? await searchQuestions(searchTerm, searchParams)
        : await fetchQuestionsWithTags(searchParams);
      
      setQuestions(response.data);
      setTotal(response.total);
      
      updateURLParams({
        page: 1,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, value !== 'all' ? value : null])
        ),
        library: activeLibraryId
      });
      
    } catch (error) {
      console.error('Error searching questions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search questions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // UPDATED: Function to handle filter changes with new tag support
  const handleFilterChange = async (key: string, value: any) => {
    let newFilters = { ...filters };
    
    if (key === 'reset') {
      newFilters = {
        status: 'all',
        type: 'all',
        theme: 'all',
        subTheme: 'all',
        targetAudience: 'all',
        isTemplate: 'all',
        theoryOfChangeStage: 'all',
        selectedIndicatorTags: 'all',
        selectedSdgTags: 'all',
        selectedResilienceTags: 'all',
        selectedEsgTags: 'all',
        selectedStandardTags: 'all'
      };
      setPage(1);
    } else if (key === 'theme' && value !== filters.theme) {
      newFilters = {
        ...filters,
        [key]: value,
        subTheme: 'all'
      };
      setPage(1);
    } else {
      newFilters = {
        ...filters,
        [key]: value
      };
      setPage(1);
    }
    
    setFilters(newFilters);
    
    setLoading(true);
    try {
      const fetchParams = {
        page: 1,
        limit,
        populate: 'selectedTags,theme,subTheme,category,creator',
        search: searchTerm || undefined,
        status: newFilters.status !== 'all' ? newFilters.status : undefined,
        type: newFilters.type !== 'all' ? newFilters.type : undefined,
        theme: newFilters.theme !== 'all' ? newFilters.theme : undefined,
        subTheme: newFilters.subTheme !== 'all' ? newFilters.subTheme : undefined,
        targetAudience: newFilters.targetAudience !== 'all' ? newFilters.targetAudience : undefined,
        isTemplate: newFilters.isTemplate !== 'all' ? newFilters.isTemplate : undefined,
        theoryOfChangeStage: newFilters.theoryOfChangeStage !== 'all' ? newFilters.theoryOfChangeStage : undefined,
        selectedIndicatorTags: newFilters.selectedIndicatorTags !== 'all' ? newFilters.selectedIndicatorTags : undefined,
        selectedSdgTags: newFilters.selectedSdgTags !== 'all' ? newFilters.selectedSdgTags : undefined,
        selectedResilienceTags: newFilters.selectedResilienceTags !== 'all' ? newFilters.selectedResilienceTags : undefined,
        selectedEsgTags: newFilters.selectedEsgTags !== 'all' ? newFilters.selectedEsgTags : undefined,
        selectedStandardTags: newFilters.selectedStandardTags !== 'all' ? newFilters.selectedStandardTags : undefined
      };
      
      const response = searchTerm 
        ? await searchQuestions(searchTerm, fetchParams)
        : await fetchQuestionsWithTags(fetchParams);
      
      setQuestions(response.data);
      setTotal(response.total);
      
      updateURLParams({
        page: 1,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(newFilters).map(([filterKey, filterValue]) => [filterKey, filterValue !== 'all' ? filterValue : null])
        ),
        library: activeLibraryId
      });
      
    } catch (error) {
      console.error('Error applying filters:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply filters. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams({
      page: newPage,
      search: searchTerm,
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, value !== 'all' ? value : null])
      ),
      library: activeLibraryId
    });
  };
  
  // Function to handle library selection
  const handleLibraryClick = async (libraryId: string) => {
    if (activeLibraryId === libraryId) {
      setActiveLibraryId(null);
      setActiveLibrary(null);
      updateURLParams({
        library: null,
        page: page,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, value !== 'all' ? value : null])
        )
      });
      return;
    }
    
    setActiveLibraryId(libraryId);
    await fetchLibraryData(libraryId);
    
    updateURLParams({
      library: libraryId,
      page: 1,
      search: searchTerm
    });
  };
  
  // Function to create a new library
  const handleCreateLibrary = async (name: string, description: string) => {
    try {
      const response = await createQuestionLibrary({ name, description });
      setLibraries([response.data, ...libraries]);
      
      toast({
        title: "Success",
        description: "Library created successfully.",
      });
    } catch (error) {
      console.error('Error creating library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create library. Please try again.",
      });
      throw error;
    }
  };
  
  // Function to delete a library
  const handleDeleteLibrary = async (id: string) => {
    try {
      await deleteQuestionLibrary(id);
      setLibraries(libraries.filter(lib => lib._id !== id));
      
      if (activeLibraryId === id) {
        setActiveLibraryId(null);
        setActiveLibrary(null);
      }
      
      toast({
        title: "Success",
        description: "Library deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete library. Please try again.",
      });
    }
  };
  
  // Function to handle question actions
  const handleArchive = async (id: string) => {
    try {
      await archiveQuestion(id);
      setQuestions(questions.map(q => 
        q._id === id ? { ...q, status: 'archived' as const } : q
      ));
      
      toast({
        title: "Success",
        description: "Question archived successfully.",
      });
    } catch (error) {
      console.error('Error archiving question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive question. Please try again.",
      });
    }
  };
  
  const handleRestore = async (id: string) => {
    try {
      await restoreQuestion(id);
      setQuestions(questions.map(q => 
        q._id === id ? { ...q, status: 'draft' as const } : q
      ));
      
      toast({
        title: "Success",
        description: "Question restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore question. Please try again.",
      });
    }
  };
  
  const handleClone = async (id: string) => {
    try {
      const response = await cloneQuestion(id);
      setQuestions([response.data, ...questions]);
      
      toast({
        title: "Success",
        description: "Question cloned successfully.",
      });
    } catch (error) {
      console.error('Error cloning question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clone question. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
      
      toast({
        title: "Success",
        description: "Question deleted permanently.",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete question. Please try again.",
      });
    }
  };
  
  const handleAddToLibrary = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setShowAddToLibrary(true);
  };
  
  const handleAddQuestionToLibrary = async (libraryId: string, questionId: string) => {
    try {
      await addQuestionsToLibrary(libraryId, [questionId]);
      
      toast({
        title: "Success",
        description: "Question added to library successfully.",
      });
      
      if (activeLibraryId === libraryId) {
        await fetchLibraryData(libraryId);
      }
      
    } catch (error) {
      console.error('Error adding question to library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add question to library. Please try again.",
      });
    }
  };
  
  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = searchTerm !== '' || Object.entries(filters).some(([key, value]) => value !== 'all');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'questions' && activeLibraryId) {
      setActiveLibraryId(null);
      setActiveLibrary(null);
      
      updateURLParams({
        library: null,
        page: page,
        search: searchTerm,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, value !== 'all' ? value : null])
        )
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-gradient-to-br from-sky-50 via-white to-concrete-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stratosphere mb-1">Question Bank</h1>
          <p className="text-sm text-sky-500">Manage and organize your question library</p>
        </div>
        
        <Button asChild className="bg-stratosphere hover:bg-stratosphere-900 text-white shadow-md transition-all hover:shadow-lg">
          <Link href="/admin/questions/builder">
            <Plus className="mr-2 h-4 w-4" /> Create Question
          </Link>
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border border-stratosphere-100 p-1">
          <TabsTrigger 
            value="questions" 
            className="data-[state=active]:bg-stratosphere data-[state=active]:text-white text-stratosphere"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger 
            value="libraries"
            className="data-[state=active]:bg-stratosphere data-[state=active]:text-white text-stratosphere"
          >
            Libraries
          </TabsTrigger>
        </TabsList>
        
        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
              <Card className="sticky top-6 shadow-md bg-white border-stratosphere-100">
                <CardContent className="pt-6">
                  <FilterPanel 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    themes={themes}
                    subThemes={subThemes}
                    libraries={libraries}
                    indicators={indicators}
                    sdgs={sdgs}
                    standards={standards}
                    esgCategories={esgCategories}
                    resilienceDimensions={resilienceDimensions}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleSearch={handleSearch}
                />
                
                {/* Mobile Filter Button */}
                <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="lg:hidden border-stratosphere text-stratosphere hover:bg-sky-50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-white overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-stratosphere">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <FilterPanel 
                        filters={filters}
                        onFilterChange={(key, value) => {
                          handleFilterChange(key, value);
                          if (key === 'reset') {
                            setFilterPanelOpen(false);
                          }
                        }}
                        themes={themes}
                        subThemes={subThemes}
                        libraries={libraries}
                        indicators={indicators}
                        sdgs={sdgs}
                        standards={standards}
                        esgCategories={esgCategories}
                        resilienceDimensions={resilienceDimensions}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Active Filters */}
              <ActiveFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                themes={themes}
                subThemes={subThemes}
                indicators={indicators}
                sdgs={sdgs}
                standards={standards}
                esgCategories={esgCategories}
                resilienceDimensions={resilienceDimensions}
              />
              
              {/* Question List */}
              {loading ? (
                <LoadingState />
              ) : questions.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-sm text-sky-500 font-medium">
                      Showing <span className="text-stratosphere font-semibold">{questions.length}</span> of <span className="text-stratosphere font-semibold">{total}</span> questions
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-sky-500">
                        Page <span className="text-stratosphere font-semibold">{page}</span> of <span className="text-stratosphere font-semibold">{totalPages}</span>
                      </p>
                    )}
                  </div>
                  
                  {questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onClone={handleClone}
                      onDelete={handleDelete}
                      onAddToLibrary={handleAddToLibrary}
                    />
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <PaginationComponent 
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Libraries Tab */}
        <TabsContent value="libraries" className="space-y-6">
          <LibrariesPanel 
            libraries={libraries}
            activeLibraryId={activeLibraryId}
            onLibraryClick={handleLibraryClick}
            onLibraryCreate={handleCreateLibrary}
            onLibraryDelete={handleDeleteLibrary}
          />
          
          {/* Library Content */}
          <div>
            {activeLibraryId && activeLibrary ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-stratosphere to-stratosphere-900 text-white shadow-lg border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{activeLibrary.name}</h2>
                        {activeLibrary.description && (
                          <p className="text-sky-100">{activeLibrary.description}</p>
                        )}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold">{activeLibrary.questions?.length || 0}</p>
                        <p className="text-xs text-sky-100">Questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {libraryLoading ? (
                  <LoadingState />
                ) : activeLibrary.questions && activeLibrary.questions.length > 0 ? (
                  <div className="space-y-4">
                    {activeLibrary.questions.map((question) => (
                      <QuestionCard
                        key={question._id}
                        question={question}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onClone={handleClone}
                        onDelete={handleDelete}
                        onAddToLibrary={handleAddToLibrary}
                        inLibrary={true}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-16 bg-white border-2 border-dashed border-stratosphere-200">
                    <CardContent>
                      <Library className="h-16 w-16 text-sky-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-stratosphere mb-2">No questions yet</h3>
                      <p className="text-sky-500 mb-4">
                        This library doesn't have any questions. Add questions from the question bank.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('questions')}
                        className="bg-stratosphere hover:bg-stratosphere-900 text-white"
                      >
                        Browse Questions
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-16 bg-gradient-to-br from-sky-50 to-white border-2 border-dashed border-sky-200">
                <CardContent>
                  <Library className="h-16 w-16 text-stratosphere-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stratosphere mb-2">Select a library</h3>
                  <p className="text-sky-500 mb-4">
                    Choose a library from above or create a new one to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add to Library Modal */}
      <AddToLibraryModal
        isOpen={showAddToLibrary}
        onClose={() => {
          setShowAddToLibrary(false);
          setSelectedQuestionId(null);
        }}
        onAdd={handleAddQuestionToLibrary}
        libraries={libraries}
        selectedQuestionId={selectedQuestionId}
      />
    </div>
  );
}

// Wrapper component for fallback UI
function QuestionsPageFallback() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-gradient-to-br from-sky-50 via-white to-concrete-50">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-stratosphere-100 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-sky-100 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-stratosphere-100 rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-white border border-stratosphere-100 rounded animate-pulse"></div>
        <div className="h-64 bg-white border border-stratosphere-100 rounded animate-pulse"></div>
        <div className="h-64 bg-white border border-stratosphere-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Main component with Suspense
const QuestionsPage = () => {
  return (
    <Suspense fallback={<QuestionsPageFallback />}>
      <QuestionsContent />
    </Suspense>
  );
};

export default QuestionsPage;