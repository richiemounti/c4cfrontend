// components/sni/SniPreviewRunner.tsx
// Walks a survey response through the roster engine's runtime-generated
// sequence (getNextScreen), one screen at a time — this is what lets Kate and
// Belinda "sanity-check a roster survey" the brief insists they can't do by
// reading a question list (§3). Deliberately NOT a mode:'roster' fork of the
// existing SurveyForm — its linear currentIndex model doesn't fit repeating
// groups (see SNI_BUILD_PLAN.md §5). This reuses none of SurveyForm's
// internals, only the same UI primitives already used for the same purpose.
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  SniQuestion, SniScreen, SniRosterEntry,
  startSniPreview, getNextSniScreen,
  confirmSniPreloadAlter, completeSniPreload,
  submitSniNameGeneratorAnswer, submitSniAlterBatteryAnswers, submitSniStandardAnswer,
} from '@/lib/api/sni';

interface Props {
  surveyId: string;
}

export default function SniPreviewRunner({ surveyId }: Props) {
  const { toast } = useToast();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [participantCode, setParticipantCode] = useState<string | null>(null);
  const [wave, setWave] = useState(1);
  const [waveInput, setWaveInput] = useState('1');
  const [entryCode, setEntryCode] = useState('');
  const [screen, setScreen] = useState<SniScreen | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const refresh = useCallback(async (respId: string) => {
    setLoading(true);
    try {
      const res = await getNextSniScreen(surveyId, respId);
      if (res.data.screen === null) {
        setComplete(true);
        setScreen(null);
      } else {
        setScreen(res.data.screen);
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to load next screen', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [surveyId, toast]);

  const handleStart = async () => {
    setLoading(true);
    setComplete(false);
    try {
      const parsedWave = Number(waveInput) || 1;
      const res = await startSniPreview(surveyId, parsedWave, parsedWave > 1 ? entryCode : undefined);
      setResponseId(res.data.response._id);
      setParticipantCode(res.data.participantCode);
      setWave(parsedWave);
      await refresh(res.data.response._id);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error starting preview', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!responseId) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Start a preview walkthrough</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Wave</Label>
            <Input type="number" min={1} value={waveInput} onChange={(e) => setWaveInput(e.target.value)} className="w-24" />
          </div>
          {Number(waveInput) > 1 && (
            <div>
              <Label>Participant code (from an earlier preview wave)</Label>
              <Input value={entryCode} onChange={(e) => setEntryCode(e.target.value)} placeholder="e.g. AB3CD9F" />
            </div>
          )}
          <Button onClick={handleStart} disabled={loading}>{loading ? 'Starting...' : 'Start preview'}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-neutral-500 flex gap-4">
        <span>Wave {wave}</span>
        <span>Participant code: <span className="font-mono">{participantCode}</span> (write this down to preview wave {wave + 1})</span>
      </div>

      {loading && <p className="text-neutral-500">Loading...</p>}

      {complete && !loading && (
        <Card><CardContent className="p-8 text-center text-green-700">Survey complete — every section resolved.</CardContent></Card>
      )}

      {!loading && screen && (
        <ScreenRenderer
          surveyId={surveyId}
          responseId={responseId}
          wave={wave}
          screen={screen}
          onAdvance={() => refresh(responseId)}
        />
      )}
    </div>
  );
}

function ScreenRenderer({ surveyId, responseId, wave, screen, onAdvance }: {
  surveyId: string; responseId: string; wave: number; screen: SniScreen; onAdvance: () => void;
}) {
  switch (screen.type) {
    case 'preload_confirmation':
      return <PreloadScreen surveyId={surveyId} responseId={responseId} wave={wave} alters={screen.alters} onAdvance={onAdvance} />;
    case 'name_generator_question':
      return <NameGeneratorScreen surveyId={surveyId} responseId={responseId} question={screen.question} roster={screen.roster} onAdvance={onAdvance} />;
    case 'standard_question':
      return <StandardQuestionScreen surveyId={surveyId} responseId={responseId} question={screen.question} onAdvance={onAdvance} />;
    case 'alter_attribute_battery':
    case 'tie_quality_battery':
      return <BatteryScreen surveyId={surveyId} responseId={responseId} wave={wave} alter={screen.alter} questions={screen.questions} label={screen.type === 'alter_attribute_battery' ? 'Alter attributes' : 'Tie quality'} onAdvance={onAdvance} />;
    default:
      return null;
  }
}

function PreloadScreen({ surveyId, responseId, wave, alters, onAdvance }: {
  surveyId: string; responseId: string; wave: number; alters: SniRosterEntry[]; onAdvance: () => void;
}) {
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (alterId: string, stillRelevant: boolean) => {
    await confirmSniPreloadAlter(surveyId, responseId, alterId, wave, stillRelevant);
    setAnswered({ ...answered, [alterId]: true });
  };

  const allAnswered = alters.every((a) => answered[a.id]);

  const finishPreload = async () => {
    setSubmitting(true);
    try {
      await completeSniPreload(surveyId, responseId);
      onAdvance();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Is this person still someone you turn to?</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {alters.length === 0 && <p className="text-sm text-neutral-500">No prior-wave roster to confirm.</p>}
        {alters.map((alter) => (
          <div key={alter.id} className="flex items-center justify-between border rounded-md p-2">
            <span>{alter.name}</span>
            {answered[alter.id] ? (
              <span className="text-xs text-green-600">confirmed</span>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => confirm(alter.id, true)}>Yes</Button>
                <Button size="sm" variant="outline" onClick={() => confirm(alter.id, false)}>No</Button>
              </div>
            )}
          </div>
        ))}
        <Button className="mt-2" disabled={!allAnswered || submitting} onClick={finishPreload}>
          {submitting ? 'Continuing...' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}

function NameGeneratorScreen({ surveyId, responseId, question, roster, onAdvance }: {
  surveyId: string; responseId: string; question: SniQuestion; roster: SniRosterEntry[]; onAdvance: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [newPeople, setNewPeople] = useState<Array<{ name: string; facebookUrl: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const maxEntries = question.alterIdentifierConfig?.maxEntries || 3;

  const toggleSelected = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const addPersonRow = () => {
    if (newPeople.length >= maxEntries) return;
    setNewPeople([...newPeople, { name: '', facebookUrl: '' }]);
  };
  const updatePersonRow = (i: number, field: 'name' | 'facebookUrl', value: string) => {
    const copy = [...newPeople];
    copy[i] = { ...copy[i], [field]: value };
    setNewPeople(copy);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const valid = newPeople.filter((p) => p.name.trim());
      await submitSniNameGeneratorAnswer(
        surveyId, responseId, question._id, selected,
        valid.map((p) => ({ name: p.name, facebookUrl: p.facebookUrl || undefined }))
      );
      onAdvance();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{question.text}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {roster.length > 0 && (
          <div>
            <Label>Select from people already named</Label>
            <div className="space-y-2 mt-1">
              {roster.map((alter) => (
                <div key={alter.id} className="flex items-center gap-2">
                  <Checkbox checked={selected.includes(alter.id)} onCheckedChange={() => toggleSelected(alter.id)} />
                  <span>{alter.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Add someone new</Label>
          <div className="space-y-2 mt-1">
            {newPeople.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Name" value={p.name} onChange={(e) => updatePersonRow(i, 'name', e.target.value)} />
                <Input placeholder="Facebook URL (optional)" value={p.facebookUrl} onChange={(e) => updatePersonRow(i, 'facebookUrl', e.target.value)} />
              </div>
            ))}
            {newPeople.length < maxEntries && (
              <Button size="sm" variant="outline" onClick={addPersonRow}>+ Add person</Button>
            )}
          </div>
        </div>

        <Button onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting...' : (selected.length === 0 && newPeople.filter((p) => p.name.trim()).length === 0) ? 'No one — continue' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}

function QuestionInput({ question, value, onChange }: { question: SniQuestion; value: any; onChange: (v: any) => void }) {
  switch (question.responseType) {
    case 'radio':
      return (
        <RadioGroup value={value || ''} onValueChange={onChange}>
          {(question.options || []).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`${question._id}-${opt.value}`} />
              <Label htmlFor={`${question._id}-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'dropdown':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {(question.options || []).map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    case 'checkbox': {
      const selectedValues: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {(question.options || []).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                checked={selectedValues.includes(opt.value)}
                onCheckedChange={(checked) => onChange(checked ? [...selectedValues, opt.value] : selectedValues.filter((v) => v !== opt.value))}
              />
              <Label>{opt.label}</Label>
            </div>
          ))}
        </div>
      );
    }
    case 'number':
    case 'scale':
      return <Input type="number" min={question.scaleConfig?.min} max={question.scaleConfig?.max} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />;
    case 'textarea':
      return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <Input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

function StandardQuestionScreen({ surveyId, responseId, question, onAdvance }: {
  surveyId: string; responseId: string; question: SniQuestion; onAdvance: () => void;
}) {
  const { toast } = useToast();
  const [value, setValue] = useState<any>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitSniStandardAnswer(surveyId, responseId, question._id, value);
      onAdvance();
    } catch (error: any) {
      toast({ title: 'Invalid answer', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{question.text}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <QuestionInput question={question} value={value} onChange={setValue} />
        <Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Continue'}</Button>
      </CardContent>
    </Card>
  );
}

function BatteryScreen({ surveyId, responseId, wave, alter, questions, label, onAdvance }: {
  surveyId: string; responseId: string; wave: number; alter: SniRosterEntry; questions: SniQuestion[]; label: string; onAdvance: () => void;
}) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitSniAlterBatteryAnswers(
        surveyId, responseId, alter.id, wave,
        questions.map((q) => ({ questionId: q._id, answer: answers[q._id] }))
      );
      onAdvance();
    } catch (error: any) {
      toast({ title: 'Invalid answer', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{label} — {alter.name}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q) => (
          <div key={q._id}>
            <Label className="mb-2 block">{q.text}</Label>
            <QuestionInput question={q} value={answers[q._id]} onChange={(v) => setAnswers({ ...answers, [q._id]: v })} />
          </div>
        ))}
        <Button onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Continue'}</Button>
      </CardContent>
    </Card>
  );
}
