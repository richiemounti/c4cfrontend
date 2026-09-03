'use client';

import { useState, useEffect } from 'react';
import { Settings, Zap, ClipboardCheck, Lock, Wand2, Trash2, Save, Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSurveyQuestion, updateSurveyQuestion } from '@/lib/api/surveyQuestion';
import { updateBespokeQuestion, deleteBespokeQuestion } from '@/lib/api/question';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import { ReviewDrawer } from '@/components/reviews/ReviewDrawer';
import { useToast } from "@/hooks/use-toast";
import type { QuestionPropertiesPanelProps } from '@/types/survey-edit';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'radio', label: 'Multiple Choice (Single)' },
  { value: 'checkbox', label: 'Multiple Choice (Many)' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'rating', label: 'Rating' },
];

const REVIEW_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'Pending Review', bg: 'bg-ochre-50',    text: 'text-ochre-500',    border: 'border-ochre-500/30' },
  in_review: { label: 'In Review',      bg: 'bg-sky-50',      text: 'text-sky-500',      border: 'border-sky-500/30' },
  approved:  { label: 'Approved',       bg: 'bg-grass-50',    text: 'text-forest',       border: 'border-grass-500/30' },
  escalated: { label: 'Escalated',      bg: 'bg-sand-50',     text: 'text-clay',         border: 'border-sand-500/30' },
  resolved:  { label: 'Resolved',       bg: 'bg-concrete-50', text: 'text-concrete-500', border: 'border-concrete-500/30' },
};

interface BespokeFormState {
  text: string;
  description: string;
  type: string;
  options: { label: string; value: string; descriptor: string; placeholder: string }[];
}

