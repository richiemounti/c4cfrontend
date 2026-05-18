// components/reports/pdf/ProjectSiteSetupReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ProjectSiteSetupReportData } from '@/types/reports';

// Register Sora font
Font.register({
  family: 'Sora',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Sora',
    fontSize: 10,
    color: '#272236',
    backgroundColor: '#FFFFFF',
  },
  
  // COVER PAGE
  coverPage: {
    width: '100%',
    height: '100%',
  },
  
  header: {
    backgroundColor: '#272236',
    height: '1.55in',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 4,
  },
  
  tagline: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.9,
  },
  
  heroSection: {
    height: '5.55in',
    backgroundColor: '#89a0ae',
    padding: 24,
    justifyContent: 'flex-end',
  },
  
  heroOverlay: {
    backgroundColor: 'rgba(137, 160, 174, 0.9)',
    borderRadius: 8,
    padding: 24,
  },
  
  metadataLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 500,
    marginBottom: 12,
    opacity: 0.8,
  },
  
  metadataGrid: {
    marginBottom: 16,
  },
  
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 10,
    color: '#FFFFFF',
  },
  
  metadataKey: {
    fontWeight: 600,
    marginRight: 4,
  },
  
  reportDescription: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 1.5,
    opacity: 0.9,
  },
  
  footerBanner: {
    backgroundColor: '#272236',
    height: '1.05in',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  reportTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 600,
  },
  
  // CONTENT PAGES
  contentPage: {
    padding: 32,
  },
  
  sectionTitle: {
    backgroundColor: '#e6eaed',
    color: '#272236',
    fontSize: 13,
    fontWeight: 600,
    padding: '12 16',
    borderRadius: 4,
    marginBottom: 16,
  },
  
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#272236',
    marginBottom: 8,
    marginTop: 12,
  },
  
  // INFO GRID
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 12,
  },
  
  infoSection: {
    backgroundColor: '#e6eaed',
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  
  // DATA TABLE
  table: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e6eaed',
    paddingVertical: 6,
  },
  
  labelCell: {
    width: '35%',
    fontSize: 10,
    fontWeight: 600,
    color: '#89a0ae',
    paddingRight: 8,
  },
  
  valueCell: {
    width: '65%',
    fontSize: 10,
    color: '#272236',
  },
  
  // METRICS
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 12,
  },
  
  metricCard: {
    backgroundColor: '#e6eaed',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#272236',
    marginBottom: 4,
  },
  
  metricLabel: {
    fontSize: 9,
    color: '#89a0ae',
    textAlign: 'center',
  },
  
  // TAG LIST
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  
  tag: {
    backgroundColor: '#89a0ae',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
  },
  
  // FINAL FOOTER
  finalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#272236',
    padding: 16,
    textAlign: 'center',
  },
  
  footerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 600,
  },
});

interface ProjectSiteSetupReportPDFProps {
  report: ProjectSiteSetupReportData;
}

const ProjectSiteSetupReportPDF: React.FC<ProjectSiteSetupReportPDFProps> = ({ report }) => {
  const reportData = report.reportData;

  const formatValue = (value: any): string => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not specified';
      return value.join(', ');
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <View style={styles.header}>
            <Text style={styles.logoText}>REFLECT</Text>
            <Text style={styles.tagline}>Evidencing the social impact of nature investments</Text>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroOverlay}>
              <Text style={styles.metadataLabel}>
                [Generated by the Reflect for Carbon - Project Site Setup Report Module]
              </Text>
              
              <View style={styles.metadataGrid}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Project Name:</Text>
                  <Text> {reportData.projectInfo.name}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Site Name:</Text>
                  <Text> {reportData.siteInfo.name}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Reporting Period:</Text>
                  <Text> {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Organisation:</Text>
                  <Text> {reportData.organizationInfo.name}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Version:</Text>
                  <Text> V1</Text>
                </View>
              </View>

              <Text style={styles.reportDescription}>
                This report presents the findings of a project site setup assessment to evaluate 
                site-specific conditions, demographics, and local context.
              </Text>
            </View>
          </View>

          <View style={styles.footerBanner}>
            <Text style={styles.reportTitle}>Project Site Setup Report V1</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 1 - EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Site Information</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Name:</Text>
                  <Text style={styles.valueCell}>{reportData.siteInfo.name}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Type:</Text>
                  <Text style={styles.valueCell}>{reportData.siteInfo.siteType}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Status:</Text>
                  <Text style={styles.valueCell}>{reportData.siteInfo.status}</Text>
                </View>
                {reportData.siteInfo.region && (
                  <View style={styles.tableRow}>
                    <Text style={styles.labelCell}>Region:</Text>
                    <Text style={styles.valueCell}>{reportData.siteInfo.region}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Setup Progress</Text>
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ fontSize: 32, fontWeight: 700, color: '#272236', marginBottom: 4 }}>
                  {Math.round(reportData.setupProgress.overallProgress)}%
                </Text>
                <Text style={{ fontSize: 10, color: '#89a0ae', marginBottom: 8 }}>Complete</Text>
                <Text style={{ fontSize: 9, color: '#272236', textAlign: 'center' }}>
                  {reportData.setupProgress.completedTasks} of {reportData.setupProgress.totalTasks} tasks completed
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{reportData.setupProgress.totalTasks}</Text>
              <Text style={styles.metricLabel}>Total Tasks</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#16A34A' }]}>{reportData.setupProgress.completedTasks}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#cd8028' }]}>{reportData.setupProgress.requiredTasks}</Text>
              <Text style={styles.metricLabel}>Required</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{reportData.demographics.estimatedPopulation?.toLocaleString() || 0}</Text>
              <Text style={styles.metricLabel}>Population</Text>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Site Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 2 - LOCATION & DEMOGRAPHICS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Location Context</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Administrative Boundaries</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Region:</Text>
                  <Text style={styles.valueCell}>{reportData.location.adminLevel1}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>District:</Text>
                  <Text style={styles.valueCell}>{reportData.location.adminLevel2}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Ward:</Text>
                  <Text style={styles.valueCell}>{reportData.location.adminLevel3}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Physical Characteristics</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>GPS:</Text>
                  <Text style={styles.valueCell}>{reportData.location.gpsCoordinates}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Coverage:</Text>
                  <Text style={styles.valueCell}>{reportData.location.siteHectareCoverage} ha</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Ecological Zone:</Text>
                  <Text style={styles.valueCell}>{formatValue(reportData.location.siteEcologicalZone)}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Demographics</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Population Data</Text>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 24, fontWeight: 700, color: '#272236' }}>
                  {reportData.demographics.estimatedPopulation?.toLocaleString() || 'N/A'}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Population</Text>
              </View>
              
              {reportData.demographics.ethnicGroupsPresent && reportData.demographics.ethnicGroupsPresent.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Ethnic Groups</Text>
                  <View style={styles.tagList}>
                    {reportData.demographics.ethnicGroupsPresent.slice(0, 6).map((group, index) => (
                      <View key={index} style={styles.tag}>
                        <Text>{group}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Vulnerability Status</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 10, marginBottom: 8, color: '#272236' }}>
                  Vulnerable Groups: {reportData.demographics.vulnerableGroupsPresent ? 'Present' : 'Not Present'}
                </Text>
                {reportData.demographics.vulnerabilityIndicators && reportData.demographics.vulnerabilityIndicators.length > 0 && (
                  <View style={styles.tagList}>
                    {reportData.demographics.vulnerabilityIndicators.map((indicator, index) => (
                      <View key={index} style={[styles.tag, { backgroundColor: '#DC2626' }]}>
                        <Text>{indicator}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Site Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 3 - LIVELIHOODS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Livelihoods</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Income Sources</Text>
              {reportData.livelihoods.primaryIncomeSources && reportData.livelihoods.primaryIncomeSources.length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: '#89a0ae', marginTop: 8, marginBottom: 4 }}>Primary:</Text>
                  <View style={styles.tagList}>
                    {reportData.livelihoods.primaryIncomeSources.map((source, index) => (
                      <View key={index} style={styles.tag}>
                        <Text>{source}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              
              {reportData.livelihoods.secondaryIncomeSources && reportData.livelihoods.secondaryIncomeSources.length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: '#89a0ae', marginTop: 12, marginBottom: 4 }}>Secondary:</Text>
                  <View style={styles.tagList}>
                    {reportData.livelihoods.secondaryIncomeSources.map((source, index) => (
                      <View key={index} style={styles.tag}>
                        <Text>{source}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Agriculture</Text>
              <View style={styles.table}>
                {reportData.livelihoods.cultivatedLandSize && (
                  <View style={styles.tableRow}>
                    <Text style={styles.labelCell}>Land Size:</Text>
                    <Text style={styles.valueCell}>{formatValue(reportData.livelihoods.cultivatedLandSize)}</Text>
                  </View>
                )}
              </View>
              
              {reportData.livelihoods.cropsGrown && reportData.livelihoods.cropsGrown.length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: '#89a0ae', marginTop: 8, marginBottom: 4 }}>Crops Grown:</Text>
                  <View style={styles.tagList}>
                    {reportData.livelihoods.cropsGrown.map((crop, index) => (
                      <View key={index} style={styles.tag}>
                        <Text>{crop}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>

          {reportData.livelihoods.livestockProfile && reportData.livelihoods.livestockProfile.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Livestock Profile</Text>
              <View style={[styles.infoSection, { marginTop: 8 }]}>
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  {formatValue(reportData.livelihoods.livestockProfile)}
                </Text>
              </View>
            </>
          )}

          {reportData.education.educationSummary && (
            <>
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={[styles.infoSection, { marginTop: 8 }]}>
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  {reportData.education.educationSummary}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Site Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 4 - WILDLIFE CONFLICT (if exists) */}
      {reportData.wildlifeConflict.wildlifeConflictPresent && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Wildlife Conflict</Text>
            
            <View style={[styles.infoSection, { backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#FECACA' }]}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
                Wildlife Conflict Present
              </Text>
              
              {reportData.wildlifeConflict.wildlifeConflictSummary && reportData.wildlifeConflict.wildlifeConflictSummary.length > 0 && (
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  {formatValue(reportData.wildlifeConflict.wildlifeConflictSummary)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Project Site Setup Report Template V1</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default ProjectSiteSetupReportPDF;