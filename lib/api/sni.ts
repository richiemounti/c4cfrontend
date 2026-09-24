// lib/api/sni.ts
// API client for the Social Networks Instrument (SNI) — a separate feature
// from the standard survey builder (see SNI_BUILD_PLAN.md). Types are kept
// local to this file rather than added to the already-large types/index.ts,
// since SNI's shapes (questionRole, roster, alter, tie) don't overlap with
// the existing Survey/Question type surface at all.
import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────

export type SniQuestionRole = 'standard' | 'name_generator' | 'alter_attribute' | 'tie_quality';
export type SniResponseType = 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime'
    | 'radio' | 'checkbox' | 'dropdown' | 'scale' | 'matrix' | 'file' | 'location'
    | 'alter_identifier';

export interface SniQuestionOption {
    value: string;
    label: string;
    descriptor?: string;
    placeholder?: string;
}

export interface SniConditionalLogic {
    enabled: boolean;
    conditions: Array<{ questionId: string; operator: string; value: any }>;
    action: 'show' | 'hide';
    logicOperator: 'AND' | 'OR';
}

export interface SniSurvey {
    _id: string;
    title: string;
    description?: string;
    isTemplate: boolean;
    templateSource?: string;
    project?: string;
    status: 'draft' | 'pretest' | 'published' | 'closed' | 'archived';
    rosterCap: number;
    consentForm?: string;
    consentRequired: boolean;
    settings: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
}

export interface SniSection {
    _id: string;
    survey: string;
    title: string;
    description?: string;
    order: number;
    separatelyAdministered: boolean;
}

export interface SniQuestion {
    _id: string;
    survey: string;
    section?: string;
    order: number;
    text: string;
    description?: string;
    questionRole: SniQuestionRole;
    responseType: SniResponseType;
    options?: SniQuestionOption[];
    alterIdentifierConfig?: { maxEntries: number; fields: Array<{ key: string; label: string; required: boolean; type: string }> };
    scaleConfig?: { min?: number; max?: number; step?: number; minLabel?: string; maxLabel?: string; showNAOption?: boolean };
    matrixConfig?: { rows: Array<{ label: string }>; columns: Array<{ value: string; label: string }>; allowMultiple?: boolean };
    rwbDimension?: 'others' | 'self' | 'environment';
    // Marks a questionRole:'standard' question as ego-level content (the
    // respondent's own characteristics) as opposed to ordinary sub-theme 4-6
    // content — a dedicated flag, not the standard builder's isStandardDemographic.
    isEgoAttribute?: boolean;
    temporality?: 'stable' | 'time_varying';
    indicatorLabel?: string;
    conditionalLogic?: SniConditionalLogic;
    required: boolean;
    validation?: { min?: number; max?: number; pattern?: string; errorMessage?: string };
}

export interface SniRosterEntry {
    id: string;
    name: string;
}

export type SniScreen =
    | { type: 'preload_confirmation'; alters: SniRosterEntry[] }
    | { type: 'name_generator_question'; question: SniQuestion; roster: SniRosterEntry[] }
    | { type: 'standard_question'; question: SniQuestion }
    | { type: 'alter_attribute_battery'; alter: SniRosterEntry; questions: SniQuestion[] }
    | { type: 'tie_quality_battery'; alter: SniRosterEntry; section: string; questions: SniQuestion[] };

// ─── Survey (authoring) ──────────────────────────────────────────────────

export const createSniSurvey = async (data: Partial<SniSurvey>) => {
    const response = await apiClient.post('/sni/surveys', data);
    return response.data;
};

export const getSniSurveys = async (params?: { project?: string; isTemplate?: boolean; status?: string }) => {
    const response = await apiClient.get('/sni/surveys', { params });
    return response.data;
};

export const getSniSurvey = async (id: string) => {
    const response = await apiClient.get(`/sni/surveys/${id}`);
    return response.data;
};

export const getSniSurveyStructure = async (id: string): Promise<{ success: boolean; data: { survey: SniSurvey; sections: SniSection[]; questions: SniQuestion[] } }> => {
    const response = await apiClient.get(`/sni/surveys/${id}/structure`);
    return response.data;
};

export const updateSniSurvey = async (id: string, data: Partial<SniSurvey>) => {
    const response = await apiClient.put(`/sni/surveys/${id}`, data);
    return response.data;
};

export const archiveSniSurvey = async (id: string) => {
    const response = await apiClient.delete(`/sni/surveys/${id}`);
    return response.data;
};

