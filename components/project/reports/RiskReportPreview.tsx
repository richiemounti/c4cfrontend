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
      case 'high': return 'text-black bg-c4c-tint-coral';
      case 'medium': return 'text-black bg-c4c-tint-gold';
      case 'low': return 'text-black bg-c4c-tint-sage';
      default: return 'text-black bg-c4c-grey-bg';
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-c4c-rule">
        <DialogHeader>
          <DialogTitle className="text-xl text-black flex items-center gap-2">
            <FileText className="h-5 w-5 text-c4c-petrol" />
            Risk Register Report Preview
          </DialogTitle>
        </DialogHeader>

        {/* Report Preview */}
        <div className="space-y-6 p-6 bg-c4c-grey-bg border border-c4c-rule rounded-lg">
          {/* Report Header */}
          <div className="text-center space-y-2 border-b border-c4c-rule pb-6">
            <h1 className="text-2xl font-bold text-black">Risk Register Report</h1>
            <p className="text-lg text-c4c-petrol">{projectName}</p>
            <p className="text-sm text-c4c-petrol">Generated on {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-c4c-petrol">Filters Applied: {formatFilters()}</p>
          </div>

          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-c4c-rule bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-c4c-petrol">Total Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-c4c-rule bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-c4c-petrol">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-c4c-burgundy">{stats.byScore.high}</div>
              </CardContent>
            </Card>

            <Card className="border-c4c-rule bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-c4c-petrol">Open Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-c4c-petrol">{stats.byStatus.open}</div>
              </CardContent>
            </Card>

            <Card className="border-c4c-rule bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-c4c-petrol">Overdue Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-c4c-burgundy">{stats.reviewOverdue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Risk Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black border-b border-c4c-rule pb-2">
              Detailed Risk Information ({risks.length} risks)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {risks.slice(0, 5).map((risk, index) => (
                <Card key={risk._id} className="border-c4c-rule bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-black">{risk.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-c4c-petrol border-c4c-rule text-xs">
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
                        <span className="font-medium text-c4c-petrol">Status:</span>
                        <span className="text-black ml-2 capitalize">{risk.status}</span>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol">Owner:</span>
                        <span className="text-black ml-2">{risk.owner.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol">Probability:</span>
                        <span className="text-black ml-2 capitalize">{risk.probability.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol">Consequences:</span>
                        <span className="text-black ml-2 capitalize">{risk.consequences}</span>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol">Review Date:</span>
                        <span className="text-black ml-2">
                          {risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol">Category:</span>
                        <span className="text-black ml-2 capitalize">{risk.category}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-c4c-petrol text-sm">Description:</span>
                        <p className="text-black text-sm mt-1">{risk.riskDescription}</p>
                      </div>
                      <div>
                        <span className="font-medium text-c4c-petrol text-sm">Mitigation Strategy:</span>
                        <p className="text-black text-sm mt-1">{risk.mitigationStrategy}</p>
                      </div>

                      {risk.impactArea && risk.impactArea.length > 0 && (
                        <div>
                          <span className="font-medium text-c4c-petrol text-sm">Impact Areas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {risk.impactArea.map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs bg-c4c-grey-bg text-c4c-petrol">
                                {area.charAt(0).toUpperCase() + area.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {risk.mitigationActions && risk.mitigationActions.length > 0 && (
                        <div>
                          <span className="font-medium text-c4c-petrol text-sm">Mitigation Actions ({risk.mitigationActions.length}):</span>
                          <div className="mt-1 space-y-1">
                            {risk.mitigationActions.slice(0, 3).map((action, idx) => (
                              <div key={idx} className="text-xs bg-c4c-grey-bg p-2 rounded border-l-2 border-c4c-rule">
                                <span className="font-medium">{action.action}</span>
                                <span className="ml-2 text-c4c-petrol">({action.status.replace('_', ' ')})</span>
                                {action.responsible && (
                                  <span className="ml-2 text-c4c-petrol">- {action.responsible.name}</span>
                                )}
                              </div>
                            ))}
                            {risk.mitigationActions.length > 3 && (
                              <p className="text-xs text-c4c-petrol">...and {risk.mitigationActions.length - 3} more actions</p>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>
              ))}
              {risks.length > 5 && (
                <div className="p-4 bg-c4c-grey-bg border border-c4c-rule rounded-md text-center">
                  <p className="text-sm text-c4c-petrol">
                    Showing first 5 risks. Full report will include all {risks.length} risks with complete details.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center pt-6 border-t border-c4c-rule">
            <p className="text-xs text-c4c-petrol">
              This report was generated by the C4C Risk Management System
            </p>
            <p className="text-xs text-c4c-petrol">
              © {new Date().getFullYear()} ConnectGo - All rights reserved
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-c4c-rule">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={downloading}
            className="border-c4c-rule text-c4c-petrol hover:bg-c4c-grey-bg"
          >
            Cancel
          </Button>
          <Button
            onClick={onDownload}
            disabled={downloading}
            className="bg-c4c-petrol hover:bg-black text-white"
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