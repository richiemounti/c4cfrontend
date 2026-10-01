// app/dashboard/project/[id]/sni/page.tsx
// Client-facing SNI activation surface — the brief's own client journey
// (§3): "create a project -> select the Social Networks Instrument -> pay ->
// activate a pre-built survey -> preview it -> deploy to the mobile app."
// Staff author survey CONTENT elsewhere (/admin/sni-surveys); this page only
// ever lets a project manager choose WHICH pre-built survey to run and
// toggle it published/closed — publishing here is what makes a survey appear
// on the mobile app (phase 7 filters on status:'published').
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Rocket, PauseCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProject } from '@/lib/api/project';
import { getSniAccessGate } from '@/lib/api/subscription';
import {
  getSniTemplates, getSniSurveysForProject, cloneSniSurveyForProject,
  publishSniSurvey, closeSniSurvey, SniSurvey,
} from '@/lib/api/sni';
import type { SniAccessGate } from '@/types/subscription';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PageParams { id: string; }

const STATUS_LABELS: Record<string, string> = {
  draft: 'Not yet published', pretest: 'In pretest', published: 'Published — visible on mobile',
  closed: 'Closed', archived: 'Archived',
};

export default function SniProjectPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const projectId = params.id;

  const [projectName, setProjectName] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [gate, setGate] = useState<SniAccessGate | null>(null);
  const [templates, setTemplates] = useState<SniSurvey[]>([]);
  const [projectSurveys, setProjectSurveys] = useState<SniSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const projectRes = await getProject(projectId);
      const project = projectRes.data;
      setProjectName(project.name);
      const orgId = typeof project.organization === 'object' ? project.organization._id : project.organization;
      setOrganizationId(orgId);

      const [gateRes, templatesRes, surveysRes] = await Promise.all([
        getSniAccessGate(orgId),
        getSniTemplates(),
        getSniSurveysForProject(projectId),
      ]);
      setGate(gateRes.data);
      setTemplates(templatesRes.data);
      setProjectSurveys(surveysRes.data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error loading Social Networks Instrument', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/account/login'); return; }
    if (!authLoading) load();
  }, [authLoading, isAuthenticated, router, load]);

  const handleActivate = async (templateId: string) => {
    setBusyId(templateId);
    try {
      await cloneSniSurveyForProject(templateId, projectId);
      toast({ title: 'Activated', description: 'Preview it, then publish when ready.' });
      await load();
    } catch (error: any) {
      const status = error?.response?.status;
      toast({
        title: status === 402 ? 'Subscription required' : 'Activation failed',
        description: error?.response?.data?.error,
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = async (id: string) => {
    setBusyId(id);
    try {
      await publishSniSurvey(id);
      toast({ title: 'Published', description: 'This survey is now visible on the mobile app.' });
      await load();
    } catch (error: any) {
      toast({ title: 'Publish failed', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleClose = async (id: string) => {
    setBusyId(id);
    try {
      await closeSniSurvey(id);
      toast({ title: 'Closed', description: 'No longer visible on the mobile app.' });
      await load();
    } catch (error: any) {
      toast({ title: 'Close failed', description: error?.response?.data?.error, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <div className="flex-1 flex justify-center items-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      <ProjectSidebar projectId={projectId} projectName={projectName} />

      <div className="flex-1">
        <div className="bg-white px-8 py-6 shadow-sm">
          <Link href={`/dashboard/project/${projectId}`} className="inline-flex items-center text-c4c-petrol hover:text-black text-sm">
            <ArrowLeft size={18} className="mr-2" /> Back to project
          </Link>
          <h1 className="text-xl font-medium mt-4">Social Networks Instrument</h1>
          <p className="text-sm text-c4c-petrol mt-1">Measures who a person relies on, what those relationships give them, and how that changes over time.</p>
          {organizationId && <HeaderHelpActions organizationId={organizationId} />}
        </div>

        <div className="max-w-3xl mx-auto p-8 space-y-8">
          {gate && !gate.isEntitled && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <Lock size={20} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">This is a paid add-on</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Your organization&apos;s subscription doesn&apos;t currently include the Social Networks Instrument.
                    {' '}<Link href={`/dashboard/organization/${organizationId}/billing`} className="underline font-medium">View plans</Link>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-lg font-medium mb-3">Available instruments</h2>
            {templates.length === 0 ? (
              <p className="text-sm text-c4c-petrol">No instruments are available to activate yet.</p>
            ) : (
              <div className="space-y-3">
                {templates.map((t) => (
                  <Card key={t._id}>
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        {t.description && <p className="text-sm text-c4c-petrol mt-1">{t.description}</p>}
                      </div>
                      <Button
                        onClick={() => handleActivate(t._id)}
                        disabled={!gate?.isEntitled || busyId === t._id}
                      >
                        {busyId === t._id ? 'Activating...' : 'Activate'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">Your SNI surveys</h2>
            {projectSurveys.length === 0 ? (
              <p className="text-sm text-c4c-petrol">Nothing activated for this project yet — pick an instrument above to get started.</p>
            ) : (
              <div className="space-y-3">
                {projectSurveys.map((s) => (
                  <Card key={s._id}>
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <Badge variant={s.status === 'published' ? 'default' : 'secondary'} className="mt-1">
                          {STATUS_LABELS[s.status] || s.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/project/${projectId}/sni/${s._id}/preview`}>
                          <Button variant="outline" size="sm"><Eye size={14} className="mr-1" /> Preview</Button>
                        </Link>
                        {s.status === 'published' ? (
                          <Button variant="outline" size="sm" onClick={() => handleClose(s._id)} disabled={busyId === s._id}>
                            <PauseCircle size={14} className="mr-1" /> Close
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handlePublish(s._id)} disabled={busyId === s._id}>
                            <Rocket size={14} className="mr-1" /> Publish
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
