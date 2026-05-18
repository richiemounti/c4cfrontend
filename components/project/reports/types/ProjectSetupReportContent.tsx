// components/reports/types/ProjectSetupReportContent.tsx
'use client';

import { useState } from 'react';
import { 
  MapPin, Building, Users, Shield, AlertTriangle, 
  CheckCircle, ChevronDown, ChevronRight, 
  Award, Globe, FileText, Calendar,
  Eye, EyeOff, ExternalLink, Building2
} from 'lucide-react';
import { BaseReportData, ProjectSetupReportData } from '@/types/reports';
import GPSCoordinateDisplay from '../visuals/GPSCoordinateDisplay';

interface ProjectSetupReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
}

const ProjectSetupReportContent: React.FC<ProjectSetupReportContentProps> = ({ 
  report, 
  onUpdate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    metadata: false,
    location: false,
    governance: false,
    landTenure: false,
    risks: false,
    sites: false
  });

  const setupReport = report as ProjectSetupReportData;
  const reportData = setupReport.reportData;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatTaskValue = (value: any): string => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not specified';
      return value.join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const getSectionIcon = (section: string, isExpanded: boolean) => {
    const iconColor = isExpanded ? 'text-white' : 'text-sky';
    const icons: Record<string, React.ReactNode> = {
      overview: <Building className={iconColor} size={20} />,
      metadata: <Award className={iconColor} size={20} />,
      location: <MapPin className={iconColor} size={20} />,
      governance: <Users className={iconColor} size={20} />,
      landTenure: <Shield className={iconColor} size={20} />,
      risks: <AlertTriangle className={iconColor} size={20} />,
      sites: <Building2 className={iconColor} size={20} />
    };
    return icons[section];
  };

  const renderSection = (
    title: string, 
    key: string, 
    content: React.ReactNode,
    itemCount?: number
  ) => {
    const isExpanded = expandedSections[key];
    return (
      <div className="border border-sky rounded-lg mb-6 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection(key)}
          className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 ${
            isExpanded 
              ? 'bg-sky text-white' 
              : 'bg-sky-tint/50 hover:bg-sky-tint text-stratosphere'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors ${
              isExpanded ? 'bg-white/20' : 'bg-white'
            }`}>
              {getSectionIcon(key, isExpanded)}
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            {itemCount !== undefined && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isExpanded 
                  ? 'bg-white/20 text-white' 
                  : 'bg-sky text-white'
              }`}>
                {itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <>
                <EyeOff size={16} />
                <ChevronDown size={20} />
              </>
            ) : (
              <>
                <Eye size={16} />
                <ChevronRight size={20} />
              </>
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-6 bg-white border-t border-sky/20">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderDataRow = (label: string, value: any, isHighlight?: boolean) => (
    <div className={`py-3 border-b border-sky-tint/50 last:border-b-0 ${
      isHighlight ? 'bg-sky-tint/30 rounded' : ''
    }`}>
      <div className="flex flex-col gap-1">
        <span className="text-sky text-xs font-medium uppercase tracking-wide">{label}</span>
        <span className="text-stratosphere text-sm break-words">{formatTaskValue(value)}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Executive Summary */}
      {renderSection(
        'Executive Summary',
        'overview',
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Building className="mr-2 text-sky flex-shrink-0" size={20} />
                Project Information
              </h4>
              <div className="space-y-3">
                {renderDataRow('Project Name', reportData.projectInfo.name, true)}
                {/* {renderDataRow('Status', reportData.projectInfo.status)} */}
                {renderDataRow('Description', reportData.projectInfo.description)}
              </div>
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Globe className="mr-2 text-sky flex-shrink-0" size={20} />
                Organization
              </h4>
              <div className="space-y-3">
                {renderDataRow('Organization', reportData.organizationInfo.name, true)}
                {reportData.organizationInfo.country && renderDataRow('Country', reportData.organizationInfo.country)}
                {reportData.organizationInfo.city && renderDataRow('City', reportData.organizationInfo.city)}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sky-tint to-sky-tint/50 rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-stratosphere">
                    {reportData.projectSites?.length || 0}
                  </div>
                  <div className="text-sm text-sky">Project Sites</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-stratosphere">
                    {reportData.locationContext.hectareCoverage || 0}
                  </div>
                  <div className="text-sm text-sky">Hectares</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Risk Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'conflictHistory', label: 'Conflict Risk' },
                  { key: 'politicalRisk', label: 'Political Risk' },
                  { key: 'accessIssues', label: 'Access Risk' },
                  { key: 'previousProjectFailures', label: 'Project Risk' }
                ].map(risk => (
                  <div key={risk.key} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      reportData.riskAssessment[risk.key as keyof typeof reportData.riskAssessment] 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-stratosphere">{risk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Metadata */}
      {renderSection(
        'Project Metadata',
        'metadata',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-sky-tint rounded-lg p-6 border border-sky">
            <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
              <Award className="mr-2 text-sky flex-shrink-0" size={20} />
              Certification Details
            </h4>
            <div className="space-y-3">
              {renderDataRow('Certification Standard', reportData.projectMetadata.certificationStandard)}
              {renderDataRow('Project Name (Certified)', reportData.projectMetadata.projectName)}
            </div>
          </div>
          
          <div className="bg-sky-tint rounded-lg p-6 border border-sky">
            <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
              <Calendar className="mr-2 text-sky flex-shrink-0" size={20} />
              Timeline Information
            </h4>
            <div className="space-y-3">
              {reportData.setupProgress.completedAt && renderDataRow('Completed Date', new Date(reportData.setupProgress.completedAt).toLocaleDateString())}
              {reportData.setupProgress.lastUpdatedBy && renderDataRow('Last Updated By', reportData.setupProgress.lastUpdatedBy.name)}
            </div>
          </div>
        </div>
      )}

      {/* Location Context */}
      {renderSection(
        'Location Context',
        'location',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Administrative Boundaries</h4>
              <div className="space-y-3">
                {renderDataRow('Country', reportData.locationContext.country, true)}
                {renderDataRow('Region (Admin Level 1)', reportData.locationContext.adminLevel1)}
                {renderDataRow('District (Admin Level 2)', reportData.locationContext.adminLevel2)}
                {renderDataRow('Ward/Location (Admin Level 3)', reportData.locationContext.adminLevel3)}
                {renderDataRow('Villages', reportData.locationContext.villages)}
              </div>
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Physical Characteristics</h4>
              <div className="space-y-3">
                {/* UPDATED: Using GPSCoordinateDisplay component */}
                <GPSCoordinateDisplay 
                  coordinates={reportData.locationContext.gpsCoordinates}
                  label="GPS Coordinates"
                  showMap={false}
                />
                {renderDataRow('Hectare Coverage', `${reportData.locationContext.hectareCoverage} hectares`, true)}
                {renderDataRow('Ecological Zone', reportData.locationContext.ecologicalZone)}
              </div>
            </div>
          </div>
          
          {/* UPDATED: Using GPSCoordinateDisplay with embedded map */}
          {reportData.locationContext.gpsCoordinates && (
            <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Location Map</h4>
              <GPSCoordinateDisplay 
                coordinates={reportData.locationContext.gpsCoordinates}
                label="Project Location"
                showMap={true}
                className="border-b-0"
              />
            </div>
          )}
        </div>
      )}

      {/* Governance Structure */}
      {renderSection(
        'Governance Structure',
        'governance',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Approval & Implementation</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Approval Granted By:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.governance.approvalGrantedBy)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Implementing Organizations:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.governance.implementingOrganisations)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Oversight & Partnerships</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Oversight Authorities:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.governance.oversightAuthorities)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Partnership Type:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.governance.partnershipType)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-sky-tint rounded-lg p-6 border border-sky">
            <h4 className="font-semibold text-stratosphere mb-4">Customary Institutions</h4>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${reportData.governance.customaryInstitutionsInvolved ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-stratosphere font-medium">
                  {reportData.governance.customaryInstitutionsInvolved ? 'Customary Institutions Involved' : 'No Customary Institutions Involved'}
                </span>
              </div>
              {reportData.governance.customaryInstitutionsDetails && (
                <p className="text-sky text-sm ml-7">{reportData.governance.customaryInstitutionsDetails}</p>
              )}
            </div>
          </div>
          
          {reportData.governance.governanceNotes && (
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Additional Governance Notes</h4>
              <div className="bg-white p-4 rounded border">
                <p className="text-stratosphere">{reportData.governance.governanceNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Land Tenure */}
      {renderSection(
        'Land Tenure',
        'landTenure',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Rights Holders</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Customary Rights Holder:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.landTenure.customaryRightsHolder)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sky text-sm font-medium block mb-2">Formal Rights Holder:</span>
                  <div className="bg-white p-3 rounded border">
                    <span className="text-stratosphere text-sm">{formatTaskValue(reportData.landTenure.formalRightsHolder)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Claims & Agreements</h4>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${reportData.landTenure.overlappingClaims ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-stratosphere font-medium">
                      {reportData.landTenure.overlappingClaims ? 'Overlapping Claims Exist' : 'No Overlapping Claims'}
                    </span>
                  </div>
                </div>
                
                {reportData.landTenure.landAgreementsUploaded && (
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center space-x-3">
                      <FileText size={16} className="text-sky flex-shrink-0" />
                      <span className="text-stratosphere font-medium">Land Agreements Uploaded</span>
                      <ExternalLink size={14} className="text-sky flex-shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {reportData.landTenure.landTenureNotes && (
            <div className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Land Tenure Notes</h4>
              <div className="bg-white p-4 rounded border">
                <p className="text-stratosphere">{reportData.landTenure.landTenureNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment */}
      {renderSection(
        'Risk Assessment',
        'risks',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              key: 'conflictHistory', 
              label: 'Conflict History', 
              description: 'Historical conflicts in the project area',
              note: reportData.riskAssessment.conflictNotes 
            },
            { 
              key: 'politicalRisk', 
              label: 'Political Risk',
              description: 'Political instability or policy changes'
            },
            { 
              key: 'accessIssues', 
              label: 'Access Issues',
              description: 'Physical or legal access limitations',
              note: reportData.riskAssessment.accessNotes 
            },
            { 
              key: 'previousProjectFailures', 
              label: 'Previous Project Failures',
              description: 'History of failed projects in the area',
              note: reportData.riskAssessment.previousFailureNotes 
            }
          ].map(risk => {
            const hasRisk = reportData.riskAssessment[risk.key as keyof typeof reportData.riskAssessment];
            return (
              <div key={risk.key} className={`rounded-lg p-6 border-2 ${
                hasRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-stratosphere">{risk.label}</h4>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${hasRisk ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
                <p className="text-sm text-sky mb-3">{risk.description}</p>
                <div className={`p-3 rounded text-sm font-medium ${
                  hasRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {hasRisk ? 'Risk Identified' : 'No Risk Detected'}
                </div>
                {risk.note && hasRisk && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-stratosphere text-sm">{risk.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Project Sites */}
      {reportData.projectSites && reportData.projectSites.length > 0 && renderSection(
        'Project Sites',
        'sites',
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.projectSites.map((site, index) => (
            <div key={site.id || index} className="bg-sky-tint rounded-lg p-6 border border-sky">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-stratosphere">{site.name}</h4>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  site.status === 'active' ? 'bg-green-100 text-green-800' :
                  site.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {site.status || 'Unknown'}
                </span>
              </div>
              <div className="space-y-2">
                {site.region && (
                  <p className="text-sm text-sky flex items-center">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    {site.region}
                  </p>
                )}
                {site.city && (
                  <p className="text-sm text-sky flex items-center">
                    <Building2 size={14} className="mr-1 flex-shrink-0" />
                    {site.city}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>,
        reportData.projectSites.length
      )}
    </div>
  );
};

export default ProjectSetupReportContent;