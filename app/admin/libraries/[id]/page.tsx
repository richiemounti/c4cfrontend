// app/admin/libraries/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Custom components
import QuestionCard from '@/components/admin/questions/QuestionCard';
import EditLibraryModal from '@/components/admin/questions/EditLibraryModal';
import SearchBar from '@/components/admin/questions/SearchBar';
import LoadingState from '@/components/admin/questions/LoadingState';
import EmptyState from '@/components/admin/questions/EmptyState';

// API functions
import { 
  fetchQuestionLibrary, 
  deleteQuestionLibrary, 
  updateQuestionLibrary,
  removeQuestionsFromLibrary
} from '@/lib/api/questionLibrary';
import { 
  archiveQuestion, 
  restoreQuestion,
  cloneQuestion, 
  deleteQuestion 
} from '@/lib/api/question';

// Types
import { Question, QuestionLibrary } from '@/types';

const LibraryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const libraryId = params.id as string;
  
  // State
  const [library, setLibrary] = useState<QuestionLibrary | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch library data
  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const data = await fetchQuestionLibrary(libraryId);
        setLibrary(data.data);
        
        // Extract and set questions if they're populated
        if (data.data.questions && Array.isArray(data.data.questions)) {
          setQuestions(data.data.questions as Question[]);
          setFilteredQuestions(data.data.questions as Question[]);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch library details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (libraryId) {
      fetchLibrary();
    }
  }, [libraryId, toast]);
  
  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(question => 
        question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.description && question.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions]);
  
  // Handle library deletion
  const handleDeleteLibrary = async () => {
    try {
      await deleteQuestionLibrary(libraryId);
      
      toast({
        title: "Success",
        description: "Library deleted successfully.",
      });
      
      // Navigate back to questions page
      router.push('/admin/questions');
    } catch (error) {
      console.error('Error deleting library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete library. Please try again.",
      });
    }
  };
  
  // Handle library update
  const handleUpdateLibrary = async (name: string, description: string) => {
    try {
      const response = await updateQuestionLibrary(libraryId, { name, description });
      
      setLibrary(response.data);
      
      toast({
        title: "Success",
        description: "Library updated successfully.",
      });
    } catch (error) {
      console.error('Error updating library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update library. Please try again.",
      });
      throw error;
    }
  };
  
  // Handle question actions
  const handleArchive = async (id: string) => {
    try {
      await archiveQuestion(id);
      
      // Update the local state
      setQuestions(questions.map(q => 
        q._id === id ? { ...q, status: 'archived' } : q
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
      
      // Update the local state
      setQuestions(questions.map(q => 
        q._id === id ? { ...q, status: 'draft' } : q
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
      
      // Add the new clone to local state
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
      
      // Remove the question from local state
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
  
  const handleRemoveFromLibrary = async (id: string) => {
    try {
      await removeQuestionsFromLibrary(libraryId, [id]);
      
      // Remove the question from local state
      setQuestions(questions.filter(q => q._id !== id));
      
      toast({
        title: "Success",
        description: "Question removed from library successfully.",
      });
    } catch (error) {
      console.error('Error removing question from library:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove question from library. Please try again.",
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <Button variant="outline" size="sm" className="mb-4 sm:mb-0" asChild>
            <Link href="/admin/questions">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
            </Link>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditModalOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Library
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Library
            </Button>
          </div>
        </div>
        
        {loading ? (
          <LoadingState />
        ) : library ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{library.name}</CardTitle>
                    <CardDescription className="mt-2">{library.description || 'No description provided'}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {library.questions?.length || 0} questions
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold mb-4 sm:mb-0">Library Questions</h2>
                <Button asChild>
                  <Link href={`/admin/questions?addToLibrary=${libraryId}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Questions
                  </Link>
                </Button>
              </div>
              
              <div className="mb-6">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleSearch={() => {}}
                //   placeholder="Search questions in this library..."
                />
              </div>
              
              {filteredQuestions.length === 0 ? (
                <EmptyState 
                  hasFilters={searchTerm !== ''}
                //   message={searchTerm !== '' ? 
                //     "No questions matching your search" : 
                //     "This library has no questions yet"
                //   }
                />
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onClone={handleClone}
                      onDelete={handleDelete}
                      onRemoveFromLibrary={handleRemoveFromLibrary}
                      showRemoveFromLibrary
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Library not found or has been deleted.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Edit Library Modal */}
      {library && (
        <EditLibraryModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateLibrary}
          library={library}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the library "{library?.name}". The questions in this library will not be deleted, but they will be removed from this library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLibrary}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LibraryDetailPage;