export const cloneSniSurveyForProject = async (templateId: string, project: string) => {
    const response = await apiClient.post(`/sni/surveys/${templateId}/clone`, { project });
    return response.data;
};

// ─── Sections ────────────────────────────────────────────────────────────

export const createSniSection = async (surveyId: string, data: Partial<SniSection>) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/sections`, data);
    return response.data;
};

export const getSniSections = async (surveyId: string) => {
    const response = await apiClient.get(`/sni/surveys/${surveyId}/sections`);
    return response.data;
};

export const updateSniSection = async (surveyId: string, id: string, data: Partial<SniSection>) => {
    const response = await apiClient.put(`/sni/surveys/${surveyId}/sections/${id}`, data);
    return response.data;
};

export const archiveSniSection = async (surveyId: string, id: string) => {
    const response = await apiClient.delete(`/sni/surveys/${surveyId}/sections/${id}`);
    return response.data;
};

// ─── Questions ───────────────────────────────────────────────────────────

export const createSniQuestion = async (surveyId: string, data: Partial<SniQuestion>) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/questions`, data);
    return response.data;
};

export const getSniQuestions = async (surveyId: string, params?: { section?: string; questionRole?: SniQuestionRole }) => {
    const response = await apiClient.get(`/sni/surveys/${surveyId}/questions`, { params });
    return response.data;
};

export const updateSniQuestion = async (surveyId: string, id: string, data: Partial<SniQuestion>) => {
    const response = await apiClient.put(`/sni/surveys/${surveyId}/questions/${id}`, data);
    return response.data;
};

export const archiveSniQuestion = async (surveyId: string, id: string) => {
    const response = await apiClient.delete(`/sni/surveys/${surveyId}/questions/${id}`);
    return response.data;
};

// ─── Preview (staff-only, bypasses draft/published status restriction) ───

export const startSniPreview = async (surveyId: string, wave = 1, participantCode?: string) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/preview/start`, { wave, participantCode });
    return response.data;
};

// ─── Response-taking (shared by preview and, later, the real respondent flow) ─

export const startSniSurveyResponse = async (surveyId: string, wave: number, participantCode?: string) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/start`, { wave, participantCode });
    return response.data;
};

export const getNextSniScreen = async (surveyId: string, responseId: string): Promise<{ success: boolean; data: { screen: SniScreen | null } }> => {
    const response = await apiClient.get(`/sni/surveys/${surveyId}/responses/${responseId}/next`);
    return response.data;
};

export const confirmSniPreloadAlter = async (surveyId: string, responseId: string, alterId: string, wave: number, stillRelevant: boolean) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/preload/confirm`, { alterId, wave, stillRelevant });
    return response.data;
};

export const completeSniPreload = async (surveyId: string, responseId: string) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/preload/complete`);
    return response.data;
};

export const submitSniNameGeneratorAnswer = async (
    surveyId: string,
    responseId: string,
    questionId: string,
    selectedAlterIds: string[],
    newAlters: Array<{ name: string; facebookUrl?: string; phoneNumber?: string }>
) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/name-generator`, {
        questionId, selectedAlterIds, newAlters,
    });
    return response.data;
};

export const submitSniAlterBatteryAnswers = async (
    surveyId: string,
    responseId: string,
    alterId: string,
    wave: number,
    answers: Array<{ questionId: string; answer: any }>
) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/alter-battery`, {
        alterId, wave, answers,
    });
    return response.data;
};

export const submitSniStandardAnswer = async (surveyId: string, responseId: string, questionId: string, answer: any) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/standard-answer`, {
        questionId, answer,
    });
    return response.data;
};

export const completeSniSurveyResponse = async (surveyId: string, responseId: string) => {
    const response = await apiClient.post(`/sni/surveys/${surveyId}/responses/${responseId}/complete`);
    return response.data;
};

// ─── Export — alter_id only, never real names (brief §9/§11) ─────────────

export const exportSniSurveyExcel = async (surveyId: string) => {
    const response = await apiClient.get(`/sni/surveys/${surveyId}/export`, {
        params: { format: 'excel' },
        responseType: 'blob',
    });
    return response.data;
};

export const exportSniSurveyCsv = async (surveyId: string, table: 'ego' | 'alter' | 'tie') => {
    const response = await apiClient.get(`/sni/surveys/${surveyId}/export`, {
        params: { format: 'csv', table },
        responseType: 'blob',
    });
    return response.data;
};
