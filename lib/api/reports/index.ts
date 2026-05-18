// lib/api/reports/index.ts - Main export file
export * from './main';
export * from './projectSetup';
export * from './projectSiteSetup';
export * from './stakeholderMapping';
export * from './riskRegister';
export * from './theoryOfChange';
export * from './background';
export * from './workflow';
export * from './history';
export * from './admin';
export * from './monitoring';

// Default exports for convenience
export { 
  getProjectReports,
  getReportById,
  getCachedReport,
  searchReports,
  quickSearchReports
} from './main';

export {
  generateProjectSetupReport
} from './projectSetup';

export {generateProjectSiteSetupReport } from './projectSiteSetup'
export { generateStakeholderMappingReport } from './stakeholderMapping'
export {generateRiskRegisterReport} from './riskRegister'
export {generateTheoryOfChangeReport} from './theoryOfChange'

export {
  queueReportGeneration,
  queueBatchGeneration,
  getJobStatus,
  cancelJob
} from './background';

export {
  transitionReportStatus,
  regenerateReport,
  getWorkflowHistory,
  getWorkflowConfig
} from './workflow';