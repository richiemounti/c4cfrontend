// components/forms/ActionForm.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader, X, HelpCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAvailableSubThemesForActions } from '@/lib/api/theoryOfChange';
import { fetchAllThemes } from '@/lib/api/theme';
import InstructionalPanel from '@/components/InstructionalPanel';
import { CreateActionData } from '@/types';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionStatus    = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
type ActionPriority  = 'low' | 'medium' | 'high' | 'critical';
type RepeatCycle     = 'monthly' | 'quarterly' | 'yearly' | 'no_repeat';

interface ActionFormData {
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  stakeholderGroupId: string;
  themeId: string;          // single-select in the UI, sent as themeIds:[value] to API
  subThemeIds: string[];
  action: string;
  responsibility?: {
    name: string;
    role?: string;
    email?: string;
    phone?: string;
  };
  timeframe?: {
    startDate?: string;     // stored as ISO string in HTML input
    endDate?: string;
  };
  repeatCycle: RepeatCycle;
  status: ActionStatus;
  priority: ActionPriority;
  notes?: string;
}

interface Theme {
  _id: string;
  name: string;
  description?: string;
}

interface SubTheme {
  _id: string;
  name: string;
  description?: string;
  theme: { _id: string; name: string };
  indicatorTags?:   Array<{ _id: string; name: string }>;
  sdgTags?:         Array<{ _id: string; code: string; name: string }>;
  resilienceTags?:  Array<{ _id: string; code: string; name: string }>;
  esgTags?:         Array<{ _id: string; code: string; name: string; type: string }>;
  standardTags?:    Array<{ _id: string; code: string; name: string; issuingBody: string }>;
}

interface SubThemesByTheme {
  theme: Theme;
  subThemes: SubTheme[];
}

interface ActionFormProps {
  // Required
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  stakeholderGroups: any[];

  // Optional — populated when editing an existing action
  initialData?: {
    _id?: string;
    stakeholderGroup: { _id: string; name: string };
    themes: Theme[];
    subThemes: SubTheme[];
    action: string;
    responsibility?: {
      name?: string;
      role?: string;
      email?: string;
      phone?: string;
    };
    timeframe?: {
      startDate?: string;
      endDate?: string;
    };
    repeatCycle?: RepeatCycle;
    status?: ActionStatus;
    priority?: ActionPriority;
    notes?: string;
  };

  // Submission
  onSubmit: (data: CreateActionData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ActionStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  on_hold:     'On Hold',
  cancelled:   'Cancelled',
};

const PRIORITY_LABELS: Record<ActionPriority, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

const REPEAT_CYCLE_LABELS: Record<RepeatCycle, string> = {
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  yearly:    'Yearly',
  no_repeat: 'No Repeat',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionForm({
  projectId,
  projectSiteId,
  stageId,
  stakeholderGroups,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Action',
  title = 'Action Details',
}: ActionFormProps) {
  const { toast } = useToast();

  const [themes, setThemes]                 = useState<Theme[]>([]);
  const [availableSubThemes, setAvailableSubThemes] = useState<SubTheme[]>([]);
  const [subThemesByTheme, setSubThemesByTheme]     = useState<SubThemesByTheme[]>([]);
  const [selectedTheme, setSelectedTheme]           = useState<string>('');
  const [selectedSubThemes, setSelectedSubThemes]   = useState<string[]>([]);
  const [loadingSubThemes, setLoadingSubThemes]     = useState(false);
  const [loading, setLoading]               = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [clickedTheme, setClickedTheme]     = useState<string | null>(null);
  const [clickedSubTheme, setClickedSubTheme] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ActionFormData>({
      defaultValues: {
        repeatCycle: 'no_repeat',
        status:      'not_started',
        priority:    'medium',
      },
    });

  const selectedStakeholderId = watch('stakeholderGroupId');

  // ── Close info modals when clicking outside ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setClickedTheme(null);
        setClickedSubTheme(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Initialise form (themes + edit data) ────────────────────────────────
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        setValue('projectId', projectId);
        setValue('stageId', stageId);
        if (projectSiteId) setValue('projectSiteId', projectSiteId);

        // Load Stage 1 - Output and Both themes, excluding Demographics
        const [stage1Themes, bothThemes] = await Promise.all([
          fetchAllThemes({ theoryOfChangeStage: 'Stage 1 - Output', status: 'published' }),
          fetchAllThemes({ theoryOfChangeStage: 'Both', status: 'published' }),
        ]);
        const merged = [...stage1Themes, ...bothThemes];
        const seen = new Set<string>();
        const filteredThemes = merged.filter((t: Theme) => {
          if (seen.has(t._id) || t.name.toLowerCase() === 'demographics') return false;
          seen.add(t._id);
          return true;
        });
        setThemes(filteredThemes);

        if (initialData) {
          setValue('stakeholderGroupId', initialData.stakeholderGroup._id);
          setValue('action', initialData.action);
          setValue('notes', initialData.notes || '');
          setValue('repeatCycle', initialData.repeatCycle ?? 'no_repeat');
          setValue('status',      initialData.status      ?? 'not_started');
          setValue('priority',    initialData.priority    ?? 'medium');

          if (initialData.responsibility) {
            setValue('responsibility.name',  initialData.responsibility.name  || '');
            setValue('responsibility.role',  initialData.responsibility.role  || '');
            setValue('responsibility.email', initialData.responsibility.email || '');
            setValue('responsibility.phone', initialData.responsibility.phone || '');
          }

          if (initialData.timeframe) {
            if (initialData.timeframe.startDate)
              setValue('timeframe.startDate', initialData.timeframe.startDate.substring(0, 10));
            if (initialData.timeframe.endDate)
              setValue('timeframe.endDate', initialData.timeframe.endDate.substring(0, 10));
          }

          const themeId    = initialData.themes[0]?._id;
          const subThemeIds = initialData.subThemes.map(st => st._id);
          if (themeId) { setSelectedTheme(themeId); setValue('themeId', themeId); }
          setSelectedSubThemes(subThemeIds);
          setValue('subThemeIds', subThemeIds);
        }
      } catch (err) {
        console.error('Error initialising form:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeForm();
  }, [projectId, stageId, projectSiteId, initialData, setValue]);

  // ── Fetch subthemes when theme changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedTheme) {
      setAvailableSubThemes([]);
      setSubThemesByTheme([]);
      setSelectedSubThemes([]);
      setValue('subThemeIds', []);
      return;
    }
    const fetchSubThemes = async () => {
      try {
        setLoadingSubThemes(true);
        const response = await getAvailableSubThemesForActions([selectedTheme]);
        if (response.data.success) {
          setAvailableSubThemes(response.data.data.availableSubThemes);
          setSubThemesByTheme(response.data.data.subThemesByTheme);
        }
      } catch (err) {
        console.error('Error fetching subthemes:', err);
        setAvailableSubThemes([]);
        setSubThemesByTheme([]);
      } finally {
        setLoadingSubThemes(false);
      }
    };
    fetchSubThemes();
  }, [selectedTheme, setValue]);

  // Keep hidden form fields in sync
  useEffect(() => { setValue('themeId', selectedTheme); }, [selectedTheme, setValue]);
  useEffect(() => { setValue('subThemeIds', selectedSubThemes); }, [selectedSubThemes, setValue]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const handleSubThemeToggle = (id: string) => {
    setSelectedSubThemes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getSelectedThemeName  = () => themes.find(t => t._id === selectedTheme);
  const getSelectedSubThemeNames = () => availableSubThemes.filter(st => selectedSubThemes.includes(st._id));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleFormSubmit: SubmitHandler<ActionFormData> = async (data) => {
    setSubmitAttempted(true);

    if (!data.stakeholderGroupId) {
      toast({ title: 'Missing Stakeholder Group', description: 'Please select a stakeholder group before saving.', variant: 'destructive' });
      return;
    }
    if (!selectedTheme) {
      toast({ title: 'Missing Theme', description: 'Please select a theme before saving.', variant: 'destructive' });
      return;
    }
    if (selectedSubThemes.length === 0) {
      toast({ title: 'Missing SubTheme', description: 'Please select at least one subtheme before saving.', variant: 'destructive' });
      return;
    }

    const actionData: CreateActionData = {
      ...data,
      projectSiteId,
      themeIds:    [selectedTheme],
      subThemeIds: selectedSubThemes,
      timeframe: data.timeframe
        ? {
            startDate: data.timeframe.startDate
              ? new Date(data.timeframe.startDate).toISOString()
              : undefined,
            endDate: data.timeframe.endDate
              ? new Date(data.timeframe.endDate).toISOString()
              : undefined,
          }
        : undefined,
    };
    await onSubmit(actionData);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere" />
        <p className="text-stratosphere font-medium ml-3">Loading form...</p>
      </div>
    );
  }

  return (
    <Card className="bg-white border border-sky max-w-4xl">
      <CardHeader>
        <CardTitle className="text-stratosphere">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Hidden fields */}
          <input type="hidden" {...register('projectId')} />
          <input type="hidden" {...register('stageId')} />
          <input type="hidden" {...register('themeId')} />

          {/* ── Stakeholder Group ─────────────────────────────────────── */}
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Stakeholder Group"
              variant="compact"
              texts={[{
                content: 'Choose the stakeholder group whose actions you are planning. You will complete a workplan for each group separately.',
                type: 'info',
              }]}
            />
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Stakeholder Group</label>
              <Select
                defaultValue={initialData?.stakeholderGroup._id}
                onValueChange={(v) => setValue('stakeholderGroupId', v)}
                disabled={!!initialData}
              >
                <SelectTrigger className={`border-sky text-stratosphere focus:border-stratosphere focus:ring-stratosphere ${submitAttempted && !selectedStakeholderId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select stakeholder group" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sky">
                  {stakeholderGroups.length > 0 ? (
                    stakeholderGroups.map(g => (
                      <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No stakeholder groups available</div>
                  )}
                </SelectContent>
              </Select>
              {submitAttempted && !selectedStakeholderId && (
                <p className="text-sm text-red-500">Please select a stakeholder group</p>
              )}
            </div>
          </div>

          {/* ── Theme ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Domain of Action"
              variant="compact"
              texts={[{
                content: 'Choose the domain where this stakeholder must take action to meet certification standards and contribute to verified emissions reductions (VERs).',
                type: 'info',
              }]}
            />
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Theme</label>
              <p className="text-sm text-gray-600">Select the theme that applies to this action</p>

              {/* Selected badge */}
              {selectedTheme && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getSelectedThemeName()?.name}
                    <button type="button" onClick={() => { setSelectedTheme(''); setSelectedSubThemes([]); }}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </Badge>
                  {getSelectedThemeName()?.description && (
                    <button type="button" onClick={() => setClickedTheme(clickedTheme === selectedTheme ? null : selectedTheme)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                      <HelpCircle className={`h-4 w-4 transition-colors ${clickedTheme === selectedTheme ? 'text-stratosphere' : 'text-gray-400'}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Dropdown */}
              {!selectedTheme && (
                <Select
                  value={selectedTheme}
                  onValueChange={(v) => { setSelectedTheme(v); setSelectedSubThemes([]); }}
                  disabled={!selectedStakeholderId}
                >
                  <SelectTrigger className="border-sky text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-sky">
                    {themes.map(t => (
                      <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {!selectedTheme && (
                <p className="text-sm text-red-500">Please select a theme</p>
              )}
            </div>
          </div>

          {/* ── SubThemes ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Key Sub-Themes"
              variant="compact"
              texts={[{
                content: 'Refine your focus by selecting the specific sub-themes that describe what must happen within this domain.',
                type: 'info',
              }]}
            />
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">SubThemes</label>
              <p className="text-sm text-gray-600">
                Select specific sub-themes within your chosen theme
                {!selectedTheme && ' (select theme first)'}
              </p>

              {loadingSubThemes && (
                <div className="flex items-center justify-center p-4">
                  <Loader className="animate-spin mr-2" size={16} />
                  <span className="text-sm text-gray-600">Loading subthemes...</span>
                </div>
              )}

              {selectedSubThemes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                  {getSelectedSubThemeNames().map(st => (
                    <div key={st._id} className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {st.name}
                        <button type="button" onClick={() => handleSubThemeToggle(st._id)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </Badge>
                      {st.description && (
                        <button type="button" onClick={() => setClickedSubTheme(clickedSubTheme === st._id ? null : st._id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <HelpCircle className={`h-3 w-3 transition-colors ${clickedSubTheme === st._id ? 'text-stratosphere' : 'text-gray-400'}`} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {subThemesByTheme.length > 0 && !loadingSubThemes && (
                <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {subThemesByTheme.map(group => (
                    <div key={group.theme._id} className="space-y-2">
                      <h4 className="font-medium text-sm text-stratosphere border-b pb-1">{group.theme.name}</h4>
                      <div className="grid grid-cols-1 gap-2 pl-2">
                        {group.subThemes.map(st => (
                          <div key={st._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subtheme-${st._id}`}
                              checked={selectedSubThemes.includes(st._id)}
                              onCheckedChange={() => handleSubThemeToggle(st._id)}
                            />
                            <label htmlFor={`subtheme-${st._id}`}
                              className="text-sm leading-none cursor-pointer flex-1">
                              {st.name}
                            </label>
                            {st.description && (
                              <button type="button" onClick={() => setClickedSubTheme(clickedSubTheme === st._id ? null : st._id)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <HelpCircle className={`h-4 w-4 transition-colors ${clickedSubTheme === st._id ? 'text-stratosphere' : 'text-gray-400'}`} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTheme && selectedSubThemes.length === 0 && !loadingSubThemes && (
                <p className="text-sm text-red-500">Please select at least one subtheme</p>
              )}
            </div>
          </div>

          {/* ── Action Text ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <InstructionalPanel
              title="Define Actions and Responsibilities"
              variant="compact"
              texts={[{
                content: 'For each theme selected, define the specific actions required, assign responsibility, and set a timeframe for completion.',
                type: 'info',
              }]}
            />
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Action</label>
              <Textarea
                {...register('action', { required: 'Action is required' })}
                placeholder="Describe the specific action to be taken"
                rows={3}
                className="border-sky focus:border-stratosphere focus:ring-stratosphere"
              />
              {errors.action && <p className="text-sm text-red-500">{errors.action.message}</p>}
            </div>
          </div>

          {/* ── Status · Priority · Repeat Cycle ─────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-stratosphere">Status</label>
              <p className="text-xs text-gray-500">Current progress of this action</p>
              <Select
                defaultValue={initialData?.status ?? 'not_started'}
                onValueChange={(v) => setValue('status', v as ActionStatus)}
              >
                <SelectTrigger className="border-sky text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sky">
                  {(Object.entries(STATUS_LABELS) as [ActionStatus, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-stratosphere">Priority</label>
              <p className="text-xs text-gray-500">Urgency level for this action</p>
              <Select
                defaultValue={initialData?.priority ?? 'medium'}
                onValueChange={(v) => setValue('priority', v as ActionPriority)}
              >
                <SelectTrigger className="border-sky text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sky">
                  {(Object.entries(PRIORITY_LABELS) as [ActionPriority, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Repeat Cycle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-stratosphere">Repeat Cycle</label>
              <p className="text-xs text-gray-500">How often to revisit this action</p>
              <Select
                defaultValue={initialData?.repeatCycle ?? 'no_repeat'}
                onValueChange={(v) => setValue('repeatCycle', v as RepeatCycle)}
              >
                <SelectTrigger className="border-sky text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
                  <SelectValue placeholder="Select repeat cycle" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sky">
                  {(Object.entries(REPEAT_CYCLE_LABELS) as [RepeatCycle, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Responsible Person ────────────────────────────────────── */}
          <div className="space-y-4">
            <InstructionalPanel
              variant="compact"
              links={[{
                href: '/support/responsibility',
                label: 'How do I assign responsibility if multiple people are involved?',
                description: 'Assign the lead person responsible; you can add more details in the notes if needed.',
                icon: <span className="text-sm">👥</span>,
              }]}
            />
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Responsible Person</label>
              <Input
                {...register('responsibility.name')}
                placeholder="Name of responsible person"
                className="border-sky focus:border-stratosphere focus:ring-stratosphere"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Role</label>
              <Input {...register('responsibility.role')} placeholder="Role"
                className="border-sky focus:border-stratosphere focus:ring-stratosphere" />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">Email</label>
              <Input {...register('responsibility.email')} placeholder="Email" type="email"
                className="border-sky focus:border-stratosphere focus:ring-stratosphere" />
            </div>
          </div>

          {/* ── Timeframe ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('timeframe.startDate', { required: 'Start date is required' })}
                className="border-sky focus:border-stratosphere focus:ring-stratosphere"
              />
              {errors.timeframe?.startDate && (
                <p className="text-sm text-red-500">{errors.timeframe.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="font-medium text-stratosphere">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('timeframe.endDate', { required: 'End date is required' })}
                className="border-sky focus:border-stratosphere focus:ring-stratosphere"
              />
              {errors.timeframe?.endDate && (
                <p className="text-sm text-red-500">{errors.timeframe.endDate.message}</p>
              )}
            </div>
          </div>

          {/* ── Notes ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="font-medium text-stratosphere">Notes</label>
            <Textarea
              {...register('notes')}
              placeholder="Additional notes about this action"
              rows={3}
              className="border-sky focus:border-stratosphere focus:ring-stratosphere"
            />
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-stratosphere hover:bg-stratosphere-900 text-white"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>

        {/* ── Theme info modal ──────────────────────────────────────── */}
        {clickedTheme && (
          <div ref={tooltipRef}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setClickedTheme(null)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="bg-stratosphere text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{themes.find(t => t._id === clickedTheme)?.name}</h3>
                <button onClick={() => setClickedTheme(null)} className="text-white hover:text-gray-200"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {themes.find(t => t._id === clickedTheme)?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SubTheme info modal ───────────────────────────────────── */}
        {clickedSubTheme && (() => {
          const st = availableSubThemes.find(s => s._id === clickedSubTheme);
          const hasTags = st && (
            st.indicatorTags?.length || st.sdgTags?.length ||
            st.resilienceTags?.length || st.esgTags?.length || st.standardTags?.length
          );
          return (
            <div ref={tooltipRef}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setClickedSubTheme(null)}>
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="bg-stratosphere text-white p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{st?.name}</h3>
                  <button onClick={() => setClickedSubTheme(null)} className="text-white hover:text-gray-200"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">{st?.description}</p>
                  {hasTags && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold text-stratosphere mb-3">Associated Tags</h4>
                      <div className="space-y-3">
                        {st?.indicatorTags?.length ? (
                          <div>
                            <label className="text-sm text-gray-600 font-medium">Indicators:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {st.indicatorTags.map(t => (
                                <span key={t._id} className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-800 font-medium">{t.name}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {st?.sdgTags?.length ? (
                          <div>
                            <label className="text-sm text-gray-600 font-medium">SDGs:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {st.sdgTags.map(t => (
                                <span key={t._id} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 font-medium">{t.name}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {st?.resilienceTags?.length ? (
                          <div>
                            <label className="text-sm text-gray-600 font-medium">Resilience:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {st.resilienceTags.map(t => (
                                <span key={t._id} className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs text-green-800 font-medium">{t.name}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {st?.esgTags?.length ? (
                          <div>
                            <label className="text-sm text-gray-600 font-medium">ESG:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {st.esgTags.map(t => (
                                <span key={t._id} className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800 font-medium">{t.name}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {st?.standardTags?.length ? (
                          <div>
                            <label className="text-sm text-gray-600 font-medium">Standards:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {st.standardTags.map(t => (
                                <span key={t._id} className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-800 font-medium">{t.issuingBody}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}