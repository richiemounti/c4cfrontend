// components/survey/SectionCard.tsx - Updated with Real APIs
'use client';

import { useState } from 'react';
import {
  GripVertical,
  MoreVertical,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import type { SectionCardProps } from '@/types/survey-edit';

export const SectionCard = ({
  section,
  isExpanded,
  onToggleExpanded,
  onUpdateTitle,
  onUpdateDescription,
  onDelete,
  onDropQuestion,
  onDropSection,
  children
}: SectionCardProps) => {
  const { toast } = useToast();
  const [localTitle, setLocalTitle] = useState(section.title);
  const [localDescription, setLocalDescription] = useState(section.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [dropIndicatorPos, setDropIndicatorPos] = useState<'top' | 'bottom' | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'section',
      sectionId: section._id
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    // Determine insert position (top/bottom third of card)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    setDropIndicatorPos(y < rect.height / 3 ? 'top' : 'bottom');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropIndicatorPos(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropIndicatorPos(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.type === 'question' && data.questionId) {
        setIsDropping(true);
        try {
          await onDropQuestion(data.questionId);
          toast({ title: 'Question moved', description: 'Question has been moved to this section' });
        } finally {
          setIsDropping(false);
        }
      } else if (data.type === 'section' && data.sectionId && data.sectionId !== section._id) {
        setIsDropping(true);
        try {
          await onDropSection?.(data.sectionId);
        } finally {
          setIsDropping(false);
        }
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
      setIsDropping(false);
      toast({
        title: 'Error',
        description: 'Failed to move item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (newTitle === section.title) return;
    
    setIsUpdating(true);
    try {
      await onUpdateTitle(newTitle);
      toast({
        title: 'Section updated',
        description: 'Section title has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to update section title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section title',
        variant: 'destructive',
      });
      // Revert local title on error
      setLocalTitle(section.title);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDescription = async (newDescription: string) => {
    if (!onUpdateDescription) return;
    if (newDescription === (section.description || '')) return;

    setIsUpdatingDescription(true);
    try {
      await onUpdateDescription(newDescription);
    } catch (error) {
      console.error('Failed to update section description:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section description',
        variant: 'destructive',
      });
      setLocalDescription(section.description || '');
    } finally {
      setIsUpdatingDescription(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      // This should be handled by parent component
      console.log('Duplicate section:', section._id);
      toast({
        title: 'Coming soon',
        description: 'Section duplication will be available soon',
      });
    } catch (error) {
      console.error('Failed to duplicate section:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate section',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      toast({
        title: 'Section deleted',
        description: 'Section has been removed from your survey',
      });
    } catch (error) {
      console.error('Failed to delete section:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };


  return (
    <Card
      className={`relative border transition-all duration-300 bg-white ${
        isDragOver
          ? 'border-c4c-cobalt ring-2 ring-c4c-cobalt ring-offset-2'
          : 'border-c4c-rule/20'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Insert-position indicator for section reordering */}
      {isDragOver && dropIndicatorPos === 'top' && (
        <div className="absolute -top-1 left-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-c4c-petrol flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-c4c-petrol rounded-full" />
          <div className="w-2.5 h-2.5 rounded-full bg-c4c-petrol flex-shrink-0" />
        </div>
      )}
      {isDragOver && dropIndicatorPos === 'bottom' && (
        <div className="absolute -bottom-1 left-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-c4c-petrol flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-c4c-petrol rounded-full" />
          <div className="w-2.5 h-2.5 rounded-full bg-c4c-petrol flex-shrink-0" />
        </div>
      )}
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CardHeader className="pb-3 bg-gradient-to-r from-c4c-tint-cyan to-c4c-tint-sage rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div
                className="p-2 bg-white rounded-lg shadow-sm cursor-grab hover:shadow-md transition-shadow"
                draggable
                onDragStart={handleDragStart}
              >
                <GripVertical className="h-5 w-5 text-c4c-petrol" />
              </div>
              <div className="flex-1">
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={(e) => handleUpdateTitle(e.target.value)}
                  className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent text-c4c-petrol"
                  placeholder="Section title"
                  disabled={isUpdating}
                />
                <Textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={(e) => handleUpdateDescription(e.target.value)}
                  className="text-sm text-c4c-petrol border-none shadow-none px-0 focus-visible:ring-0 mt-1 bg-transparent resize-none"
                  placeholder="Add a section description..."
                  rows={1}
                  disabled={isUpdatingDescription}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isDropping && (
                <div className="flex items-center gap-1.5 text-c4c-petrol text-xs font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Moving...</span>
                </div>
              )}
              <Badge className="bg-c4c-tint-sage text-c4c-petrol border-c4c-sage/20">
                {section.questions?.length || 0} questions
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-white/50">
                  {isExpanded ?
                    <ChevronUp className="h-4 w-4 text-c4c-petrol" /> :
                    <ChevronDown className="h-4 w-4 text-c4c-petrol" />
                  }
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-white/50">
                    <MoreVertical className="h-4 w-4 text-c4c-petrol" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem
                    className="text-c4c-petrol"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Section
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-c4c-burgundy"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {children}
              
              {isDragOver && (
                <div className="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-dashed border-c4c-rule bg-c4c-grey-bg text-c4c-petrol text-sm font-medium animate-pulse">
                  <span className="text-lg leading-none">↓</span>
                  Drop question here
                </div>
              )}

              <Button
                variant="ghost"
                className="w-full border-2 border-dashed border-c4c-sage/30 hover:border-c4c-sage/60 hover:bg-c4c-tint-sage/50 h-14 text-c4c-petrol hover:text-c4c-petrol transition-all"
                onClick={() => console.log('Add question to section:', section._id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question to Section
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};