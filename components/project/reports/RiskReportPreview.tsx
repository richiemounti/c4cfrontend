import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2 } from 'lucide-react';
import { RiskItem } from '@/types';

interface RiskReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  risks: RiskItem[];
  projectName: string;
  stats: {
    total: number;
    byScore: { high: number; medium: number; low: number };
    byStatus: { open: number; monitoring: number; closed: number; transferred: number };
    reviewOverdue: number;
  };
  appliedFilters: Record<string, string>;
  onDownload: () => void;
  downloading: boolean;
}

const RiskReportPreview = ({ 
  isOpen, 
  onClose, 
  risks, 
  projectName, 
  stats, 
  appliedFilters, 
  onDownload,
  downloading 
}: RiskReportPreviewProps) => {
  const getRiskScoreColor = (score: string): string => {
    switch (score) {
      case 'high': return 'text-sand-900 bg-sand-100';
      case 'medium': return 'text-ochre-900 bg-ochre-100';
      case 'low': return 'text-grass-900 bg-grass-100';
      default: return 'text-sky-900 bg-sky-100';
    }
  };

  const formatFilters = () => {
    const filterStrings = [];
    if (appliedFilters.status) filterStrings.push(`Status: ${appliedFilters.status}`);
    if (appliedFilters.riskScore) filterStrings.push(`Risk Score: ${appliedFilters.riskScore}`);
    if (appliedFilters.riskType) filterStrings.push(`Risk Type: ${appliedFilters.riskType}`);
    if (appliedFilters.reviewDateFrom) filterStrings.push(`Review From: ${appliedFilters.reviewDateFrom}`);
    if (appliedFilters.reviewDateTo) filterStrings.push(`Review To: ${appliedFilters.reviewDateTo}`);
    return filterStrings.length > 0 ? filterStrings.join(' • ') : 'No filters applied';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-stratosphere flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-500" />
            Risk Register Report Preview
          </DialogTitle>
        </DialogHeader>

        {/* Report Preview */}
        <div className="space-y-6 p-6 bg-concrete-50 border border-sky-100 rounded-lg">
          {/* Report Header */}
          <div className="text-center space-y-2 border-b border-sky-200 pb-6">
            <h1 className="text-2xl font-bold text-stratosphere">Risk Register Report</h1>
            <p className="text-lg text-sky-600">{projectName}</p>
            <p className="text-sm text-sky-500">Generated on {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-sky-400">Filters Applied: {formatFilters()}</p>
          </div>

          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-sky-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-sky-600">Total Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-stratosphere">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-sky-600">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sand-500">{stats.byScore.high}</div>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-sky-600">Open Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ochre-500">{stats.byStatus.open}</div>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-sky-600">Overdue Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sand-500">{stats.reviewOverdue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Risk Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-stratosphere border-b border-sky-200 pb-2">
              Detailed Risk Information ({risks.length} risks)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {risks.slice(0, 5).map((risk, index) => (
                <Card key={risk._id} className="border-sky-200 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-stratosphere">{risk.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sky-500 border-sky-200 text-xs">
                          {risk.riskType.charAt(0).toUpperCase() + risk.riskType.slice(1)}
                        </Badge>
                        <Badge className={`${getRiskScoreColor(risk.riskScore)} text-xs`}>
                          {risk.riskScore.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-sky-600">Status:</span>
                        <span className="text-stratosphere ml-2 capitalize">{risk.status}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600">Owner:</span>
                        <span className="text-stratosphere ml-2">{risk.owner.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600">Probability:</span>
                        <span className="text-stratosphere ml-2 capitalize">{risk.probability.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600">Consequences:</span>
                        <span className="text-stratosphere ml-2 capitalize">{risk.consequences}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600">Review Date:</span>
                        <span className="text-stratosphere ml-2">
                          {risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600">Category:</span>
                        <span className="text-stratosphere ml-2 capitalize">{risk.category}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-sky-600 text-sm">Description:</span>
                        <p className="text-stratosphere text-sm mt-1">{risk.riskDescription}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sky-600 text-sm">Mitigation Strategy:</span>
                        <p className="text-stratosphere text-sm mt-1">{risk.mitigationStrategy}</p>
                      </div>
                      
                      {risk.impactArea && risk.impactArea.length > 0 && (
                        <div>
                          <span className="font-medium text-sky-600 text-sm">Impact Areas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {risk.impactArea.map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs bg-sky-100 text-sky-700">
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {risk.mitigationActions && risk.mitigationActions.length > 0 && (
                        <div>
                          <span className="font-medium text-sky-600 text-sm">Mitigation Actions ({risk.mitigationActions.length}):</span>
                          <div className="mt-1 space-y-1">
                            {risk.mitigationActions.slice(0, 3).map((action, idx) => (
                              <div key={idx} className="text-xs bg-sky-50 p-2 rounded border-l-2 border-sky-200">
                                <span className="font-medium">{action.action}</span>
                                <span className="ml-2 text-sky-500">({action.status.replace('_', ' ')})</span>
                                {action.responsible && (
                                  <span className="ml-2 text-sky-600">- {action.responsible.name}</span>
                                )}
                              </div>
                            ))}
                            {risk.mitigationActions.length > 3 && (
                              <p className="text-xs text-sky-500">...and {risk.mitigationActions.length - 3} more actions</p>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>
              ))}
              {risks.length > 5 && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-md text-center">
                  <p className="text-sm text-sky-600">
                    Showing first 5 risks. Full report will include all {risks.length} risks with complete details.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center pt-6 border-t border-sky-200">
            <p className="text-xs text-sky-400">
              This report was generated by the C4C Risk Management System
            </p>
            <p className="text-xs text-sky-400">
              © {new Date().getFullYear()} ConnectGo - All rights reserved
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-sky-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={downloading}
            className="border-sky-200 text-sky-500 hover:bg-sky-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onDownload}
            disabled={downloading}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskReportPreview;