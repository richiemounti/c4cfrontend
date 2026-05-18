// components/reports/types/ProjectSiteSetupReportContent.tsx
'use client';

import { useState } from 'react';
import { 
  MapPin, Building, Users, GraduationCap, Briefcase, 
  CheckCircle, ChevronDown, ChevronRight, 
  Globe, Calendar, Eye, EyeOff, 
  AlertTriangle, Wheat, Cat
} from 'lucide-react';
import { BaseReportData, ProjectSiteSetupReportData } from '@/types/reports';
import GPSCoordinateDisplay from '../visuals/GPSCoordinateDisplay';

interface ProjectSiteSetupReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
}

const ProjectSiteSetupReportContent: React.FC<ProjectSiteSetupReportContentProps> = ({ 
  report, 
  onUpdate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    metadata: false,
    location: false,
    demographics: false,
    education: false,
    livelihoods: false,
    wildlife: false
  });

  const setupReport = report as ProjectSiteSetupReportData;
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
    const iconColor = isExpanded ? 'text-white' : 'text-ochre';
    const icons: Record<string, React.ReactNode> = {
      overview: <Building className={iconColor} size={20} />,
      metadata: <MapPin className={iconColor} size={20} />,
      location: <MapPin className={iconColor} size={20} />,
      demographics: <Users className={iconColor} size={20} />,
      education: <GraduationCap className={iconColor} size={20} />,
      livelihoods: <Briefcase className={iconColor} size={20} />,
      wildlife: <AlertTriangle className={iconColor} size={20} />
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
      <div className="border border-ochre rounded-lg mb-6 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection(key)}
          className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 ${
            isExpanded 
              ? 'bg-ochre text-white' 
              : 'bg-ochre-50 hover:bg-ochre-100 text-stratosphere'
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
                  : 'bg-ochre text-white'
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
          <div className="p-6 bg-white border-t border-ochre/20">
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
      {/* Site Overview */}
      {renderSection(
        'Site Overview',
        'overview',
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <MapPin className="mr-2 text-ochre flex-shrink-0" size={20} />
                Site Information
              </h4>
              <div className="space-y-3">
                {renderDataRow('Site Name', reportData.siteInfo.name, true)}
                {renderDataRow('Site Type', reportData.siteInfo.siteType)}
                {renderDataRow('Status', reportData.siteInfo.status)}
                {reportData.siteInfo.region && renderDataRow('Region', reportData.siteInfo.region)}
                {reportData.siteInfo.size && renderDataRow('Size', `${reportData.siteInfo.size} ${reportData.siteInfo.sizeUnit || 'units'}`)}
              </div>
            </div>
            
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Building className="mr-2 text-ochre flex-shrink-0" size={20} />
                Project Context
              </h4>
              <div className="space-y-3">
                {renderDataRow('Project Name', reportData.projectInfo.name, true)}
                {renderDataRow('Project Status', reportData.projectInfo.status)}
                {renderDataRow('Organization', reportData.organizationInfo.name)}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-ochre-50 to-ochre-100 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Key Demographics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-stratosphere">
                    {reportData.demographics.estimatedPopulation?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-ochre">Population</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-stratosphere">
                    {reportData.demographics.ethnicGroupsPresent?.length || 0}
                  </div>
                  <div className="text-sm text-ochre">Ethnic Groups</div>
                </div>
              </div>
            </div>

            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Vulnerability Status</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${reportData.demographics.vulnerableGroupsPresent ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-stratosphere font-medium">
                    {reportData.demographics.vulnerableGroupsPresent ? 'Vulnerable Groups Present' : 'No Vulnerable Groups Identified'}
                  </span>
                </div>
                {reportData.demographics.vulnerabilityIndicators && reportData.demographics.vulnerabilityIndicators.length > 0 && (
                  <div className="ml-7">
                    <p className="text-sm text-ochre">Indicators: {reportData.demographics.vulnerabilityIndicators.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Metadata */}
      {renderSection(
        'Site Metadata',
        'metadata',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
            <h4 className="font-semibold text-stratosphere mb-4">Site Details</h4>
            <div className="space-y-3">
              {renderDataRow('Site Name', reportData.siteMetadata.siteName)}
              {renderDataRow('Project Name', reportData.siteMetadata.projectName)}
              {renderDataRow('Location Description', reportData.siteMetadata.siteLocationDescription)}
            </div>
          </div>
          
          <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
            <h4 className="font-semibold text-stratosphere mb-4">Timeline Information</h4>
            <div className="space-y-3">
              {reportData.setupProgress.completedAt && renderDataRow('Completed Date', new Date(reportData.setupProgress.completedAt).toLocaleDateString())}
              {reportData.setupProgress.lastUpdatedBy && renderDataRow('Last Updated By', reportData.setupProgress.lastUpdatedBy.name)}
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      {renderSection(
        'Location Details',
        'location',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Administrative Boundaries</h4>
              <div className="space-y-3">
                {renderDataRow('Region (Admin Level 1)', reportData.location.adminLevel1, true)}
                {renderDataRow('District (Admin Level 2)', reportData.location.adminLevel2)}
                {renderDataRow('Ward/Location (Admin Level 3)', reportData.location.adminLevel3)}
              </div>
            </div>
            
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Physical Characteristics</h4>
              <div className="space-y-3">
                {/* UPDATED: Using GPSCoordinateDisplay component */}
                <GPSCoordinateDisplay 
                  coordinates={reportData.location.gpsCoordinates}
                  label="GPS Coordinates"
                  showMap={false}
                />
                {renderDataRow('Site Coverage', `${reportData.location.siteHectareCoverage} hectares`, true)}
                {renderDataRow('Ecological Zone', reportData.location.siteEcologicalZone)}
              </div>
            </div>
          </div>
          
          {/* UPDATED: Using GPSCoordinateDisplay with embedded map */}
          {reportData.location.gpsCoordinates && (
            <div className="bg-gradient-to-r from-ochre-50 to-ochre-100 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Site Map</h4>
              <GPSCoordinateDisplay 
                coordinates={reportData.location.gpsCoordinates}
                label="Site Location"
                showMap={true}
                className="border-b-0"
              />
              <p className="text-sm text-ochre mt-2 text-center">
                Coverage: {reportData.location.siteHectareCoverage} hectares
              </p>
            </div>
          )}
        </div>
      )}

      {/* Demographics */}
      {renderSection(
        'Demographics',
        'demographics',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Users className="mr-2 text-ochre flex-shrink-0" size={20} />
                Population Data
              </h4>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-stratosphere mb-2">
                    {reportData.demographics.estimatedPopulation?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-ochre">Total Population</div>
                </div>
                
                {reportData.demographics.genderDistribution && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Gender Distribution</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{formatTaskValue(reportData.demographics.genderDistribution)}</span>
                    </div>
                  </div>
                )}
                
                {reportData.demographics.ageDistribution && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Age Distribution</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{formatTaskValue(reportData.demographics.ageDistribution)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4">Social Groups</h4>
              <div className="space-y-4">
                {reportData.demographics.ethnicGroupsPresent && reportData.demographics.ethnicGroupsPresent.length > 0 && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Ethnic Groups</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{reportData.demographics.ethnicGroupsPresent.join(', ')}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h5 className="font-medium text-stratosphere mb-2">Vulnerable Groups</h5>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${reportData.demographics.vulnerableGroupsPresent ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className="text-stratosphere font-medium">
                        {reportData.demographics.vulnerableGroupsPresent ? 'Present' : 'Not Present'}
                      </span>
                    </div>
                    {reportData.demographics.vulnerabilityIndicators && reportData.demographics.vulnerabilityIndicators.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-ochre font-medium">Vulnerability Indicators:</p>
                        <div className="flex flex-wrap gap-2">
                          {reportData.demographics.vulnerabilityIndicators.map((indicator, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {renderSection(
        'Education',
        'education',
        <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
          <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
            <GraduationCap className="mr-2 text-ochre flex-shrink-0" size={20} />
            Education Summary
          </h4>
          <div className="bg-white p-4 rounded border">
            <p className="text-stratosphere">
              {reportData.education.educationSummary || 'No education summary provided'}
            </p>
          </div>
        </div>
      )}

      {/* Livelihoods */}
      {renderSection(
        'Livelihoods',
        'livelihoods',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Briefcase className="mr-2 text-ochre flex-shrink-0" size={20} />
                Income Sources
              </h4>
              <div className="space-y-4">
                {reportData.livelihoods.primaryIncomeSources && reportData.livelihoods.primaryIncomeSources.length > 0 && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Primary Income Sources</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{reportData.livelihoods.primaryIncomeSources.join(', ')}</span>
                    </div>
                  </div>
                )}
                
                {reportData.livelihoods.secondaryIncomeSources && reportData.livelihoods.secondaryIncomeSources.length > 0 && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Secondary Income Sources</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{reportData.livelihoods.secondaryIncomeSources.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Wheat className="mr-2 text-ochre flex-shrink-0" size={20} />
                Agriculture
              </h4>
              <div className="space-y-4">
                {reportData.livelihoods.cultivatedLandSize && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Cultivated Land Size</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{formatTaskValue(reportData.livelihoods.cultivatedLandSize)}</span>
                    </div>
                  </div>
                )}
                
                {reportData.livelihoods.cropsGrown && reportData.livelihoods.cropsGrown.length > 0 && (
                  <div>
                    <h5 className="font-medium text-stratosphere mb-2">Crops Grown</h5>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-stratosphere text-sm">{reportData.livelihoods.cropsGrown.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {reportData.livelihoods.livestockProfile && reportData.livelihoods.livestockProfile.length > 0 && (
            <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Cat className="mr-2 text-ochre flex-shrink-0" size={20} />
                Livestock Profile
              </h4>
              <div className="bg-white p-4 rounded border">
                <span className="text-stratosphere">{formatTaskValue(reportData.livelihoods.livestockProfile)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wildlife Conflict */}
      {renderSection(
        'Wildlife Conflict',
        'wildlife',
        <div className="bg-ochre-50 rounded-lg p-6 border border-ochre">
          <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-ochre flex-shrink-0" size={20} />
            Wildlife Conflict Assessment
          </h4>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${reportData.wildlifeConflict.wildlifeConflictPresent ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-stratosphere font-medium">
                  {reportData.wildlifeConflict.wildlifeConflictPresent ? 'Wildlife Conflict Present' : 'No Wildlife Conflict'}
                </span>
              </div>
            </div>
            
            {reportData.wildlifeConflict.wildlifeConflictSummary && reportData.wildlifeConflict.wildlifeConflictSummary.length > 0 && (
              <div>
                <h5 className="font-medium text-stratosphere mb-2">Conflict Summary</h5>
                <div className="bg-white p-4 rounded border">
                  <span className="text-stratosphere">{formatTaskValue(reportData.wildlifeConflict.wildlifeConflictSummary)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSiteSetupReportContent;