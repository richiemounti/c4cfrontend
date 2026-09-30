// components/survey/EditConsentFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import * as consentFormApi from '@/lib/api/consentForm';

interface ConsentFormData {
  _id: string;
  name: string;
  description: string;
  agreementLabel?: string;
  version?: string;
  defaultLanguage?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  projectId?: string;
  organizationId?: string;
  translations?: Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel?: string;
  }>;
}

interface EditConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  consentForm: ConsentFormData;
  projectId: string;
  organizationId?: string;
  onSuccess?: () => void;
}

export const EditConsentFormModal = ({
  isOpen,
  onClose,
  consentForm,
  projectId,
  organizationId,
  onSuccess
}: EditConsentFormModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agreementLabel: 'I have read and agree to the above terms',
    defaultLanguage: 'en',
    isActive: true,
    });

  const [translations, setTranslations] = useState<Array<{
    language: string;
    name: string;
    description: string;
    agreementLabel: string;
  }>>([]);

  // Pre-populate from the consent form prop whenever the modal opens
  useEffect(() => {
    if (isOpen && consentForm) {
      // Determine scope from the form's associations
      let scope: 'project' | 'organization' | 'global' = 'global';
      if (consentForm.projectId) scope = 'project';
      else if (consentForm.organizationId) scope = 'organization';

      setFormData({
        name: consentForm.name || '',
        description: consentForm.description || '',
        agreementLabel: consentForm.agreementLabel || 'I have read and agree to the above terms',
        defaultLanguage: consentForm.defaultLanguage || 'en',
        isActive: true,
    });

      setTranslations(
        (consentForm.translations || []).map(t => ({
          language: t.language || '',
          name: t.name || '',
          description: t.description || '',
          agreementLabel: t.agreementLabel || 'I have read and agree to the above terms',
        }))
      );
    }
  }, [isOpen, consentForm]);

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

    setSaving(true);
    try {
      await consentFormApi.updateConsentForm(consentForm._id, {
        name: formData.name,
        description: formData.description,
        agreementLabel: formData.agreementLabel,
        defaultLanguage: formData.defaultLanguage,
        translations: translations.length > 0 ? translations : undefined,
      });

      toast({
        title: 'Success',
        description: 'Consent form updated successfully',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update consent form',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addTranslation = () => {
    setTranslations([...translations, {
      language: '',
      name: '',
      description: '',
      agreementLabel: 'I have read and agree to the above terms',
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
          <DialogTitle className="text-2xl font-semibold text-black flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-c4c-burgundy" />
            Edit Consent Form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-black">
                Name <span className="text-c4c-burgundy">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Community Engagement Consent"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-black">
                Consent Text <span className="text-c4c-burgundy">*</span>
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter the full consent form text that respondents will read..."
                className="mt-1.5 min-h-[150px]"
                required
              />
              <p className="text-xs text-c4c-petrol mt-1">
                This text will be displayed to survey respondents
              </p>
            </div>

            <div>
              <Label htmlFor="edit-agreementLabel" className="text-black">
                Agreement Checkbox Label
              </Label>
              <Input
                id="edit-agreementLabel"
                value={formData.agreementLabel}
                onChange={(e) => setFormData({ ...formData, agreementLabel: e.target.value })}
                placeholder="I have read and agree to the above terms"
                className="mt-1.5"
              />
              <p className="text-xs text-c4c-petrol mt-1">
                Text that appears next to the consent checkbox
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-language" className="text-black">
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

          {/* Translations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-black">Translations (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTranslation}
                className="border-c4c-rule text-c4c-petrol hover:bg-c4c-grey-bg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>

            {translations.map((translation, index) => (
              <Card key={index} className="bg-c4c-grey-bg border-c4c-rule">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">
                      Translation {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTranslation(index)}
                      className="text-c4c-petrol hover:text-c4c-petrol hover:bg-c4c-tint-gold"
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-c4c-rule">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-c4c-rule"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.name || !formData.description}
              className="bg-c4c-burgundy hover:bg-black text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};