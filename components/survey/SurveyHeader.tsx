// components/survey/SurveyHeader.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Eye, 
  Save
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SurveyHeaderProps {
  projectId: string;
  surveyId: string;
  surveyTitle: string;
  surveyDescription: string;
  surveySettings?: {
    isPublic: boolean;
    allowAnonymous: boolean;
    allowMultipleResponses: boolean;
  };
  hasUnsavedChanges: boolean;
  previewMode: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSettingsChange?: (key: 'isPublic' | 'allowAnonymous' | 'allowMultipleResponses', value: boolean) => void;
  onPreviewModeChange: (enabled: boolean) => void;
  onSave: () => void;
}

export const SurveyHeader = ({
  projectId,
  surveyId,
  surveyTitle,
  surveyDescription,
  surveySettings,
  hasUnsavedChanges,
  previewMode,
  onTitleChange,
  onDescriptionChange,
  onSettingsChange,
  onPreviewModeChange,
  onSave
}: SurveyHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-c4c-rule px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-c4c-petrol hover:text-black transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Link>

          <div className="flex items-center gap-3 min-w-0">
            <Input
              value={surveyTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent max-w-xs sm:max-w-sm md:max-w-md"
              placeholder="Untitled Survey"
            />
            {hasUnsavedChanges && (
              <Badge className="bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow/20 animate-pulse flex-shrink-0">
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-c4c-grey-bg rounded-lg p-2">
            <Eye className="h-4 w-4 text-c4c-petrol" />
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={onPreviewModeChange}
            />
            <Label htmlFor="preview-mode" className="text-sm font-medium">Preview</Label>
          </div>
          
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="border-c4c-rule hover:bg-c4c-grey-bg">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle className="text-black">Survey Settings</SheetTitle>
                <SheetDescription className="text-c4c-petrol">
                  Configure your survey properties and settings
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="title" className="text-black">Survey Title</Label>
                  <Input
                    id="title"
                    value={surveyTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter survey title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-black">Description</Label>
                  <Textarea
                    id="description"
                    value={surveyDescription}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter survey description"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-black">Survey Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-c4c-grey-bg rounded-lg">
                      <Label htmlFor="public" className="text-black">Public Access</Label>
                      <Switch
                        id="public"
                        checked={surveySettings?.isPublic ?? false}
                        onCheckedChange={(v) => onSettingsChange?.('isPublic', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-c4c-grey-bg rounded-lg">
                      <Label htmlFor="anonymous" className="text-black">Allow Anonymous</Label>
                      <Switch
                        id="anonymous"
                        checked={surveySettings?.allowAnonymous ?? false}
                        onCheckedChange={(v) => onSettingsChange?.('allowAnonymous', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-c4c-grey-bg rounded-lg">
                      <Label htmlFor="multiple" className="text-black">Multiple Responses</Label>
                      <Switch
                        id="multiple"
                        checked={surveySettings?.allowMultipleResponses ?? false}
                        onCheckedChange={(v) => onSettingsChange?.('allowMultipleResponses', v)}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => { onSave(); setSettingsOpen(false); }}
                  className="w-full bg-c4c-burgundy hover:bg-black text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button
            onClick={onSave}
            className="bg-c4c-burgundy hover:bg-black text-white shadow-md transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};