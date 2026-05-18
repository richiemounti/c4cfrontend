// components/admin/questions/AddToLibraryModal.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { QuestionLibrary } from '@/types';

interface AddToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (libraryId: string, questionId: string) => void;
  libraries: QuestionLibrary[];
  selectedQuestionId: string | null;
}

const AddToLibraryModal = ({
  isOpen,
  onClose,
  onAdd,
  libraries,
  selectedQuestionId
}: AddToLibraryModalProps) => {
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add to Library</SheetTitle>
          <SheetDescription>
            Select a library to add this question to
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Select
            value={selectedLibrary || undefined}
            onValueChange={setSelectedLibrary}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a library" />
            </SelectTrigger>
            <SelectContent>
              {libraries.map(library => (
                <SelectItem key={library._id} value={library._id!}>
                  {library.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedLibrary && selectedQuestionId) {
                  onAdd(selectedLibrary, selectedQuestionId);
                  onClose();
                  setSelectedLibrary(''); // Reset the selection
                }
              }}
              disabled={!selectedLibrary || !selectedQuestionId}
            >
              Add to Library
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddToLibraryModal;