'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Languages,
  Plus,
  Wand2,
  Save,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Bot,
  Pencil,
  Send,
  ThumbsUp,
  Globe,
  X,
  ChevronRight,
  Loader2,
  RotateCcw,
  Info,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getSurvey, getSurveyStructure } from '@/lib/api/survey';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import {
  getSurveyTranslations,
  createSurveyTranslation,
  getTranslation,
  updateTranslation,
  updateTranslatedSection,
  updateTranslatedQuestion,
  submitTranslationForReview,
  approveTranslation,
  publishTranslation,
} from '@/lib/api/surveyTranslation';
import { apiClient } from '@/lib/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageParams {
  id: string;
  surveyId: string;
}

type FieldKey = string; // e.g. "title", "description", "section:sectionId:title", "question:sqId:text", "question:sqId:option:value"

interface PendingChange {
  value: string;
  isDirty: boolean;
  isMachine: boolean;
}

// ─── SUPPORTED LANGUAGES ─────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { code: 'sw', name: 'Swahili' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'am', name: 'Amharic' },
  { code: 'ha', name: 'Hausa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'so', name: 'Somali' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
];

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-ochre-50 text-ochre-500 border-ochre-500/30',
    icon: Clock,
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-sky-50 text-sky-500 border-sky-500/30',
    icon: Send,
  },
  approved: {
    label: 'Approved',
    color: 'bg-grass-50 text-grass-500 border-grass-500/30',
    icon: ThumbsUp,
  },
  published: {
    label: 'Published',
    color: 'bg-coral-50 text-coral-500 border-coral-500/20',
    icon: Globe,
  },
};

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

const SurveyTranslationsPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;

  // ── Core data
  const [survey, setSurvey] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);
  const [translations, setTranslations] = useState<any[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState<any>(null);

  // ── Loading states
  const [loading, setLoading] = useState(true);
  const [autoTranslating, setAutoTranslating] = useState(false);
  const [savingField, setSavingField] = useState<FieldKey | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // ── Review state
  const [translationReview, setTranslationReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ── UI state
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ── Pending changes (field-level dirty tracking)
  const [pendingChanges, setPendingChanges] = useState<Record<FieldKey, PendingChange>>({});
  const saveTimeoutRef = useRef<Record<FieldKey, NodeJS.Timeout>>({});

  // ── Add language form
  const [newLang, setNewLang] = useState({ code: '', name: '', notes: '' });
  const [addingLanguage, setAddingLanguage] = useState(false);

  // ─── DERIVED ────────────────────────────────────────────────────────────────

  const allQuestions = [
    ...(structure?.sections?.flatMap((s: any) => s.questions) ?? []),
    ...(structure?.noSectionQuestions ?? []),
  ];

  const totalFields = (() => {
    if (!structure) return 0;
    let count = 1; // title always required

    // Survey description only if it exists
    if (survey?.description) count++;

    structure.sections?.forEach((s: any) => {
      count += 1; // section title always required
      if (s.description) count++; // section description only if exists

      s.questions?.forEach((q: any) => {
        const questionDoc = q.question || q;
        count += 1; // question text always required

        // description only if the question actually has one
        const hasDesc = q.customDescription || questionDoc?.description;
        if (hasDesc) count++;

        // options only for choice questions
        const opts = q.customOptions?.length ? q.customOptions : (questionDoc?.options ?? []);
        if (['radio', 'checkbox', 'dropdown', 'select'].includes(questionDoc?.type)) {
          count += opts.length;
        }
      });
    });

    structure.noSectionQuestions?.forEach((q: any) => {
      const questionDoc = q.question || q;
      count += 1;

      const hasDesc = q.customDescription || questionDoc?.description;
      if (hasDesc) count++;

      const opts = q.customOptions?.length ? q.customOptions : (questionDoc?.options ?? []);
      if (['radio', 'checkbox', 'dropdown', 'select'].includes(questionDoc?.type)) {
        count += opts.length;
      }
    });

    return count;
  })();

  const translatedFields = (() => {
    if (!currentTranslation) return 0;
    let count = 0;
    if (currentTranslation.title) count++;
    if (currentTranslation.description) count++;
    currentTranslation.translatedSections?.forEach((s: any) => {
      if (s.title) count++;
      if (s.description) count++;
    });
    currentTranslation.translatedQuestions?.forEach((q: any) => {
      if (q.translatedText) count++;
      if (q.translatedDescription) count++;
      q.translatedOptions?.forEach((o: any) => { if (o.label) count++; });
    });
    return count;
  })();

  const completionPct = totalFields > 0 ? Math.round((translatedFields / totalFields) * 100) : 0;

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [surveyRes, structureRes, translationsRes] = await Promise.all([
        getSurvey(surveyId),
        getSurveyStructure(surveyId),
        getSurveyTranslations(surveyId),
      ]);
      setSurvey(surveyRes.data);
      setStructure(structureRes.data);

      const tList = translationsRes.data ?? [];
      setTranslations(tList);

      if (tList.length > 0) {
        const full = await getTranslation(tList[0]._id);
        setCurrentTranslation(full.data);
        setExpandedSections(new Set(structureRes.data?.sections?.map((s: any) => s._id) ?? []));
      }
    } catch (err) {
      toast({ title: 'Failed to load translations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const switchLanguage = async (translationId: string) => {
    try {
      const full = await getTranslation(translationId);
      setCurrentTranslation(full.data);
      setPendingChanges({});
    } catch {
      toast({ title: 'Failed to load translation', variant: 'destructive' });
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!currentTranslation?._id) {
      setTranslationReview(null);
      return;
    }
    setReviewLoading(true);
    setTranslationReview(null);
    getReviewsByModuleItem('survey_translation', currentTranslation._id)
      .then(r => {
        if (r.success && r.data && r.data.length > 0) {
          setTranslationReview(r.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  }, [currentTranslation?._id]);

  // ─── FIELD VALUE HELPERS ─────────────────────────────────────────────────

  const getFieldValue = (key: FieldKey): string => {
    if (pendingChanges[key] !== undefined) return pendingChanges[key].value;
    if (!currentTranslation) return '';

    const [type, id, subtype, optionValue] = key.split(':');

    if (type === 'survey') {
      return subtype === 'title' ? currentTranslation.title ?? '' : currentTranslation.description ?? '';
    }
    if (type === 'section') {
      const ts = currentTranslation.translatedSections?.find((s: any) => s.section === id || s.section?._id === id);
      return subtype === 'title' ? ts?.title ?? '' : ts?.description ?? '';
    }
    if (type === 'question') {
      const tq = currentTranslation.translatedQuestions?.find((q: any) => q.surveyQuestion === id || q.surveyQuestion?._id === id);
      if (subtype === 'text') return tq?.translatedText ?? '';
      if (subtype === 'description') return tq?.translatedDescription ?? '';
      if (subtype === 'option') {
        const opt = tq?.translatedOptions?.find((o: any) => o.value === optionValue);
        return opt?.label ?? '';
      }
    }
    return '';
  };

  const isFieldMachine = (key: FieldKey): boolean => {
    if (pendingChanges[key]?.isDirty) return false;
    return currentTranslation?.translationMethod === 'machine';
  };

  // ─── FIELD CHANGE + AUTO-SAVE ────────────────────────────────────────────

  const handleFieldChange = (key: FieldKey, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: { value, isDirty: true, isMachine: false },
    }));

    // Debounced auto-save (1.5s after last keystroke)
    if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);
    saveTimeoutRef.current[key] = setTimeout(() => saveField(key, value), 1500);
  };

  const saveField = async (key: FieldKey, value: string) => {
    if (!currentTranslation) return;
    setSavingField(key);

    const [type, id, subtype, optionValue] = key.split(':');

    try {
      if (type === 'survey') {
        const updateData = subtype === 'title' ? { title: value } : { description: value };
        await updateTranslation(currentTranslation._id, updateData);
        setCurrentTranslation((prev: any) => ({
          ...prev,
          ...(subtype === 'title' ? { title: value } : { description: value }),
        }));
      }

      if (type === 'section') {
        const existing = currentTranslation.translatedSections?.find(
          (s: any) => s.section === id || s.section?._id === id
        ) ?? {};
        const updateData = subtype === 'title'
          ? { title: value, description: existing.description ?? '' }
          : { title: existing.title ?? '', description: value };
        await updateTranslatedSection(currentTranslation._id, id, updateData);
        setCurrentTranslation((prev: any) => {
          const sections = [...(prev.translatedSections ?? [])];
          const idx = sections.findIndex((s: any) => s.section === id || s.section?._id === id);
          if (idx >= 0) {
            sections[idx] = { ...sections[idx], ...(subtype === 'title' ? { title: value } : { description: value }) };
          } else {
            sections.push({ section: id, ...(subtype === 'title' ? { title: value } : { description: value }) });
          }
          return { ...prev, translatedSections: sections };
        });
      }

      if (type === 'question') {
        const existing = currentTranslation.translatedQuestions?.find(
          (q: any) => q.surveyQuestion === id || q.surveyQuestion?._id === id
        ) ?? {};

        let updateData: any = {
          translatedText: existing.translatedText ?? '',
          translatedDescription: existing.translatedDescription,
          translatedOptions: existing.translatedOptions,
        };

        if (subtype === 'text') updateData.translatedText = value;
        if (subtype === 'description') updateData.translatedDescription = value;
        if (subtype === 'option') {
          const opts = [...(existing.translatedOptions ?? [])];
          const oIdx = opts.findIndex((o: any) => o.value === optionValue);
          if (oIdx >= 0) opts[oIdx] = { ...opts[oIdx], label: value };
          else opts.push({ value: optionValue, label: value });
          updateData.translatedOptions = opts;
        }

        await updateTranslatedQuestion(currentTranslation._id, id, updateData);
        setCurrentTranslation((prev: any) => {
          const questions = [...(prev.translatedQuestions ?? [])];
          const idx = questions.findIndex((q: any) => q.surveyQuestion === id || q.surveyQuestion?._id === id);
          if (idx >= 0) questions[idx] = { ...questions[idx], ...updateData };
          else questions.push({ surveyQuestion: id, ...updateData });
          return { ...prev, translatedQuestions: questions };
        });
      }

      // Clear pending change on success
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {
      toast({ title: 'Failed to save field', variant: 'destructive' });
    } finally {
      setSavingField(null);
    }
  };

  // ─── AUTO TRANSLATE ───────────────────────────────────────────────────────

  const handleAutoTranslate = async (overwriteExisting = false) => {
    if (!currentTranslation) return;
    setAutoTranslating(true);
    try {
      await apiClient.post(`/translations/${currentTranslation._id}/auto-translate`, {
        overwriteExisting,
        sourceLanguage: 'en',
      });
      const refreshed = await getTranslation(currentTranslation._id);
      setCurrentTranslation(refreshed.data);
      setPendingChanges({});
      toast({ title: 'Auto-translation complete', description: 'Review machine-translated content and adjust as needed.' });
    } catch {
      toast({ title: 'Auto-translation failed', description: 'Check your Google Translate API key configuration.', variant: 'destructive' });
    } finally {
      setAutoTranslating(false);
    }
  };

  // ─── WORKFLOW ACTIONS ─────────────────────────────────────────────────────

  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'publish') => {
    if (!currentTranslation) return;
    setWorkflowLoading(true);
    try {
      if (action === 'submit') await submitTranslationForReview(currentTranslation._id);
      if (action === 'approve') await approveTranslation(currentTranslation._id);
      if (action === 'publish') await publishTranslation(currentTranslation._id);
      const refreshed = await getTranslation(currentTranslation._id);
      setCurrentTranslation(refreshed.data);
      const labels = { submit: 'Submitted for review', approve: 'Translation approved', publish: 'Translation published' };
      toast({ title: labels[action] });
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.response?.data?.message, variant: 'destructive' });
    } finally {
      setWorkflowLoading(false);
    }
  };

  // ─── ADD LANGUAGE ─────────────────────────────────────────────────────────

  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.name) return;
    setAddingLanguage(true);
    try {
      const res = await createSurveyTranslation(surveyId, {
        language: newLang.code,
        languageName: newLang.name,
        title: survey?.title ?? '',
        notes: newLang.notes,
        translationMethod: 'human',
      });
      const newTranslation = res.data;
      setTranslations(prev => [...prev, newTranslation]);
      const full = await getTranslation(newTranslation._id);
      setCurrentTranslation(full.data);
      setPendingChanges({});
      setShowAddLanguageModal(false);
      setNewLang({ code: '', name: '', notes: '' });
      toast({ title: `${newLang.name} translation created` });
    } catch (err: any) {
      toast({ title: 'Failed to add language', description: err?.response?.data?.message, variant: 'destructive' });
    } finally {
      setAddingLanguage(false);
    }
  };

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
      <Badge className={`border text-xs flex items-center gap-1 ${cfg.color}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const FieldIndicator = ({ fieldKey }: { fieldKey: FieldKey }) => {
    if (savingField === fieldKey) return <Loader2 className="h-3.5 w-3.5 text-sky-500 animate-spin shrink-0" />;
    if (pendingChanges[fieldKey]?.isDirty) return <div className="h-1.5 w-1.5 rounded-full bg-ochre-500 shrink-0 mt-1" />;
    if (isFieldMachine(fieldKey) && getFieldValue(fieldKey)) return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><Bot className="h-3.5 w-3.5 text-sky-500/60 shrink-0" /></TooltipTrigger>
          <TooltipContent><p className="text-xs">Machine translated — verify before publishing</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    if (getFieldValue(fieldKey)) return <CheckCircle className="h-3.5 w-3.5 text-coral-500 shrink-0" />;
    return <div className="h-3.5 w-3.5 shrink-0" />;
  };

  // Renders a single side-by-side row
  const TranslationRow = ({
  label,
  originalText,
  fieldKey,
  multiline = false,
  placeholder = 'Enter translation...',
  isOption = false,
  infoTooltip,
  }: {
    label?: string;
    originalText: string;
    fieldKey: FieldKey;
    multiline?: boolean;
    placeholder?: string;
    isOption?: boolean;
    infoTooltip?: string;
  }) => {
    const value = getFieldValue(fieldKey);
    const isMachine = isFieldMachine(fieldKey) && !!value && !pendingChanges[fieldKey]?.isDirty;

    return (
      <div className={`grid grid-cols-2 border-b border-concrete-500/20 last:border-0 ${isOption ? 'bg-stratosphere-50/40' : ''}`}>
        {/* Original — left */}
        {showOriginal && (
          <div className="p-4 border-r border-concrete-500/20 bg-stratosphere-50/60">
            {label && <p className="text-xs font-medium text-concrete-900 uppercase tracking-wide mb-1.5">{label}</p>}
            <p className="text-sm text-stratosphere-900 leading-relaxed whitespace-pre-wrap">
              {originalText || <span className="text-concrete-900 italic">No content</span>}
            </p>
          </div>
        )}

        {/* Translation — right */}
        <div className={`p-4 ${!showOriginal ? 'col-span-2' : ''}`}>
          {label && (
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-sky-500 uppercase tracking-wide">{label}</p>
                {infoTooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-concrete-900/50 hover:text-sky-500 cursor-default" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-56 text-xs">
                        {infoTooltip}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <FieldIndicator fieldKey={fieldKey} />
            </div>
          )}
          {!label && (
            <div className="flex justify-end mb-1">
              <FieldIndicator fieldKey={fieldKey} />
            </div>
          )}

          <div className="relative">
            {multiline ? (
              <Textarea
                value={value}
                onChange={e => handleFieldChange(fieldKey, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className={`text-sm resize-none border-concrete-500/30 focus:border-clay-500 focus:ring-clay-500/20 bg-white
                  ${isMachine ? 'bg-sky-50/40 border-sky-500/30' : ''}
                  ${currentTranslation?.status === 'published' ? 'opacity-60 pointer-events-none' : ''}
                `}
              />
            ) : (
              <Input
                value={value}
                onChange={e => handleFieldChange(fieldKey, e.target.value)}
                placeholder={placeholder}
                className={`text-sm border-concrete-500/30 focus:border-clay-500 focus:ring-clay-500/20 bg-white
                  ${isMachine ? 'bg-sky-50/40 border-sky-500/30' : ''}
                  ${currentTranslation?.status === 'published' ? 'opacity-60 pointer-events-none' : ''}
                `}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renders a full question block
  const QuestionBlock = ({ surveyQuestion }: { surveyQuestion: any }) => {
    const questionDoc = surveyQuestion.question || surveyQuestion;
    const sqId = surveyQuestion._id;
    const isChoiceType = ['radio', 'checkbox', 'dropdown', 'select'].includes(questionDoc?.type);
    const options = surveyQuestion.customOptions?.length ? surveyQuestion.customOptions : (questionDoc?.options ?? []);

    return (
      <div className="border border-concrete-500/20 rounded-lg overflow-hidden mb-3">
        {/* Question text */}
        <TranslationRow
          label="Question"
          originalText={surveyQuestion.customText || questionDoc?.text || ''}
          fieldKey={`question:${sqId}:text`}
          multiline
          placeholder="Translate question text..."
        />

        {/* Question description */}
        {(surveyQuestion.customDescription || questionDoc?.description) && (
          <TranslationRow
            originalText={surveyQuestion.customDescription || questionDoc?.description || ''}
            fieldKey={`question:${sqId}:description`}
            placeholder="Translate description..."
          />
        )}

        {/* Options for choice questions */}
        {isChoiceType && options.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-stratosphere-50 border-t border-b border-concrete-500/20">
              <p className="text-xs font-medium text-sky-500 uppercase tracking-wide">Answer Options</p>
            </div>
            {options.map((opt: any, i: number) => (
              <div key={opt.value ?? i} className="grid grid-cols-2 border-b border-concrete-500/10 last:border-0 bg-stratosphere-50/30">
                {showOriginal && (
                  <div className="px-4 py-2.5 border-r border-concrete-500/10 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-concrete-900/40 shrink-0" />
                    <span className="text-sm text-stratosphere-900">{opt.label}</span>
                  </div>
                )}
                <div className={`px-4 py-2 flex items-center gap-2 ${!showOriginal ? 'col-span-2' : ''}`}>
                  <div className="h-4 w-4 rounded-full border border-concrete-500/40 shrink-0" />
                  <div className="flex-1 flex items-center gap-1.5">
                    <Input
                      value={getFieldValue(`question:${sqId}:option:${opt.value}`)}
                      onChange={e => handleFieldChange(`question:${sqId}:option:${opt.value}`, e.target.value)}
                      placeholder={opt.label}
                      className={`text-sm h-8 border-concrete-500/20 focus:border-clay-500 bg-white ${currentTranslation?.status === 'published' ? 'opacity-60 pointer-events-none' : ''}`}
                    />
                    <FieldIndicator fieldKey={`question:${sqId}:option:${opt.value}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── LOADING STATE ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-clay-500 mx-auto mb-3" />
          <p className="text-stratosphere-900 font-medium text-sm">Loading translations...</p>
        </div>
      </div>
    );
  }

  // ─── EMPTY STATE ──────────────────────────────────────────────────────────

  const hasTranslations = translations.length > 0;

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stratosphere-50">

      {/* ── TOP HEADER BAR ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-concrete-500/20 sticky top-0 z-20">
        <div className="px-6 py-4">
          {/* Row 1: Back + title */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
              className="flex items-center gap-1.5 text-sm text-sky-500 hover:text-stratosphere-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {survey?.title ?? 'Survey'}
            </Link>

            <div className="flex items-center gap-2">
              {/* Toggle original panel */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs text-sky-500 hover:text-stratosphere-900"
              >
                {showOriginal ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                {showOriginal ? 'Hide original' : 'Show original'}
              </Button>

              <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/edit`}>
                <Button variant="outline" size="sm" className="border-concrete-500/30 text-sky-500 text-xs">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit Survey
                </Button>
              </Link>
            </div>
          </div>

          {/* Row 2: Language switcher + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Languages className="h-5 w-5 text-clay-500 shrink-0" />
              <h1 className="text-lg font-semibold text-stratosphere-900 mr-2">Translations</h1>

              {/* Language dropdown */}
              {hasTranslations && (
                <Select
                  value={currentTranslation?._id}
                  onValueChange={switchLanguage}
                >
                  <SelectTrigger className="w-52 h-9 text-sm border-concrete-500/30 bg-stratosphere-50">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {translations.map(t => (
                      <SelectItem key={t._id} value={t._id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.languageName}</span>
                          <span className="text-xs text-sky-500 uppercase">{t.language}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Add language */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddLanguageModal(true)}
                className="border-clay-500/30 text-clay-500 hover:bg-clay-50 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Language
              </Button>
            </div>

            {/* Status + workflow actions */}
            {currentTranslation && (
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={currentTranslation.status} />

                {/* Review button — shown once a review exists for this translation */}
                {reviewLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                )}
                {!reviewLoading && translationReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-sky-500/30 text-sky-500 hover:bg-sky-50 text-xs gap-1"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    View Review
                  </Button>
                )}

                {/* Auto translate dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={autoTranslating || currentTranslation.status === 'published'}
                      className="border-sky-500/30 text-sky-500 hover:bg-sky-50 text-xs"
                    >
                      {autoTranslating
                        ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        : <Wand2 className="h-3.5 w-3.5 mr-1" />
                      }
                      Auto-translate
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleAutoTranslate(false)}>
                      <Wand2 className="h-4 w-4 mr-2 text-sky-500" />
                      <div>
                        <p className="text-sm font-medium">Translate missing fields</p>
                        <p className="text-xs text-sky-500">Skip already-translated content</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAutoTranslate(true)}>
                      <RotateCcw className="h-4 w-4 mr-2 text-ochre-500" />
                      <div>
                        <p className="text-sm font-medium">Re-translate everything</p>
                        <p className="text-xs text-sky-500">Overwrites manual edits</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Workflow button */}
                {currentTranslation.status === 'draft' && (
                  <Button
                    size="sm"
                    disabled={workflowLoading || completionPct < 100}
                    onClick={() => handleWorkflowAction('submit')}
                    className="bg-clay-500 hover:bg-clay-600 text-white text-xs"
                  >
                    {workflowLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                    Submit for Review
                  </Button>
                )}
                {currentTranslation.status === 'pending_review' && (
                  <Button
                    size="sm"
                    disabled={workflowLoading}
                    onClick={() => handleWorkflowAction('approve')}
                    className="bg-grass-500 hover:bg-grass-600 text-white text-xs"
                  >
                    {workflowLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5 mr-1" />}
                    Approve
                  </Button>
                )}
                {currentTranslation.status === 'approved' && (
                  <Button
                    size="sm"
                    disabled={workflowLoading}
                    onClick={() => handleWorkflowAction('publish')}
                    className="bg-coral-500 hover:bg-coral-600 text-white text-xs"
                  >
                    {workflowLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Globe className="h-3.5 w-3.5 mr-1" />}
                    Publish
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Progress bar (only when a translation is selected) */}
          {currentTranslation && (
            <div className="mt-3 flex items-center gap-3">
              <Progress value={completionPct} className="h-1.5 flex-1 bg-concrete-500/20" />
              <span className="text-xs text-sky-500 tabular-nums shrink-0">
                {translatedFields} / {totalFields} fields
                <span className="font-semibold text-stratosphere-900 ml-1">({completionPct}%)</span>
              </span>
              {currentTranslation.translationMethod && (
                <Badge variant="outline" className="text-xs border-concrete-500/30 text-sky-500 flex items-center gap-1">
                  {currentTranslation.translationMethod === 'machine' && <Bot className="h-3 w-3" />}
                  {currentTranslation.translationMethod === 'human' && <Pencil className="h-3 w-3" />}
                  {currentTranslation.translationMethod}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Column headers (only when both panels visible) */}
        {currentTranslation && showOriginal && (
          <div className="grid grid-cols-2 border-t border-concrete-500/20 bg-stratosphere-50/80">
            <div className="px-6 py-2 border-r border-concrete-500/20">
              <p className="text-xs font-semibold text-stratosphere-900 uppercase tracking-wider">
                Original (English)
              </p>
            </div>
            <div className="px-6 py-2 flex items-center gap-2">
              <p className="text-xs font-semibold text-stratosphere-900 uppercase tracking-wider">
                {currentTranslation.languageName}
              </p>
              {currentTranslation.status === 'published' && (
                <span className="text-xs text-concrete-900 italic">(read-only — published)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto p-6">

        {/* Empty state */}
        {!hasTranslations && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-clay-100 flex items-center justify-center mb-4">
              <Languages className="h-8 w-8 text-clay-500" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">No translations yet</h2>
            <p className="text-sky-500 mb-6 max-w-sm">
              Add a language to start translating this survey for your community respondents.
            </p>
            <Button
              onClick={() => setShowAddLanguageModal(true)}
              className="bg-clay-500 hover:bg-clay-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Language
            </Button>
          </div>
        )}

        {/* Translation editor */}
        {currentTranslation && structure && (
          <div className="space-y-6">

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-sky-500 bg-white border border-concrete-500/20 rounded-lg px-4 py-2.5">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-sky-500/60" /> Machine translated</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-coral-500" /> Manually confirmed</span>
                <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-ochre-500" /> Unsaved change</span>
                <span className="flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 text-sky-500" /> Saving...</span>
              </div>
            </div>

            {/* Survey title / description block */}
            <div>
              <h3 className="text-xs font-semibold text-stratosphere-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileTextIcon className="h-3.5 w-3.5 text-clay-500" />
                Survey Title &amp; Description
              </h3>
              <div className="border border-concrete-500/20 rounded-lg overflow-hidden bg-white">
                <TranslationRow
                  label="Title"
                  originalText={survey?.title ?? ''}
                  fieldKey="survey:_:title"
                  placeholder="Translate survey title..."
                  infoTooltip="The survey title must be translated manually — auto-translate is not applied to this field."
                />
                <TranslationRow
                  label="Description"
                  originalText={survey?.description ?? ''}
                  fieldKey="survey:_:description"
                  multiline
                  placeholder="Translate survey description..."
                />
              </div>
            </div>

            {/* Sections */}
            {structure.sections?.map((section: any) => {
              const isExpanded = expandedSections.has(section._id);
              return (
                <div key={section._id} className="border border-concrete-500/20 rounded-lg overflow-hidden bg-white">
                  {/* Section header toggle */}
                  <button
                    onClick={() => {
                      const next = new Set(expandedSections);
                      isExpanded ? next.delete(section._id) : next.add(section._id);
                      setExpandedSections(next);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-stratosphere-50 hover:bg-stratosphere-100/50 border-b border-concrete-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`h-4 w-4 text-sky-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className="font-medium text-stratosphere-900 text-sm">{section.title}</span>
                      <Badge variant="outline" className="text-xs border-concrete-500/30 text-sky-500">
                        {section.questions?.length ?? 0} questions
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Section title translation indicator */}
                      <FieldIndicator fieldKey={`section:${section._id}:title`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-concrete-500/10">
                      {/* Section title/desc translation rows */}
                      <TranslationRow
                        label="Section Title"
                        originalText={section.title}
                        fieldKey={`section:${section._id}:title`}
                        placeholder="Translate section title..."
                      />
                      {section.description && (
                        <TranslationRow
                          label="Section Description"
                          originalText={section.description}
                          fieldKey={`section:${section._id}:description`}
                          multiline
                          placeholder="Translate section description..."
                        />
                      )}

                      {/* Questions in section */}
                      <div className="p-4 space-y-0">
                        {section.questions?.map((sq: any) => (
                          <QuestionBlock key={sq._id} surveyQuestion={sq} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* No-section questions */}
            {structure.noSectionQuestions?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-stratosphere-900 uppercase tracking-wider mb-2">
                  Unsectioned Questions
                </h3>
                <div className="bg-white border border-concrete-500/20 rounded-lg overflow-hidden p-4 space-y-0">
                  {structure.noSectionQuestions.map((sq: any) => (
                    <QuestionBlock key={sq._id} surveyQuestion={sq} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── ADD LANGUAGE MODAL ─────────────────────────────────────────────── */}
      <Dialog open={showAddLanguageModal} onOpenChange={setShowAddLanguageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-stratosphere-900 flex items-center gap-2">
              <Languages className="h-5 w-5 text-clay-500" />
              Add Translation Language
            </DialogTitle>
            <DialogDescription className="text-sky-500">
              Choose a language to start translating this survey. You can auto-translate or fill in manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-stratosphere-900 mb-1.5 block">Language</label>
              <Select
                value={newLang.code}
                onValueChange={code => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                  setNewLang(prev => ({ ...prev, code, name: lang?.name ?? '' }));
                }}
              >
                <SelectTrigger className="border-concrete-500/30">
                  <SelectValue placeholder="Select a language..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {SUPPORTED_LANGUAGES
                    .filter(l => !translations.find(t => t.language === l.code))
                    .map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-xs text-sky-500 ml-2 uppercase">{lang.code}</span>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-stratosphere-900 mb-1.5 block">Notes <span className="text-sky-500 font-normal">(optional)</span></label>
              <Textarea
                value={newLang.notes}
                onChange={e => setNewLang(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes for the translator..."
                rows={2}
                className="border-concrete-500/30 focus:border-clay-500 text-sm resize-none"
              />
            </div>

            <div className="bg-sky-50 border border-sky-500/20 rounded-lg p-3">
              <p className="text-xs text-sky-500">
                After creating, use <strong>Auto-translate</strong> to fill all fields with Google Translate, then review and correct manually.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-concrete-500/30"
                onClick={() => setShowAddLanguageModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-clay-500 hover:bg-clay-600 text-white"
                disabled={!newLang.code || addingLanguage}
                onClick={handleAddLanguage}
              >
                {addingLanguage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Translation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Detail Modal */}
      {showReviewModal && translationReview && (
        <ReviewDetailModal
          reviewId={translationReview._id}
          onClose={() => {
            setShowReviewModal(false);
            // Re-fetch to reflect status changes made inside the modal
            if (currentTranslation?._id) {
              getReviewsByModuleItem('survey_translation', currentTranslation._id)
                .then(r => {
                  if (r.success && r.data?.length) setTranslationReview(r.data[0]);
                })
                .catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
};

// Small local icon to avoid import issues
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default SurveyTranslationsPage;