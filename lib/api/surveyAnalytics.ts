// lib/api/surveyAnalytics.ts
import { apiClient } from './client';
import { AnalyticsReportPayload, FrameworkCategory } from '@/types';

export interface GetSurveyAnalyticsReportParams {
  surveyIds: string[];
  demographic?: { questionId: string; value: string };
  framework?: FrameworkCategory;
}

export const getSurveyAnalyticsReport = async (
  params: GetSurveyAnalyticsReportParams,
  signal?: AbortSignal
): Promise<{ data: AnalyticsReportPayload }> => {
  try {
    const response = await apiClient.get('/survey-analytics/report', {
      params: {
        surveyIds: params.surveyIds.join(','),
        demographicQuestionId: params.demographic?.questionId,
        demographicValue: params.demographic?.value,
        framework: params.framework,
      },
      signal,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching survey analytics report:', error);
    throw error;
  }
};
