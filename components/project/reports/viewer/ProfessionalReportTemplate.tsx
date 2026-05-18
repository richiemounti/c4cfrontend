// components/reports/viewer/ProfessionalReportTemplate.tsx
'use client';

import { useState } from 'react';
import { BaseReportData, ProjectSetupReportData, ProjectSiteSetupReportData, StakeholderMappingReportData, TheoryOfChangeReportData, RiskRegisterReportData } from '@/types/reports';
import { FileText } from 'lucide-react';

interface ProfessionalReportTemplateProps {
  report: BaseReportData;
  onUpdate?: () => void;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  isModal?: boolean;
}

const ProfessionalReportTemplate: React.FC<ProfessionalReportTemplateProps> = ({ 
  report, 
  onUpdate,
  onExport,
  isModal = false 
}) => {
  const getReportTypeTitle = (reportType: string): string => {
    const titles = {
      'project_setup': 'Project Setup Report',
      'project_site_setup': 'Project Site Setup Report',
      'stakeholder_mapping': 'Stakeholder Mapping Report',
      'theory_of_change': 'Theory of Change Report',
      'risk_register': 'Risk Register Report'
    };
    return titles[reportType as keyof typeof titles] || 'Project Report';
  };

  const getReportDescription = (reportType: string): string => {
    const descriptions = {
      'project_setup': 'This report presents the findings of a project setup assessment to evaluate the project foundation, governance structure, and initial risk evaluation.',
      'project_site_setup': 'This report presents the findings of a project site setup assessment to evaluate site-specific conditions, demographics, and local context.',
      'stakeholder_mapping': 'This report presents the findings of a stakeholder mapping exercise to assess the influence, impact and engagement of various stakeholder groups regarding the project. The analysis includes stakeholder identification, roles and responsibilities, potential risks and benefits.',
      'theory_of_change': 'This report presents the theory of change framework outlining the project\'s planned activities, expected outcomes, and impact pathways.',
      'risk_register': 'This report presents a comprehensive risk assessment and mitigation strategy for project-related risks and uncertainties.'
    };
    return descriptions[reportType as keyof typeof descriptions] || 'Project assessment and analysis report.';
  };

  // Content renderers for each report type
  const renderProjectSetupContent = (data: ProjectSetupReportData) => {
    const reportData = data.reportData;
    
    return (
      <div className="report-content">
        {/* Page 1 - Executive Summary */}
        <div className="report-page">
          <h2 className="section-title">Executive Summary</h2>
          
          <div className="info-grid">
            <div className="info-section">
              <h3 className="subsection-title">Project Information</h3>
              <table className="data-table">
                <tbody>
                  <tr><td className="label-cell">Name:</td><td>{reportData.projectInfo.name}</td></tr>
                  <tr><td className="label-cell">Status:</td><td>{reportData.projectInfo.status}</td></tr>
                  <tr><td className="label-cell">Organization:</td><td>{reportData.organizationInfo.name}</td></tr>
                  <tr><td className="label-cell">Country:</td><td>{reportData.locationContext.country}</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="info-section">
              <h3 className="subsection-title">Setup Progress</h3>
              <div className="metric-box">
                <div className="metric-value">{Math.round(reportData.setupProgress.overallProgress)}%</div>
                <div className="metric-label">Complete</div>
                <div className="progress-detail">
                  {reportData.setupProgress.completedTasks} of {reportData.setupProgress.totalTasks} tasks completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 - Location Context */}
        <div className="report-page page-break">
          <h2 className="section-title">Location Context</h2>
          
          <div className="info-grid">
            <div className="info-section">
              <h3 className="subsection-title">Administrative Boundaries</h3>
              <table className="data-table">
                <tbody>
                  <tr><td className="label-cell">Country:</td><td>{reportData.locationContext.country}</td></tr>
                  <tr><td className="label-cell">Region:</td><td>{reportData.locationContext.adminLevel1}</td></tr>
                  <tr><td className="label-cell">District:</td><td>{reportData.locationContext.adminLevel2}</td></tr>
                  <tr><td className="label-cell">Ward:</td><td>{reportData.locationContext.adminLevel3}</td></tr>
                </tbody>
              </table>
            </div>
            
            <div className="info-section">
              <h3 className="subsection-title">Physical Characteristics</h3>
              <table className="data-table">
                <tbody>
                  <tr><td className="label-cell">GPS Coordinates:</td><td>{reportData.locationContext.gpsCoordinates}</td></tr>
                  <tr><td className="label-cell">Coverage:</td><td>{reportData.locationContext.hectareCoverage} hectares</td></tr>
                  <tr><td className="label-cell">Ecological Zone:</td><td>{reportData.locationContext.ecologicalZone}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page 3 - Risk Assessment */}
        <div className="report-page page-break">
          <h2 className="section-title">Risk Assessment</h2>
          
          <div className="risk-grid">
            {[
              { key: 'conflictHistory', label: 'Conflict History', note: reportData.riskAssessment.conflictNotes },
              { key: 'politicalRisk', label: 'Political Risk' },
              { key: 'accessIssues', label: 'Access Issues', note: reportData.riskAssessment.accessNotes },
              { key: 'previousProjectFailures', label: 'Previous Project Failures', note: reportData.riskAssessment.previousFailureNotes }
            ].map(risk => {
              const hasRisk = reportData.riskAssessment[risk.key as keyof typeof reportData.riskAssessment];
              return (
                <div key={risk.key} className={`risk-card ${hasRisk ? 'risk-present' : 'risk-absent'}`}>
                  <div className="risk-header">
                    <span className={`risk-indicator ${hasRisk ? 'risk-indicator-red' : 'risk-indicator-green'}`}></span>
                    <span className="risk-label">{risk.label}</span>
                  </div>
                  <div className={`risk-status ${hasRisk ? 'risk-status-identified' : 'risk-status-none'}`}>
                    {hasRisk ? 'Risk Identified' : 'No Risk Detected'}
                  </div>
                  {risk.note && hasRisk && (
                    <div className="risk-note">"{risk.note}"</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Page 4 - Governance Structure */}
        <div className="report-page page-break">
          <h2 className="section-title">Governance Structure</h2>
          
          <table className="data-table full-width">
            <tbody>
              <tr>
                <td className="label-cell">Approval Granted By:</td>
                <td>{Array.isArray(reportData.governance.approvalGrantedBy) ? reportData.governance.approvalGrantedBy.join(', ') : reportData.governance.approvalGrantedBy}</td>
              </tr>
              <tr>
                <td className="label-cell">Implementing Organizations:</td>
                <td>{Array.isArray(reportData.governance.implementingOrganisations) ? reportData.governance.implementingOrganisations.join(', ') : reportData.governance.implementingOrganisations}</td>
              </tr>
              <tr>
                <td className="label-cell">Oversight Authorities:</td>
                <td>{Array.isArray(reportData.governance.oversightAuthorities) ? reportData.governance.oversightAuthorities.join(', ') : reportData.governance.oversightAuthorities}</td>
              </tr>
              <tr>
                <td className="label-cell">Partnership Type:</td>
                <td>{reportData.governance.partnershipType}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStakeholderMappingContent = (data: StakeholderMappingReportData) => {
    const reportData = data.reportData;
    
    return (
      <div className="report-content">
        {/* Page 1 - Executive Summary */}
        <div className="report-page">
          <h2 className="section-title">Executive Summary</h2>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{reportData.summary.totalStakeholders}</div>
              <div className="metric-label">Total Stakeholders</div>
            </div>
            <div className="metric-card">
              <div className="metric-value metric-value-success">{reportData.summary.completedStakeholders}</div>
              <div className="metric-label">Completed Mappings</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{Math.round(reportData.summary.completionPercentage)}%</div>
              <div className="metric-label">Complete</div>
            </div>
          </div>
        </div>

        {/* Page 2 - Stakeholder Identification Table */}
        <div className="report-page page-break">
          <h2 className="section-title">Stakeholder Identification Table</h2>
          
          <table className="stakeholder-table">
            <thead>
              <tr>
                <th>Stakeholder Category</th>
                <th>Stakeholder Group</th>
                <th>Connection to Project Potential Benefits</th>
                <th>Connection to Project Potential Risks</th>
                <th>Roles and Responsibilities</th>
              </tr>
            </thead>
            <tbody>
              {reportData.stakeholderData.slice(0, 10).map((stakeholder, index) => (
                <tr key={stakeholder._id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="cell-bold">{stakeholder.category.name}</td>
                  <td className="cell-bold">{stakeholder.name}</td>
                  <td>The project offers benefits including potential for income enhancement. The project addresses key local issues and priorities.</td>
                  <td>The project might conflict with existing goals.</td>
                  <td>Participates in consultations, involved in project planning, local project impacts on services, supports community.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page 3 - Influence Impact Matrix */}
        <div className="report-page page-break">
          <h2 className="section-title">Stakeholder Influence and Impact Matrix (Scoring system from 1 - 5)</h2>
          
          <table className="influence-table">
            <thead>
              <tr>
                <th>Stakeholder Group</th>
                <th className="text-center">Influence on Project</th>
                <th className="text-center">Connection to Project</th>
                <th className="text-center">Risk</th>
                <th className="text-center">Roles/Responsibilities</th>
                <th className="text-center">Potential Benefits</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(reportData.summary.stakeholdersByCategory).slice(0, 5).map(([category, data], index) => (
                <tr key={category} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="cell-bold">{category}</td>
                  <td className="text-center cell-bold">{Math.round(data.averageRating)}</td>
                  <td className="text-center cell-bold">{Math.round(data.averageRating)}</td>
                  <td className="text-center cell-bold">{Math.round(data.averageRating)}</td>
                  <td className="text-center cell-bold">{Math.round(data.averageRating)}</td>
                  <td className="text-center cell-bold">{Math.round(data.averageRating)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Key Insights */}
          <div className="insights-section">
            <h3 className="subsection-title">Key Insights and Analysis</h3>
            <ul className="insights-list">
              <li><strong>Government:</strong> Holds high influence over the project through regulation, but is less dependent on its success. Compliance requirements are key.</li>
              <li><strong>Communities Affected:</strong> Highly dependent on the project and face significant risks if it fails; engagement is crucial.</li>
              <li><strong>Women, Youth, and Vulnerable Groups:</strong> Most vulnerable to negative impacts, requiring targeted interventions for inclusivity.</li>
              <li><strong>Partner Agencies:</strong> Strong collaborative role with moderate influence; can provide essential support.</li>
              <li><strong>Our Organization:</strong> Central to project execution, with both high influence and responsibility.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Simplified renderers for other report types (you can expand these)
  const renderProjectSiteSetupContent = (data: ProjectSiteSetupReportData) => {
    return <div className="report-content"><div className="report-page"><h2 className="section-title">Project Site Setup Report</h2><p>Content for site setup report...</p></div></div>;
  };

  const renderTheoryOfChangeContent = (data: TheoryOfChangeReportData) => {
    return <div className="report-content"><div className="report-page"><h2 className="section-title">Theory of Change Report</h2><p>Content for theory of change report...</p></div></div>;
  };

  const renderRiskRegisterContent = (data: RiskRegisterReportData) => {
    return <div className="report-content"><div className="report-page"><h2 className="section-title">Risk Register Report</h2><p>Content for risk register report...</p></div></div>;
  };

  // Main content renderer
  const renderReportContent = () => {
    switch (report.reportType) {
      case 'project_setup':
        return renderProjectSetupContent(report as ProjectSetupReportData);
      case 'project_site_setup':
        return renderProjectSiteSetupContent(report as ProjectSiteSetupReportData);
      case 'stakeholder_mapping':
        return renderStakeholderMappingContent(report as StakeholderMappingReportData);
      case 'theory_of_change':
        return renderTheoryOfChangeContent(report as TheoryOfChangeReportData);
      case 'risk_register':
        return renderRiskRegisterContent(report as RiskRegisterReportData);
      default:
        return (
          <div className="report-content">
            <div className="report-page text-center">
              <FileText size={48} className="mx-auto text-[#89a0ae] mb-4" />
              <h3 className="text-lg font-medium text-[#272236] mb-2">Unsupported Report Type</h3>
              <p className="text-[#89a0ae]">Report type "{report.reportType}" is not yet supported.</p>
            </div>
          </div>
        );
    }
  };

  if (!report) {
    return (
      <div className="p-8 text-center">
        <FileText size={48} className="mx-auto text-[#89a0ae] mb-4" />
        <h3 className="text-lg font-medium text-[#272236] mb-2">No Report Data</h3>
        <p className="text-[#89a0ae]">This report doesn't contain any data yet.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white print-content ${isModal ? '' : 'min-h-screen'}`} style={{ fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Professional Report Template */}
      <div className={`max-w-[8.5in] mx-auto bg-white ${isModal ? '' : 'shadow-2xl my-8'}`}>
        
        {/* Cover Page */}
        <div className="cover-page">
          {/* Header Banner - 1.55 inches */}
          <div className="header-banner">
            <div className="header-content">
              <div className="logo-text">REFLECT</div>
              <div className="tagline">Evidencing the social impact of nature investments</div>
            </div>
          </div>

          {/* Hero Section - 5.55 inches */}
          <div className="hero-section">
            <div className="hero-overlay">
              <div className="report-metadata">
                <div className="metadata-label">[Generated by the Reflect for Carbon - {getReportTypeTitle(report.reportType)} Module]</div>
                
                <div className="metadata-grid">
                  <div><span className="metadata-key">Project Name:</span> {report.project?.name || '[Auto-fill]'}</div>
                  <div><span className="metadata-key">Reporting Period:</span> {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
                  <div><span className="metadata-key">Organisation:</span> {report.organization?.name || '[Auto-fill]'}</div>
                  <div><span className="metadata-key">Version:</span> [Auto-fill]</div>
                </div>

                <p className="report-description">
                  {getReportDescription(report.reportType)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Banner - 1.05 inches */}
          <div className="footer-banner">
            <h1 className="report-title">
              {getReportTypeTitle(report.reportType)} V1
            </h1>
          </div>
        </div>

        {/* Report Content Pages */}
        <div className="content-pages">
          {renderReportContent()}
        </div>

        {/* Final Footer */}
        <div className="final-footer">
          <div className="footer-text">
            {getReportTypeTitle(report.reportType)} Template V1
          </div>
        </div>
      </div>

      {/* Comprehensive Print Styles */}
      <style jsx global>{`
        /* SORA Font - Make sure this is imported in your main CSS */
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        /* Base Print Styles */
        @page {
          margin: 0;
          size: A4 portrait;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-size: 10pt;
            line-height: 1.3;
          }
          
          .page-break {
            page-break-before: always;
            break-before: page;
          }

          /* Hide modal chrome */
          [data-modal-chrome] {
            display: none !important;
          }

          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }

        /* COVER PAGE STYLES */
        .cover-page {
          position: relative;
          page-break-after: always;
        }

        .header-banner {
          background-color: #272236;
          height: 1.55in;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .header-content {
          color: white;
        }

        .logo-text {
          font-size: 24pt;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          font-family: 'Sora', sans-serif;
        }

        .tagline {
          font-size: 10pt;
          opacity: 0.9;
          font-weight: 400;
          font-family: 'Sora', sans-serif;
        }

        .hero-section {
          background: linear-gradient(to right, #4A90E2, #50C878, #F5C842);
          height: 5.55in;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 24pt;
        }

        .hero-overlay {
          background-color: rgba(137, 160, 174, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 8pt;
          padding: 24pt;
          color: white;
          width: 100%;
        }

        .report-metadata {
          font-family: 'Sora', sans-serif;
        }

        .metadata-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 10pt;
          font-weight: 500;
          margin-bottom: 12pt;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8pt;
          margin-bottom: 16pt;
          font-size: 10pt;
        }

        .metadata-key {
          font-weight: 600;
        }

        .report-description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 10pt;
          line-height: 1.5;
        }

        .footer-banner {
          background-color: #272236;
          height: 1.05in;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-title {
          color: white;
          font-size: 18pt;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
        }

        /* CONTENT PAGES STYLES */
        .content-pages {
          background: white;
        }

        .report-content {
          font-family: 'Sora', sans-serif;
        }

        .report-page {
          padding: 32pt;
          min-height: 9in;
        }

        .section-title {
          background-color: #e6eaed;
          color: #272236;
          font-weight: 600;
          font-size: 13pt;
          padding: 12pt 16pt;
          border-radius: 4pt;
          margin-bottom: 16pt;
          font-family: 'Sora', sans-serif;
        }

        .subsection-title {
          font-weight: 600;
          font-size: 11pt;
          color: #272236;
          margin-bottom: 8pt;
          font-family: 'Sora', sans-serif;
        }

        /* TABLES */
        .data-table,
        .stakeholder-table,
        .influence-table {
          width: 100%;
          border-collapse: collapse;
          margin: 12pt 0;
          font-family: 'Sora', sans-serif;
        }

        .data-table th,
        .stakeholder-table th,
        .influence-table th {
          background-color: #89a0ae;
          color: white;
          font-weight: 600;
          font-size: 9pt;
          padding: 8pt;
          text-align: left;
          border: 1pt solid #89a0ae;
        }

        .data-table td,
        .stakeholder-table td,
        .influence-table td {
          padding: 6pt 8pt;
          font-size: 10pt;
          border: 1pt solid #89a0ae;
          color: #272236;
        }

        .stakeholder-table tbody tr:nth-child(even),
        .influence-table tbody tr:nth-child(even) {
          background-color: #e6eaed;
        }

        .label-cell {
          font-weight: 600;
          width: 35%;
        }

        .cell-bold {
          font-weight: 600;
        }

        .text-center {
          text-align: center;
        }

        .row-even {
          background-color: #e6eaed;
        }

        .row-odd {
          background-color: white;
        }

        /* GRIDS */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24pt;
          margin: 16pt 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24pt;
          margin: 24pt 0;
        }

        .risk-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16pt;
          margin: 16pt 0;
        }

        /* INFO SECTIONS */
        .info-section {
          background-color: #e6eaed;
          border-radius: 8pt;
          padding: 16pt;
        }

        .metric-card {
          background-color: #e6eaed;
          border-radius: 8pt;
          padding: 16pt;
          text-align: center;
        }

        .metric-value {
          font-size: 24pt;
          font-weight: 700;
          color: #272236;
          margin-bottom: 4pt;
          font-family: 'Sora', sans-serif;
        }

        .metric-value-success {
          color: #16A34A;
        }

        .metric-label {
          font-size: 10pt;
          color: #89a0ae;
          font-family: 'Sora', sans-serif;
        }

        .metric-box {
          background-color: white;
          border-radius: 8pt;
          padding: 16pt;
          text-align: center;
        }

        .progress-detail {
          font-size: 10pt;
          color: #272236;
          margin-top: 8pt;
        }

        /* RISK CARDS */
        .risk-card {
          padding: 16pt;
          border-radius: 8pt;
          border: 2pt solid;
        }

        .risk-present {
          background-color: #FEF2F2;
          border-color: #FECACA;
        }

        .risk-absent {
          background-color: #F0FDF4;
          border-color: #BBF7D0;
        }

        .risk-header {
          display: flex;
          align-items: center;
          gap: 8pt;
          margin-bottom: 8pt;
        }

        .risk-indicator {
          width: 12pt;
          height: 12pt;
          border-radius: 50%;
        }

        .risk-indicator-red {
          background-color: #EF4444;
        }

        .risk-indicator-green {
          background-color: #10B981;
        }

        .risk-label {
          font-weight: 600;
          color: #272236;
          font-size: 11pt;
        }

        .risk-status {
          padding: 6pt 12pt;
          border-radius: 6pt;
          font-size: 10pt;
          font-weight: 600;
          text-align: center;
        }

        .risk-status-identified {
          background-color: #FEE2E2;
          color: #991B1B;
        }

        .risk-status-none {
          background-color: #DCFCE7;
          color: #166534;
        }

        .risk-note {
          margin-top: 12pt;
          padding: 8pt;
          background-color: white;
          border-radius: 4pt;
          font-size: 10pt;
          color: #272236;
          font-style: italic;
        }

        /* INSIGHTS */
        .insights-section {
          margin-top: 24pt;
        }

        .insights-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .insights-list li {
          margin-bottom: 12pt;
          padding-left: 20pt;
          position: relative;
          font-size: 10pt;
          line-height: 1.5;
          color: #272236;
        }

        .insights-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #89a0ae;
          font-weight: 600;
        }

        .insights-list li strong {
          font-weight: 700;
        }

        /* FINAL FOOTER */
        .final-footer {
          background-color: #272236;
          padding: 16pt;
          text-align: center;
          min-height: 0.67in;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-text {
          color: white;
          font-size: 11pt;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
        }

        /* UTILITIES */
        .full-width {
          width: 100%;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .mb-4 {
          margin-bottom: 16pt;
        }

        .text-lg {
          font-size: 14pt;
        }

        .font-medium {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalReportTemplate;