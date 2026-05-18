// components/reports/pdf/ProjectSetupReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ProjectSetupReportData } from '@/types/reports';

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
  
  // RISK GRID
  riskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
  },
  
  riskCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
  },
  
  riskCardPresent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  
  riskCardAbsent: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  
  riskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  riskIndicatorRed: {
    backgroundColor: '#EF4444',
  },
  
  riskIndicatorGreen: {
    backgroundColor: '#10B981',
  },
  
  riskLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#272236',
  },
  
  riskStatus: {
    padding: '6 12',
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 600,
    textAlign: 'center',
  },
  
  riskStatusIdentified: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  
  riskStatusNone: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  
  riskNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    fontSize: 9,
    color: '#272236',
    fontStyle: 'italic',
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

interface ProjectSetupReportPDFProps {
  report: ProjectSetupReportData;
}

const ProjectSetupReportPDF: React.FC<ProjectSetupReportPDFProps> = ({ report }) => {
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
                [Generated by the Reflect for Carbon - Project Setup Report Module]
              </Text>
              
              <View style={styles.metadataGrid}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Project Name:</Text>
                  <Text> {reportData.projectInfo.name}</Text>
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
                This report presents the findings of a project setup assessment to evaluate the 
                project foundation, governance structure, and initial risk evaluation.
              </Text>
            </View>
          </View>

          <View style={styles.footerBanner}>
            <Text style={styles.reportTitle}>Project Setup Report V1</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 1 - EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Project Information</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Name:</Text>
                  <Text style={styles.valueCell}>{reportData.projectInfo.name}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Status:</Text>
                  <Text style={styles.valueCell}>{reportData.projectInfo.status}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Organization:</Text>
                  <Text style={styles.valueCell}>{reportData.organizationInfo.name}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Country:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.country}</Text>
                </View>
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
              <Text style={styles.metricValue}>{reportData.projectSites?.length || 0}</Text>
              <Text style={styles.metricLabel}>Project Sites</Text>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 2 - LOCATION CONTEXT */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Location Context</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Administrative Boundaries</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Country:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.country}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Region:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.adminLevel1}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>District:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.adminLevel2}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Ward:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.adminLevel3}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Villages:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.villages}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Physical Characteristics</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>GPS Coordinates:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.gpsCoordinates}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Coverage:</Text>
                  <Text style={styles.valueCell}>{reportData.locationContext.hectareCoverage} hectares</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Ecological Zone:</Text>
                  <Text style={styles.valueCell}>{formatValue(reportData.locationContext.ecologicalZone)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 3 - RISK ASSESSMENT */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          
          <View style={styles.riskGrid}>
            {[
              { key: 'conflictHistory', label: 'Conflict History', note: reportData.riskAssessment.conflictNotes },
              { key: 'politicalRisk', label: 'Political Risk' },
              { key: 'accessIssues', label: 'Access Issues', note: reportData.riskAssessment.accessNotes },
              { key: 'previousProjectFailures', label: 'Previous Project Failures', note: reportData.riskAssessment.previousFailureNotes }
            ].map((risk) => {
              const hasRisk = reportData.riskAssessment[risk.key as keyof typeof reportData.riskAssessment];
              return (
                <View 
                  key={risk.key} 
                  style={[styles.riskCard, hasRisk ? styles.riskCardPresent : styles.riskCardAbsent]}
                >
                  <View style={styles.riskHeader}>
                    <View style={[styles.riskIndicator, hasRisk ? styles.riskIndicatorRed : styles.riskIndicatorGreen]} />
                    <Text style={styles.riskLabel}>{risk.label}</Text>
                  </View>
                  <View style={[styles.riskStatus, hasRisk ? styles.riskStatusIdentified : styles.riskStatusNone]}>
                    <Text>{hasRisk ? 'Risk Identified' : 'No Risk Detected'}</Text>
                  </View>
                  {risk.note && hasRisk && (
                    <View style={styles.riskNote}>
                      <Text>"{risk.note}"</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 4 - GOVERNANCE STRUCTURE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Governance Structure</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Approval Granted By:</Text>
              <Text style={styles.valueCell}>{formatValue(reportData.governance.approvalGrantedBy)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Implementing Organizations:</Text>
              <Text style={styles.valueCell}>{formatValue(reportData.governance.implementingOrganisations)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Oversight Authorities:</Text>
              <Text style={styles.valueCell}>{formatValue(reportData.governance.oversightAuthorities)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Partnership Type:</Text>
              <Text style={styles.valueCell}>{formatValue(reportData.governance.partnershipType)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.labelCell}>Customary Institutions:</Text>
              <Text style={styles.valueCell}>
                {reportData.governance.customaryInstitutionsInvolved ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>

          {reportData.governance.governanceNotes && (
            <>
              <Text style={styles.subsectionTitle}>Additional Governance Notes</Text>
              <View style={[styles.infoSection, { marginTop: 8 }]}>
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  {reportData.governance.governanceNotes}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Setup Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 5 - LAND TENURE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Land Tenure</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Rights Holders</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Customary:</Text>
                  <Text style={styles.valueCell}>{formatValue(reportData.landTenure.customaryRightsHolder)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.labelCell}>Formal:</Text>
                  <Text style={styles.valueCell}>{formatValue(reportData.landTenure.formalRightsHolder)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subsectionTitle}>Claims & Agreements</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 10, color: '#272236', marginBottom: 8 }}>
                  Overlapping Claims: {reportData.landTenure.overlappingClaims ? 'Yes' : 'No'}
                </Text>
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  Land Agreements: {reportData.landTenure.landAgreementsUploaded ? 'Uploaded' : 'Not uploaded'}
                </Text>
              </View>
            </View>
          </View>

          {reportData.landTenure.landTenureNotes && (
            <>
              <Text style={styles.subsectionTitle}>Land Tenure Notes</Text>
              <View style={[styles.infoSection, { marginTop: 8 }]}>
                <Text style={{ fontSize: 10, color: '#272236' }}>
                  {reportData.landTenure.landTenureNotes}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Project Setup Report Template V1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProjectSetupReportPDF;