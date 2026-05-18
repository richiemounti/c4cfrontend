// components/admin/questions/LibraryCard.tsx
import { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown, Trash2, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuestionLibrary } from '@/types';
import Link from 'next/link';

interface LibraryCardProps {
  library: QuestionLibrary;
  onDelete: (id: string) => Promise<void>;
  onClick: () => void;
  isActive: boolean;
}

const LibraryCard = ({
  library,
  onDelete,
  onClick,
  isActive
}: LibraryCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Add type guard to ensure _id is defined before calling onDelete
  const handleDelete = async () => {
    if (library._id) {
      await onDelete(library._id);
      setDeleteDialogOpen(false);
    } else {
      console.error("Cannot delete library: Missing library ID");
      setDeleteDialogOpen(false);
    }
  };

  const questionCount = library.questions?.length || 0;

  return (
    <div 
      className={cn(
        "border border-stratosphere rounded-md p-3 cursor-pointer transition-colors hover:bg-sky/30",
        isActive && "border-primary bg-accent/40"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start flex-1 min-w-0 overflow-hidden">
          <BookOpen className="h-4 w-4 mr-2 text-stratosphere mt-0.5 flex-shrink-0" />
          <div className="flex flex-col min-w-0 w-full overflow-hidden">
            <h3 className="text-sm font-medium break-words text-stratosphere">{library.name}</h3>
            {library.description && (
              <p className="text-xs text-muted-foreground break-words line-clamp-2 text-sky">
                {library.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Badge variant="outline" className="whitespace-nowrap border-stratosphere text-stratosphere">{questionCount}</Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} className='border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere hover:bg-sky-500'>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <span className="sr-only">Open menu</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-stratosphere text-stratosphere">
              {library._id && (
                <DropdownMenuItem asChild>
                  <Link 
                    href={`/admin/libraries/${library._id}`}
                    className="flex items-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the library "{library.name}". The questions in this library will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
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

export default LibraryCard;