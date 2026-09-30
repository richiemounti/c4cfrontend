// app/dashboard/project/[id]/surveys/[surveyId]/preview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSurvey, useSurveyStructure } from '@/hooks/useSurvey';
import * as surveyApi from '@/lib/api/survey';
import { useToast } from "@/hooks/use-toast";
import { SurveyForm } from '@/components/survey/SurveyForm';
import { Question } from '@/components/survey/SurveyQuestionInput';

interface PageParams {
  id: string;
  surveyId: string;
}

const SurveyPreviewPage = ({ params }: { params: PageParams }) => {
  const { id: projectId, surveyId } = params;
  const { toast } = useToast();

  const { survey, loading: surveyLoading, error: surveyError, fetchSurvey } = useSurvey(surveyId);
  const { structure, loading: structureLoading, error: structureError, fetchStructure } = useSurveyStructure(surveyId);

  const [isExportingForm, setIsExportingForm] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();
      fetchStructure();
    }
  }, [surveyId]);

  const handleExportForm = async () => {
    if (!survey) return;
    setIsExportingForm(true);
    try {
      const excelData = await surveyApi.exportSurveyForm(surveyId);
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey.title}-form.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export survey form',
        variant: 'destructive',
      });
    } finally {
      setIsExportingForm(false);
    }
  };

  const loading = surveyLoading || structureLoading;
  const error = surveyError || structureError;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral mx-auto mb-4" />
          <p className="text-black font-medium">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-c4c-tint-gold p-6 w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-black" />
          </div>
          <h2 className="text-xl text-black mb-2">Survey Unavailable</h2>
          <p className="text-c4c-petrol mb-6">{error || 'Could not load this survey.'}</p>
          <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}`}>
            <Button variant="anchor">Back to Survey</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Flatten sections + noSectionQuestions into an ordered list. Sections
  // arrive pre-sorted by section order, and each section's questions are
  // pre-sorted by question order within that section — question `order`
  // resets per section, so re-sorting the flattened list by raw `order`
  // would interleave sections instead of preserving this grouping.
  const questions: Question[] = [];
  structure?.sections?.forEach((section: any) => {
    section.questions?.forEach((q: Question) => questions.push(q));
  });
  structure?.noSectionQuestions?.forEach((q: Question) => questions.push(q));

  return (
    <div className="min-h-screen bg-c4c-grey-bg">
      <div className="sticky top-0 z-30 bg-white border-b border-c4c-rule px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-sm text-c4c-petrol hover:text-black font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Survey
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="attention">
              <Sparkles className="h-3 w-3 mr-1" />
              {survey.status === 'draft' ? 'Draft' : survey.status === 'pretest' ? 'Pretest' : 'Published'} preview
            </Badge>
            <Button
              variant="anchor"
              size="sm"
              onClick={handleExportForm}
              disabled={isExportingForm || questions.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isExportingForm ? 'Exporting...' : 'Export Form (Excel)'}
            </Button>
          </div>
        </div>
      </div>

      <SurveyForm
        mode="preview"
        survey={{ title: survey.title, description: survey.description }}
        questions={questions}
      />
    </div>
  );
};

export default SurveyPreviewPage;
