// constants/instructionalVideos.ts
// Centralized configuration for all instructional videos
// This makes it easy to manage and update video content across the platform

import { InstructionalVideo, createVideoConfig } from '@/types/instructional.types';

/**
 * Project Setup Videos
 */
export const PROJECT_SETUP_VIDEOS: Record<string, InstructionalVideo> = {
  CREATING_PROJECT: createVideoConfig(
    'project-setup',
    'creating-project.mp4',
    'How to Create a New Project',
    'Learn the step-by-step process of creating a new project in the C4C platform'
  ),
  CONFIGURING_PROJECT: createVideoConfig(
    'project-setup',
    'configuring-project.mp4',
    'Configuring Project Settings',
    'Understanding project settings, sites, and setup tasks'
  ),
  PROJECT_HIERARCHY: createVideoConfig(
    'project-setup',
    'project-hierarchy.mp4',
    'Understanding Project Hierarchy',
    'Learn how organizations, projects, and sites are structured'
  ),
};

/**
 * Organization Setup Videos
 */
export const ORGANIZATION_SETUP_VIDEOS: Record<string, InstructionalVideo> = {
  CREATING_ORGANIZATION: createVideoConfig(
    'organization-setup',
    'creating-organization.mp4',
    'Creating Your Organization',
    'Set up your organization profile and basic information'
  ),
  MANAGING_USERS: createVideoConfig(
    'organization-setup',
    'managing-users.mp4',
    'Managing Organization Users',
    'Learn how to invite users and assign roles'
  ),
};

/**
 * Survey Builder Videos
 */
export const SURVEY_BUILDER_VIDEOS: Record<string, InstructionalVideo> = {
  BUILDING_SURVEY: createVideoConfig(
    'survey-builder',
    'building-survey.mp4',
    'Building Your First Survey',
    'Learn the basics of creating surveys tailored to your community'
  ),
  QUESTION_TYPES: createVideoConfig(
    'survey-builder',
    'question-types.mp4',
    'Understanding Question Types',
    'Explore different question types and when to use them'
  ),
  ADVANCED_LOGIC: createVideoConfig(
    'survey-builder',
    'advanced-logic.mp4',
    'Advanced Survey Logic',
    'Set up conditional questions and branching logic'
  ),
  QUESTION_LIBRARY: createVideoConfig(
    'survey-builder',
    'question-library.mp4',
    'Using the Question Library',
    'Reuse and manage questions across multiple surveys'
  ),
};

/**
 * Stakeholder Mapping Videos
 */
export const STAKEHOLDER_MAPPING_VIDEOS: Record<string, InstructionalVideo> = {
  MAPPING_STAKEHOLDERS: createVideoConfig(
    'stakeholder-mapping',
    'mapping-stakeholders.mp4',
    'Stakeholder Mapping Guide',
    'Learn how to effectively map and engage with project stakeholders'
  ),
  STAKEHOLDER_ANALYSIS: createVideoConfig(
    'stakeholder-mapping',
    'stakeholder-analysis.mp4',
    'Analyzing Stakeholder Impact',
    'Understanding stakeholder influence and interest levels'
  ),
};

/**
 * Theory of Change Videos
 */
export const THEORY_OF_CHANGE_VIDEOS: Record<string, InstructionalVideo> = {
  INTRODUCTION: createVideoConfig(
    'theory-of-change',
    'introduction.mp4',
    'Introduction to Theory of Change',
    'What is Theory of Change and why it matters for impact measurement'
  ),
  BUILDING_STAGES: createVideoConfig(
    'theory-of-change',
    'building-stages.mp4',
    'Building Theory of Change Stages',
    'Step-by-step guide to creating inputs, activities, outputs, outcomes, and impacts'
  ),
  INDICATORS: createVideoConfig(
    'theory-of-change',
    'indicators.mp4',
    'Setting Up Indicators',
    'Learn how to define and track meaningful indicators'
  ),
};

/**
 * Risk Register Videos
 */
export const RISK_REGISTER_VIDEOS: Record<string, InstructionalVideo> = {
  RISK_ASSESSMENT: createVideoConfig(
    'risk-register',
    'risk-assessment.mp4',
    'Risk Assessment Process',
    'How to identify, assess, and prioritize project risks'
  ),
  MITIGATION_STRATEGIES: createVideoConfig(
    'risk-register',
    'mitigation-strategies.mp4',
    'Developing Mitigation Strategies',
    'Creating effective risk mitigation and contingency plans'
  ),
};

/**
 * Reporting Videos
 */
export const REPORTING_VIDEOS: Record<string, InstructionalVideo> = {
  GENERATING_REPORTS: createVideoConfig(
    'reporting',
    'generating-reports.mp4',
    'How to Generate Reports',
    'Complete walkthrough of the report generation process'
  ),
  CUSTOMIZING_REPORTS: createVideoConfig(
    'reporting',
    'customizing-reports.mp4',
    'Customizing Your Reports',
    'Learn how to filter and customize report content'
  ),
  REPORT_TYPES: createVideoConfig(
    'reporting',
    'report-types.mp4',
    'Understanding Report Types',
    'Overview of available report types and when to use them'
  ),
};

/**
 * Dashboard Videos
 */
export const DASHBOARD_VIDEOS: Record<string, InstructionalVideo> = {
  OVERVIEW: createVideoConfig(
    'dashboard',
    'overview.mp4',
    'Dashboard Overview',
    'Understanding your project dashboard and key metrics'
  ),
  INSIGHTS: createVideoConfig(
    'dashboard',
    'insights.mp4',
    'Interpreting Dashboard Insights',
    'How to read and act on dashboard data'
  ),
};

/**
 * Data Collection Videos
 */
export const DATA_COLLECTION_VIDEOS: Record<string, InstructionalVideo> = {
  FIELD_AGENTS: createVideoConfig(
    'data-collection',
    'field-agents.mp4',
    'Managing Field Agents',
    'How to assign and manage field data collectors'
  ),
  MOBILE_DATA: createVideoConfig(
    'data-collection',
    'mobile-data.mp4',
    'Mobile Data Collection',
    'Collecting survey responses on mobile devices'
  ),
  DATA_QUALITY: createVideoConfig(
    'data-collection',
    'data-quality.mp4',
    'Ensuring Data Quality',
    'Best practices for accurate and reliable data collection'
  ),
};

/**
 * Review Process Videos
 */
export const REVIEW_PROCESS_VIDEOS: Record<string, InstructionalVideo> = {
  REVIEW_WORKFLOW: createVideoConfig(
    'review-process',
    'review-workflow.mp4',
    'Understanding Review Workflows',
    'How the two-stage review process works'
  ),
  REVIEWER_TASKS: createVideoConfig(
    'review-process',
    'reviewer-tasks.mp4',
    'Reviewer Responsibilities',
    'What reviewers need to check and approve'
  ),
};

/**
 * GDPR Compliance Videos
 */
export const GDPR_COMPLIANCE_VIDEOS: Record<string, InstructionalVideo> = {
  OVERVIEW: createVideoConfig(
    'gdpr-compliance',
    'overview.mp4',
    'GDPR Compliance Overview',
    'Understanding GDPR requirements in the carbon sector'
  ),
  DATA_HANDLING: createVideoConfig(
    'gdpr-compliance',
    'data-handling.mp4',
    'Proper Data Handling',
    'Best practices for handling sensitive personal data'
  ),
  CONSENT_MANAGEMENT: createVideoConfig(
    'gdpr-compliance',
    'consent-management.mp4',
    'Managing Consent',
    'How to properly collect and manage consent'
  ),
};

/**
 * General Platform Videos
 */
export const GENERAL_VIDEOS: Record<string, InstructionalVideo> = {
  PLATFORM_INTRO: createVideoConfig(
    'general',
    'platform-intro.mp4',
    'Welcome to C4C Platform',
    'An introduction to the Social Monitoring, Reporting, and Verification platform'
  ),
  NAVIGATION: createVideoConfig(
    'general',
    'navigation.mp4',
    'Platform Navigation',
    'Learn how to navigate the platform efficiently'
  ),
  GETTING_STARTED: createVideoConfig(
    'general',
    'getting-started.mp4',
    'Getting Started Guide',
    'Your first steps on the C4C platform'
  ),
};

/**
 * Helper function to get videos by category
 */
export function getVideosByCategory(category: string): InstructionalVideo[] {
  const videoMap: Record<string, Record<string, InstructionalVideo>> = {
    'project-setup': PROJECT_SETUP_VIDEOS,
    'organization-setup': ORGANIZATION_SETUP_VIDEOS,
    'survey-builder': SURVEY_BUILDER_VIDEOS,
    'stakeholder-mapping': STAKEHOLDER_MAPPING_VIDEOS,
    'theory-of-change': THEORY_OF_CHANGE_VIDEOS,
    'risk-register': RISK_REGISTER_VIDEOS,
    'reporting': REPORTING_VIDEOS,
    'dashboard': DASHBOARD_VIDEOS,
    'data-collection': DATA_COLLECTION_VIDEOS,
    'review-process': REVIEW_PROCESS_VIDEOS,
    'gdpr-compliance': GDPR_COMPLIANCE_VIDEOS,
    'general': GENERAL_VIDEOS,
  };

  const categoryVideos = videoMap[category];
  return categoryVideos ? Object.values(categoryVideos) : [];
}

/**
 * Get all videos as a flat array
 */
export function getAllVideos(): InstructionalVideo[] {
  return [
    ...Object.values(PROJECT_SETUP_VIDEOS),
    ...Object.values(ORGANIZATION_SETUP_VIDEOS),
    ...Object.values(SURVEY_BUILDER_VIDEOS),
    ...Object.values(STAKEHOLDER_MAPPING_VIDEOS),
    ...Object.values(THEORY_OF_CHANGE_VIDEOS),
    ...Object.values(RISK_REGISTER_VIDEOS),
    ...Object.values(REPORTING_VIDEOS),
    ...Object.values(DASHBOARD_VIDEOS),
    ...Object.values(DATA_COLLECTION_VIDEOS),
    ...Object.values(REVIEW_PROCESS_VIDEOS),
    ...Object.values(GDPR_COMPLIANCE_VIDEOS),
    ...Object.values(GENERAL_VIDEOS),
  ];
}