// components/reports/viewer/ReportContent.tsx
'use client';

import { BaseReportData } from '@/types/reports';
import ProjectSetupReportContent from '../types/ProjectSetupReportContent';
import ProjectSiteSetupReportContent from '../types/ProjectSiteSetupReportContent';
import StakeholderMappingReportContent from '../types/StakeholderMappingReportContent';
import TheoryOfChangeReportContent from '../types/TheoryOfChangeReportContent';
import RiskRegisterReportContent from '../types/RiskRegisterReportContent';
import { FileText, AlertTriangle } from 'lucide-react';

interface ReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
}

const ReportContent: React.FC<ReportContentProps> = ({ 
  report, 
  onUpdate,
  onExport 
}) => {
  // Render appropriate content based on report type
  const renderReportContent = () => {
    switch (report.reportType) {
      case 'project_setup':
        return (
          <ProjectSetupReportContent 
            report={report} 
            onUpdate={onUpdate}
          />
        );
      case 'project_site_setup':
        return (
          <ProjectSiteSetupReportContent 
            report={report} 
            onUpdate={onUpdate}
          />
        );
      case 'stakeholder_mapping':
        return (
          <StakeholderMappingReportContent 
            report={report} 
            onUpdate={onUpdate}
          />
        );
      case 'theory_of_change':
        return (
          <TheoryOfChangeReportContent 
            report={report} 
            onUpdate={onUpdate}
          />
        );
      case 'risk_register':
        return (
          <RiskRegisterReportContent 
            report={report} 
            onUpdate={onUpdate}
          />
        );
      default:
        return (
          <div className="p-8 text-center">
            <AlertTriangle size={48} className="mx-auto text-ochre mb-4" />
            <h3 className="text-lg font-medium text-stratosphere mb-2">
              Unsupported Report Type
            </h3>
            <p className="text-sky">
              Report type "{report.reportType}" is not yet supported for viewing.
            </p>
          </div>
        );
    }
  };

  // Handle empty or invalid report data
  if (!report) {
    return (
      <div className="p-8 text-center">
        <FileText size={48} className="mx-auto text-sky mb-4" />
        <h3 className="text-lg font-medium text-stratosphere mb-2">
          No Report Data
        </h3>
        <p className="text-sky">
          This report doesn't contain any data yet. It may still be generating or there was an error during creation.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {renderReportContent()}
    </div>
  );
};

export default ReportContent;