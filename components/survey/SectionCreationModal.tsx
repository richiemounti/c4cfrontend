// components/survey/SectionCreationModal.tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSection: (data: { title: string; description: string }) => Promise<void>;
}

export const SectionCreationModal = ({
  isOpen,
  onClose,
  onCreateSection
}: SectionCreationModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await onCreateSection({
        title: title.trim(),
        description: description.trim()
      });
      // Reset form
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create section:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="bg-gradient-to-r from-coral-50 to-sand-50">
          <CardTitle className="text-xl font-semibold text-stratosphere-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-coral-500" />
            Create New Section
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="section-title" className="text-stratosphere-900 font-medium">
                Section Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="section-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title"
                className="mt-2"
                disabled={creating}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="section-description" className="text-stratosphere-900 font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="section-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter section description"
                rows={3}
                className="mt-2"
                disabled={creating}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-coral-500 hover:bg-coral-600 text-white"
                disabled={creating || !title.trim()}
              >
                {creating ? 'Creating...' : 'Create Section'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};