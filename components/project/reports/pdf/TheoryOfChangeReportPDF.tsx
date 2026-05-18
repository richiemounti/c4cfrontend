// components/reports/pdf/TheoryOfChangeReportPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { TheoryOfChangeReportData } from '@/types/reports';

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
  
  // THEORY OF CHANGE LEVELS
  tocLevel: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  
  tocLevelImpact: {
    backgroundColor: '#8B9D5F',
  },
  
  tocLevelOutcome: {
    backgroundColor: '#C85A54',
  },
  
  tocLevelActivities: {
    backgroundColor: '#8B6B8F',
  },
  
  tocLevelInput: {
    backgroundColor: '#5B95AC',
  },
  
  tocLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  tocLevelTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  
  tocLevelSubtitle: {
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  tocMetricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  
  tocMetricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  
  tocMetricValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  
  tocMetricLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  
  // FRAMEWORK ITEMS GRID
  frameworkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  
  frameworkItem: {
    width: '23%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 8,
  },
  
  frameworkCode: {
    fontSize: 11,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  
  frameworkName: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  
  frameworkStats: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 600,
  },
  
  // STAKEHOLDER LIST
  stakeholderList: {
    marginTop: 12,
  },
  
  stakeholderItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  stakeholderName: {
    fontSize: 9,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  
  stakeholderInfo: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  // SIDE PANEL
  sidePanel: {
    backgroundColor: '#e6eaed',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  sidePanelTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#272236',
    marginBottom: 8,
  },
  
  sidePanelItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  
  // GANTT TABLE
  ganttTable: {
    marginTop: 12,
    marginBottom: 12,
  },
  
  ganttHeader: {
    flexDirection: 'row',
    backgroundColor: '#89a0ae',
    borderWidth: 1,
    borderColor: '#89a0ae',
    padding: 8,
  },
  
  ganttHeaderCell: {
    fontSize: 9,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  
  ganttRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#89a0ae',
    padding: 8,
  },
  
  ganttRowEven: {
    backgroundColor: '#e6eaed',
  },
  
  ganttCell: {
    fontSize: 9,
    color: '#272236',
  },
  
  // STATUS BADGES
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 600,
  },
  
  statusComplete: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  
  statusInProgress: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  
  statusPlanned: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
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

interface TheoryOfChangeReportPDFProps {
  report: TheoryOfChangeReportData;
}

const TheoryOfChangeReportPDF: React.FC<TheoryOfChangeReportPDFProps> = ({ report }) => {
  const reportData = report.reportData;

  // Update the detectReportType function:
    const detectReportType = (): 'full' | 'workplan' | 'outcome' => {
    // Check if both stages exist and have data
    const hasStage1 = reportData.stagesSummary?.stage1?.exists || false;
    const hasStage2 = reportData.stagesSummary?.stage2?.exists || false;
    
    // If both stages exist, it's a full report
    if (hasStage1 && hasStage2) return 'full';
    
    // If only stage 1 exists (actions), it's a workplan
    if (hasStage1 && !hasStage2) return 'workplan';
    
    // If only stage 2 exists (impacts), it's an outcome report
    if (!hasStage1 && hasStage2) return 'outcome';
    
    // Default to full
    return 'full';
    };

  const reportType = detectReportType();

  // Get selected framework from available frameworks (default to first available or themes)
    const availableFrameworks = reportData.outcomeBasedView?.availableFrameworks || ['themes'];
    const selectedFramework = availableFrameworks[0] || 'themes';

    // Helper to safely access framework data
    const getFrameworkData = (framework: string) => {
    return reportData.outcomeBasedView?.frameworkOutcomes?.[framework as keyof typeof reportData.outcomeBasedView.frameworkOutcomes] || [];
    };

  // Helper function to get display name based on framework
  const getDisplayName = (item: any): string => {
    switch (selectedFramework) {
      case 'resilience':
        return item.capacityTypes && item.capacityTypes.length > 0
          ? item.capacityTypes.map((ct: string) => 
              ct.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
            ).join(', ')
          : item.name;
      case 'standards':
        return item.issuingBody || item.name;
      default:
        return item.name;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === 'Complete' || status === 'completed') return styles.statusComplete;
    if (status === 'In Progress' || status === 'in_progress') return styles.statusInProgress;
    return styles.statusPlanned;
  };

  // RENDER WORKPLAN REPORT
  const renderWorkplanReport = () => {
    const workplanData = reportData.workPlanView;
    const stageInfo = reportData.stagesSummary.stage1;
    
    if (!workplanData || !stageInfo.exists) {
      return (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={{ textAlign: 'center', color: '#89a0ae', marginTop: 32 }}>
              No workplan data available
            </Text>
          </View>
          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      );
    }
    
    return (
      <>
        {/* PAGE 1 - OVERVIEW */}
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Work Plan Report - Stage 1 Actions</Text>
            
            {/* Key Metrics */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {workplanData.workPlanSummary.totalActivities}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Actions</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#16A34A' }}>
                  {workplanData.workPlanSummary.activitiesWithDates}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Scheduled</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {Math.round(workplanData.workPlanSummary.overallProgress || 0)}%
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Avg Progress</Text>
              </View>
            </View>

            {/* Theory of Change Visualization - ACTIVITIES LEVEL */}
            <View style={[styles.tocLevel, styles.tocLevelActivities]}>
              <View style={styles.tocLevelHeader}>
                <View>
                  <Text style={styles.tocLevelTitle}>OUTPUTS (STAGE 1)</Text>
                  <Text style={styles.tocLevelSubtitle}>Actions and interventions</Text>
                </View>
              </View>

              <View style={styles.tocMetricsGrid}>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{workplanData.workPlanSummary.totalActivities}</Text>
                  <Text style={styles.tocMetricLabel}>Total Activities</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{workplanData.workPlanSummary.activitiesWithDates}</Text>
                  <Text style={styles.tocMetricLabel}>Scheduled</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{Math.round(workplanData.workPlanSummary.overallProgress || 0)}%</Text>
                  <Text style={styles.tocMetricLabel}>Progress</Text>
                </View>
              </View>
            </View>

            {/* INPUT LEVEL */}
            {workplanData.stakeholderWorkloads && workplanData.stakeholderWorkloads.length > 0 && (
              <View style={[styles.tocLevel, styles.tocLevelInput]}>
                <View style={styles.tocLevelHeader}>
                  <View>
                    <Text style={styles.tocLevelTitle}>INPUTS & STAKEHOLDERS</Text>
                    <Text style={styles.tocLevelSubtitle}>Resources and actors</Text>
                  </View>
                </View>

                <View style={styles.stakeholderList}>
                  {workplanData.stakeholderWorkloads.slice(0, 6).map((workload: any, index: number) => (
                    <View key={index} style={styles.stakeholderItem}>
                      <View>
                        <Text style={styles.stakeholderName}>{workload.stakeholder.name}</Text>
                        <Text style={styles.stakeholderInfo}>
                          {workload.activityCount} activities • {workload.totalDuration} days
                        </Text>
                      </View>
                      <Text style={styles.stakeholderInfo}>{Math.round(workload.completionRate || 0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>

        {/* PAGE 2 - GANTT TIMELINE */}
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Timeline & Gantt Chart</Text>
            
            {workplanData.ganttTimeline && workplanData.ganttTimeline.length > 0 ? (
              <View style={styles.ganttTable}>
                <View style={styles.ganttHeader}>
                  <Text style={[styles.ganttHeaderCell, { width: '40%' }]}>Activity</Text>
                  <Text style={[styles.ganttHeaderCell, { width: '25%' }]}>Stakeholder</Text>
                  <Text style={[styles.ganttHeaderCell, { width: '20%' }]}>Timeline</Text>
                  <Text style={[styles.ganttHeaderCell, { width: '15%' }]}>Progress</Text>
                </View>
                
                {workplanData.ganttTimeline.slice(0, 15).map((item: any, index: number) => (
                  <View key={item.id} style={index % 2 === 0 ? [styles.ganttRow, styles.ganttRowEven] : styles.ganttRow}>
                    <Text style={[styles.ganttCell, { width: '40%', fontWeight: 600 }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.ganttCell, { width: '25%' }]}>
                      {item.stakeholder.name}
                    </Text>
                    <Text style={[styles.ganttCell, { width: '20%' }]}>
                      {item.duration ? `${item.duration} days` : 'N/A'}
                    </Text>
                    <Text style={[styles.ganttCell, { width: '15%' }]}>
                      {item.progress || 0}%
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ textAlign: 'center', color: '#89a0ae', marginTop: 32 }}>
                No timeline data available
              </Text>
            )}
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      </>
    );
  };

  // RENDER OUTCOME REPORT
  const renderOutcomeReport = () => {
    const outcomeData = reportData.outcomeBasedView;
    const stageInfo = reportData.stagesSummary.stage2;
    const currentFrameworkData = getFrameworkData(selectedFramework);
    
    if (!outcomeData || !stageInfo.exists) {
      return (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={{ textAlign: 'center', color: '#89a0ae', marginTop: 32 }}>
              No outcome data available
            </Text>
          </View>
          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      );
    }
    
    return (
      <>
        {/* PAGE 1 - OVERVIEW WITH TOC VISUALIZATION */}
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Outcome Report - Stage 2 Impacts</Text>
              <View style={{ backgroundColor: '#cd8028', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ fontSize: 9, color: '#FFFFFF', fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedFramework.replace('_', ' ')} Framework
                </Text>
              </View>
            </View>
            
            {/* Key Metrics */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {outcomeData.outcomeSummary.itemsWithImpacts}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Impacts</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {outcomeData.outcomeSummary.totalFrameworkItems}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Framework Items</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#16A34A' }}>
                  {Math.round(outcomeData.outcomeSummary.averageCompletionRate || 0)}%
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Completion</Text>
              </View>
            </View>

            {/* IMPACT LEVEL */}
            <View style={[styles.tocLevel, styles.tocLevelImpact]}>
              <View style={styles.tocLevelHeader}>
                <View>
                  <Text style={styles.tocLevelTitle}>LONG TERM IMPACT</Text>
                  <Text style={styles.tocLevelSubtitle}>
                    {selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)} contributions
                  </Text>
                </View>
              </View>

              <View style={styles.frameworkGrid}>
                {currentFrameworkData.slice(0, 8).map((outcome: any, index: number) => {
                  const displayName = getDisplayName(outcome.framework.item);
                  return (
                    <View key={index} style={styles.frameworkItem}>
                      <Text style={styles.frameworkCode}>
                        {outcome.framework.item.code || displayName.substring(0, 3).toUpperCase()}
                      </Text>
                      <Text style={styles.frameworkName}>{displayName}</Text>
                      <Text style={styles.frameworkStats}>
                        {outcome.stage2Impacts?.length || 0} impacts • {Math.round(outcome.metrics.completionRate || 0)}%
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.tocMetricsGrid}>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{outcomeData.outcomeSummary.itemsWithImpacts}</Text>
                  <Text style={styles.tocMetricLabel}>Total Impacts</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{currentFrameworkData.length}</Text>
                  <Text style={styles.tocMetricLabel}>Framework Items</Text>
                </View>
              </View>
            </View>

            {/* OUTCOME LEVEL */}
            <View style={[styles.tocLevel, styles.tocLevelOutcome]}>
              <View style={styles.tocLevelHeader}>
                <View>
                  <Text style={styles.tocLevelTitle}>OUTCOME</Text>
                  <Text style={styles.tocLevelSubtitle}>Short to medium term results</Text>
                </View>
              </View>

              <View style={styles.tocMetricsGrid}>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{outcomeData.outcomeSummary.itemsWithImpacts}</Text>
                  <Text style={styles.tocMetricLabel}>Total Outcomes</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>

        {/* PAGE 2 - FRAMEWORK DETAILS */}
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>
              Outcomes by {selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)}
            </Text>
            
            {currentFrameworkData.slice(0, 12).map((outcome: any, index: number) => {
              const displayName = getDisplayName(outcome.framework.item);
              return (
                <View key={index} style={[styles.sidePanel, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: 700, color: '#272236' }}>
                        {displayName}
                      </Text>
                      {outcome.framework.item.code && (
                        <Text style={{ fontSize: 8, color: '#89a0ae', marginTop: 2 }}>
                          Code: {outcome.framework.item.code}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 9, fontWeight: 600, color: '#272236' }}>
                        {outcome.stage2Impacts?.length || 0} impacts
                      </Text>
                      <Text style={{ fontSize: 8, color: '#89a0ae' }}>
                        {Math.round(outcome.metrics.completionRate || 0)}% complete
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      </>
    );
  };

  // RENDER FULL REPORT - Complete Fixed Version
const renderFullReport = () => {
  const stage1Info = reportData.stagesSummary.stage1;
  const stage2Info = reportData.stagesSummary.stage2;
  const workplanData = reportData.workPlanView;
  const outcomeData = reportData.outcomeBasedView;
  const currentFrameworkData = getFrameworkData(selectedFramework);
  
  // Get totals from StagesSummary
  const stage1Total = stage1Info.actionCount || 0;
  const stage2Total = stage2Info.impactCount || 0;
  
  return (
    <>
      {/* PAGE 1 - OVERVIEW */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <Text style={styles.sectionTitle}>Full Theory of Change Report</Text>
          
          {/* Stage Summaries */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#272236', marginBottom: 8 }}>
                Stage 1: Actions
              </Text>
              <Text style={{ fontSize: 9, color: '#89a0ae', marginBottom: 4 }}>
                Status: {stage1Info.exists ? 'Active' : 'Not Started'}
              </Text>
              <Text style={{ fontSize: 9, color: '#89a0ae', marginBottom: 4 }}>
                Progress: {Math.round(stage1Info.progress || 0)}%
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 700, color: '#272236', textAlign: 'center', marginTop: 8 }}>
                {stage1Total}
              </Text>
              <Text style={{ fontSize: 8, color: '#89a0ae', textAlign: 'center' }}>
                Total Actions
              </Text>
            </View>
            
            <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#272236', marginBottom: 8 }}>
                Stage 2: Impacts
              </Text>
              <Text style={{ fontSize: 9, color: '#89a0ae', marginBottom: 4 }}>
                Status: {stage2Info.exists ? 'Active' : 'Not Started'}
              </Text>
              <Text style={{ fontSize: 9, color: '#89a0ae', marginBottom: 4 }}>
                Progress: {Math.round(stage2Info.progress || 0)}%
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 700, color: '#272236', textAlign: 'center', marginTop: 8 }}>
                {stage2Total}
              </Text>
              <Text style={{ fontSize: 8, color: '#89a0ae', textAlign: 'center' }}>
                Total Impacts
              </Text>
            </View>
          </View>

          {/* Stage 2 - IMPACT LEVEL */}
          {stage2Info.exists && outcomeData && (
            <View style={[styles.tocLevel, styles.tocLevelImpact]}>
              <View style={styles.tocLevelHeader}>
                <View>
                  <Text style={styles.tocLevelTitle}>LONG TERM IMPACT</Text>
                  <Text style={styles.tocLevelSubtitle}>
                    {selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)} Framework
                  </Text>
                </View>
              </View>

              <View style={styles.frameworkGrid}>
                {currentFrameworkData.slice(0, 8).map((outcome: any, index: number) => {
                  const displayName = getDisplayName(outcome.framework.item);
                  return (
                    <View key={index} style={styles.frameworkItem}>
                      <Text style={styles.frameworkCode}>
                        {outcome.framework.item.code || displayName.substring(0, 3).toUpperCase()}
                      </Text>
                      <Text style={styles.frameworkName}>{displayName}</Text>
                      <Text style={styles.frameworkStats}>
                        {outcome.stage2Impacts?.length || 0} impacts
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.tocMetricsGrid}>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{stage2Total}</Text>
                  <Text style={styles.tocMetricLabel}>Total Impacts</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{currentFrameworkData.length}</Text>
                  <Text style={styles.tocMetricLabel}>Framework Items</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{stage2Info.riskCount || 0}</Text>
                  <Text style={styles.tocMetricLabel}>Risks</Text>
                </View>
              </View>
            </View>
          )}

          {/* Stage 1 - ACTIVITIES LEVEL */}
          {stage1Info.exists && workplanData && (
            <View style={[styles.tocLevel, styles.tocLevelActivities]}>
              <View style={styles.tocLevelHeader}>
                <View>
                  <Text style={styles.tocLevelTitle}>OUTPUTS (STAGE 1)</Text>
                  <Text style={styles.tocLevelSubtitle}>Actions and interventions</Text>
                </View>
              </View>

              <View style={styles.tocMetricsGrid}>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{stage1Total}</Text>
                  <Text style={styles.tocMetricLabel}>Total Activities</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{Math.round(stage1Info.progress || 0)}%</Text>
                  <Text style={styles.tocMetricLabel}>Progress</Text>
                </View>
                <View style={styles.tocMetricCard}>
                  <Text style={styles.tocMetricValue}>{stage1Info.stakeholderCount || 0}</Text>
                  <Text style={styles.tocMetricLabel}>Stakeholders</Text>
                </View>
              </View>
            </View>
          )}

          {/* Summary Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <View style={styles.sidePanel}>
              <Text style={{ fontSize: 10, fontWeight: 700, color: '#272236', marginBottom: 8 }}>
                Overall Summary
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Stakeholders:</Text>
                <Text style={{ fontSize: 9, fontWeight: 600, color: '#272236' }}>
                  {Math.max(stage1Info.stakeholderCount || 0, stage2Info.stakeholderCount || 0)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Themes:</Text>
                <Text style={{ fontSize: 9, fontWeight: 600, color: '#272236' }}>
                  {Math.max(stage1Info.themeCount || 0, stage2Info.themeCount || 0)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Total Items:</Text>
                <Text style={{ fontSize: 9, fontWeight: 600, color: '#272236' }}>
                  {stage1Total + stage2Total}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.finalFooter}>
          <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
        </View>
      </Page>

      {/* PAGE 2 - STAGE 1 DETAILS (if exists) */}
      {stage1Info.exists && workplanData && workplanData.ganttTimeline && workplanData.ganttTimeline.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Stage 1: Timeline & Activities</Text>
            
            <View style={styles.ganttTable}>
              <View style={styles.ganttHeader}>
                <Text style={[styles.ganttHeaderCell, { width: '40%' }]}>Activity</Text>
                <Text style={[styles.ganttHeaderCell, { width: '30%' }]}>Stakeholder</Text>
                <Text style={[styles.ganttHeaderCell, { width: '15%' }]}>Duration</Text>
                <Text style={[styles.ganttHeaderCell, { width: '15%' }]}>Progress</Text>
              </View>
              
              {workplanData.ganttTimeline.slice(0, 20).map((item: any, index: number) => (
                <View key={item.id || index} style={index % 2 === 0 ? [styles.ganttRow, styles.ganttRowEven] : styles.ganttRow}>
                  <Text style={[styles.ganttCell, { width: '40%', fontWeight: 600 }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.ganttCell, { width: '30%' }]}>
                    {item.stakeholder?.name || 'N/A'}
                  </Text>
                  <Text style={[styles.ganttCell, { width: '15%' }]}>
                    {item.duration ? `${item.duration}d` : 'N/A'}
                  </Text>
                  <Text style={[styles.ganttCell, { width: '15%' }]}>
                    {item.progress || 0}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      )}

      {/* PAGE 3 - STAGE 1 STAKEHOLDER WORKLOADS (if exists) */}
      {stage1Info.exists && workplanData && workplanData.stakeholderWorkloads && workplanData.stakeholderWorkloads.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Stage 1: Stakeholder Workloads</Text>
            
            <View style={styles.ganttTable}>
              <View style={styles.ganttHeader}>
                <Text style={[styles.ganttHeaderCell, { width: '40%' }]}>Stakeholder</Text>
                <Text style={[styles.ganttHeaderCell, { width: '20%' }]}>Activities</Text>
                <Text style={[styles.ganttHeaderCell, { width: '20%' }]}>Duration</Text>
                <Text style={[styles.ganttHeaderCell, { width: '20%' }]}>Completion</Text>
              </View>
              
              {workplanData.stakeholderWorkloads.map((workload: any, index: number) => (
                <View key={index} style={index % 2 === 0 ? [styles.ganttRow, styles.ganttRowEven] : styles.ganttRow}>
                  <Text style={[styles.ganttCell, { width: '40%', fontWeight: 600 }]}>
                    {workload.stakeholder?.name || 'N/A'}
                  </Text>
                  <Text style={[styles.ganttCell, { width: '20%' }]}>
                    {workload.activityCount || 0}
                  </Text>
                  <Text style={[styles.ganttCell, { width: '20%' }]}>
                    {workload.totalDuration || 0} days
                  </Text>
                  <Text style={[styles.ganttCell, { width: '20%' }]}>
                    {Math.round(workload.completionRate || 0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      )}

      {/* PAGE 4 - STAGE 2 DETAILS (if exists) */}
      {stage2Info.exists && outcomeData && currentFrameworkData.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>
              Stage 2: Outcomes by {selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)}
            </Text>
            
            {currentFrameworkData.slice(0, 15).map((outcome: any, index: number) => {
              const displayName = getDisplayName(outcome.framework.item);
              return (
                <View key={index} style={[styles.sidePanel, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: 700, color: '#272236' }}>
                        {displayName}
                      </Text>
                      {outcome.framework.item.code && (
                        <Text style={{ fontSize: 8, color: '#89a0ae', marginTop: 2 }}>
                          Code: {outcome.framework.item.code}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 9, fontWeight: 600, color: '#272236' }}>
                        {outcome.stage2Impacts?.length || 0} impacts
                      </Text>
                      <Text style={{ fontSize: 8, color: '#89a0ae' }}>
                        {Math.round(outcome.metrics?.completionRate || 0)}% complete
                      </Text>
                      {outcome.metrics?.riskCount > 0 && (
                        <Text style={{ fontSize: 8, color: '#DC2626', marginTop: 2 }}>
                          {outcome.metrics.riskCount} risks
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      )}
    </>
  );
};
  // RENDER CONSULTATION PLAN REPORT
  const renderConsultationPlanReport = () => {
    const consultationData = reportData as any;
    const plan = consultationData.consultationPlan;
    
    return (
      <>
        <Page size="A4" style={styles.page}>
          <View style={styles.contentPage}>
            <Text style={styles.sectionTitle}>Consultation Plan Report</Text>
            
            {/* Overview Metrics */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {plan.selectedStakeholders.length}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Stakeholder Groups</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: plan.isCompleted ? '#16A34A' : '#cd8028' }}>
                  {plan.isCompleted ? 'Complete' : 'In Progress'}
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Status</Text>
              </View>
              
              <View style={{ flex: 1, backgroundColor: '#e6eaed', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 700, color: '#272236' }}>
                  {plan.completionStatus.completionPercentage}%
                </Text>
                <Text style={{ fontSize: 9, color: '#89a0ae' }}>Complete</Text>
              </View>
            </View>

            {/* Selected Stakeholders */}
            <Text style={styles.subsectionTitle}>Selected Stakeholder Groups</Text>
            {plan.selectedStakeholders.slice(0, 8).map((sg: any, index: number) => (
              <View key={index} style={[styles.sidePanel, { marginBottom: 6 }]}>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#272236', marginBottom: 4 }}>
                  {sg.stakeholderGroup.name}
                </Text>
                {sg.stakeholderGroup.description && (
                  <Text style={{ fontSize: 9, color: '#89a0ae' }}>
                    {sg.stakeholderGroup.description}
                  </Text>
                )}
              </View>
            ))}

            {/* Timeline */}
            <Text style={styles.subsectionTitle}>Timeline</Text>
            <View style={styles.sidePanel}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={{ fontSize: 9, color: '#89a0ae' }}>Start Date</Text>
                  <Text style={{ fontSize: 10, fontWeight: 600, color: '#272236' }}>
                    {plan.timeline.startDate ? new Date(plan.timeline.startDate).toLocaleDateString() : 'Not set'}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 9, color: '#89a0ae' }}>End Date</Text>
                  <Text style={{ fontSize: 10, fontWeight: 600, color: '#272236' }}>
                    {plan.timeline.endDate ? new Date(plan.timeline.endDate).toLocaleDateString() : 'Not set'}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 9, color: '#89a0ae' }}>Duration</Text>
                  <Text style={{ fontSize: 10, fontWeight: 600, color: '#272236' }}>
                    {plan.timeline.duration ? `${plan.timeline.duration} days` : 'TBD'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.finalFooter}>
            <Text style={styles.footerText}>Theory of Change Report Template V1</Text>
          </View>
        </Page>
      </>
    );
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
                [Generated by the Reflect for Carbon - Theory of Change Module]
              </Text>
              
              <View style={styles.metadataGrid}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Project Name:</Text>
                  <Text> {reportData.projectInfo?.name || 'N/A'}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Report Type:</Text>
                  <Text> {reportType === 'full' ? 'Full Report' : 
                           reportType === 'workplan' ? 'Work Plan' : 
                          //  reportType === 'consultation' ? 'Consultation Plan' :
                           'Outcome Framework'}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Reporting Period:</Text>
                  <Text> {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Organisation:</Text>
                  <Text> {reportData.organizationInfo?.name || 'N/A'}</Text>
                </View>
                {reportType === 'outcome' || reportType === 'full' ? (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataKey}>Framework:</Text>
                    <Text style={{ textTransform: 'capitalize' }}> {selectedFramework.replace('_', ' ')}</Text>
                  </View>
                ) : null}
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataKey}>Version:</Text>
                  <Text> V1</Text>
                </View>
              </View>

              <Text style={styles.reportDescription}>
                This report presents the theory of change framework outlining the project's planned 
                activities, expected outcomes, and impact pathways.
              </Text>
            </View>
          </View>

          <View style={styles.footerBanner}>
            <Text style={styles.reportTitle}>Theory of Change Report V1</Text>
          </View>
        </View>
      </Page>

      {/* CONTENT PAGES - Route based on report type */}
      {reportType === 'workplan' && renderWorkplanReport()}
      {reportType === 'outcome' && renderOutcomeReport()}
      {reportType === 'full' && renderFullReport()}
      {/* {reportType === 'consultation' && renderConsultationPlanReport()} */}
    </Document>
  );
};

export default TheoryOfChangeReportPDF;