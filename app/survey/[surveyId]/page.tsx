'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getPublicSurveyData } from '@/lib/api/survey';
import { getPublishedTranslations, getFullTranslation } from '@/lib/api/surveyTranslation';
import { apiClient } from '@/lib/api/client';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { Question } from '@/components/survey/SurveyQuestionInput';

export default function PublicSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const surveyId = params.surveyId as string;
  const langParam = searchParams.get('lang');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // Map from surveyQuestion._id → translated data for the active language
  const [translationMap, setTranslationMap] = useState<Record<string, any>>({});
  const [translatedSurveyMeta, setTranslatedSurveyMeta] = useState<{ title?: string; description?: string }>({});

  const [responseId, setResponseId] = useState<string | null>(null);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const result = await getPublicSurveyData(surveyId);
      const data = result.data;

      if (data.requiresAuth) {
        // Private survey — redirect to login, come back after
        router.push(`/account/login?from=/survey/${surveyId}`);
        return;
      }

      setSurveyData(data);

      // Flatten sections + noSectionQuestions into an ordered list. Sections
      // arrive pre-sorted by section order, and each section's questions are
      // pre-sorted by question order within that section — question `order`
      // resets per section, so re-sorting the flattened list by raw `order`
      // would interleave sections instead of preserving this grouping.
      const allQuestions: Question[] = [];
      if (data.sections?.length) {
        data.sections.forEach((section: any) => {
          section.questions?.forEach((q: Question) => allQuestions.push(q));
        });
      }
      data.noSectionQuestions?.forEach((q: Question) => allQuestions.push(q));
      setQuestions(allQuestions);

      // Load translation if a lang param is set
      if (langParam) {
        try {
          const publishedRes = await getPublishedTranslations(surveyId);
          const translations = publishedRes.data?.translations ?? [];
          const match = translations.find((t: any) => t.language === langParam);
          if (match) {
            const fullRes = await getFullTranslation(match._id);
            const full = fullRes.data;
            // Build a map from surveyQuestion id → translated question data
            const map: Record<string, any> = {};
            full.translatedQuestions?.forEach((tq: any) => {
              const sqId = typeof tq.surveyQuestion === 'string'
                ? tq.surveyQuestion
                : tq.surveyQuestion?._id;
              if (sqId) map[sqId] = tq;
            });
            setTranslationMap(map);
            setTranslatedSurveyMeta({ title: full.title, description: full.description });
          }
        } catch {
          // Translation load failure is non-fatal — fall back to original language
        }
      }

      // Start response immediately
      const startRes = await apiClient.post(`/surveys/${surveyId}/responses/start`, {
        respondentInfo: { anonymous: true }
      });
      setResponseId(startRes.data.data._id);
    } catch (err: any) {
      console.error('Error loading survey:', err);
      setError('Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswerToServer = async (q: Question, answerValue: any, descriptorAnswers: Record<string, string>) => {
    if (!responseId) return;
    if (answerValue instanceof File) {
      const formData = new FormData();
      formData.append('file', answerValue);
      formData.append('questionId', q.question._id);
      formData.append('surveyQuestionId', q._id);
      await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/answers`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await apiClient.post(`/surveys/${surveyId}/responses/${responseId}/answers`, {
        questionId: q.question._id,
        surveyQuestionId: q._id,
        answer: answerValue,
        descriptorAnswers: Object.keys(descriptorAnswers).length ? descriptorAnswers : undefined
      });
    }
  };

  const completeOnServer = async () => {
    if (!responseId) return;
    try {
      await apiClient.put(`/surveys/${surveyId}/responses/${responseId}/complete`, {});
    } catch (err) {
      console.error('Error completing survey:', err);
      toast({ title: 'Error', description: 'Failed to submit survey. Please try again.', variant: 'destructive' });
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-stratosphere-900 font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stratosphere-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl text-stratosphere-900 mb-2">Survey Unavailable</h2>
            <p className="text-sky-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SurveyForm
      mode="live"
      survey={surveyData?.survey}
      questions={questions}
      translationMap={translationMap}
      translatedSurveyMeta={translatedSurveyMeta}
      onSubmitAnswer={submitAnswerToServer}
      onComplete={completeOnServer}
    />
  );
}
