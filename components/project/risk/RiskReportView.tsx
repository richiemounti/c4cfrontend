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
    <div className="flex flex-col gap-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-title text-2xl font-semibold text-black">Risk Report</h2>
          <p className="text-c4c-petrol mt-1">Comprehensive risk analysis and statistics</p>
        </div>
        <Button variant="anchor" onClick={handleDownloadPDF} disabled={downloadingPDF} type="button">
          {downloadingPDF ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Printable content wrapper - OPTIMIZED FOR PDF */}
      <div ref={printableRef} className="flex flex-col gap-6">
        {/* SECTION 1: Header - Compact */}
        <div
          data-pdf-section
          data-section-type="header"
          className="bg-white p-8 border-2 border-black"
        >
          <h1 className="font-title text-4xl font-semibold text-black mb-2">Risk Management Report</h1>
          <h2 className="text-2xl text-c4c-petrol mb-4">{projectName}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-c4c-petrol border-t border-c4c-rule pt-4">
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

        {/* SECTION 2: Key Metrics - 2x2 Grid for better PDF layout.
            High risk stays burgundy, not coral: this badge-like tile can
            repeat across many generated reports, and coral is reserved as
            the one-per-screen spotlight (the "Download PDF" button above). */}
        <div
          data-pdf-section
          data-section-type="metrics"
          className="grid grid-cols-2 gap-4"
        >
          <div className="border border-c4c-rule bg-white p-5">
            <div className="flex items-center justify-between pb-3">
              <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">Total Risks</span>
              <AlertTriangle className="h-5 w-5 text-c4c-petrol" />
            </div>
            <div className="font-title text-4xl font-semibold text-black mb-1">{metrics.totalRisks}</div>
            <p className="text-sm text-c4c-petrol">
              {metrics.openRisks} open, {metrics.closedRisks} closed
            </p>
          </div>

          <div className="border border-c4c-burgundy bg-white p-5">
            <div className="flex items-center justify-between pb-3">
              <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">High Risk</span>
              <TrendingUp className="h-5 w-5 text-c4c-burgundy" />
            </div>
            <div className="font-title text-4xl font-semibold text-c4c-burgundy mb-1">{metrics.highRisks}</div>
            <p className="text-sm text-c4c-petrol">
              {metrics.totalRisks > 0 ? Math.round((metrics.highRisks / metrics.totalRisks) * 100) : 0}% of total
            </p>
          </div>

          <div className="border border-c4c-yellow bg-c4c-tint-gold p-5">
            <div className="flex items-center justify-between pb-3">
              <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">Overdue Reviews</span>
              <Clock className="h-5 w-5 text-c4c-petrol" />
            </div>
            <div className="font-title text-4xl font-semibold text-black mb-1">{metrics.overdueReviews}</div>
            <p className="text-sm text-c4c-petrol">
              Require immediate attention
            </p>
          </div>

          <div className="border border-c4c-sage bg-c4c-tint-sage p-5">
            <div className="flex items-center justify-between pb-3">
              <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">Avg Review Time</span>
              <Calendar className="h-5 w-5 text-c4c-petrol" />
            </div>
            <div className="font-title text-4xl font-semibold text-black mb-1">{metrics.averageDaysUntilReview}</div>
            <p className="text-sm text-c4c-petrol">
              days until next review
            </p>
          </div>
        </div>

        {/* SECTION 3: Charts - Better layout */}
        <div
          data-pdf-section
          data-section-type="charts"
          className="bg-white p-6"
        >
          <h3 className="font-title text-2xl font-semibold text-black mb-6 border-b border-c4c-rule pb-2">
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
          <Card className="p-0">
            <CardHeader className="bg-c4c-grey-bg border-b border-c4c-rule">
              <CardTitle className="font-title text-lg text-black flex items-center gap-2">
                <MapPin className="h-5 w-5 text-c4c-petrol" />
                Risks by Source
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {Object.entries(metrics.risksBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between p-3 bg-c4c-grey-bg border border-c4c-rule">
                      <span className="text-sm text-black font-medium">
                        {getRiskSourceDisplayName(source)}
                      </span>
                      <Badge variant="quiet">{count}</Badge>
                    </div>
                  ))}
                {Object.keys(metrics.risksBySource).length === 0 && (
                  <p className="text-sm text-c4c-petrol text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Risk Owners */}
          <Card className="p-0">
            <CardHeader className="bg-c4c-grey-bg border-b border-c4c-rule">
              <CardTitle className="font-title text-lg text-black flex items-center gap-2">
                <Users className="h-5 w-5 text-c4c-petrol" />
                Top Risk Owners
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {metrics.topOwners.map((owner, index) => (
                  <div key={owner.id} className="flex items-center justify-between p-3 bg-c4c-grey-bg border border-c4c-rule">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-c4c-petrol text-white font-title font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm text-black font-medium">
                        {owner.name}
                      </span>
                    </div>
                    <Badge variant="quiet">{owner.count}</Badge>
                  </div>
                ))}
                {metrics.topOwners.length === 0 && (
                  <p className="text-sm text-c4c-petrol text-center py-4">No data available</p>
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
          <Card className="p-0">
            <CardHeader className="bg-c4c-grey-bg border-b border-c4c-rule">
              <CardTitle className="font-title text-lg text-black flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-c4c-petrol" />
                Risks by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(metrics.risksByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="p-4 bg-c4c-grey-bg border border-c4c-rule text-center">
                      <div className="font-title text-3xl font-semibold text-black mb-2">{count}</div>
                      <div className="text-xs text-c4c-petrol font-semibold uppercase">
                        {getRiskTypeDisplayName(type)}
                      </div>
                    </div>
                  ))}
              </div>
              {Object.keys(metrics.risksByType).length === 0 && (
                <p className="text-sm text-c4c-petrol text-center py-8">No risk type data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION 6: Overdue Risks Alert — gold, not coral: repeats a
            badge per overdue risk, so it needs the repeatable "needs
            attention" colour rather than the one-per-screen spotlight. */}
        {metrics.overdueReviews > 0 && (
          <div
            data-pdf-section
            data-section-type="overdue"
          >
            <Card className="p-0 border-c4c-yellow bg-c4c-tint-gold">
              <CardHeader className="border-b border-c4c-yellow">
                <CardTitle className="font-title text-lg text-black flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Risk Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-black mb-4 font-medium">
                  {metrics.overdueReviews} risk{metrics.overdueReviews > 1 ? 's' : ''} {metrics.overdueReviews > 1 ? 'have' : 'has'} overdue reviews.
                  Please review and update {metrics.overdueReviews > 1 ? 'these risks' : 'this risk'} immediately.
                </p>
                <div className="space-y-2">
                  {risks
                    .filter(r => r.isReviewOverdue)
                    .slice(0, 5)
                    .map(risk => (
                      <div key={risk._id} className="flex items-center justify-between p-3 bg-white border border-c4c-yellow">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-black">{risk.name}</p>
                          <p className="text-xs text-c4c-petrol mt-1">
                            Review was due on {new Date(risk.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="attention" className="ml-4">
                          {risk.riskScore.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 7: Key Insights - Starred Comments */}
        {keyInsights.length > 0 && (
          <div
            data-pdf-section
            data-section-type="key-insights"
          >
            <Card className="p-0 border-c4c-yellow bg-c4c-tint-gold">
              <CardHeader className="border-b border-c4c-yellow">
                <CardTitle className="font-title text-lg text-black flex items-center gap-2">
                  <Star className="h-5 w-5 fill-c4c-yellow" />
                  Key actions taken to mitigate risk
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">

                <div className="space-y-3">
                  {keyInsights.map((insight, index) => (
                    <div
                      key={insight.commentId || index}
                      className="p-4 bg-white border border-c4c-yellow"
                    >
                      {/* Header with risk name and badge */}
                      <div className="flex items-start justify-between mb-3 pb-2 border-b border-c4c-rule">
                        <div className="flex items-center gap-2 flex-1">
                          <MessageSquare className="h-4 w-4 text-c4c-petrol flex-shrink-0" />
                          <span className="text-sm font-bold text-black">
                            {insight.riskName}
                          </span>
                        </div>
                        <Badge variant="attention" className="ml-2">
                          {insight.riskScore.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-black mb-3 leading-relaxed whitespace-pre-wrap">
                        {insight.text}
                      </p>

                      {/* Footer with author and starred info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-c4c-petrol pt-2 border-t border-c4c-rule">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Author:</span>
                          <span>{insight.author.name}</span>
                        </div>
                        {insight.starredBy && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-c4c-yellow" />
                              <span className="font-medium">Starred by:</span>
                              <span>{insight.starredBy.name}</span>
                            </div>
                          </>
                        )}
                        {insight.starredAt && (
                          <>
                            <span>•</span>
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