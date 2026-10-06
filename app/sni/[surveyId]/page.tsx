// app/sni/[surveyId]/page.tsx
// The real (non-preview) live take experience for the Social Networks
// Instrument — public, unauthenticated, produces real data about real
// respondents. Mirrors app/survey/[surveyId]/page.tsx's role for the
// standard builder, but SNI's own engine (SniSurveyRunner, mode="live").
//
// Consent is handled HERE, not inside SniSurveyRunner — the runner is shared
// with preview (which never needs consent, see SNI_BUILD_PLAN.md), so
// keeping consent as a gate this page renders before mounting the runner
// means the runner itself stays agnostic to where its start call came from.
// Built together with split administration (brief §9: "Sam should build the
// technical controls [consent] above regardless" of whether the real
// consent copy exists yet — this is that mechanism; the backend rejects a
// start without it whenever the survey has consentRequired + a consentForm).
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getSniPublicSurveyData, startSniSurveyResponse, SniPublicSurveyData } from '@/lib/api/sni';
import SniSurveyRunner from '@/components/sni/SniSurveyRunner';

const BrandHeader = () => (
  <Image
    src="/logos/Primary logo_black.png"
    alt="Citizens for Change"
    width={110}
    height={48}
    style={{ height: 32, width: 'auto' }}
  />
);

export default function SniLiveSurveyPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<SniPublicSurveyData | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentGivenAt, setConsentGivenAt] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSniPublicSurveyData(surveyId);
        setSurveyData(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'This survey is not available.');
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-c4c-grey-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-c4c-petrol" />
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-c4c-grey-bg flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <p>{error || 'This survey is not available.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const needsConsent = surveyData.consentRequired && !!surveyData.consentForm;
  const readyToStart = !needsConsent || consentGivenAt;

  const startFn = (wave: number, participantCode?: string) =>
    startSniSurveyResponse(
      surveyId, wave, participantCode,
      needsConsent ? { consentGiven: true, consentFormId: surveyData.consentForm!._id } : undefined
    );

  return (
    <div className="min-h-screen bg-c4c-grey-bg">
      <div className="bg-white px-6 py-4 shadow-sm flex items-center">
        <BrandHeader />
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-1">{surveyData.title}</h1>
        {surveyData.description && <p className="text-c4c-petrol mb-6">{surveyData.description}</p>}

        {!readyToStart ? (
          <Card>
            <CardHeader><CardTitle className="text-base">{surveyData.consentForm!.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{surveyData.consentForm!.description}</p>
              <div className="flex items-start gap-2">
                <Checkbox checked={consentChecked} onCheckedChange={(v) => setConsentChecked(!!v)} id="consent-agree" />
                <label htmlFor="consent-agree" className="text-sm">
                  {surveyData.consentForm!.agreementLabel || 'I have read and agree to the above terms'}
                </label>
              </div>
              <Button disabled={!consentChecked} onClick={() => setConsentGivenAt(true)}>Continue</Button>
            </CardContent>
          </Card>
        ) : (
          <SniSurveyRunner surveyId={surveyId} mode="live" startFn={startFn} />
        )}
      </div>
    </div>
  );
}
