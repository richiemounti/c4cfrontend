// app/admin/sni-surveys/page.tsx
// Staff-only authoring list for the Social Networks Instrument. Lists
// TEMPLATES (isTemplate: true) — the pre-built shapes (Networks of Care, etc.)
// clients activate rather than compose (brief §3). Project-scoped clones
// aren't managed here; that's the activation flow (phase 5).
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getSniSurveys, createSniSurvey, SniSurvey } from '@/lib/api/sni';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-c4c-grey-bg text-black',
  pretest: 'bg-c4c-tint-gold text-black',
  published: 'bg-c4c-tint-sage text-black',
  closed: 'bg-c4c-grey-bg text-black',
  archived: 'bg-c4c-tint-coral text-black',
};

export default function SniSurveysListPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [surveys, setSurveys] = useState<SniSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', rosterCap: 5 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSniSurveys({ isTemplate: true });
      setSurveys(res.data || []);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load SNI surveys', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const res = await createSniSurvey({ ...form, isTemplate: true });
      toast({ title: 'Survey created' });
      setDialogOpen(false);
      router.push(`/admin/sni-surveys/${res.data._id}`);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to create survey', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="text-c4c-petrol" size={28} />
          <div>
            <h1 className="text-2xl font-semibold">Social Networks Instrument</h1>
            <p className="text-sm text-c4c-petrol">Instrument templates — a separate canvas from the standard survey builder.</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="spotlight"><Plus size={16} className="mr-1" /> New Survey</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New SNI survey template</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Networks of Care" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Roster cap</Label>
                <Input type="number" min={1} value={form.rosterCap} onChange={(e) => setForm({ ...form, rosterCap: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating} variant="spotlight">{creating ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-c4c-petrol">Loading...</p>
      ) : surveys.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-c4c-petrol">No SNI survey templates yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <Link key={survey._id} href={`/admin/sni-surveys/${survey._id}`}>
              <Card className="hover:border-c4c-petrol transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <Badge className={STATUS_COLORS[survey.status]}>{survey.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-c4c-petrol">{survey.description}</p>
                  <p className="text-xs text-c4c-petrol mt-2">Roster cap: {survey.rosterCap}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
