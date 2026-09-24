// app/admin/sni-surveys/[id]/page.tsx
// Staff-only authoring builder for one SNI survey. Deliberately simple per
// the brief: "It has to be good enough for Kate and Belinda to work in, not
// polished for external users" (§3, "Who builds surveys").
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Eye, Trash2, Pencil, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  SniSurvey, SniSection, SniQuestion, SniQuestionRole, SniResponseType,
  getSniSurveyStructure, updateSniSurvey,
  createSniSection, archiveSniSection,
  createSniQuestion, updateSniQuestion, archiveSniQuestion,
  exportSniSurveyExcel,
} from '@/lib/api/sni';

const SECTION_SCOPED_ROLES: SniQuestionRole[] = ['name_generator', 'tie_quality', 'standard'];
const RESPONSE_TYPES: SniResponseType[] = ['text', 'textarea', 'number', 'date', 'radio', 'checkbox', 'dropdown', 'scale'];
const OPTION_BASED_TYPES: SniResponseType[] = ['radio', 'checkbox', 'dropdown'];

export default function SniSurveyBuilderPage() {
  const params = useParams();
  const surveyId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [survey, setSurvey] = useState<SniSurvey | null>(null);
  const [sections, setSections] = useState<SniSection[]>([]);
  const [questions, setQuestions] = useState<SniQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '', separatelyAdministered: false });

  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; sectionId: string | null; lockedRole?: SniQuestionRole; lockedEgoAttribute?: boolean; editing?: SniQuestion } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSniSurveyStructure(surveyId);
      setSurvey(res.data.survey);
      setSections(res.data.sections);
      setQuestions(res.data.questions);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load survey', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [surveyId, toast]);

  useEffect(() => { load(); }, [load]);

  const handleSaveSurvey = async () => {
    if (!survey) return;
    setSaving(true);
    try {
      await updateSniSurvey(surveyId, {
        title: survey.title, description: survey.description, status: survey.status,
        rosterCap: survey.rosterCap, consentRequired: survey.consentRequired,
      });
      toast({ title: 'Saved' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error saving survey', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportSniSurveyExcel(surveyId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey?.title || 'sni-survey'}-export.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Export failed', description: error?.response?.data?.error, variant: 'destructive' });
    }
  };

  const handleCreateSection = async () => {
    try {
      await createSniSection(surveyId, sectionForm);
      setSectionDialogOpen(false);
      setSectionForm({ title: '', description: '', separatelyAdministered: false });
      load();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error creating section', variant: 'destructive' });
    }
  };

  const handleArchiveSection = async (id: string) => {
    if (!confirm('Archive this section and all its questions will be orphaned. Continue?')) return;
    await archiveSniSection(surveyId, id);
    load();
  };

  const handleArchiveQuestion = async (id: string) => {
    if (!confirm('Archive this question?')) return;
    await archiveSniQuestion(surveyId, id);
    load();
  };

  if (loading || !survey) {
    return <div className="p-6 text-neutral-500">Loading...</div>;
  }

  const alterAttributeQuestions = questions.filter((q) => q.questionRole === 'alter_attribute');
  const egoAttributeQuestions = questions.filter((q) => q.questionRole === 'standard' && q.isEgoAttribute);
  const questionsForSection = (sectionId: string) => questions.filter((q) => q.section === sectionId).sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <Link href="/admin/sni-surveys" className="inline-flex items-center text-sm text-neutral-500 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to SNI surveys
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{survey.title || 'Untitled survey'}</h1>
        <div className="flex gap-2">
          {!survey.isTemplate && (
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-1" /> Export
            </Button>
          )}
          <Link href={`/admin/sni-surveys/${surveyId}/preview`}>
            <Button variant="outline"><Eye size={16} className="mr-1" /> Preview</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Survey settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={survey.title} onChange={(e) => setSurvey({ ...survey, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={survey.description || ''} onChange={(e) => setSurvey({ ...survey, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={survey.status} onValueChange={(v) => setSurvey({ ...survey, status: v as SniSurvey['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['draft', 'pretest', 'published', 'closed', 'archived'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Roster cap</Label>
              <Input type="number" min={1} value={survey.rosterCap} onChange={(e) => setSurvey({ ...survey, rosterCap: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={survey.consentRequired} onCheckedChange={(v) => setSurvey({ ...survey, consentRequired: v })} />
            <Label>Consent required</Label>
          </div>
          <Button onClick={handleSaveSurvey} disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
        </CardContent>
      </Card>

      {/* Alter attribute questions — survey-scoped, run once per alter ever */}
      <Card className="mb-6 border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Alter attributes</CardTitle>
            <p className="text-xs text-neutral-500">Survey-wide — asked once per named person, regardless of which sub-theme they came up in.</p>
          </div>
          <Button size="sm" onClick={() => setQuestionDialog({ open: true, sectionId: null, lockedRole: 'alter_attribute' })}>
            <Plus size={14} className="mr-1" /> Add attribute
          </Button>
        </CardHeader>
        <CardContent>
          <QuestionList questions={alterAttributeQuestions} onEdit={(q) => setQuestionDialog({ open: true, sectionId: null, lockedRole: 'alter_attribute', editing: q })} onArchive={handleArchiveQuestion} />
        </CardContent>
      </Card>

      {/* Ego attribute questions — ordinary standard questions marked as the
          respondent's own characteristics (brief §11's "ego characteristics"),
          not the roster's data. Still live inside a sub-theme like any other
          standard question — this card is a consolidated view across all
          sub-themes plus a shortcut for authoring a new one, not a separate
          storage location. */}
      <Card className="mb-6 border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Ego attributes</CardTitle>
            <p className="text-xs text-neutral-500">The respondent&apos;s own characteristics (e.g. demographics) — can be marked stable (asked once ever) or time-varying (asked every wave).</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (sections.length === 0) {
                toast({ title: 'Add a sub-theme first', description: 'Ego attributes still need a sub-theme to live in.', variant: 'destructive' });
                return;
              }
              setQuestionDialog({ open: true, sectionId: sections[0]._id, lockedRole: 'standard', lockedEgoAttribute: true });
            }}
          >
            <Plus size={14} className="mr-1" /> Add ego attribute
          </Button>
        </CardHeader>
        <CardContent>
          <QuestionList questions={egoAttributeQuestions} onEdit={(q) => setQuestionDialog({ open: true, sectionId: q.section || null, lockedRole: 'standard', lockedEgoAttribute: true, editing: q })} onArchive={handleArchiveQuestion} />
        </CardContent>
      </Card>

      {/* Sub-themes */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Sub-themes</h2>
        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New sub-theme</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Title</Label><Input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={sectionForm.separatelyAdministered} onCheckedChange={(v) => setSectionForm({ ...sectionForm, separatelyAdministered: v })} />
                <Label>Separately administered (safeguarding split)</Label>
              </div>
            </div>
            <DialogFooter><Button onClick={handleCreateSection}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Button size="sm" onClick={() => setSectionDialogOpen(true)}><Plus size={14} className="mr-1" /> Add sub-theme</Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {section.title}
                  {section.separatelyAdministered && <Badge variant="outline">separately administered</Badge>}
                </CardTitle>
                {section.description && <p className="text-xs text-neutral-500">{section.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setQuestionDialog({ open: true, sectionId: section._id })}>
                  <Plus size={14} className="mr-1" /> Add question
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleArchiveSection(section._id)}><Trash2 size={14} /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionList
                questions={questionsForSection(section._id)}
                onEdit={(q) => setQuestionDialog({ open: true, sectionId: section._id, editing: q })}
                onArchive={handleArchiveQuestion}
              />
            </CardContent>
          </Card>
        ))}
        {sections.length === 0 && <p className="text-neutral-500 text-sm">No sub-themes yet.</p>}
      </div>

      {questionDialog?.open && (
        <QuestionFormDialog
          surveyId={surveyId}
          sectionId={questionDialog.sectionId}
          lockedRole={questionDialog.lockedRole}
          lockedEgoAttribute={questionDialog.lockedEgoAttribute}
          sections={sections}
          editing={questionDialog.editing}
          onClose={() => setQuestionDialog(null)}
          onSaved={() => { setQuestionDialog(null); load(); }}
        />
      )}
    </div>
  );
}

function QuestionList({ questions, onEdit, onArchive }: { questions: SniQuestion[]; onEdit: (q: SniQuestion) => void; onArchive: (id: string) => void }) {
  if (questions.length === 0) return <p className="text-sm text-neutral-400">No questions yet.</p>;
  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <div key={q._id} className="flex items-center justify-between border rounded-md p-2 text-sm">
          <div>
            <span className="font-medium">{q.text}</span>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">{q.questionRole}</Badge>
              <Badge variant="outline" className="text-xs">{q.responseType}</Badge>
              {q.isEgoAttribute && <Badge variant="outline" className="text-xs">ego attribute</Badge>}
              {q.temporality && <Badge variant="outline" className="text-xs">{q.temporality}</Badge>}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(q)}><Pencil size={14} /></Button>
            <Button size="icon" variant="ghost" onClick={() => onArchive(q._id)}><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionFormDialog({
  surveyId, sectionId, lockedRole, lockedEgoAttribute, sections, editing, onClose, onSaved,
}: {
  surveyId: string; sectionId: string | null; lockedRole?: SniQuestionRole; lockedEgoAttribute?: boolean; sections: SniSection[];
  editing?: SniQuestion; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<SniQuestion>>(editing || {
    questionRole: lockedRole || 'standard',
    responseType: lockedRole === 'name_generator' ? 'alter_identifier' : lockedRole === 'alter_attribute' ? 'radio' : 'radio',
    section: sectionId || undefined,
    required: true,
    options: [],
    isEgoAttribute: !!lockedEgoAttribute,
    temporality: (lockedRole === 'alter_attribute' || lockedEgoAttribute) ? 'stable' : undefined,
    alterIdentifierConfig: lockedRole === 'name_generator' ? { maxEntries: 3, fields: [{ key: 'name', label: 'Name', required: true, type: 'text' }, { key: 'facebookUrl', label: 'Facebook URL', required: false, type: 'url' }] } : undefined,
  });

  const role = form.questionRole as SniQuestionRole;
  const isNameGenerator = role === 'name_generator';
  const isOptionBased = OPTION_BASED_TYPES.includes(form.responseType as SniResponseType);
  const showTemporality = role === 'alter_attribute' || (role === 'standard' && !!form.isEgoAttribute);

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const options = [...(form.options || [])];
    options[index] = { ...options[index], [field]: value };
    setForm({ ...form, options });
  };
  const addOption = () => setForm({ ...form, options: [...(form.options || []), { value: '', label: '' }] });
  const removeOption = (index: number) => setForm({ ...form, options: (form.options || []).filter((_, i) => i !== index) });

  const handleSave = async () => {
    if (!form.text?.trim()) {
      toast({ title: 'Question text required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, section: role === 'alter_attribute' ? undefined : form.section };
      if (editing) {
        await updateSniQuestion(surveyId, editing._id, payload);
      } else {
        await createSniQuestion(surveyId, payload);
      }
      onSaved();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error saving question', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? 'Edit question' : 'New question'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {!editing && !lockedRole && (
            <div>
              <Label>Question role</Label>
              <Select value={role} onValueChange={(v) => setForm({ ...form, questionRole: v as SniQuestionRole, responseType: v === 'name_generator' ? 'alter_identifier' : 'radio' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTION_SCOPED_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Question text</Label>
            <Textarea
              value={form.text || ''}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder={role === 'alter_attribute' || role === 'tie_quality' ? 'Use [name] to pipe in the alter\'s name' : ''}
            />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {role === 'standard' && (
            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.isEgoAttribute}
                onCheckedChange={(v) => setForm({ ...form, isEgoAttribute: v, temporality: v ? (form.temporality || 'stable') : undefined })}
              />
              <Label>Ego attribute — the respondent&apos;s own characteristic, not ordinary sub-theme content</Label>
            </div>
          )}

          {showTemporality && (
            <div>
              <Label>Temporality</Label>
              <Select value={form.temporality} onValueChange={(v) => setForm({ ...form, temporality: v as 'stable' | 'time_varying' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable — first wave only</SelectItem>
                  <SelectItem value="time_varying">Time-varying — every wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isNameGenerator ? (
            <div>
              <Label>Max people this question can capture</Label>
              <Input
                type="number" min={1}
                value={form.alterIdentifierConfig?.maxEntries || 3}
                onChange={(e) => setForm({
                  ...form,
                  alterIdentifierConfig: { ...(form.alterIdentifierConfig as any), maxEntries: Number(e.target.value) },
                })}
              />
              <p className="text-xs text-neutral-500 mt-1">Response type is fixed to "alter identifier" for name generators.</p>
            </div>
          ) : (
            <div>
              <Label>Response type</Label>
              <Select value={form.responseType} onValueChange={(v) => setForm({ ...form, responseType: v as SniResponseType, options: OPTION_BASED_TYPES.includes(v as SniResponseType) ? (form.options?.length ? form.options : [{ value: '', label: '' }]) : form.options })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESPONSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {isOptionBased && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-1">
                {(form.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="value" value={opt.value} onChange={(e) => updateOption(i, 'value', e.target.value)} />
                    <Input placeholder="label" value={opt.label} onChange={(e) => updateOption(i, 'label', e.target.value)} />
                    <Button size="icon" variant="ghost" onClick={() => removeOption(i)}><Trash2 size={14} /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addOption}><Plus size={14} className="mr-1" /> Add option</Button>
              </div>
            </div>
          )}

          {form.responseType === 'scale' && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min</Label><Input type="number" value={form.scaleConfig?.min ?? 1} onChange={(e) => setForm({ ...form, scaleConfig: { ...(form.scaleConfig || {}), min: Number(e.target.value) } })} /></div>
              <div><Label>Max</Label><Input type="number" value={form.scaleConfig?.max ?? 5} onChange={(e) => setForm({ ...form, scaleConfig: { ...(form.scaleConfig || {}), max: Number(e.target.value) } })} /></div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={form.required ?? true} onCheckedChange={(v) => setForm({ ...form, required: v })} />
            <Label>Required</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save question'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
