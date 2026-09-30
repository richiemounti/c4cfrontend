// components/project/modals/ViewRisksModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Eye, X } from 'lucide-react';
import { getRiskRegisterSummary, getRiskScoreColor } from '@/lib/api/riskManagement';
import { format } from 'date-fns';
import { RiskItem } from '@/types';

interface ViewRisksModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  organizationId: string;
  sourceFieldName?: string; // To filter risks from specific field
}

const ViewRisksModal = ({
  isOpen,
  onClose,
  projectId,
  organizationId,
  sourceFieldName
}: ViewRisksModalProps) => {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRisks();
    }
  }, [isOpen, projectId]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getRiskRegisterSummary({
        projectId,
        organizationId
      });
      
      // Filter by source field if specified
      let filteredRisks = data.risks;
      
      setRisks(filteredRisks);
    } catch (err) {
      console.error('Failed to fetch risks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load risks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-c4c-rule">
        <DialogHeader>
          <DialogTitle className="text-xl text-black flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-c4c-burgundy" />
            Project Risks
            {sourceFieldName && (
              <span className="ml-2 text-sm text-c4c-petrol">
                (from {sourceFieldName})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-c4c-petrol" />
              <span className="ml-2 text-c4c-petrol">Loading risks...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-c4c-tint-coral border border-c4c-pink rounded-md">
              <p className="text-sm text-c4c-burgundy">{error}</p>
            </div>
          )}

          {!loading && !error && risks.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-c4c-petrol mx-auto mb-3" />
              <p className="text-c4c-petrol">
                {sourceFieldName
                  ? `No risks found from ${sourceFieldName}`
                  : 'No risks have been created for this project yet'}
              </p>
            </div>
          )}

          {!loading && !error && risks.length > 0 && (
            <div className="space-y-3">
              {risks.map((risk) => (
                <div
                  key={risk._id}
                  className="p-4 border border-c4c-rule rounded-lg hover:bg-c4c-grey-bg transition-colors cursor-pointer"
                  onClick={() => setSelectedRisk(risk)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-black">{risk.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                          {risk.riskScore.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-c4c-grey-bg text-c4c-petrol">
                          {risk.riskType}
                        </span>
                      </div>
                      <p className="text-sm text-c4c-petrol line-clamp-2 mb-2">
                        {risk.riskDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-c4c-petrol">
                        <span>Owner: {risk.owner.name}</span>
                        <span>Status: {risk.status}</span>
                        <span>Created: {format(new Date(risk.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-c4c-petrol" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Detail View */}
        {selectedRisk && (
          <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl text-black flex items-center justify-between">
                  <span>{selectedRisk.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRisk(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-c4c-petrol mb-1">Risk Type & Score</h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-c4c-grey-bg">
                      {selectedRisk.riskType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getRiskScoreColor(selectedRisk.riskScore)}`}>
                      {selectedRisk.riskScore.toUpperCase()} RISK
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-c4c-petrol mb-1">Description</h4>
                  <p className="text-sm text-c4c-petrol">{selectedRisk.riskDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-c4c-petrol mb-1">Probability</h4>
                    <p className="text-sm text-c4c-petrol capitalize">{selectedRisk.probability.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-c4c-petrol mb-1">Consequences</h4>
                    <p className="text-sm text-c4c-petrol capitalize">{selectedRisk.consequences}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-c4c-petrol mb-1">Mitigation Strategy</h4>
                  <p className="text-sm text-c4c-petrol">{selectedRisk.mitigationStrategy}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-c4c-petrol mb-1">Owner</h4>
                  <p className="text-sm text-c4c-petrol">{selectedRisk.owner.name}</p>
                </div>

                {selectedRisk.projectSite && (
                  <div>
                    <h4 className="text-sm font-medium text-c4c-petrol mb-1">Project Site</h4>
                    <p className="text-sm text-c4c-petrol">{selectedRisk.projectSite.name}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-c4c-rule">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-c4c-rule text-c4c-petrol hover:bg-c4c-grey-bg"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRisksModal;