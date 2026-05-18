// components/survey/CreateConsentFormModal.tsx - FIXED VERSION
'use client';

import { useState } from 'react';
import { X, FileCheck, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useConsentForms } from '@/hooks/useConsentForm';
import { useToast } from "@/hooks/use-toast";

interface CreateConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  organizationId?: string;
  onSuccess?: () => void;
}

export const CreateConsentFormModal = ({
  isOpen,
  onClose,
  projectId,
  organizationId,
  onSuccess
}: CreateConsentFormModalProps) => {
  const { toast } = useToast();
  const { createConsentForm } = useConsentForms();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agreementLabel: 'I have read and agree to the above terms', // ADD THIS
    version: '1.0',
    defaultLanguage: 'en',
    isTemplate: false,
    templateCategory: '',
    scope: 'project' as 'project' | 'organization' | 'global',
  });

  // FIX: Add agreementLabel to translations
  const [translations, setTranslations] = useState<Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel: string; // ADD THIS
  }>>([]);

  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and description are required',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await createConsentForm({
        name: formData.name,
        description: formData.description,
        agreementLabel: formData.agreementLabel, // ADD THIS
        version: formData.version,
        defaultLanguage: formData.defaultLanguage,
        isTemplate: formData.isTemplate,
        templateCategory: formData.isTemplate ? formData.templateCategory as any : undefined,
        projectId: formData.scope === 'project' ? projectId : undefined,
        organizationId: formData.scope === 'organization' ? organizationId : undefined,
        translations: translations.length > 0 ? translations : undefined,
      });

      toast({
        title: 'Success',
        description: 'Consent form created successfully',
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        agreementLabel: 'I have read and agree to the above terms',
        version: '1.0',
        defaultLanguage: 'en',
        isTemplate: false,
        templateCategory: '',
        scope: 'project',
      });
      setTranslations([]);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create consent form',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const addTranslation = () => {
    setTranslations([...translations, { 
      language: '', 
      name: '', 
      description: '',
      agreementLabel: 'I have read and agree to the above terms' // ADD THIS
    }]);
  };

  const removeTranslation = (index: number) => {
    setTranslations(translations.filter((_, i) => i !== index));
  };

  const updateTranslation = (index: number, field: string, value: string) => {
    const updated = [...translations];
    updated[index] = { ...updated[index], [field]: value };
    setTranslations(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-stratosphere-900 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-clay-500" />
            Create Consent Form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-stratosphere-900">
                Name <span className="text-coral-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Community Engagement Consent"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-stratosphere-900">
                Consent Text <span className="text-coral-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter the full consent form text that respondents will read..."
                className="mt-1.5 min-h-[150px]"
                required
              />
              <p className="text-xs text-sky-500 mt-1">
                This text will be displayed to survey respondents
              </p>
            </div>

            {/* ADD THIS FIELD */}
            <div>
              <Label htmlFor="agreementLabel" className="text-stratosphere-900">
                Agreement Checkbox Label
              </Label>
              <Input
                id="agreementLabel"
                value={formData.agreementLabel}
                onChange={(e) => setFormData({ ...formData, agreementLabel: e.target.value })}
                placeholder="I have read and agree to the above terms"
                className="mt-1.5"
              />
              <p className="text-xs text-sky-500 mt-1">
                Text that appears next to the consent checkbox
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version" className="text-stratosphere-900">
                  Version
                </Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="language" className="text-stratosphere-900">
                  Default Language
                </Label>
                <Select
                  value={formData.defaultLanguage}
                  onValueChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <Label className="text-stratosphere-900">Scope</Label>
            <Select
              value={formData.scope}
              onValueChange={(value: any) => setFormData({ ...formData, scope: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project-Specific</SelectItem>
                {organizationId && (
                  <SelectItem value="organization">Organization-Wide</SelectItem>
                )}
                <SelectItem value="global">Global Template</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-sky-500 mt-1">
              {formData.scope === 'project' && 'Only available in this project'}
              {formData.scope === 'organization' && 'Available to all projects in your organization'}
              {formData.scope === 'global' && 'Available as a template for all projects'}
            </p>
          </div>

          {/* Template Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-stratosphere-900">Save as Template</Label>
                <p className="text-xs text-sky-500">
                  Templates can be reused across multiple surveys
                </p>
              </div>
              <Switch
                checked={formData.isTemplate}
                onCheckedChange={(checked) => setFormData({ ...formData, isTemplate: checked })}
              />
            </div>

            {formData.isTemplate && (
              <div>
                <Label htmlFor="templateCategory" className="text-stratosphere-900">
                  Template Category <span className="text-coral-500">*</span>
                </Label>
                <Select
                  value={formData.templateCategory}
                  onValueChange={(value) => setFormData({ ...formData, templateCategory: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community_engagement">Community Engagement</SelectItem>
                    <SelectItem value="data_collection">Data Collection</SelectItem>
                    <SelectItem value="environmental_study">Environmental Study</SelectItem>
                    <SelectItem value="carbon_project">Carbon Project</SelectItem>
                    <SelectItem value="gdpr_compliance">GDPR Compliance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Translations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-stratosphere-900">Translations (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTranslation}
                className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>

            {translations.map((translation, index) => (
              <Card key={index} className="bg-stratosphere-50 border-concrete-500/20">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stratosphere-900">
                      Translation {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTranslation(index)}
                      className="text-ochre-500 hover:text-ochre-600 hover:bg-ochre-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Language code (e.g., es)"
                      value={translation.language}
                      onChange={(e) => updateTranslation(index, 'language', e.target.value)}
                    />
                    <Input
                      placeholder="Translated name"
                      value={translation.name}
                      onChange={(e) => updateTranslation(index, 'name', e.target.value)}
                    />
                  </div>

                  <Textarea
                    placeholder="Translated consent text"
                    value={translation.description}
                    onChange={(e) => updateTranslation(index, 'description', e.target.value)}
                    className="min-h-[80px]"
                  />

                  {/* ADD THIS FIELD */}
                  <Input
                    placeholder="Translated agreement label"
                    value={translation.agreementLabel}
                    onChange={(e) => updateTranslation(index, 'agreementLabel', e.target.value)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-concrete-500/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={creating}
              className="border-concrete-500/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !formData.name || !formData.description}
              className="bg-coral-500 hover:bg-coral-600 text-white"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Create Consent Form
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};