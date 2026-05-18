// components/survey/QuestionPropertiesPanel.tsx - Simplified for Conditional Logic Only
'use client';

import { useState, useEffect } from 'react';
import { Settings, Zap, ClipboardCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSurveyQuestion, updateSurveyQuestion } from '@/lib/api/surveyQuestion';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import { useToast } from "@/hooks/use-toast";
import type { QuestionPropertiesPanelProps } from '@/types/survey-edit';

export const QuestionPropertiesPanel = ({ 
  questionId, 
  surveyId,
  onClose,
  onUpdate,
  onOpenConditionalLogic
}: QuestionPropertiesPanelProps & { onOpenConditionalLogic: () => void }) => {
  const { toast } = useToast();
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Review state
  const [questionReview, setQuestionReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const REVIEW_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending:   { label: 'Pending Review', bg: 'bg-ochre-50',    text: 'text-ochre-500',    border: 'border-ochre-500/30' },
    in_review: { label: 'In Review',      bg: 'bg-sky-50',      text: 'text-sky-500',      border: 'border-sky-500/30' },
    approved:  { label: 'Approved',       bg: 'bg-grass-50',    text: 'text-grass-500',    border: 'border-grass-500/30' },
    escalated: { label: 'Escalated',      bg: 'bg-sand-50',     text: 'text-sand-500',     border: 'border-sand-500/30' },
    resolved:  { label: 'Resolved',       bg: 'bg-concrete-50', text: 'text-concrete-500', border: 'border-concrete-500/30' },
  };

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const response = await getSurveyQuestion(surveyId, questionId);
        setQuestionData(response.data);
      } catch (error) {
        console.error('Failed to load question data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load question data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (questionId && surveyId) {
      fetchQuestionData();
    }
  }, [questionId, surveyId]);

  useEffect(() => {
    const fetchQuestionReview = async () => {
      if (!questionId) return;
      setReviewLoading(true);
      setQuestionReview(null);
      try {
        const response = await getReviewsByModuleItem('survey_question', questionId);
        if (response.success && response.data && response.data.length > 0) {
          setQuestionReview(response.data[0]);
        }
      } catch {
        // Non-fatal
      } finally {
        setReviewLoading(false);
      }
    };
    fetchQuestionReview();
  }, [questionId]);

  const handleUpdateQuestion = async (updates: any) => {
    try {
      setUpdating(true);
      await updateSurveyQuestion(surveyId, questionId, updates);
      setQuestionData((prev: any) => ({ ...prev, ...updates }));
      onUpdate();
      toast({
        title: 'Question updated',
        description: 'Changes saved successfully',
      });
    } catch (error) {
      console.error('Failed to update question:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleConditionalLogic = (checked: boolean) => {
    if (checked) {
      // Open the conditional logic modal
      onOpenConditionalLogic();
    } else {
      // Disable conditional logic
      handleUpdateQuestion({ 
        conditionalLogic: { enabled: false, conditions: [], action: 'show' }
      });
    }
  };

  if (loading || !questionData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const questionType = questionData.question?.type || 'text';
  const questionText = questionData.customText || questionData.question?.text || 'Untitled Question';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-concrete-500/20">
        <h3 className="font-semibold text-stratosphere-900 flex items-center gap-2">
          <div className="p-2 bg-sky-50 rounded-lg">
            <Settings className="h-4 w-4 text-sky-500" />
          </div>
          Question Settings
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-stratosphere-50">
          ×
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Question Info Display */}
        <div className="p-4 bg-gradient-to-r from-sky-50 to-stratosphere-50 rounded-xl">
          <div className="space-y-2">
            <Label className="text-stratosphere-900 font-medium">Question</Label>
            <p className="text-sm text-stratosphere-700">{questionText}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded">
                {questionType.charAt(0).toUpperCase() + questionType.slice(1)}
              </span>
              {questionData.required && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                  Required
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Conditional Logic Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral-50 to-sand-50 rounded-xl">
            <div>
              <Label className="text-stratosphere-900 font-medium">Conditional Logic</Label>
              <p className="text-xs text-coral-500 mt-1">Show or hide based on other answers</p>
            </div>
            <Switch 
              checked={questionData.conditionalLogic?.enabled || false}
              onCheckedChange={handleToggleConditionalLogic}
              disabled={updating}
            />
          </div>

          {questionData.conditionalLogic?.enabled && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <Label className="text-amber-900 font-medium">Active Conditional Logic</Label>
              </div>
              <p className="text-xs text-amber-700 mb-3">
                This question has {questionData.conditionalLogic.conditions?.length || 0} condition(s) set.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenConditionalLogic}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                disabled={updating}
              >
                <Zap className="h-3 w-3 mr-2" />
                Edit Logic Rules
              </Button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
          <Label className="text-slate-900 font-medium">About Conditional Logic</Label>
          <p className="text-xs text-slate-600 mt-2">
            Use conditional logic to show or hide questions based on respondents' previous answers.
            This helps create dynamic surveys that adapt to each respondent.
          </p>
        </div>

        {/* Review Section */}
        <div className="border-t border-concrete-500/20 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-clay-50 rounded-lg">
              <ClipboardCheck className="h-4 w-4 text-clay-500" />
            </div>
            <Label className="text-stratosphere-900 font-medium">Review</Label>
          </div>

          {reviewLoading ? (
            <div className="flex items-center gap-2 text-sm text-sky-500 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              Loading review...
            </div>
          ) : questionReview ? (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${REVIEW_STATUS_CONFIG[questionReview.status]?.bg} ${REVIEW_STATUS_CONFIG[questionReview.status]?.text} ${REVIEW_STATUS_CONFIG[questionReview.status]?.border}`}>
                <div className="h-1.5 w-1.5 rounded-full bg-current" />
                {REVIEW_STATUS_CONFIG[questionReview.status]?.label ?? questionReview.status}
              </div>
              {questionReview.issues?.filter((i: any) => !i.resolvedAt).length > 0 && (
                <p className="text-xs text-ochre-500">
                  {questionReview.issues.filter((i: any) => !i.resolvedAt).length} open issue(s)
                </p>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full border-sky-500/30 text-sky-500 hover:bg-sky-50"
                onClick={() => setShowReviewModal(true)}
              >
                View Review
              </Button>
            </div>
          ) : (
            <p className="text-xs text-sky-500">
              A review is created automatically when a question is added to this survey.
            </p>
          )}
        </div>
      </div>

      {showReviewModal && questionReview && (
        <ReviewDetailModal
          reviewId={questionReview._id}
          onClose={() => {
            setShowReviewModal(false);
            // Re-fetch to reflect any status changes made in the modal
            getReviewsByModuleItem('survey_question', questionId)
              .then(r => { if (r.success && r.data?.length) setQuestionReview(r.data[0]); })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};