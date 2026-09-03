// lib/utils/reviewModules.ts
import type { ReviewModule } from '@/types';

// Display order for review modules, matching the order modules are actually
// completed in a project's workflow — not alphabetical or enum-declaration order.
export const REVIEW_MODULE_ORDER: ReviewModule[] = [
  'project_setup',
  'project_site_setup',
  'stakeholder_group',
  'stakeholder_action',
  'toc_consultation_plan',
  'social_impact',
  'survey',
  'survey_question',
  'survey_translation',
];

export const REVIEW_MODULE_LABELS: Record<ReviewModule, string> = {
  project_setup: 'Project Setup',
  project_site_setup: 'Project Site Setup',
  stakeholder_group: 'Stakeholder Group',
  stakeholder_action: 'Stakeholder Action (Stage 1)',
  toc_consultation_plan: 'ToC Consultation Plan',
  social_impact: 'Social Impact (Stage 2)',
  survey_question: 'Survey Question',
  survey: 'Survey (Pretest)',
  survey_translation: 'Survey Translation',
};
