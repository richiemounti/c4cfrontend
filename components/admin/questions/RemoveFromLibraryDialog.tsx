// components/admin/questions/RemoveFromLibraryDialog.tsx
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
  
  interface RemoveFromLibraryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    questionTitle: string;
    libraryName: string;
  }
  
  const RemoveFromLibraryDialog = ({
    isOpen,
    onOpenChange,
    onConfirm,
    questionTitle,
    libraryName
  }: RemoveFromLibraryDialogProps) => {
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Library?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the question "{questionTitle}" from the library "{libraryName}". 
              The question itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
export default RemoveFromLibraryDialog;