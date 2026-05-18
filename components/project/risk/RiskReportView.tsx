'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  MapPin,
  BarChart3,
  Loader2,
  Download,
  Star,
  MessageSquare
} from 'lucide-react';
import { RiskItem, RiskStats } from '@/types';
import { getRiskSourceDisplayName, getRiskTypeDisplayName } from '@/lib/api/riskManagement';
import RiskCharts from './RiskCharts';

interface RiskReportViewProps {
  risks: RiskItem[];
  stats?: RiskStats;
  projectId: string;
  projectName: string;
  appliedFilters: {
    status?: string;
    riskScore?: string;
    riskSource?: string;
    owner?: string;
    reviewDateFrom?: string;
    reviewDateTo?: string;
  };
}

const RiskReportView: React.FC<RiskReportViewProps> = ({
  risks,
  stats,
  projectId,
  projectName,
  appliedFilters
}) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!risks || risks.length === 0) {
      return {
        totalRisks: 0,
        highRisks: 0,
        mediumRisks: 0,
        lowRisks: 0,
        openRisks: 0,
        closedRisks: 0,
        overdueReviews: 0,
        averageDaysUntilReview: 0,
        risksBySource: {},
        risksByType: {},
        topOwners: []
      };
    }

    const risksBySource: Record<string, number> = {};
    const risksByType: Record<string, number> = {};
    const ownerCounts: Record<string, { name: string; count: number }> = {};
    let totalDaysUntilReview = 0;
    let reviewDateCount = 0;

    risks.forEach(risk => {
      risksBySource[risk.riskSource] = (risksBySource[risk.riskSource] || 0) + 1;
      risksByType[risk.riskType] = (risksByType[risk.riskType] || 0) + 1;

      const ownerId = risk.owner._id;
      if (!ownerCounts[ownerId]) {
        ownerCounts[ownerId] = { name: risk.owner.name, count: 0 };
      }
      ownerCounts[ownerId].count++;

      if (risk.daysUntilReview !== undefined && risk.daysUntilReview !== null) {
        totalDaysUntilReview += risk.daysUntilReview;
        reviewDateCount++;
      }
    });

    const topOwners = Object.entries(ownerCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRisks: risks.length,
      highRisks: risks.filter(r => r.riskScore === 'high').length,
      mediumRisks: risks.filter(r => r.riskScore === 'medium').length,
      lowRisks: risks.filter(r => r.riskScore === 'low').length,
      openRisks: risks.filter(r => r.status === 'open' || r.status === 'monitoring').length,
      closedRisks: risks.filter(r => r.status === 'closed').length,
      overdueReviews: risks.filter(r => r.isReviewOverdue).length,
      averageDaysUntilReview: reviewDateCount > 0 ? Math.round(totalDaysUntilReview / reviewDateCount) : 0,
      risksBySource,
      risksByType,
      topOwners
    };
  };

  const metrics = calculateMetrics();

  // ✅ NEW: Extract key insights from all risks
  const extractKeyInsights = () => {
    const insights: Array<{
      commentId: string;
      text: string;
      author: { name: string; email?: string };
      starredBy?: { name: string; email?: string };
      starredAt?: string;
      riskId: string;
      riskName: string;
      riskScore: string;
    }> = [];

    risks.forEach(risk => {
      if (risk.comments && risk.comments.length > 0) {
        risk.comments
          .filter(comment => comment.isKeyInsight)
          .forEach(comment => {
            insights.push({
              commentId: comment._id || '',
              text: comment.text,
              author: comment.author,
              starredBy: comment.starredBy,
              starredAt: comment.starredAt,
              riskId: risk._id,
              riskName: risk.name,
              riskScore: risk.riskScore
            });
          });
      }
    });

    // Sort by starred date (most recent first)
    return insights.sort((a, b) => {
      if (!a.starredAt) return 1;
      if (!b.starredAt) return -1;
      return new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime();
    });
  };

  const keyInsights = extractKeyInsights();

  // IMPROVED: Better PDF generation with optimized layout
  const handleDownloadPDF = async () => {
    console.log('=== PDF Download Started ===');
    
    if (!printableRef.current) {
      console.error('Printable ref is not available');
      alert('Unable to generate PDF. Please try again.');
      return;
    }
    
    setDownloadingPDF(true);
    
    try {
      console.log('Loading libraries...');
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      console.log('Libraries loaded successfully');
      
      const printContent = printableRef.current;
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      console.log('Waiting for content to settle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get all sections
      const sections = printContent.querySelectorAll('[data-pdf-section]');
      console.log(`Found ${sections.length} sections to capture`);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15; // Increased margin for better spacing
      const contentWidth = pageWidth - (2 * margin);
      
      let currentY = margin;
      let isFirstPage = true;

      // Process each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const sectionType = section.getAttribute('data-section-type');
        console.log(`Processing section ${i + 1}/${sections.length} - Type: ${sectionType}`);

        try {
          // Capture section with better quality
          const canvas = await html2canvas(section, {
            scale: 2.5, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200, // Fixed width for consistency
            windowHeight: section.scrollHeight,
          });

          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // Calculate scaled dimensions
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add spacing between sections (except for first section on a page)
          const sectionSpacing = currentY === margin ? 0 : 8;
          
          // Check if section fits on current page
          if (!isFirstPage && (currentY + imgHeight + sectionSpacing > pageHeight - margin)) {
            console.log(`Section ${i + 1} needs new page`);
            pdf.addPage();
            currentY = margin;
          } else if (currentY !== margin) {
            currentY += sectionSpacing;
          }

          // Handle sections that span multiple pages
          if (imgHeight > pageHeight - (2 * margin)) {
            console.log(`Section ${i + 1} spans multiple pages`);
            let remainingHeight = imgHeight;
            let sourceY = 0;

            while (remainingHeight > 0) {
              const availableHeight = pageHeight - currentY - margin;
              const sliceHeight = Math.min(remainingHeight, availableHeight);
              
              // Calculate the source slice position
              const sourceSliceHeight = (sliceHeight / imgWidth) * canvas.width;
              
              // Add the slice to the PDF
              pdf.addImage(
                imgData,
                'PNG',
                margin,
                currentY,
                imgWidth,
                sliceHeight,
                undefined,
                'FAST'
              );

              remainingHeight -= sliceHeight;
              sourceY += sourceSliceHeight;

              if (remainingHeight > 0) {
                pdf.addPage();
                currentY = margin;
              } else {
                currentY += sliceHeight;
              }
            }
          } else {
            // Section fits on current page
            pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
            currentY += imgHeight;
          }

          isFirstPage = false;
          console.log(`Section ${i + 1} added successfully`);

        } catch (sectionError) {
          console.error(`Error processing section ${i + 1}:`, sectionError);
        }
      }

      // Save PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `risk-report-${projectName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
      
      console.log('Saving PDF as:', filename);
      pdf.save(filename);
      console.log('=== PDF saved successfully! ===');
      
    } catch (error) {
      console.error('=== PDF generation error ===');
      console.error('Error:', error);
      alert(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingPDF(false);
      console.log('=== PDF download process ended ===');
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stratosphere">Risk Report</h2>
          <p className="text-sky-500 mt-1">Comprehensive risk analysis and statistics</p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="bg-sky-500 hover:bg-sky-600 text-white"
          type="button"
        >
          {downloadingPDF ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Printable content wrapper - OPTIMIZED FOR PDF */}
      <div ref={printableRef} className="space-y-6">
        {/* SECTION 1: Header - Compact */}
        <div 
          data-pdf-section 
          data-section-type="header"
          className="bg-white p-8 rounded-lg shadow-sm border-2 border-stratosphere"
        >
          <h1 className="text-4xl font-bold text-stratosphere mb-2">Risk Management Report</h1>
          <h2 className="text-2xl text-sky-500 mb-4">{projectName}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-sky-600 border-t-2 border-sky-100 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Generated:</span> {new Date().toLocaleDateString()}
            </div>
            {appliedFilters.status && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span> {appliedFilters.status}
              </div>
            )}
            {appliedFilters.riskScore && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Risk Score:</span> {appliedFilters.riskScore}
              </div>
            )}
            {appliedFilters.riskSource && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Source:</span> {getRiskSourceDisplayName(appliedFilters.riskSource)}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Key Metrics - 2x2 Grid for better PDF layout */}
        <div 
          data-pdf-section 
          data-section-type="metrics"
          className="grid grid-cols-2 gap-4"
        >
          <Card className="border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-stratosphere">Total Risks</CardTitle>
              <AlertTriangle className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-stratosphere mb-1">{metrics.totalRisks}</div>
              <p className="text-sm text-sky-500">
                {metrics.openRisks} open, {metrics.closedRisks} closed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-sand-200 bg-gradient-to-br from-white to-sand-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-stratosphere">High Risk</CardTitle>
              <TrendingUp className="h-5 w-5 text-sand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-sand-500 mb-1">{metrics.highRisks}</div>
              <p className="text-sm text-sand-600">
                {metrics.totalRisks > 0 ? Math.round((metrics.highRisks / metrics.totalRisks) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-ochre-200 bg-gradient-to-br from-white to-ochre-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-stratosphere">Overdue Reviews</CardTitle>
              <Clock className="h-5 w-5 text-ochre-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-ochre-500 mb-1">{metrics.overdueReviews}</div>
              <p className="text-sm text-ochre-600">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-grass-200 bg-gradient-to-br from-white to-grass-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-stratosphere">Avg Review Time</CardTitle>
              <Calendar className="h-5 w-5 text-grass-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-grass-500 mb-1">{metrics.averageDaysUntilReview}</div>
              <p className="text-sm text-grass-600">
                days until next review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 3: Charts - Better layout */}
        <div 
          data-pdf-section 
          data-section-type="charts"
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-2xl font-bold text-stratosphere mb-6 border-b-2 border-sky-200 pb-2">
            Risk Analysis Charts
          </h3>
          <RiskCharts 
            risks={risks}
            metrics={metrics}
            projectId={projectId}
          />
        </div>

        {/* SECTION 4: Risk Distribution Tables */}
        <div 
          data-pdf-section 
          data-section-type="tables"
          className="grid grid-cols-2 gap-6"
        >
          {/* Risks by Source */}
          <Card className="border-2 border-sky-200 bg-white">
            <CardHeader className="bg-sky-50 border-b-2 border-sky-200">
              <CardTitle className="text-lg text-stratosphere flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-500" />
                Risks by Source
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {Object.entries(metrics.risksBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                      <span className="text-sm text-stratosphere font-medium">
                        {getRiskSourceDisplayName(source)}
                      </span>
                      <Badge className="bg-sky-500 text-white font-bold">
                        {count}
                      </Badge>
                    </div>
                  ))}
                {Object.keys(metrics.risksBySource).length === 0 && (
                  <p className="text-sm text-sky-400 text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Risk Owners */}
          <Card className="border-2 border-sky-200 bg-white">
            <CardHeader className="bg-sky-50 border-b-2 border-sky-200">
              <CardTitle className="text-lg text-stratosphere flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-500" />
                Top Risk Owners
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {metrics.topOwners.map((owner, index) => (
                  <div key={owner.id} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm text-stratosphere font-medium">
                        {owner.name}
                      </span>
                    </div>
                    <Badge className="bg-sky-500 text-white font-bold">
                      {owner.count}
                    </Badge>
                  </div>
                ))}
                {metrics.topOwners.length === 0 && (
                  <p className="text-sm text-sky-400 text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 5: Risks by Type - Compact grid */}
        <div 
          data-pdf-section 
          data-section-type="risk-types"
        >
          <Card className="border-2 border-sky-200 bg-white">
            <CardHeader className="bg-sky-50 border-b-2 border-sky-200">
              <CardTitle className="text-lg text-stratosphere flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sky-500" />
                Risks by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(metrics.risksByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="p-4 bg-sky-50 rounded-lg border-2 border-sky-200 text-center">
                      <div className="text-3xl font-bold text-stratosphere mb-2">{count}</div>
                      <div className="text-xs text-sky-600 font-semibold uppercase">
                        {getRiskTypeDisplayName(type)}
                      </div>
                    </div>
                  ))}
              </div>
              {Object.keys(metrics.risksByType).length === 0 && (
                <p className="text-sm text-sky-400 text-center py-8">No risk type data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION 6: Overdue Risks Alert */}
        {metrics.overdueReviews > 0 && (
          <div 
            data-pdf-section 
            data-section-type="overdue"
          >
            <Card className="border-2 border-sand-300 bg-sand-50">
              <CardHeader className="bg-sand-100 border-b-2 border-sand-300">
                <CardTitle className="text-lg text-sand-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Risk Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-sand-700 mb-4 font-medium">
                  {metrics.overdueReviews} risk{metrics.overdueReviews > 1 ? 's' : ''} {metrics.overdueReviews > 1 ? 'have' : 'has'} overdue reviews. 
                  Please review and update {metrics.overdueReviews > 1 ? 'these risks' : 'this risk'} immediately.
                </p>
                <div className="space-y-2">
                  {risks
                    .filter(r => r.isReviewOverdue)
                    .slice(0, 5)
                    .map(risk => (
                      <div key={risk._id} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-sand-200">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-stratosphere">{risk.name}</p>
                          <p className="text-xs text-sand-600 mt-1">
                            Review was due on {new Date(risk.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-sand-500 text-white font-bold ml-4">
                          {risk.riskScore.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ NEW SECTION 7: Key Insights - Starred Comments */}
        {keyInsights.length > 0 && (
          <div 
            data-pdf-section 
            data-section-type="key-insights"
          >
            <Card className="border-2 border-ochre-300 bg-ochre-50">
              <CardHeader className="bg-ochre-100 border-b-2 border-ochre-300">
                <CardTitle className="text-lg text-ochre-700 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-ochre-500" />
                  Key actions taken to mitigate risk
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">

                <div className="space-y-3">
                  {keyInsights.map((insight, index) => (
                    <div 
                      key={insight.commentId || index} 
                      className="p-4 bg-white rounded-lg border-2 border-ochre-200"
                    >
                      {/* Header with risk name and badge */}
                      <div className="flex items-start justify-between mb-3 pb-2 border-b border-ochre-100">
                        <div className="flex items-center gap-2 flex-1">
                          <MessageSquare className="h-4 w-4 text-ochre-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-stratosphere">
                            {insight.riskName}
                          </span>
                        </div>
                        <Badge className="bg-ochre-500 text-white font-bold ml-2">
                          {insight.riskScore.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-stratosphere mb-3 leading-relaxed whitespace-pre-wrap">
                        {insight.text}
                      </p>

                      {/* Footer with author and starred info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ochre-600 pt-2 border-t border-ochre-100">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Author:</span>
                          <span>{insight.author.name}</span>
                        </div>
                        {insight.starredBy && (
                          <>
                            <span className="text-ochre-300">•</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-ochre-500" />
                              <span className="font-medium">Starred by:</span>
                              <span>{insight.starredBy.name}</span>
                            </div>
                          </>
                        )}
                        {insight.starredAt && (
                          <>
                            <span className="text-ochre-300">•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(insight.starredAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskReportView;