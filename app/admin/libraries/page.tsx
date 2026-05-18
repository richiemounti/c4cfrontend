// app/admin/libraries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowRight, Search, BookOpen } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Custom components
import CreateLibraryModal from '@/components/admin/questions/CreateLibraryModal';
import LoadingState from '@/components/admin/questions/LoadingState';
import EmptyState from '@/components/admin/questions/EmptyState';

// API functions
import { 
  fetchQuestionLibraries,
  fetchQuestionLibrary,
  createQuestionLibrary,
  deleteQuestionLibrary
} from '@/lib/api/questionLibrary';

// Types
import { QuestionLibrary } from '@/types';

const LibraryListPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  
  // State
  const [libraries, setLibraries] = useState<QuestionLibrary[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<QuestionLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteLibraryId, setDeleteLibraryId] = useState<string | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<QuestionLibrary | null>(null);
  const [selectedLibraryLoading, setSelectedLibraryLoading] = useState(false);
  
  // Fetch libraries
  useEffect(() => {
    const fetchLibraries = async () => {
      setLoading(true);
      try {
        const response = await fetchQuestionLibraries();
        setLibraries(response.data);
        setFilteredLibraries(response.data);
        
        // Select the first library by default if available
        if (response.data.length > 0) {
          handleSelectLibrary(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching libraries:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch libraries. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLibraries();
  }, [toast]);
  
  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLibraries(libraries);
    } else {
      const filtered = libraries.filter(library => 
        library.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (library.description && library.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLibraries(filtered);
    }
  }, [searchTerm, libraries]);
  
  // Handle library creation
  const handleCreateLibrary = async (name: string, description: string) => {
    try {
      const response = await createQuestionLibrary({ name, description });
      
      // Add the new library to state
      const newLibraries = [response.data, ...libraries];
      setLibraries(newLibraries);
      
      // Select the newly created library
      handleSelectLibrary(response.data._id);
      
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
  
  // Handle library deletion
  const handleDeleteLibrary = async () => {
    if (!deleteLibraryId) return;
    
    try {
      await deleteQuestionLibrary(deleteLibraryId);
      
      // Remove the library from state
      const updatedLibraries = libraries.filter(lib => lib._id !== deleteLibraryId);
      setLibraries(updatedLibraries);
      
      // If the deleted library was selected, select another one
      if (selectedLibrary && selectedLibrary._id === deleteLibraryId) {
        setSelectedLibrary(null);
        if (updatedLibraries.length > 0) {
          handleSelectLibrary(updatedLibraries[0]._id);
        }
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
    } finally {
      setDeleteLibraryId(null);
    }
  };

  // Handle library selection
  const handleSelectLibrary = async (id: string) => {
    setSelectedLibraryLoading(true);
    try {
      const response = await fetchQuestionLibrary(id);
      setSelectedLibrary(response.data);
    } catch (error) {
      console.error('Error fetching library details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch library details. Please try again.",
      });
    } finally {
      setSelectedLibraryLoading(false);
    }
  };

  // Handle view all questions in a library
  const handleViewLibraryDetails = () => {
    if (selectedLibrary) {
      router.push(`/admin/libraries/${selectedLibrary._id}`);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Question Libraries</h1>
        
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Library
        </Button>
      </div>
      
      {/* Library Selection Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Select a Library</h2>
        
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search libraries..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <LoadingState />
        ) : filteredLibraries.length === 0 ? (
          <EmptyState 
            hasFilters={searchTerm !== ''}
            // message={searchTerm !== '' ? "No libraries matching your search" : "No libraries found. Create your first library."}
          />
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Library Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Questions</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLibraries.map((library) => (
                  <TableRow 
                    key={library._id}
                    className={selectedLibrary?._id === library._id ? "bg-muted" : "cursor-pointer hover:bg-muted/50"}
                    onClick={() => handleSelectLibrary(library._id)}
                  >
                    <TableCell className="font-medium">{library.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {library.description ? (
                        <span className="line-clamp-1">{library.description}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {library.questions?.length || 0}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={library.status === 'published' ? 'default' : 'secondary'}>
                        {library.status || 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteLibraryId(library._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Library Detail Section */}
      {selectedLibrary ? (
        <div className="mt-6">
          {selectedLibraryLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedLibrary.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedLibrary.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedLibrary.questions?.length || 0} questions
                    </Badge>
                    <Badge variant={selectedLibrary.status === 'published' ? 'default' : 'secondary'}>
                      {selectedLibrary.status || 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(selectedLibrary.createdAt).toLocaleDateString()}
                  </p>
                  {selectedLibrary.updatedAt && (
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(selectedLibrary.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {selectedLibrary.questions && selectedLibrary.questions.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Questions in this library:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedLibrary.questions.slice(0, 5).map((question: any) => (
                        <li key={question._id} className="text-muted-foreground">
                          {question.text || 'Unnamed question'}
                        </li>
                      ))}
                      {selectedLibrary.questions.length > 5 && (
                        <li className="text-muted-foreground">
                          <em>And {selectedLibrary.questions.length - 5} more questions...</em>
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-6 py-4 text-center text-muted-foreground border rounded-md bg-muted/50">
                    <BookOpen className="mx-auto h-8 w-8 mb-2 text-muted-foreground/70" />
                    <p>This library doesn't have any questions yet.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleViewLibraryDetails} className="w-full sm:w-auto">
                  View All Questions <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : !loading && (
        <div className="mt-6 p-8 text-center text-muted-foreground border rounded-md">
          <BookOpen className="mx-auto h-12 w-12 mb-2 text-muted-foreground/70" />
          <p className="text-lg">Select a library to view its details</p>
        </div>
      )}
      
      {/* Create Library Modal */}
      <CreateLibraryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateLibrary}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLibraryId} onOpenChange={() => setDeleteLibraryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the library and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLibrary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LibraryListPage;