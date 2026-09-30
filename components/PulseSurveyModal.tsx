// components/PulseSurveyModal.tsx
//
// timeToComplete is now received as a prop (calculated at the module level in
// SetupForm) rather than measured from when this modal opens.

import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import {
  PulseSurvey,
  QuestionResponse,
  ModuleType,
  PulseSurveyResponsePayload,
} from '@/types/pulseSurvey';
import { submitPulseSurveyResponse } from '@/lib/api/pulseSurvey';

interface PulseSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulseSurvey: PulseSurvey | null;
  moduleType: ModuleType;
  moduleReference: string;
  moduleReferenceModel: string;
  organizationId: string | undefined;
  projectId: string | undefined;
  projectSiteId?: string;
  /** Time in seconds the user spent on the full module. Provided by the parent. */
  timeToComplete?: number;
  onSubmitSuccess?: () => void;
}

const PulseSurveyModal: React.FC<PulseSurveyModalProps> = ({
  isOpen,
  onClose,
  pulseSurvey,
  moduleType,
  moduleReference,
  moduleReferenceModel,
  organizationId,
  projectId,
  projectSiteId,
  timeToComplete,
  onSubmitSuccess,
}) => {
  const [responses, setResponses] = useState<{ [questionId: string]: QuestionResponse }>({});
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize responses whenever the survey or open state changes
  useEffect(() => {
    if (isOpen && pulseSurvey) {
      const initialResponses: { [questionId: string]: QuestionResponse } = {};
      pulseSurvey.questions.forEach((q) => {
        initialResponses[q._id!] = {
          questionId: q._id!,
          questionText: q.questionText,
          questionType: q.questionType,
          skipped: false,
        };
      });
      setResponses(initialResponses);
    }
  }, [isOpen, pulseSurvey]);

  if (!isOpen) return null;

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ratingValue: rating, skipped: false },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], textValue: text, skipped: !text.trim() },
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, option: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOption: option, skipped: false },
    }));
  };

  const handleYesNoChange = (questionId: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOption: answer, skipped: false },
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required questions
      const unansweredRequired = pulseSurvey!.questions.filter((q) => {
        if (!q.isRequired) return false;
        const response = responses[q._id!];
        if (!response) return true;

        if (q.questionType === 'rating') return !response.ratingValue;
        if (q.questionType === 'text') return !response.textValue?.trim();
        if (q.questionType === 'multiple_choice' || q.questionType === 'yes_no')
          return !response.selectedOption;
        return false;
      });

      if (unansweredRequired.length > 0) {
        setError('Please answer all required questions');
        return;
      }

      const payload: PulseSurveyResponsePayload = {
        pulseSurveyId: pulseSurvey!._id,
        moduleType,
        moduleReference,
        moduleReferenceModel,
        organizationId,
        projectId,
        projectSiteId,
        responses: Object.values(responses),
        additionalComments: additionalComments.trim() || undefined,
        timeToComplete, // from parent — full module duration
      };

      await submitPulseSurveyResponse(payload);

      setShowSuccess(true);

      setTimeout(() => {
        onSubmitSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting pulse survey:', err);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => onClose();

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-c4c-sage mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">Thank You!</h3>
          <p className="text-c4c-petrol">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-c4c-petrol text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{pulseSurvey!.title}</h2>
            {pulseSurvey!.description && (
              <p className="text-white/80 text-sm">{pulseSurvey!.description}</p>
            )}
          </div>
          <button
            onClick={handleSkip}
            className="text-white hover:text-white/80 ml-4"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-c4c-tint-coral border-l-4 border-c4c-burgundy text-black p-4 mx-6 mt-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {pulseSurvey!.questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => (
              <div key={question._id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="bg-c4c-grey-bg text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <label className="block text-c4c-petrol font-medium mb-2">
                      {question.questionText}
                      {question.isRequired && (
                        <span className="text-c4c-burgundy ml-1">*</span>
                      )}
                    </label>

                    {/* Rating */}
                    {question.questionType === 'rating' && question.ratingScale && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          {Array.from(
                            {
                              length:
                                question.ratingScale.max - question.ratingScale.min + 1,
                            },
                            (_, i) => question.ratingScale!.min + i
                          ).map((rating) => {
                            const isSelected =
                              responses[question._id!]?.ratingValue === rating;
                            return (
                              <button
                                key={rating}
                                onClick={() => handleRatingChange(question._id!, rating)}
                                className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? 'bg-c4c-yellow border-c4c-yellow text-white'
                                    : 'bg-white border-c4c-rule text-c4c-petrol hover:border-c4c-yellow'
                                }`}
                              >
                                <Star
                                  className={`w-6 h-6 mx-auto ${isSelected ? 'fill-current' : ''}`}
                                />
                                <span className="text-xs mt-1 block">{rating}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-c4c-petrol">
                          <span>{question.ratingScale.labels.low}</span>
                          <span>{question.ratingScale.labels.high}</span>
                        </div>
                      </div>
                    )}

                    {/* Text */}
                    {question.questionType === 'text' && (
                      <textarea
                        value={responses[question._id!]?.textValue || ''}
                        onChange={(e) => handleTextChange(question._id!, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-c4c-rule rounded-lg focus:border-c4c-petrol focus:ring-2 focus:ring-c4c-petrol/20 outline-none resize-none"
                        rows={3}
                        placeholder="Type your answer here..."
                      />
                    )}

                    {/* Multiple choice */}
                    {question.questionType === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isSelected =
                            responses[question._id!]?.selectedOption === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleMultipleChoiceChange(question._id!, option.value)
                              }
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'bg-c4c-grey-bg border-c4c-petrol text-c4c-petrol'
                                  : 'bg-white border-c4c-rule text-c4c-petrol hover:border-c4c-rule'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-c4c-petrol' : 'border-c4c-rule'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-c4c-petrol" />
                                  )}
                                </div>
                                <span>{option.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Yes/No */}
                    {question.questionType === 'yes_no' && (
                      <div className="flex gap-4">
                        {['Yes', 'No'].map((answer) => {
                          const isSelected =
                            responses[question._id!]?.selectedOption === answer;
                          return (
                            <button
                              key={answer}
                              onClick={() => handleYesNoChange(question._id!, answer)}
                              className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                                isSelected
                                  ? answer === 'Yes'
                                    ? 'bg-c4c-sage border-c4c-sage text-white'
                                    : 'bg-c4c-burgundy border-c4c-burgundy text-white'
                                  : 'bg-white border-c4c-rule text-c4c-petrol hover:border-c4c-rule'
                              }`}
                            >
                              {answer}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* Additional comments */}
          <div className="space-y-2 pt-4 border-t border-c4c-rule">
            <label className="flex items-center gap-2 text-c4c-petrol font-medium">
              <MessageSquare className="w-4 h-4" />
              Additional Comments (Optional)
            </label>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              className="w-full px-4 py-3 border-2 border-c4c-rule rounded-lg focus:border-c4c-petrol focus:ring-2 focus:ring-c4c-petrol/20 outline-none resize-none"
              rows={3}
              placeholder="Any other feedback you'd like to share?"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-c4c-rule p-6 bg-c4c-grey-bg">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-6 py-3 text-c4c-petrol hover:text-black disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-c4c-coral text-black rounded-lg hover:bg-c4c-petrol hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseSurveyModal;