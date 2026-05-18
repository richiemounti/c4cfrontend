// components/reports/pdf/RiskRegisterReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { RiskRegisterReportData } from '@/types/reports';

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
  
  // METRICS GRID
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
  
  // RISK SCORE CARDS
  riskScoreGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  
  riskScoreCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  riskScoreCardHigh: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  
  riskScoreCardMedium: {
    backgroundColor: '#FEFCE8',
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  
  riskScoreCardLow: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  
  riskScoreValue: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  
  riskScoreValueHigh: {
    color: '#DC2626',
  },
  
  riskScoreValueMedium: {
    color: '#CA8A04',
  },
  
  riskScoreValueLow: {
    color: '#16A34A',
  },
  
  // RISK TABLE
  table: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#89a0ae',
    borderWidth: 1,
    borderColor: '#89a0ae',
  },
  
  tableHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontWeight: 600,
    color: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#89a0ae',
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#89a0ae',
    borderLeftWidth: 1,
    borderLeftColor: '#89a0ae',
    borderRightWidth: 1,
    borderRightColor: '#89a0ae',
  },
  
  tableRowEven: {
    backgroundColor: '#e6eaed',
  },
  
  tableCell: {
    padding: 6,
    fontSize: 9,
    color: '#272236',
    borderRightWidth: 1,
    borderRightColor: '#89a0ae',
  },
  
  tableCellBold: {
    fontWeight: 600,
  },
  
  tableCellCenter: {
    textAlign: 'center',
  },
  
  // RISK BADGE
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 600,
  },
  
  riskBadgeHigh: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  
  riskBadgeMedium: {
    backgroundColor: '#FEF3C7',
    color: '#854D0E',
  },
  
  riskBadgeLow: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  
  // STATUS BADGE
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 600,
  },
  
  statusBadgeOpen: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  
  statusBadgeMonitoring: {
    backgroundColor: '#FEF3C7',
    color: '#854D0E',
  },
  
  statusBadgeClosed: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  
  statusBadgeTransferred: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  
  // CATEGORY SECTION
  categorySection: {
    marginVertical: 12,
    backgroundColor: '#e6eaed',
    borderRadius: 8,
    padding: 12,
  },
  
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  categoryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#272236',
  },
  
  categoryCount: {
    backgroundColor: '#89a0ae',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 600,
  },
  
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  
  categoryStat: {
    alignItems: 'center',
  },
  
  categoryStatValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  
  categoryStatLabel: {
    fontSize: 8,
    color: '#89a0ae',
    marginTop: 2,
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

interface RiskRegisterReportPDFProps {
  report: RiskRegisterReportData;
}

const RiskRegisterReportPDF: React.FC<RiskRegisterReportPDFProps> = ({ report }) => {
  const reportData = report.reportData;

  const getRiskScoreBadgeStyle = (score: string) => {
    switch (score.toLowerCase()) {
      case 'high': return styles.riskBadgeHigh;
      case 'medium': return styles.riskBadgeMedium;
      case 'low': return styles.riskBadgeLow;
      default: return styles.riskBadgeLow;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return styles.statusBadgeOpen;
      case 'monitoring': return styles.statusBadgeMonitoring;
      case 'closed': return styles.statusBadgeClosed;
      case 'transferred': return styles.statusBadgeTransferred;
      default: return styles.statusBadgeOpen;
    }
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
                [Generated by the Reflect for Carbon - Risk Register Module]
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
                This report presents a comprehensive risk assessment and mitigation strategy for 
                project-related risks and uncertainties.
              </Text>
            </View>
          </View>

          <View style={styles.footerBanner}>
            <Text style={styles.reportTitle}>Risk Register Report V1</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 1 - EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{reportData.executiveSummary.totalRisks}</Text>
              <Text style={styles.metricLabel}>Total Risks</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                {reportData.executiveSummary.risksByStatus.closed}
              </Text>
              <Text style={styles.metricLabel}>Closed</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#CA8A04' }]}>
                {reportData.executiveSummary.risksByStatus.monitoring}
              </Text>
              <Text style={styles.metricLabel}>Monitoring</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#DC2626' }]}>
                {reportData.executiveSummary.reviewMetrics.reviewOverdue}
              </Text>
              <Text style={styles.metricLabel}>Overdue</Text>
            </View>
          </View>

          {/* Risk Score Distribution */}
          <Text style={styles.subsectionTitle}>Risk Score Distribution</Text>
          <View style={styles.riskScoreGrid}>
            <View style={[styles.riskScoreCard, styles.riskScoreCardHigh]}>
              <Text style={[styles.riskScoreValue, styles.riskScoreValueHigh]}>
                {reportData.executiveSummary.risksByScore.high}
              </Text>
              <Text style={[styles.metricLabel, { color: '#DC2626' }]}>High Risk</Text>
            </View>
            
            <View style={[styles.riskScoreCard, styles.riskScoreCardMedium]}>
              <Text style={[styles.riskScoreValue, styles.riskScoreValueMedium]}>
                {reportData.executiveSummary.risksByScore.medium}
              </Text>
              <Text style={[styles.metricLabel, { color: '#CA8A04' }]}>Medium Risk</Text>
            </View>
            
            <View style={[styles.riskScoreCard, styles.riskScoreCardLow]}>
              <Text style={[styles.riskScoreValue, styles.riskScoreValueLow]}>
                {reportData.executiveSummary.risksByScore.low}
              </Text>
              <Text style={[styles.metricLabel, { color: '#16A34A' }]}>Low Risk</Text>
            </View>
          </View>

          {/* Mitigation Progress */}
          <Text style={styles.subsectionTitle}>Mitigation Progress</Text>
          <View style={[styles.metricCard, { marginTop: 8 }]}>
            <Text style={{ fontSize: 28, fontWeight: 700, color: '#272236', marginBottom: 4 }}>
              {Math.round(reportData.executiveSummary.mitigationMetrics.averageProgress)}%
            </Text>
            <Text style={styles.metricLabel}>Average Mitigation Progress</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#272236' }}>
                  {reportData.executiveSummary.mitigationMetrics.totalActions}
                </Text>
                <Text style={{ fontSize: 8, color: '#89a0ae' }}>Total Actions</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#272236' }}>
                  {reportData.executiveSummary.mitigationMetrics.completedActions}
                </Text>
                <Text style={{ fontSize: 8, color: '#89a0ae' }}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Risk Register Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 2 - RISK REGISTER TABLE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Risk Register</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>Risk ID</Text>
              <Text style={[styles.tableHeaderCell, { width: '32%' }]}>Risk Description</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Risk Score</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Status</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Owner</Text>
              <Text style={[styles.tableHeaderCell, { width: '6%', borderRightWidth: 0 }]}>Progress</Text>
            </View>
            
            {/* Table Rows */}
            {reportData.riskDetails.slice(0, 12).map((risk, index) => (
              <View key={risk._id} style={index % 2 === 0 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '8%' }]}>
                  R{String(index + 1).padStart(3, '0')}
                </Text>
                <Text style={[styles.tableCell, { width: '32%' }]}>
                  {risk.riskDescription.length > 100 
                    ? risk.riskDescription.substring(0, 100) + '...' 
                    : risk.riskDescription}
                </Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>
                  {risk.category}
                </Text>
                <View style={[styles.tableCell, { width: '12%', justifyContent: 'center' }]}>
                  <View style={[styles.riskBadge, getRiskScoreBadgeStyle(risk.riskScore)]}>
                    <Text>{risk.riskScore}</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, { width: '12%', justifyContent: 'center' }]}>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(risk.status)]}>
                    <Text>{risk.status}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, { width: '15%' }]}>
                  {risk.owner.name}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '6%', borderRightWidth: 0 }]}>
                  {risk.mitigationProgress || 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Risk Register Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 3 - RISK ANALYSIS BY CATEGORY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Risk Analysis by Category</Text>
          
          {Object.entries(reportData.risksByCategory).slice(0, 6).map(([category, risks]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.categoryCount}>
                  <Text>{risks.length} risks</Text>
                </View>
              </View>
              
              <View style={styles.categoryStats}>
                <View style={styles.categoryStat}>
                  <Text style={[styles.categoryStatValue, { color: '#DC2626' }]}>
                    {risks.filter(r => r.riskScore.toLowerCase() === 'high').length}
                  </Text>
                  <Text style={styles.categoryStatLabel}>High</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Text style={[styles.categoryStatValue, { color: '#CA8A04' }]}>
                    {risks.filter(r => r.riskScore.toLowerCase() === 'medium').length}
                  </Text>
                  <Text style={styles.categoryStatLabel}>Medium</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Text style={[styles.categoryStatValue, { color: '#16A34A' }]}>
                    {risks.filter(r => r.riskScore.toLowerCase() === 'low').length}
                  </Text>
                  <Text style={styles.categoryStatLabel}>Low</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Risk Register Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 4 - HIGH PRIORITY RISKS (if any) */}
      {reportData.highPriorityRisks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>High Priority Risks</Text>
            
            <View style={{ 
              backgroundColor: '#FEF2F2', 
              borderWidth: 2, 
              borderColor: '#FECACA', 
              borderRadius: 8, 
              padding: 12,
              marginBottom: 16 
            }}>
              <Text style={{ fontSize: 10, fontWeight: 600, color: '#991B1B', marginBottom: 4 }}>
                Attention Required
              </Text>
              <Text style={{ fontSize: 9, color: '#991B1B' }}>
                These risks require immediate attention and active management.
              </Text>
            </View>

            {reportData.highPriorityRisks.slice(0, 8).map((risk, index) => (
              <View 
                key={risk._id} 
                style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 2,
                  borderColor: '#FECACA',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: '#272236', flex: 1 }}>
                    {risk.name}
                  </Text>
                  <View style={[styles.riskBadge, styles.riskBadgeHigh, { marginLeft: 8 }]}>
                    <Text>{risk.riskScore}</Text>
                  </View>
                </View>
                
                <Text style={{ fontSize: 9, color: '#272236', marginBottom: 8 }}>
                  {risk.riskDescription}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 8, color: '#89a0ae' }}>
                    Owner: {risk.owner.name}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#89a0ae' }}>
                    Progress: {risk.mitigationProgress || 0}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Risk Register Report Template V1</Text>
          </View>
        </Page>
      )}

      {/* PAGE 5 - OVERDUE RISKS (if any) */}
      {reportData.overdueRisks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Overdue Review Risks</Text>
            
            <View style={{ 
              backgroundColor: '#FEF3C7', 
              borderWidth: 2, 
              borderColor: '#FDE68A', 
              borderRadius: 8, 
              padding: 12,
              marginBottom: 16 
            }}>
              <Text style={{ fontSize: 10, fontWeight: 600, color: '#854D0E', marginBottom: 4 }}>
                Review Overdue
              </Text>
              <Text style={{ fontSize: 9, color: '#854D0E' }}>
                These risks have overdue reviews and require immediate attention from risk owners.
              </Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Risk ID</Text>
                <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Risk Name</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Owner</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Last Review</Text>
                <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Score</Text>
                <Text style={[styles.tableHeaderCell, { width: '10%', borderRightWidth: 0 }]}>Status</Text>
              </View>
              
              {reportData.overdueRisks.slice(0, 10).map((risk, index) => (
                <View key={risk._id} style={index % 2 === 0 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableCellBold, { width: '10%' }]}>
                    R{String(reportData.riskDetails.findIndex(r => r._id === risk._id) + 1).padStart(3, '0')}
                  </Text>
                  <Text style={[styles.tableCell, { width: '35%' }]}>
                    {risk.name}
                  </Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>
                    {risk.owner.name}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>
                    {risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString() : 'N/A'}
                  </Text>
                  <View style={[styles.tableCell, { width: '10%', justifyContent: 'center' }]}>
                    <View style={[styles.riskBadge, getRiskScoreBadgeStyle(risk.riskScore)]}>
                      <Text>{risk.riskScore}</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: '10%', justifyContent: 'center', borderRightWidth: 0 }]}>
                    <View style={[styles.statusBadge, getStatusBadgeStyle(risk.status)]}>
                      <Text>{risk.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Risk Register Report Template V1</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default RiskRegisterReportPDF;