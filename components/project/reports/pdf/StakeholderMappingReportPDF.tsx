// components/reports/pdf/StakeholderMappingReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { StakeholderMappingReportData } from '@/types/reports';

// Register fonts (you can use system fonts or load custom ones)
Font.register({
  family: 'Sora',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/sora/v11/xMQOuFFYT72X5wkB_18qmnndmSdSn3-KIwNhBti0.ttf', fontWeight: 700 },
  ],
});

// Create styles that match your REFLECT template
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Sora',
    fontSize: 10,
    color: '#272236',
    backgroundColor: '#FFFFFF',
  },
  
  // COVER PAGE STYLES
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
  
  // CONTENT PAGE STYLES
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
  
  // TABLE STYLES
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
    fontSize: 10,
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
  
  // METRICS GRID
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 16,
  },
  
  metricCard: {
    backgroundColor: '#e6eaed',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  
  metricValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#272236',
    marginBottom: 4,
  },
  
  metricValueSuccess: {
    color: '#16A34A',
  },
  
  metricLabel: {
    fontSize: 10,
    color: '#89a0ae',
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
  
  // INSIGHTS LIST
  insightsList: {
    marginTop: 16,
  },
  
  insightItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  insightBullet: {
    color: '#89a0ae',
    marginRight: 8,
    fontWeight: 600,
  },
  
  insightText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#272236',
  },
  
  insightTextBold: {
    fontWeight: 700,
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

interface StakeholderMappingReportPDFProps {
  report: StakeholderMappingReportData;
}

const StakeholderMappingReportPDF: React.FC<StakeholderMappingReportPDFProps> = ({ report }) => {
  const reportData = report.reportData;

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>REFLECT</Text>
            <Text style={styles.tagline}>Evidencing the social impact of nature investments</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroOverlay}>
              <Text style={styles.metadataLabel}>
                [Generated by the Reflect for Carbon - Stakeholder Mapping Module]
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
                This report presents the findings of a stakeholder mapping exercise to assess the 
                influence, impact and engagement of various stakeholder groups regarding the project. 
                The analysis includes stakeholder identification, roles and responsibilities, potential 
                risks and benefits.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerBanner}>
            <Text style={styles.reportTitle}>Stakeholder Mapping Report V1</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 1 - EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          {/* Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{reportData.summary.totalStakeholders}</Text>
              <Text style={styles.metricLabel}>Total Stakeholders</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {reportData.summary.completedStakeholders}
              </Text>
              <Text style={styles.metricLabel}>Completed Mappings</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(reportData.summary.completionPercentage)}%
              </Text>
              <Text style={styles.metricLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Stakeholder Mapping Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 2 - STAKEHOLDER IDENTIFICATION TABLE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Stakeholder Identification Table</Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Stakeholder Category</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Stakeholder Group</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Connection to Project Potential Benefits</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Connection to Project Potential Risks</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%', borderRightWidth: 0 }]}>Roles and Responsibilities</Text>
            </View>
            
            {/* Table Rows */}
            {reportData.stakeholderData.slice(0, 8).map((stakeholder, index) => (
              <View key={stakeholder._id} style={index % 2 === 0 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '15%' }]}>
                  {stakeholder.category.name}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '15%' }]}>
                  {stakeholder.name}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  The project offers benefits including potential for income enhancement. 
                  The project addresses key local issues and priorities.
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>
                  The project might conflict with existing goals.
                </Text>
                <Text style={[styles.tableCell, { width: '25%', borderRightWidth: 0 }]}>
                  Participates in consultations, involved in project planning, local project 
                  impacts on services, supports community.
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Stakeholder Mapping Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 3 - INFLUENCE AND IMPACT MATRIX */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>
            Stakeholder Influence and Impact Matrix (Scoring system from 1 - 5)
          </Text>
          
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Stakeholder Group</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellCenter, { width: '15%' }]}>Influence on Project</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellCenter, { width: '15%' }]}>Connection to Project</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellCenter, { width: '15%' }]}>Risk</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellCenter, { width: '15%' }]}>Roles/Responsibilities</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellCenter, { width: '15%', borderRightWidth: 0 }]}>Potential Benefits</Text>
            </View>
            
            {/* Table Rows */}
            {Object.entries(reportData.summary.stakeholdersByCategory).slice(0, 5).map(([category, data], index) => (
              <View key={category} style={index % 2 === 0 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '25%' }]}>
                  {category}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellCenter, { width: '15%' }]}>
                  {Math.round(data.averageRating)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellCenter, { width: '15%' }]}>
                  {Math.round(data.averageRating)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellCenter, { width: '15%' }]}>
                  {Math.round(data.averageRating)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellCenter, { width: '15%' }]}>
                  {Math.round(data.averageRating)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellCenter, { width: '15%', borderRightWidth: 0 }]}>
                  {Math.round(data.averageRating)}
                </Text>
              </View>
            ))}
          </View>

          {/* Key Insights */}
          <Text style={styles.subsectionTitle}>Key Insights and Analysis</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>→</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightTextBold}>Government:</Text> Holds high influence over 
                the project through regulation, but is less dependent on its success. Compliance 
                requirements are key.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>→</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightTextBold}>Communities Affected:</Text> Highly dependent 
                on the project and face significant risks if it fails; engagement is crucial.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>→</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightTextBold}>Women, Youth, and Vulnerable Groups:</Text> Most 
                vulnerable to negative impacts, requiring targeted interventions for inclusivity.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>→</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightTextBold}>Partner Agencies:</Text> Strong collaborative 
                role with moderate influence; can provide essential support.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>→</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightTextBold}>Our Organization:</Text> Central to project 
                execution, with both high influence and responsibility.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Stakeholder Mapping Report Template V1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default StakeholderMappingReportPDF;