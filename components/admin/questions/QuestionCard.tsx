// components/admin/questions/QuestionCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Edit, 
  Copy, 
  Archive, 
  RotateCcw, 
  Trash2, 
  MoreVertical,
  BookMarked,
  Bookmark,
  Tag,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Leaf,
  Building2,
  Award,
  AlertCircle
} from 'lucide-react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";

import { Question } from '@/types';
import { QUESTION_TYPE_CONFIG } from '@/types';

interface QuestionCardProps {
  question: Question;
  onArchive?: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
  onClone?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAddToLibrary?: (id: string) => void;
  onRemoveFromLibrary?: (id: string) => Promise<void>;
  showRemoveFromLibrary?: boolean;
  inLibrary?: boolean;
}

const QuestionCard = ({
  question,
  onArchive,
  onRestore,
  onClone,
  onDelete,
  onAddToLibrary,
  onRemoveFromLibrary,
  showRemoveFromLibrary = false,
  inLibrary = false
}: QuestionCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  
  const isArchived = question.status === 'archived';
  const questionTypeConfig = QUESTION_TYPE_CONFIG[question.type];

  // Format date helper
  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Status badge styling with brand colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-c4c-sage text-white hover:bg-black">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-c4c-yellow text-black hover:bg-c4c-petrol hover:text-white">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-c4c-grey-bg text-black border-c4c-rule hover:bg-c4c-rule">
            <Archive className="w-3 h-3 mr-1" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Target audience badge with brand colors
  const getAudienceBadge = (audience: string) => {
    const styles = {
      internal: 'bg-c4c-grey-bg text-black border-c4c-rule hover:bg-c4c-rule',
      external: 'bg-c4c-tint-cyan text-c4c-petrol border-c4c-petrol hover:bg-c4c-tint-cyan',
      both: 'bg-c4c-tint-gold text-black border-c4c-yellow hover:bg-c4c-tint-gold'
    };

    return (
      <Badge variant="outline" className={styles[audience as keyof typeof styles] || 'bg-c4c-grey-bg'}>
        <Users className="w-3 h-3 mr-1" />
        {audience.charAt(0).toUpperCase() + audience.slice(1)}
      </Badge>
    );
  };

  const handleArchive = async () => {
    if (onArchive) {
      await onArchive(question._id);
    }
  };
  
  const handleRestore = async () => {
    if (onRestore) {
      await onRestore(question._id);
    }
  };
  
  const handleClone = async () => {
    if (onClone) {
      await onClone(question._id);
    }
  };
  
  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(question._id);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleAddToLibrary = () => {
    if (onAddToLibrary) {
      onAddToLibrary(question._id);
    }
  };
  
  const handleRemoveFromLibrary = async () => {
    if (onRemoveFromLibrary) {
      await onRemoveFromLibrary(question._id);
      setRemoveDialogOpen(false);
    }
  };

  return (
    <>
      <Card className={`mb-4 transition-all hover:shadow-lg border-l-4 ${
        isArchived 
          ? 'border-l-c4c-rule bg-c4c-grey-bg opacity-75' 
          : 'border-l-c4c-petrol bg-white shadow-sm'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-black leading-tight hover:text-black transition-colors">
                    {question.text}
                  </CardTitle>
                  {question.description && (
                    <CardDescription className="text-sm text-c4c-petrol mt-1.5 line-clamp-2">
                      {question.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              
              {/* Status, Type, and Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(question.status)}
                
                <Badge variant="outline" className="bg-c4c-grey-bg text-black border-c4c-rule hover:bg-c4c-rule">
                  <span className="mr-1">{questionTypeConfig?.icon}</span>
                  {questionTypeConfig?.label || question.type}
                </Badge>
                
                {getAudienceBadge(question.targetAudience)}
                
                {question.isTemplate && (
                  <Badge variant="outline" className="bg-c4c-tint-gold text-black border-c4c-yellow hover:bg-c4c-tint-gold">
                    <Tag className="w-3 h-3 mr-1" />
                    Template
                  </Badge>
                )}
                
                {question.required && (
                  <Badge variant="outline" className="bg-c4c-tint-coral text-black border-c4c-burgundy hover:bg-c4c-tint-coral">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Required
                  </Badge>
                )}
                
                {inLibrary && (
                  <Badge className="bg-c4c-tint-sage text-black border-c4c-sage hover:bg-c4c-sage">
                    <BookMarked className="w-3 h-3 mr-1" />
                    In Library
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-black hover:bg-c4c-grey-bg hover:text-black"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-c4c-rule">
                <DropdownMenuItem asChild>
                  <Link 
                    href={`/admin/questions/builder/${question._id}`}
                    className="cursor-pointer text-black hover:text-black"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleClone} className="text-black hover:text-black">
                  <Copy className="mr-2 h-4 w-4" />
                  Clone
                </DropdownMenuItem>
                
                {/* Library actions */}
                {!inLibrary && !showRemoveFromLibrary && onAddToLibrary && (
                  <DropdownMenuItem onClick={handleAddToLibrary} className="text-black hover:text-black">
                    <BookMarked className="mr-2 h-4 w-4" />
                    Add to Library
                  </DropdownMenuItem>
                )}
                
                {(inLibrary || showRemoveFromLibrary) && onRemoveFromLibrary && (
                  <DropdownMenuItem onClick={() => setRemoveDialogOpen(true)} className="text-black hover:text-black">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Remove from Library
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-c4c-rule" />
                
                {isArchived ? (
                  <DropdownMenuItem onClick={handleRestore} className="text-c4c-petrol hover:text-black">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleArchive} className="text-black hover:text-black">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  className="text-c4c-burgundy hover:text-c4c-burgundy focus:text-c4c-burgundy"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          {/* Theme and Category Information */}
          {(question.theme || (question.subThemes && question.subThemes.length > 0) || (question.categories && question.categories.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {question.categories && question.categories.length > 0 && typeof question.categories[0] === 'object' && (question.categories[0] as any).name && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-c4c-grey-bg text-c4c-petrol border border-c4c-rule">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="font-medium text-xs">Category:</span>
                  <span className="text-xs">{(question.categories[0] as any).name}</span>
                </div>
              )}

              {question.theme && typeof question.theme === 'object' && question.theme.name && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-c4c-tint-cyan text-c4c-petrol border border-c4c-petrol">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="font-medium text-xs">Theme:</span>
                  <span className="text-xs">{question.theme.name}</span>
                </div>
              )}

              {question.subThemes && question.subThemes.length > 0 && typeof question.subThemes[0] === 'object' && (question.subThemes[0] as any).name && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-c4c-tint-sage text-black border border-c4c-sage">
                  <Target className="w-3.5 h-3.5" />
                  <span className="font-medium text-xs">SubTheme:</span>
                  <span className="text-xs">{(question.subThemes[0] as any).name}</span>
                </div>
              )}
            </div>
          )}

          {/* Demographic Information */}
          {question.isStandardDemographic && (
            <div className="bg-c4c-tint-sage border border-c4c-sage rounded-lg p-3">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-medium text-black block">Standard Demographic Question</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {question.demographicType && (
                      <Badge variant="outline" className="bg-c4c-tint-sage text-black border-c4c-sage text-xs">
                        {question.demographicType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                    {question.demographicCategory && (
                      <Badge variant="outline" className="bg-c4c-tint-sage text-black border-c4c-sage text-xs">
                        {question.demographicCategory}
                      </Badge>
                    )}
                    {question.isGlobalStandard && (
                      <Badge variant="outline" className="bg-c4c-tint-gold text-black border-c4c-yellow text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Global Standard
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Tags Section */}
          {(question.selectedIndicatorTags?.length || 
            question.selectedSdgTags?.length || 
            question.selectedResilienceTags?.length || 
            question.selectedEsgTags?.length || 
            question.selectedStandardTags?.length) && (
            <>
              <Separator className="bg-c4c-rule" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                  <Tag className="w-4 h-4 text-c4c-petrol" />
                  <span>Associated Tags</span>
                </div>
                
                <div className="space-y-2.5 pl-6">
                  {/* Indicators */}
                  {question.selectedIndicatorTags && question.selectedIndicatorTags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-c4c-petrol flex items-center gap-1.5">
                        <Target className="w-3 h-3" />
                        Indicators ({question.selectedIndicatorTags.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {question.selectedIndicatorTags.map((indicator) => (
                          <Badge 
                            key={typeof indicator === 'string' ? indicator : indicator._id}
                            variant="outline" 
                            className="bg-c4c-grey-bg text-black border-c4c-rule text-xs hover:bg-c4c-rule transition-colors"
                          >
                            {typeof indicator === 'string' ? indicator : indicator.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SDGs */}
                  {question.selectedSdgTags && question.selectedSdgTags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-black flex items-center gap-1.5">
                        <Target className="w-3 h-3" />
                        SDGs ({question.selectedSdgTags.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {question.selectedSdgTags.map((sdg) => (
                          <Badge 
                            key={typeof sdg === 'string' ? sdg : sdg._id}
                            variant="outline" 
                            className="bg-c4c-tint-sage text-black border-c4c-sage text-xs hover:bg-c4c-tint-sage transition-colors"
                          >
                            {typeof sdg === 'string' ? sdg : `SDG ${sdg.code}: ${sdg.name}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ESG Categories */}
                  {question.selectedEsgTags && question.selectedEsgTags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-c4c-petrol flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        ESG Categories ({question.selectedEsgTags.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {question.selectedEsgTags.map((esg) => (
                          <Badge 
                            key={typeof esg === 'string' ? esg : esg._id}
                            variant="outline" 
                            className="bg-c4c-tint-cyan text-c4c-petrol border-c4c-petrol text-xs hover:bg-c4c-tint-cyan transition-colors"
                          >
                            {typeof esg === 'string' ? esg : esg.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resilience Dimensions */}
                  {question.selectedResilienceTags && question.selectedResilienceTags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-c4c-petrol flex items-center gap-1.5">
                        <Leaf className="w-3 h-3" />
                        Resilience Dimensions ({question.selectedResilienceTags.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {question.selectedResilienceTags.map((resilience) => (
                          <Badge 
                            key={typeof resilience === 'string' ? resilience : resilience._id}
                            variant="outline" 
                            className="bg-c4c-tint-gold text-black border-c4c-yellow text-xs hover:bg-c4c-tint-gold transition-colors"
                          >
                            {typeof resilience === 'string' ? resilience : resilience.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standards */}
                  {question.selectedStandardTags && question.selectedStandardTags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-c4c-cobalt flex items-center gap-1.5">
                        <Award className="w-3 h-3" />
                        Standards ({question.selectedStandardTags.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {question.selectedStandardTags.map((standard) => (
                          <Badge 
                            key={typeof standard === 'string' ? standard : standard._id}
                            variant="outline" 
                            className="bg-c4c-tint-cyan text-c4c-cobalt border-c4c-cobalt text-xs hover:bg-c4c-tint-cyan transition-colors"
                          >
                            {typeof standard === 'string' ? standard : standard.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t border-c4c-rule">
          <div className="w-full flex justify-between items-center text-xs text-c4c-petrol">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Created: {formatDate(question.createdAt)}</span>
              </div>
              {question.updatedAt && question.updatedAt !== question.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {formatDate(question.updatedAt)}</span>
                </div>
              )}
            </div>
            
            {question.creator && typeof question.creator === 'object' && question.creator.name && (
              <div className="flex items-center gap-1 text-black font-medium">
                <Users className="w-3 h-3" />
                <span>{question.creator.name}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-c4c-rule">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-c4c-petrol">
              This will permanently delete this question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black border-c4c-rule hover:bg-c4c-grey-bg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-c4c-burgundy hover:bg-black text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Remove from library confirmation dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="bg-white border-c4c-rule">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Remove from Library?</AlertDialogTitle>
            <AlertDialogDescription className="text-c4c-petrol">
              This will remove the question from this library. The question itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black border-c4c-rule hover:bg-c4c-grey-bg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleRemoveFromLibrary();
              }}
              className="bg-c4c-burgundy hover:bg-black text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuestionCard;