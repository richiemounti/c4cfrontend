'use client';

import { useState, useEffect } from 'react';
import { 
  X, FileText, Loader2, CheckCircle, AlertCircle, Clock,
  Building, MapPin, Users, Target, AlertTriangle, Settings,
  Calendar, Filter, Play, Eye, Database, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateProjectSetupReport,
  generateProjectSiteSetupReport,
  generateStakeholderMappingReport,
  generateRiskRegisterReport,
  generateTheoryOfChangeReport,
  queueReportGeneration
} from '@/lib/api/reports';
import { ReportType, ReportFilters } from '@/types/reports';
import { getProjectSites } from '@/lib/api/project';
import { checkConsultationPlanStatus, getConsultationPlansByProject } from '@/lib/api/tocConsultationPlan';

interface ReportGenerationModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
}

interface ReportOption {
  type: ReportType;
  title: string;
  description: string;
  icon: any;
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
  prerequisites: string[];
  available: boolean;
  dataRequired: string;
}

interface SiteOption {
  _id: string;
  name: string;
  status: string;
  region?: string;
  setupProgress?: number;
}

// Update the configuration interface to include risk-specific filters
interface Configuration {
  saveReport: boolean;
  scope: 'all' | 'project' | 'site';
  selectedSites: string[];
  reportDimension: 'full' | 'workplan' | 'outcome';
  includeArchived: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  statusFilters: string[];
  categoryFilters: string[];
  // Add these for risk register:
  riskScoreFilters: string[];  // NEW
  riskTypeFilters: string[];   // NEW
  ownerIds: string[];          // NEW
  overdueOnly: boolean;        // NEW
  useBackgroundGeneration: boolean;
  previewMode: boolean;
  includeConsultationPlan: boolean; // NEW: flag to include consultation plan
}

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({
  projectId,
  projectName,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [step, setStep] = useState<'select' | 'configure' | 'generating'>('select');
  const [generating, setGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableSites, setAvailableSites] = useState<SiteOption[]>([]);
  const [dataValidation, setDataValidation] = useState<Record<string, boolean>>({});
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [consultationPlansAvailable, setConsultationPlansAvailable] = useState<Record<string, boolean>>({});


  const [configuration, setConfiguration] = useState<Configuration>({
    saveReport: true,
    scope: 'all',
    selectedSites: [],
    reportDimension: 'full',
    includeArchived: false,
    statusFilters: [],
    categoryFilters: [],
    riskScoreFilters: [],    // NEW
    riskTypeFilters: [],     // NEW
    ownerIds: [],            // NEW
    overdueOnly: false,      // NEW
    useBackgroundGeneration: false,
    previewMode: false,
    includeConsultationPlan: false, // ADD this line
  });

  const reportOptions: ReportOption[] = [
    {
      type: 'project_setup',
      title: 'Project Setup Report',
      description: 'Comprehensive overview of project initialization, location context, governance structure, and initial risk assessment.',
      icon: Building,
      estimatedTime: '2-3 minutes',
      complexity: 'simple',
      prerequisites: ['Project basic information', 'Location details', 'Organization data'],
      available: true,
      dataRequired: 'Project metadata and basic setup information'
    },
    {
      type: 'project_site_setup',
      title: 'Project Site Setup Report',
      description: 'Detailed analysis of individual project sites including demographics, livelihoods, education, and site-specific characteristics.',
      icon: MapPin,
      estimatedTime: '3-5 minutes',
      complexity: 'moderate',
      prerequisites: ['Site creation', 'Site setup tasks', 'Demographic data collection'],
      available: true,
      dataRequired: 'At least one project site with setup completion'
    },
    {
      type: 'stakeholder_mapping',
      title: 'Stakeholder Mapping Report',
      description: 'Comprehensive analysis of stakeholder engagement, influence matrices, community involvement, and relationship mapping.',
      icon: Users,
      estimatedTime: '4-6 minutes',
      complexity: 'moderate',
      prerequisites: ['Stakeholder groups', 'Engagement activities', 'Influence assessments'],
      available: true,
      dataRequired: 'Stakeholder groups with completed engagement data'
    },
    // Around line 150, update the theory_of_change option:
    {
      type: 'theory_of_change',
      title: 'Theory of Change Report',
      description: 'Strategic framework with work plans (Stage 1 actions/outputs) and outcome analysis (Stage 2 impacts) with customizable framework views.',
      icon: Target,
      estimatedTime: '6-10 minutes',
      complexity: 'complex',
      prerequisites: ['Theory of Change stages', 'Actions with timelines', 'Impacts with frameworks', 'Stakeholder assignments'],
      available: true,
      dataRequired: 'Theory of Change stages with actions (Stage 1) and/or impacts (Stage 2)'
    },
    {
      type: 'risk_register',
      title: 'Risk Register Report',
      description: 'Comprehensive risk assessment including identified risks, probability analysis, mitigation strategies, and monitoring status.',
      icon: AlertTriangle,
      estimatedTime: '4-7 minutes',
      complexity: 'moderate',
      prerequisites: ['Risk identification', 'Risk assessments', 'Mitigation plans', 'Owner assignments'],
      available: true,
      dataRequired: 'Risk register with assessed and categorized risks'
    }
  ];

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (selectedReportType) {
      validateReportData(selectedReportType);
      calculateEstimatedTime(selectedReportType, configuration);
    }
  }, [selectedReportType, configuration]);

  // Around line 189, replace the entire fetchProjectData function
  const fetchProjectData = async () => {
    try {
      console.log('Fetching real project sites for project:', projectId);
      
      // Fetch project sites
      const sitesResponse = await getProjectSites(projectId);
      
      if (sitesResponse.success && sitesResponse.data) {
        const sites = sitesResponse.data.map((site: any) => ({
          _id: site._id,
          name: site.name,
          status: site.status,
          region: site.region || undefined,
          setupProgress: site.setupProgress || 0
        }));
        
        console.log('Fetched sites:', sites);
        setAvailableSites(sites);
        
        // Batch fetch all consultation plans for the project
        try {
          console.log('Fetching consultation plans for project:', projectId);
          const plansResponse = await getConsultationPlansByProject(projectId);
          
          console.log('Plans response:', plansResponse);
          
          // Initialize consultation plan status for all sites
          const consultationPlanStatus: Record<string, boolean> = {};
          
          // Default all sites to not having a consultation plan
          sites.forEach(site => {
            consultationPlanStatus[site._id] = false;
          });
          
          // Check if we have valid plans data
          if (plansResponse.data?.success && plansResponse.data?.data) {
            const plans = plansResponse.data.data || [];
            console.log('Found consultation plans:', plans.length);
            
            // Map each plan to its site and check completion status
            plans.forEach((plan: any) => {
              // Handle both populated and non-populated projectSite references
              const siteId = typeof plan.projectSite === 'object' 
                ? plan.projectSite._id 
                : plan.projectSite;
              
              if (siteId) {
                consultationPlanStatus[siteId] = plan.isCompleted === true;
                console.log(`Site ${siteId} consultation plan status:`, plan.isCompleted);
              }
            });
          }
          
          setConsultationPlansAvailable(consultationPlanStatus);
          console.log('Final consultation plans availability:', consultationPlanStatus);
          
        } catch (planError) {
          console.error('Error fetching consultation plans:', planError);
          
          // On error, initialize all sites as not having plans
          const consultationPlanStatus: Record<string, boolean> = {};
          sites.forEach(site => {
            consultationPlanStatus[site._id] = false;
          });
          
          setConsultationPlansAvailable(consultationPlanStatus);
          
          // Show a toast notification about the error
          toast({
            title: 'Warning',
            description: 'Could not fetch consultation plan status. Some features may be limited.',
            variant: 'default',
          });
        }
        
      } else {
        console.log('No sites found for project');
        setAvailableSites([]);
        setConsultationPlansAvailable({});
      }
    } catch (error) {
      console.error('Error fetching project sites:', error);
      setAvailableSites([]);
      setConsultationPlansAvailable({});
      
      toast({
        title: 'Error',
        description: 'Failed to load project data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const validateReportData = async (reportType: ReportType) => {
    // Mock validation - replace with actual API calls
    const validationResults: Record<string, boolean> = {
      project_setup: true,
      project_site_setup: availableSites.length > 0,
      stakeholder_mapping: true, // Check for stakeholder groups
      theory_of_change: true, // Check for ToC stages
      risk_register: true // Check for risks
    };

    setDataValidation(validationResults);
  };

  const calculateEstimatedTime = (reportType: ReportType, config: Configuration) => {
    const baseTimes: Record<ReportType, number> = {
      project_setup: 2,
      project_site_setup: 4,
      stakeholder_mapping: 5,
      theory_of_change: 8,
      risk_register: 5
    };

    let time = baseTimes[reportType];

    // Adjust based on scope
    if (config.scope === 'site' && config.selectedSites.length > 1) {
      time += config.selectedSites.length * 1.5;
    }

    // Adjust for complexity
    if (reportType === 'theory_of_change' && config.reportDimension === 'full') {
      time += 2;
    }

    setEstimatedTime(Math.ceil(time));
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'complex': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const initializeGenerationSteps = (reportType: ReportType) => {
    const baseSteps = [
      { id: 'validate', label: 'Validating data requirements', status: 'pending' as const },
      { id: 'collect', label: 'Collecting report data', status: 'pending' as const },
      { id: 'process', label: 'Processing and analyzing data', status: 'pending' as const },
      { id: 'generate', label: 'Generating report content', status: 'pending' as const }
    ];

    const typeSpecificSteps: Record<ReportType, GenerationStep[]> = {
      'project_setup': [
        ...baseSteps.slice(0, 2),
        { id: 'tasks', label: 'Analyzing project setup tasks', status: 'pending' as const },
        { id: 'governance', label: 'Processing governance structure', status: 'pending' as const },
        ...baseSteps.slice(2),
        { id: 'save', label: 'Saving report', status: 'pending' as const }
      ],
      'project_site_setup': [
        ...baseSteps.slice(0, 2),
        { id: 'sites', label: 'Processing site information', status: 'pending' as const },
        { id: 'demographics', label: 'Analyzing demographic data', status: 'pending' as const },
        ...baseSteps.slice(2),
        { id: 'save', label: 'Saving report', status: 'pending' as const }
      ],
      'stakeholder_mapping': [
        ...baseSteps.slice(0, 2),
        { id: 'stakeholders', label: 'Mapping stakeholder relationships', status: 'pending' as const },
        { id: 'influence', label: 'Calculating influence matrices', status: 'pending' as const },
        { id: 'engagement', label: 'Analyzing engagement data', status: 'pending' as const },
        ...baseSteps.slice(2),
        { id: 'save', label: 'Saving report', status: 'pending' as const }
      ],
      'theory_of_change': [
        ...baseSteps.slice(0, 2),
        // Check if generating consultation plan
        ...(selectedReportType === 'theory_of_change' && 
            configuration.reportDimension === 'outcome' &&
            configuration.includeConsultationPlan 
          ? [
              { id: 'consultation', label: 'Loading consultation plan data', status: 'pending' as const },
              { id: 'stakeholders', label: 'Processing selected stakeholders', status: 'pending' as const },
              { id: 'planning', label: 'Analyzing planning details', status: 'pending' as const }
            ]
          : [
              { id: 'stages', label: 'Processing theory of change stages', status: 'pending' as const },
              { id: 'timeline', label: 'Building activity timeline', status: 'pending' as const },
              { id: 'outcomes', label: 'Mapping outcome frameworks', status: 'pending' as const },
              ...(configuration.reportDimension === 'full' 
                ? [{ id: 'workplan', label: 'Generating work plan view', status: 'pending' as const }]
                : []
              )
            ]
        ),
        ...baseSteps.slice(2),
        { id: 'save', label: 'Saving report', status: 'pending' as const }
      ],
      'risk_register': [
        ...baseSteps.slice(0, 2),
        { id: 'risks', label: 'Analyzing risk data', status: 'pending' as const },
        { id: 'mitigation', label: 'Processing mitigation strategies', status: 'pending' as const },
        { id: 'scoring', label: 'Calculating risk scores', status: 'pending' as const },
        ...baseSteps.slice(2),
        { id: 'save', label: 'Saving report', status: 'pending' as const }
      ]
    };

    return typeSpecificSteps[reportType] || [...baseSteps, { id: 'save', label: 'Saving report', status: 'pending' as const }];
  };

  const updateGenerationStep = (stepId: string, status: GenerationStep['status'], message?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message }
        : step
    ));
  };

  const handleReportTypeSelect = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setError(null);
    
    // Auto-advance for simple reports without configuration needs
    if (reportType === 'project_setup') {
      // Simple report, can generate immediately
      return;
    }
    
    // For other reports, show configuration
    setStep('configure');
  };

  const handleConfigurationChange = (key: keyof Configuration, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateConfiguration = (): string | null => {
    if (!selectedReportType) return 'Please select a report type';

    if (selectedReportType === 'project_site_setup' && configuration.selectedSites.length === 0) {
      return 'Please select at least one project site';
    }

    if (configuration.scope === 'site' && configuration.selectedSites.length === 0) {
      return 'Please select at least one site for site-specific reporting';
    }

    if (!dataValidation[selectedReportType]) {
      return 'Required data is not available for this report type';
    }

    return null;
  };

  const generateReport = async () => {
    console.log('🚀 generateReport function called');
    console.log('📋 selectedReportType:', selectedReportType);
    
    if (!selectedReportType) {
      console.log('❌ No report type selected');
      return;
    }

    const validationError = validateConfiguration();
    if (validationError) {
      console.log('❌ Validation error:', validationError);
      setError(validationError);
      return;
    }

    console.log('✅ Validation passed, starting generation process...');
    setGenerating(true);
    setError(null);
    setStep('generating');
    
    const steps = initializeGenerationSteps(selectedReportType);
    setGenerationSteps(steps);
    console.log('📝 Generation steps initialized:', steps.length, 'steps');

    try {
      // Use background generation for complex reports
      if (configuration.useBackgroundGeneration && estimatedTime > 5) {
        console.log('🔄 Using background generation...');
        const response = await queueReportGeneration(
          selectedReportType,
          configuration.scope === 'site' ? 'project_site' : 'project',
          configuration.scope === 'site' && configuration.selectedSites.length === 1 
            ? configuration.selectedSites[0] 
            : projectId,
          {
            saveReport: configuration.saveReport && !configuration.previewMode,
            filters: buildFilters(),
            priority: 'normal'
          }
        );

        if (response.success) {
          setJobId(response.data.jobId);
          toast({
            title: 'Report Queued',
            description: `Your ${getReportTypeLabel(selectedReportType)} report has been queued for background generation. You'll be notified when it's ready.`,
          });
          onSuccess();
          return;
        }
      }

      console.log('🔄 Using foreground generation with step simulation...');
      
      // Foreground generation with step simulation
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`⏳ Processing step ${i + 1}/${steps.length}: ${step.label}`);
        updateGenerationStep(step.id, 'active');
        
        // Realistic processing time based on step complexity
        const processingTime = getStepProcessingTime(step.id, selectedReportType);
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Simulate occasional errors for testing (1% chance)
        if (Math.random() < 0.01 && step.id !== 'save') {
          updateGenerationStep(step.id, 'error', 'Processing encountered an issue');
          throw new Error(`Failed during ${step.label.toLowerCase()}`);
        }
        
        updateGenerationStep(step.id, 'completed', getStepCompletionMessage(step.id));
        console.log(`✅ Completed step: ${step.label}`);
      }

      console.log('🎯 All steps completed, now making actual API call...');
      
      // Actually generate the report
      let response;
      const reportOptions = {
        saveReport: configuration.saveReport && !configuration.previewMode,
        filters: buildFilters()
      };

      console.log('📊 Report options:', reportOptions);
      console.log('🎯 About to call API for report type:', selectedReportType);

      switch (selectedReportType) {
        case 'project_setup':
          console.log('📞 Calling generateProjectSetupReport...');
          response = await generateProjectSetupReport(projectId, reportOptions);
          break;
        case 'project_site_setup':
          console.log('📞 Calling generateProjectSiteSetupReport...');
          response = await generateProjectSiteSetupReport(
            configuration.selectedSites[0], 
            reportOptions
          );
          break;
        case 'stakeholder_mapping':
          console.log('📞 Calling generateStakeholderMappingReport...');
          response = await generateStakeholderMappingReport(projectId, reportOptions);
          break;
        case 'theory_of_change':
          console.log('📞 Calling generateTheoryOfChangeReport...');
          console.log('Configuration:', {
            reportDimension: configuration.reportDimension,
            scope: configuration.scope,
            selectedSites: configuration.selectedSites,
            includeConsultationPlan: configuration.includeConsultationPlan
          });
          
          response = await generateTheoryOfChangeReport(projectId, {
            ...reportOptions,
            reportDimension: configuration.reportDimension,
            siteId: configuration.scope === 'site' && configuration.selectedSites.length === 1 
              ? configuration.selectedSites[0] 
              : undefined,
            includeConsultationPlan: configuration.includeConsultationPlan
          });
          break;
        case 'risk_register':
          console.log('📞 Calling generateRiskRegisterReport...');
          console.log('🔍 API call details:', {
            projectId,
            reportOptions,
            url: '/reports/risk-register/' + projectId
          });
          
          const startTime = Date.now();
          try {
            response = await generateRiskRegisterReport(projectId, reportOptions);
            const endTime = Date.now();
            console.log(`✅ Risk register API call completed in ${endTime - startTime}ms`);
            console.log('📊 API response:', response);
          } catch (apiError) {
            const endTime = Date.now();
            console.error(`❌ Risk register API call failed after ${endTime - startTime}ms`);
            console.error('🔥 API Error details:', apiError);
            
            // Log the error object details
            if (apiError instanceof Error) {
              console.error('Error message:', apiError.message);
              console.error('Error stack:', apiError.stack);
            }
            
            // Check if it's a network error
            if (apiError && typeof apiError === 'object' && 'response' in apiError) {
              console.error('Response status:', (apiError as any).response?.status);
              console.error('Response data:', (apiError as any).response?.data);
            }
            
            throw apiError;
          }
          break;
        default:
          console.error('❌ Unknown report type:', selectedReportType);
          throw new Error('Unknown report type');
      }

      console.log('🎉 API call successful, processing response...');
      console.log('📊 Response details:', response);

      if (response.success) {
        const action = configuration.previewMode ? 'previewed' : 'generated';
        console.log(`✅ Report ${action} successfully`);
        toast({
          title: `Report ${action === 'previewed' ? 'Previewed' : 'Generated'} Successfully`,
          description: `Your ${getReportTypeLabel(selectedReportType)} report has been ${action}.`,
        });
        onSuccess();
      } else {
        console.error('❌ Response indicates failure:', response);
        throw new Error('Report generation failed');
      }
    } catch (error) {
      console.error('🔥 Error in generateReport:', error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Check for network/axios errors
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', (error as any).code);
      }
      
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 generateReport function completed');
      setGenerating(false);
    }
  };

  const buildFilters = (): ReportFilters => {
    const baseFilters = {
      scope: configuration.scope,
      siteIds: configuration.scope === 'site' ? configuration.selectedSites : undefined,
      includeArchived: configuration.includeArchived,
      dateRange: configuration.dateRange,
    };

    // Add risk-specific filters
    if (selectedReportType === 'risk_register') {
      return {
        ...baseFilters,
        riskScore: configuration.riskScoreFilters.length > 0 ? configuration.riskScoreFilters : undefined,
        riskType: configuration.riskTypeFilters.length > 0 ? configuration.riskTypeFilters : undefined,
        status: configuration.statusFilters.length > 0 ? configuration.statusFilters : undefined,
        category: configuration.categoryFilters.length > 0 ? configuration.categoryFilters : undefined,
        overdueOnly: configuration.overdueOnly,
      };
    }

    // Add ToC specific filters
    if (selectedReportType === 'theory_of_change') {
      return {
        ...baseFilters
      };
    }

    return {
      ...baseFilters,
      status: configuration.statusFilters.length > 0 ? configuration.statusFilters : undefined,
      categories: configuration.categoryFilters.length > 0 ? configuration.categoryFilters : undefined,
    };
  };

  const getStepProcessingTime = (stepId: string, reportType: ReportType): number => {
    const baseTimes: Record<string, number> = {
      validate: 800,
      collect: 1200,
      process: 1500,
      generate: 2000,
      save: 1000,
      // Type-specific steps
      tasks: 1000,
      governance: 800,
      sites: 1200,
      demographics: 1000,
      stakeholders: 1500,
      influence: 1800,
      engagement: 1000,
      stages: 1800,
      timeline: 1500,
      outcomes: 1200,
      workplan: 1000,
      risks: 1200,
      mitigation: 1000,
      scoring: 800
    };

    return baseTimes[stepId] || 1000;
  };

  const getStepCompletionMessage = (stepId: string): string => {
    const messages: Record<string, string> = {
      validate: 'Data validation complete',
      collect: 'Data collection finished',
      process: 'Analysis complete',
      generate: 'Content generation finished',
      save: 'Report saved successfully',
      tasks: 'Setup tasks analyzed',
      governance: 'Governance structure processed',
      sites: 'Site data processed',
      demographics: 'Demographics analyzed',
      stakeholders: 'Stakeholder mapping complete',
      influence: 'Influence matrix calculated',
      engagement: 'Engagement data processed',
      stages: 'ToC stages processed',
      timeline: 'Timeline generated',
      outcomes: 'Outcome frameworks mapped',
      workplan: 'Work plan view created',
      risks: 'Risk analysis complete',
      mitigation: 'Mitigation strategies processed',
      scoring: 'Risk scoring complete'
    };

    return messages[stepId] || 'Step completed';
  };

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      project_setup: 'Project Setup',
      project_site_setup: 'Project Site Setup',
      stakeholder_mapping: 'Stakeholder Mapping',
      theory_of_change: 'Theory of Change',
      risk_register: 'Risk Register'
    };
    return labels[type];
  };

  const canProceed = () => {
    if (!selectedReportType) return false;
    if (step === 'configure') {
      return validateConfiguration() === null;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sky-tint">
          <div>
            <h2 className="text-xl font-semibold text-stratosphere">Generate Report</h2>
            <p className="text-sm text-sky mt-1">Create a new report for {projectName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={generating}
            className="text-sky hover:text-stratosphere disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <>
              {/* Report Type Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-stratosphere mb-4">Select Report Type</h3>
                <div className="grid grid-cols-1 gap-4">
                  {reportOptions.map((option) => (
                    <div
                      key={option.type}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedReportType === option.type
                          ? 'border-sky bg-sky-tint'
                          : option.available
                          ? 'border-sky-tint hover:border-sky'
                          : 'border-concrete bg-concrete/20 cursor-not-allowed'
                      }`}
                      onClick={() => option.available && handleReportTypeSelect(option.type)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${
                          option.available ? 'bg-white' : 'bg-concrete/50'
                        }`}>
                          <option.icon size={32} className={option.available ? 'text-sky' : 'text-concrete'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className={`text-lg font-medium ${
                              option.available ? 'text-stratosphere' : 'text-concrete'
                            }`}>
                              {option.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(option.complexity)}`}>
                              {option.complexity}
                            </span>
                            <span className="flex items-center text-xs text-sky">
                              <Clock size={12} className="mr-1" />
                              {option.estimatedTime}
                            </span>
                          </div>
                          <p className={`text-sm mb-3 ${
                            option.available ? 'text-sky' : 'text-concrete'
                          }`}>
                            {option.description}
                          </p>
                          
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-medium text-stratosphere mb-1">Prerequisites:</p>
                              <div className="flex flex-wrap gap-1">
                                {option.prerequisites.map((prereq, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded">
                                    {prereq}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {selectedReportType === option.type && (
                              <CheckCircle className="text-sky" size={24} />
                            )}
                          </div>
                          
                          {!option.available && (
                            <p className="text-xs text-ochre mt-2 font-medium">{option.dataRequired}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedReportType === 'project_setup') {
                      generateReport();
                    } else {
                      setStep('configure');
                    }
                  }}
                  disabled={!selectedReportType || !dataValidation[selectedReportType!]}
                  className="px-6 py-2 bg-ochre text-white rounded-md hover:bg-ochre-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {selectedReportType === 'project_setup' ? (
                    <>
                      <Play size={16} className="mr-2" />
                      Generate Now
                    </>
                  ) : (
                    <>
                      <Settings size={16} className="mr-2" />
                      Configure Options
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'configure' && selectedReportType && (
            <>
              {/* Configuration Options */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-stratosphere">Configure Report Options</h3>
                  <button
                    onClick={() => setStep('select')}
                    className="text-sky hover:text-stratosphere text-sm"
                  >
                    ← Back to Selection
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Site Selection for site-specific reports */}
                    {selectedReportType === 'project_site_setup' && (
                      <div className="bg-sky-tint rounded-lg p-4">
                        <label className="block text-sm font-medium text-stratosphere mb-3">Select Project Site</label>
                        <div className="space-y-2">
                          {availableSites.map(site => (
                            <div
                              key={site._id}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                configuration.selectedSites.includes(site._id)
                                  ? 'border-sky bg-white'
                                  : 'border-sky-tint hover:border-sky bg-white'
                              }`}
                              onClick={() => handleConfigurationChange('selectedSites', [site._id])}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-stratosphere">{site.name}</p>
                                  <p className="text-sm text-sky">{site.region} • {site.status}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-stratosphere">{site.setupProgress}%</div>
                                  <div className="w-16 bg-sky-tint rounded-full h-2">
                                    <div 
                                      className="bg-sky h-2 rounded-full transition-all"
                                      style={{ width: `${site.setupProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scope Selection for multi-scope reports */}
                    {['stakeholder_mapping', 'risk_register', 'theory_of_change'].includes(selectedReportType) && (
                      <div className="bg-sky-tint rounded-lg p-4">
                        <label className="block text-sm font-medium text-stratosphere mb-3">Report Scope</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'all', label: 'All Data', desc: 'Project + Sites' },
                            { value: 'project', label: 'Project Only', desc: 'Project level' },
                            { value: 'site', label: 'Site Specific', desc: 'Selected sites' }
                          ].map(scope => (
                            <button
                              key={scope.value}
                              onClick={() => handleConfigurationChange('scope', scope.value)}
                              className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                                configuration.scope === scope.value
                                  ? 'border-sky bg-white text-stratosphere'
                                  : 'border-sky-tint hover:border-sky bg-white text-sky'
                              }`}
                            >
                              <div className="font-medium">{scope.label}</div>
                              <div className="text-xs">{scope.desc}</div>
                            </button>
                          ))}
                        </div>

                        {configuration.scope === 'site' && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-stratosphere mb-2">Select Sites</label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {availableSites.map(site => (
                                <label key={site._id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={configuration.selectedSites.includes(site._id)}
                                    onChange={(e) => {
                                      const newSites = e.target.checked
                                        ? [...configuration.selectedSites, site._id]
                                        : configuration.selectedSites.filter(id => id !== site._id);
                                      handleConfigurationChange('selectedSites', newSites);
                                    }}
                                    className="rounded border-sky text-sky focus:ring-sky"
                                  />
                                  <span className="text-sm text-stratosphere">{site.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Theory of Change specific options - UPDATE THIS SECTION */}
                    {selectedReportType === 'theory_of_change' && (
                      <>
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="block text-sm font-medium text-stratosphere mb-3">Report Focus</label>
                          <select 
                            value={configuration.reportDimension}
                            onChange={(e) => handleConfigurationChange('reportDimension', e.target.value)}
                            className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                          >
                            <option value="full">Full Report - Both stages combined</option>
                            <option value="workplan">Work Plan - Stage 1 actions only</option>
                            <option value="outcome">Outcome Framework - Stage 2 impacts only</option>
                          </select>
                        </div>

                        {/* Show consultation plan option when outcome is selected AND single site is selected */}
                        {configuration.reportDimension === 'outcome' && 
                        configuration.scope === 'site' && 
                        configuration.selectedSites.length === 1 && (
                          <div className="bg-sky-tint rounded-lg p-4">
                            <label className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={configuration.includeConsultationPlan}
                                onChange={(e) => handleConfigurationChange('includeConsultationPlan', e.target.checked)}
                                className="rounded border-sky text-sky focus:ring-sky mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-stratosphere">
                                    Generate Consultation Plan Report
                                  </span>
                                  {consultationPlansAvailable[configuration.selectedSites[0]] && (
                                    <CheckCircle className="text-green-500" size={14} />
                                  )}
                                </div>
                                <p className="text-xs text-sky">
                                  {consultationPlansAvailable[configuration.selectedSites[0]]
                                    ? 'Generate a consultation plan report for this site instead of the outcome framework report.'
                                    : 'No completed consultation plan found for this site. A placeholder report will be generated.'}
                                </p>
                              </div>
                            </label>

                            {/* Show consultation plan status details */}
                            {configuration.includeConsultationPlan && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-sky-200">
                                <div className="flex items-start space-x-2">
                                  {consultationPlansAvailable[configuration.selectedSites[0]] ? (
                                    <>
                                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                      <div>
                                        <p className="text-sm font-medium text-green-700">Consultation Plan Available</p>
                                        <p className="text-xs text-green-600 mt-1">
                                          A completed consultation plan exists for this site and will be included in the report.
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                                      <div>
                                        <p className="text-sm font-medium text-amber-700">No Consultation Plan Found</p>
                                        <p className="text-xs text-amber-600 mt-1">
                                          No completed consultation plan exists for this site. The report will show available data or placeholders.
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {/* Risk Register Specific Filters */}
                    {selectedReportType === 'risk_register' && (
                      <>
                        {/* Risk Score Filter */}
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="block text-sm font-medium text-stratosphere mb-3">
                            Risk Score Levels
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-700' },
                              { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-700' },
                              { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-700' }
                            ].map(score => (
                              <label key={score.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={configuration.riskScoreFilters.includes(score.value)}
                                  onChange={(e) => {
                                    const newScores = e.target.checked
                                      ? [...configuration.riskScoreFilters, score.value]
                                      : configuration.riskScoreFilters.filter(s => s !== score.value);
                                    handleConfigurationChange('riskScoreFilters', newScores);
                                  }}
                                  className="rounded border-sky text-sky focus:ring-sky"
                                />
                                <span className={`px-2 py-1 rounded text-xs ${score.color}`}>
                                  {score.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Risk Type Filter */}
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="block text-sm font-medium text-stratosphere mb-3">
                            Risk Types
                          </label>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {[
                              'operational', 'financial', 'strategic', 'compliance',
                              'environmental', 'social', 'technical', 'reputational',
                              'political', 'market', 'legal'
                            ].map(type => (
                              <label key={type} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={configuration.riskTypeFilters.includes(type)}
                                  onChange={(e) => {
                                    const newTypes = e.target.checked
                                      ? [...configuration.riskTypeFilters, type]
                                      : configuration.riskTypeFilters.filter(t => t !== type);
                                    handleConfigurationChange('riskTypeFilters', newTypes);
                                  }}
                                  className="rounded border-sky text-sky focus:ring-sky"
                                />
                                <span className="text-sm text-stratosphere capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Risk Status Filter */}
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="block text-sm font-medium text-stratosphere mb-3">
                            Risk Status
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'open', label: 'Open' },
                              { value: 'monitoring', label: 'Monitoring' },
                              { value: 'closed', label: 'Closed' },
                              { value: 'transferred', label: 'Transferred' }
                            ].map(status => (
                              <label key={status.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={configuration.statusFilters.includes(status.value)}
                                  onChange={(e) => {
                                    const newStatuses = e.target.checked
                                      ? [...configuration.statusFilters, status.value]
                                      : configuration.statusFilters.filter(s => s !== status.value);
                                    handleConfigurationChange('statusFilters', newStatuses);
                                  }}
                                  className="rounded border-sky text-sky focus:ring-sky"
                                />
                                <span className="text-sm text-stratosphere">{status.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Risk Category Filter */}
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="block text-sm font-medium text-stratosphere mb-3">
                            Risk Category
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'inherent', label: 'Inherent' },
                              { value: 'residual', label: 'Residual' },
                              { value: 'current', label: 'Current' }
                            ].map(category => (
                              <label key={category.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={configuration.categoryFilters.includes(category.value)}
                                  onChange={(e) => {
                                    const newCategories = e.target.checked
                                      ? [...configuration.categoryFilters, category.value]
                                      : configuration.categoryFilters.filter(c => c !== category.value);
                                    handleConfigurationChange('categoryFilters', newCategories);
                                  }}
                                  className="rounded border-sky text-sky focus:ring-sky"
                                />
                                <span className="text-sm text-stratosphere">{category.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Overdue Only Toggle */}
                        <div className="bg-sky-tint rounded-lg p-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={configuration.overdueOnly}
                              onChange={(e) => handleConfigurationChange('overdueOnly', e.target.checked)}
                              className="rounded border-sky text-sky focus:ring-sky"
                            />
                            <div>
                              <span className="text-sm font-medium text-stratosphere">
                                Show Overdue Risks Only
                              </span>
                              <p className="text-xs text-sky">
                                Only include risks with review dates that have passed
                              </p>
                            </div>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Date Range Filter */}
                    <div className="bg-sky-tint rounded-lg p-4">
                      <label className="block text-sm font-medium text-stratosphere mb-3">Date Range (Optional)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-sky mb-1">From</label>
                          <input
                            type="date"
                            value={configuration.dateRange?.startDate || ''}
                            onChange={(e) => handleConfigurationChange('dateRange', {
                              ...configuration.dateRange,
                              startDate: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sky mb-1">To</label>
                          <input
                            type="date"
                            value={configuration.dateRange?.endDate || ''}
                            onChange={(e) => handleConfigurationChange('dateRange', {
                              ...configuration.dateRange,
                              endDate: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Generation Options */}
                    <div className="bg-sky-tint rounded-lg p-4">
                      <h4 className="text-sm font-medium text-stratosphere mb-3">Generation Options</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={configuration.saveReport}
                            onChange={(e) => handleConfigurationChange('saveReport', e.target.checked)}
                            className="rounded border-sky text-sky focus:ring-sky"
                          />
                          <span className="text-sm text-stratosphere">Save report to database</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={configuration.previewMode}
                            onChange={(e) => handleConfigurationChange('previewMode', e.target.checked)}
                            className="rounded border-sky text-sky focus:ring-sky"
                          />
                          <span className="text-sm text-stratosphere">Preview mode (don't save)</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={configuration.includeArchived}
                            onChange={(e) => handleConfigurationChange('includeArchived', e.target.checked)}
                            className="rounded border-sky text-sky focus:ring-sky"
                          />
                          <span className="text-sm text-stratosphere">Include archived data</span>
                        </label>

                        {estimatedTime > 5 && (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={configuration.useBackgroundGeneration}
                              onChange={(e) => handleConfigurationChange('useBackgroundGeneration', e.target.checked)}
                              className="rounded border-sky text-sky focus:ring-sky"
                            />
                            <span className="text-sm text-stratosphere">Use background generation</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="bg-gradient-to-r from-ochre-50 to-ochre-100 border border-ochre-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="text-ochre" size={16} />
                        <h4 className="text-sm font-medium text-ochre-800">Estimated Generation Time</h4>
                      </div>
                      <div className="text-2xl font-bold text-ochre-800">{estimatedTime} minutes</div>
                      <p className="text-xs text-ochre-700 mt-1">
                        {configuration.useBackgroundGeneration 
                          ? 'Will be processed in the background' 
                          : 'Please keep this window open during generation'
                        }
                      </p>
                    </div>

                    {/* Data Validation Status */}
                    <div className="bg-sky-tint rounded-lg p-4">
                      <h4 className="text-sm font-medium text-stratosphere mb-3">Data Validation</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {dataValidation[selectedReportType] ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : (
                            <AlertCircle className="text-red-500" size={16} />
                          )}
                          <span className="text-sm text-stratosphere">
                            Required data {dataValidation[selectedReportType] ? 'available' : 'missing'}
                          </span>
                        </div>
                        
                        {selectedReportType === 'project_site_setup' && (
                          <div className="flex items-center space-x-2">
                            {availableSites.length > 0 ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : (
                              <AlertCircle className="text-red-500" size={16} />
                            )}
                            <span className="text-sm text-stratosphere">
                              {availableSites.length} site{availableSites.length !== 1 ? 's' : ''} available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint"
                >
                  ← Back
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateReport}
                    disabled={!canProceed()}
                    className="px-6 py-2 bg-ochre text-white rounded-md hover:bg-ochre-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {configuration.previewMode ? (
                      <>
                        <Eye size={16} className="mr-2" />
                        Preview Report
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'generating' && (
            /* Generation Progress */
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sky-tint to-sky-100 rounded-full mb-4">
                  <Loader2 className="w-10 h-10 text-sky animate-spin" />
                </div>
                <h3 className="text-xl font-medium text-stratosphere">
                  Generating {selectedReportType && getReportTypeLabel(selectedReportType)} Report
                </h3>
                <p className="text-sm text-sky mt-2">
                  {configuration.useBackgroundGeneration 
                    ? 'Report queued for background processing...' 
                    : 'This may take a few moments, please keep this window open...'
                  }
                </p>
                {jobId && (
                  <p className="text-xs text-sky mt-1">Job ID: {jobId}</p>
                )}
              </div>

              {/* Progress Steps */}
              <div className="space-y-4">
                {generationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-100 border-green-500'
                        : step.status === 'active'
                        ? 'bg-sky-tint border-sky'
                        : step.status === 'error'
                        ? 'bg-red-100 border-red-500'
                        : 'bg-concrete border-concrete'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="w-5 h-5 text-sky animate-spin" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-concrete"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.status === 'error' ? 'text-red-600' : 'text-stratosphere'
                      }`}>
                        {step.label}
                      </p>
                      {step.message && (
                        <p className={`text-xs mt-1 ${
                          step.status === 'error' ? 'text-red-500' : 'text-sky'
                        }`}>
                          {step.message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-sky">
                      {step.status === 'completed' && '✓'}
                      {step.status === 'active' && 'Processing...'}
                      {step.status === 'error' && 'Failed'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Display during generation */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <div>
                      <p className="text-red-700 text-sm font-medium">Generation Failed</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        setError(null);
                        setStep('configure');
                        setGenerating(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerationModal;