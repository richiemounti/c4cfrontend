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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-stratosphere-900 font-medium">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
          <h2 className="text-xl text-stratosphere-900 mb-2">Survey Unavailable</h2>
          <p className="text-sky-500 mb-6">{error || 'Could not load this survey.'}</p>
          <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}`}>
            <Button variant="outline">Back to Survey</Button>
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
    <div className="min-h-screen bg-stratosphere-50">
      <div className="sticky top-0 z-30 bg-white border-b border-concrete-500/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-sm text-sky-500 hover:text-stratosphere-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Survey
          </Link>

          <div className="flex items-center gap-3">
            <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {survey.status === 'draft' ? 'Draft' : survey.status === 'pretest' ? 'Pretest' : 'Published'} preview
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportForm}
              disabled={isExportingForm || questions.length === 0}
              className="border-clay-500/30 text-clay-600 hover:bg-clay-50"
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
