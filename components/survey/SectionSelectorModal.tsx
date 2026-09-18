// components/survey/SectionSelectorModal.tsx
'use client';

import { useState } from 'react';
import { Move, FolderOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Section {
  _id: string;
  title: string;
  description?: string;
  questions?: any[];
}

interface SectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  availableSections: Section[];
  currentSectionId?: string | null;
  onMoveToSection: (sectionId: string | null) => Promise<void>;
}

export const SectionSelectorModal = ({
  isOpen,
  onClose,
  questionText,
  availableSections,
  currentSectionId,
  onMoveToSection
}: SectionSelectorModalProps) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(currentSectionId || null);
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = async () => {
    if (selectedSectionId === currentSectionId) {
      onClose();
      return;
    }

    setIsMoving(true);
    try {
      await onMoveToSection(selectedSectionId);
      onClose();
    } catch (error) {
      console.error('Failed to move question:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    setSelectedSectionId(currentSectionId || null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="bg-gradient-to-r from-neutral-50 to-ink-50">
          <CardTitle className="text-xl font-semibold text-ink-900 flex items-center gap-2">
            <Move className="h-5 w-5 text-neutral-500" />
            Move Question to Section
          </CardTitle>
          <p className="text-sm text-neutral-500 mt-2 font-normal">
            "{questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText}"
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label className="text-ink-900 font-medium">Select Target Section</Label>
            
            {/* No Section Option */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedSectionId === null
                  ? 'border-neutral-500 bg-neutral-50'
                  : 'border-stone-500/20 hover:border-neutral-500/40 hover:bg-neutral-50/50'
              }`}
              onClick={() => setSelectedSectionId(null)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-gold-50 to-coral-50 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-gold-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink-900">No Section</div>
                  <div className="text-sm text-neutral-500">Move to unorganized questions</div>
                </div>
                {currentSectionId === null && (
                  <Badge className="bg-gold-100 text-gold-600 text-xs">Current</Badge>
                )}
              </div>
            </div>

            {/* Available Sections */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSections.map((section) => (
                <div
                  key={section._id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSectionId === section._id
                      ? 'border-neutral-500 bg-neutral-50'
                      : 'border-stone-500/20 hover:border-neutral-500/40 hover:bg-neutral-50/50'
                  }`}
                  onClick={() => setSelectedSectionId(section._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-petrol-50 to-sage-50 rounded-lg">
                      <FolderOpen className="h-4 w-4 text-petrol-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink-900">{section.title}</div>
                      {section.description && (
                        <div className="text-sm text-neutral-500">{section.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-sage-50 text-sage-600 text-xs">
                          {section.questions?.length || 0} questions
                        </Badge>
                        {currentSectionId === section._id && (
                          <Badge className="bg-neutral-100 text-neutral-600 text-xs">Current</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {availableSections.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sections available. Create a section first.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stone-500/20 mt-6">
            <Button variant="outline" onClick={handleClose} disabled={isMoving}>
              Cancel
            </Button>
            <Button 
              onClick={handleMove}
              className="bg-neutral-500 hover:bg-neutral-600 text-white"
              disabled={isMoving || selectedSectionId === currentSectionId}
            >
              {isMoving ? 'Moving...' : 'Move Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};