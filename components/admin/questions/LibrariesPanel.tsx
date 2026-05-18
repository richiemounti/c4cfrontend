// components/admin/questions/LibrariesPanel.tsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import LibraryCard from './LibraryCard';
import CreateLibraryModal from './CreateLibraryModal';
import { QuestionLibrary } from '@/types';

interface LibrariesPanelProps {
  libraries: QuestionLibrary[];
  onLibraryCreate: (name: string, description: string) => Promise<void>;
  onLibraryDelete: (id: string) => Promise<void>;
  onLibraryClick: (id: string) => void;
  activeLibraryId?: string | null;
}

const LibrariesPanel = ({
  libraries,
  onLibraryCreate,
  onLibraryDelete,
  onLibraryClick,
  activeLibraryId
}: LibrariesPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <Card className="mb-6 shadow-sm bg-white border border-stratosphere">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CardHeader className="pb-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center flex-1 overflow-hidden text-stratosphere">
              <CollapsibleTrigger className="flex items-center text-left w-full text-stratosphere">
                {isOpen ? <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />}
                <span className="truncate">Question Libraries</span>
                <Badge variant="outline" className="ml-2 flex-shrink-0 border-stratosphere text-stratosphere">
                  {libraries.length}
                </Badge>
              </CollapsibleTrigger>
            </CardTitle>
            <Button size="sm" variant="ghost" className="ml-2 flex-shrink-0" onClick={(e) => {
              e.stopPropagation();
              setCreateModalOpen(true);
            }}>
              <Plus className="h-4 w-4 text-stratosphere" />
            </Button>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            {libraries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 text-stratosphere">
                No libraries found. Create your first library.
              </p>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3 pr-2">
                  {libraries.map(library => (
                    // Only render library cards for libraries with a valid _id
                    library._id && (
                      <LibraryCard
                        key={library._id}
                        library={library}
                        onDelete={onLibraryDelete}
                        onClick={() => onLibraryClick(library._id)}
                        isActive={activeLibraryId === library._id}
                      />
                    )
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <CreateLibraryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={onLibraryCreate}
      />
    </Card>
  );
};

export default LibrariesPanel;