export const QuestionPropertiesPanel = ({
  questionId,
  surveyId,
  onClose,
  onUpdate,
  onOpenConditionalLogic
}: QuestionPropertiesPanelProps & { onOpenConditionalLogic: () => void }) => {
  const { toast } = useToast();
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Review state
  const [questionReview, setQuestionReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Bespoke edit form state
  const [bespokeForm, setBespokeForm] = useState<BespokeFormState>({
    text: '',
    description: '',
    type: 'text',
    options: [{ label: '', value: '', descriptor: '', placeholder: '' }],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const response = await getSurveyQuestion(surveyId, questionId);
        const data = response.data;
        setQuestionData(data);

        if (data.question?.isBespoke) {
          setBespokeForm({
            text: data.question.text || '',
            description: data.question.description || '',
            type: data.question.type || 'text',
            options: data.question.options?.length
              ? data.question.options.map((o: any) => ({
                  label: o.label || '',
                  value: o.value || '',
                  descriptor: o.descriptor || '',
                  placeholder: o.placeholder || '',
                }))
              : [{ label: '', value: '', descriptor: '', placeholder: '' }],
          });
        }
      } catch (error) {
        console.error('Failed to load question data:', error);
        toast({ title: 'Error', description: 'Failed to load question data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (questionId && surveyId) fetchQuestionData();
  }, [questionId, surveyId]);

  useEffect(() => {
    const fetchQuestionReview = async () => {
      if (!questionId) return;
      setReviewLoading(true);
      setQuestionReview(null);
      try {
        const response = await getReviewsByModuleItem('survey_question', questionId);
        if (response.success && response.data?.length > 0) {
          setQuestionReview(response.data[0]);
        }
      } catch {
        // non-fatal
      } finally {
        setReviewLoading(false);
      }
    };
    fetchQuestionReview();
  }, [questionId]);

  // ── Conditional logic ────────────────────────────────────────────────────────

  const handleUpdateQuestion = async (updates: any) => {
    try {
      setUpdating(true);
      await updateSurveyQuestion(surveyId, questionId, updates);
      setQuestionData((prev: any) => ({ ...prev, ...updates }));
      onUpdate();
      toast({ title: 'Question updated', description: 'Changes saved successfully' });
    } catch (error) {
      console.error('Failed to update question:', error);
      toast({ title: 'Error', description: 'Failed to update question', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleConditionalLogic = (checked: boolean) => {
    if (checked) {
      onOpenConditionalLogic();
    } else {
      handleUpdateQuestion({ conditionalLogic: { enabled: false, conditions: [], action: 'show' } });
    }
  };

  // ── Bespoke form helpers ─────────────────────────────────────────────────────

  const requiresOptions = ['radio', 'checkbox', 'dropdown'].includes(bespokeForm.type);

  const validateBespokeForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!bespokeForm.text.trim()) {
      errors.text = 'Question text is required';
    } else if (bespokeForm.text.length < 10) {
      errors.text = 'Must be at least 10 characters';
    }
    if (requiresOptions) {
      const valid = bespokeForm.options.filter(o => o.label.trim());
      if (valid.length < 2) errors.options = 'At least 2 options are required';
      const labels = valid.map(o => o.label.toLowerCase().trim());
      if (labels.length !== new Set(labels).size) errors.options = 'Option labels must be unique';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBespoke = async () => {
    if (!validateBespokeForm()) return;
    setSaving(true);
    try {
      const payload: any = {
        text: bespokeForm.text.trim(),
        description: bespokeForm.description.trim() || undefined,
        type: bespokeForm.type,
      };
      if (requiresOptions) {
        payload.options = bespokeForm.options
          .filter(o => o.label.trim())
          .map(o => ({
            label: o.label.trim(),
            value: o.value || o.label.toLowerCase().replace(/\s+/g, '_'),
            ...(o.descriptor?.trim() ? { descriptor: o.descriptor.trim() } : {}),
            ...(o.placeholder?.trim() ? { placeholder: o.placeholder.trim() } : {}),
          }));
      }
      await updateBespokeQuestion(questionData.question._id, payload);
      onUpdate();
      toast({ title: 'Question saved', description: 'Custom question updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.response?.data?.message || 'Failed to save question',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBespoke = async () => {
    setDeleting(true);
    try {
      await deleteBespokeQuestion(questionData.question._id);
      onUpdate();
      onClose();
      toast({ title: 'Question deleted', description: 'Custom question has been deleted' });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'Failed to delete question',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleOptionChange = (index: number, label: string) => {
    setBespokeForm(prev => {
      const opts = [...prev.options];
      opts[index] = { ...opts[index], label, value: label.toLowerCase().replace(/\s+/g, '_') };
      return { ...prev, options: opts };
    });
  };

  const handleAddOption = () => {
    setBespokeForm(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '', descriptor: '', placeholder: '' }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setBespokeForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading || !questionData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const isBespoke = !!questionData.question?.isBespoke;
  const bespokeStatus = questionData.question?.bespokeMetadata?.status;
  const canEditBespoke = isBespoke && bespokeStatus !== 'elevated';
  const questionText = questionData.question?.text || 'Untitled Question';
  const questionType = questionData.question?.type || 'text';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-concrete-500/20">
        <h3 className="font-semibold text-stratosphere-900 flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isBespoke ? 'bg-grass-50' : 'bg-concrete-50'}`}>
            {isBespoke
              ? <Wand2 className="h-4 w-4 text-forest" />
              : <Settings className="h-4 w-4 text-concrete-500" />
            }
          </div>
          {isBespoke ? 'Custom Question' : 'Question Settings'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-stratosphere-50">
          ×
        </Button>
      </div>

      <div className="space-y-6">

        {/* ── BESPOKE: editable form ── */}
        {isBespoke && canEditBespoke && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-grass-50 text-grass-600 border-grass-500/20 text-xs">
                <Wand2 className="h-3 w-3 mr-1" />
                Custom Question
              </Badge>
              {bespokeStatus && (
                <Badge className="bg-sky-50 text-sky-600 border-sky-500/20 text-xs capitalize">
                  {bespokeStatus}
                </Badge>
              )}
            </div>

            {/* Text */}
            <div className="space-y-1">
              <Label className="text-stratosphere-900 font-medium text-sm">Question Text <span className="text-clay-500">*</span></Label>
              <Textarea
                value={bespokeForm.text}
                onChange={(e) => setBespokeForm(prev => ({ ...prev, text: e.target.value }))}
                className={`min-h-[80px] text-sm ${formErrors.text ? 'border-sand-500' : ''}`}
                placeholder="What would you like to ask?"
              />
              {formErrors.text && <p className="text-xs text-clay">{formErrors.text}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-stratosphere-900 font-medium text-sm">Description <span className="text-sky-400">(optional)</span></Label>
              <Textarea
                value={bespokeForm.description}
                onChange={(e) => setBespokeForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[60px] text-sm"
                placeholder="Add context or instructions..."
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label className="text-stratosphere-900 font-medium text-sm">Question Type <span className="text-clay-500">*</span></Label>
              <Select
                value={bespokeForm.type}
                onValueChange={(value) => setBespokeForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            {requiresOptions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-stratosphere-900 font-medium text-sm">Answer Options <span className="text-clay-500">*</span></Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-7 text-xs border-clay-500/30 text-clay-500 hover:bg-clay-50">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {bespokeForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="text-sm h-8 flex-1"
                      />
                      {bespokeForm.options.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(index)} className="h-8 w-8 p-0 text-clay hover:text-sand-600 hover:bg-sand-50">
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {formErrors.options && <p className="text-xs text-clay">{formErrors.options}</p>}
              </div>
            )}

            <Button onClick={handleSaveBespoke} disabled={saving} className="w-full bg-grass-500 hover:bg-grass-600 text-white">
              {saving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        )}

        {/* ── BESPOKE: elevated (read-only) ── */}
        {isBespoke && !canEditBespoke && (
          <div className="p-4 bg-gradient-to-r from-sand-50 to-ochre-50 rounded-xl border border-sand-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-clay" />
              <span className="font-medium text-stratosphere-900 text-sm">Question Elevated</span>
            </div>
            <p className="text-xs text-sky-500 mb-3">{questionText}</p>
            <p className="text-xs text-clay">
              This question has been elevated to the platform library and can no longer be edited.
            </p>
          </div>
        )}

        {/* ── LIBRARY question: read-only notice ── */}
        {!isBespoke && (
          <div className="p-4 bg-gradient-to-r from-concrete-50 to-stratosphere-50 rounded-xl border border-concrete-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-concrete-500" />
              <span className="font-medium text-stratosphere-900 text-sm">Shared Library Question</span>
            </div>
            <p className="text-sm text-stratosphere-700 mb-2">{questionText}</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-sky-50 text-sky-600 border-sky-500/20 text-xs">
                {questionType.charAt(0).toUpperCase() + questionType.slice(1)}
              </Badge>
              {questionData.required && (
                <Badge className="bg-red-50 text-red-600 border-red-500/20 text-xs">Required</Badge>
              )}
            </div>
            <p className="text-xs text-concrete-500 mt-3">
              This question is shared across surveys and cannot be edited here. Use conditional logic below to control when it appears.
            </p>
          </div>
        )}

        {/* ── Conditional Logic (all questions) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral-50 to-sand-50 rounded-xl">
            <div>
              <Label className="text-stratosphere-900 font-medium">Conditional Logic</Label>
              <p className="text-xs text-coral-500 mt-1">Show or hide based on other answers</p>
            </div>
            <Switch
              checked={questionData.conditionalLogic?.enabled || false}
              onCheckedChange={handleToggleConditionalLogic}
              disabled={updating}
            />
          </div>

          {questionData.conditionalLogic?.enabled && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <Label className="text-amber-900 font-medium">Active Conditional Logic</Label>
              </div>
              <p className="text-xs text-amber-700 mb-3">
                {questionData.conditionalLogic.conditions?.length || 0} condition(s) set.
              </p>
              <Button size="sm" variant="outline" onClick={onOpenConditionalLogic} className="border-amber-300 text-amber-700 hover:bg-amber-100" disabled={updating}>
                <Zap className="h-3 w-3 mr-2" />
                Edit Logic Rules
              </Button>
            </div>
          )}
        </div>

        {/* ── Review (all questions) ── */}
        <div className="border-t border-concrete-500/20 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-clay-50 rounded-lg">
              <ClipboardCheck className="h-4 w-4 text-clay-500" />
            </div>
            <Label className="text-stratosphere-900 font-medium">Review</Label>
          </div>

          {reviewLoading ? (
            <div className="flex items-center gap-2 text-sm text-sky-500 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              Loading review...
            </div>
          ) : questionReview ? (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border ${REVIEW_STATUS_CONFIG[questionReview.status]?.bg} ${REVIEW_STATUS_CONFIG[questionReview.status]?.text} ${REVIEW_STATUS_CONFIG[questionReview.status]?.border}`}>
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                {REVIEW_STATUS_CONFIG[questionReview.status]?.label ?? questionReview.status}
              </div>
              {questionReview.issues?.filter((i: any) => !i.resolvedAt).length > 0 && (
                <p className="text-xs text-ochre-500">
                  {questionReview.issues.filter((i: any) => !i.resolvedAt).length} open issue(s)
                </p>
              )}
              <Button size="sm" variant="outline" className="w-full border-sky-500/30 text-sky-500 hover:bg-sky-50" onClick={() => setShowReviewModal(true)}>
                View Review
              </Button>
            </div>
          ) : (
            <p className="text-xs text-sky-500">
              A review is created automatically when a question is added to this survey.
            </p>
          )}
        </div>

        {/* ── Delete bespoke (danger zone) ── */}
        {isBespoke && canEditBespoke && (
          <div className="border-t border-concrete-500/20 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Question'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete custom question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the custom question and remove it from this survey. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteBespoke} className="bg-red-600 hover:bg-red-700 text-white">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <ReviewDrawer
        isOpen={showReviewModal && !!questionReview}
        reviewId={questionReview?._id ?? null}
        onClose={() => {
          setShowReviewModal(false);
          // Re-fetch to reflect any status changes made in the drawer
          getReviewsByModuleItem('survey_question', questionId)
            .then(r => { if (r.success && r.data?.length) setQuestionReview(r.data[0]); })
            .catch(() => {});
        }}
      />
    </div>
  );
};
