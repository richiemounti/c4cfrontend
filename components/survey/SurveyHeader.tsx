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
    <div className="bg-white/95 backdrop-blur-sm border-b border-concrete-500/20 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-sky-500 hover:text-stratosphere-900 transition-colors flex-shrink-0"
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
              <Badge className="bg-ochre-50 text-ochre-500 border-ochre-500/20 animate-pulse flex-shrink-0">
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-stratosphere-50 rounded-lg p-2">
            <Eye className="h-4 w-4 text-sky-500" />
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={onPreviewModeChange}
            />
            <Label htmlFor="preview-mode" className="text-sm font-medium">Preview</Label>
          </div>
          
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="border-sky-500/20 hover:bg-sky-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle className="text-stratosphere-900">Survey Settings</SheetTitle>
                <SheetDescription className="text-sky-500">
                  Configure your survey properties and settings
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="title" className="text-stratosphere-900">Survey Title</Label>
                  <Input
                    id="title"
                    value={surveyTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter survey title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-stratosphere-900">Description</Label>
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
                  <h4 className="font-medium text-stratosphere-900">Survey Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-lg">
                      <Label htmlFor="public" className="text-stratosphere-900">Public Access</Label>
                      <Switch
                        id="public"
                        checked={surveySettings?.isPublic ?? false}
                        onCheckedChange={(v) => onSettingsChange?.('isPublic', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-lg">
                      <Label htmlFor="anonymous" className="text-stratosphere-900">Allow Anonymous</Label>
                      <Switch
                        id="anonymous"
                        checked={surveySettings?.allowAnonymous ?? false}
                        onCheckedChange={(v) => onSettingsChange?.('allowAnonymous', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-lg">
                      <Label htmlFor="multiple" className="text-stratosphere-900">Multiple Responses</Label>
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
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            onClick={onSave} 
            className="bg-coral-500 hover:bg-coral-600 text-white shadow-md transition-all hover:shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};