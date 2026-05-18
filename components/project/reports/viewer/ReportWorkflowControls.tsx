// components/reports/viewer/ReportWorkflowControls.tsx
'use client';

import { useState } from 'react';
import { 
  CheckCircle, Clock, FileText, Share2, Archive, 
  ArrowRight, RotateCcw, AlertTriangle, User 
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';
import ReportStatusBadge from '../ReportStatusBadge';
import { 
  transitionReportStatus, 
  getWorkflowConfig, 
  regenerateReport 
} from '@/lib/api/reports/workflow';
import { 
  canUserEditReport, 
  canUserApproveReport, 
  canUserPublishReport,
  canUserArchiveReport,
  getReportStatusLabel
} from '@/lib/utils/reports';

interface ReportWorkflowControlsProps {
  report: BaseReportData;
  onUpdate: () => void;
  user: any;
}

const ReportWorkflowControls: React.FC<ReportWorkflowControlsProps> = ({
  report,
  onUpdate,
  user
}) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<string>('');
  const [transitionNotes, setTransitionNotes] = useState('');

  const canEdit = canUserEditReport(report, user);
  const canApprove = canUserApproveReport(report, user);
  const canPublish = canUserPublishReport(report, user);
  const canArchive = canUserArchiveReport(report, user);

  // Define available transitions based on current status and permissions
  const getAvailableTransitions = () => {
    const transitions = [];

    switch (report.status) {
      case 'draft':
        if (canEdit) {
          transitions.push({ value: 'generated', label: 'Mark as Generated', icon: CheckCircle, color: 'bg-sky' });
        }
        if (canArchive) {
          transitions.push({ value: 'archived', label: 'Archive', icon: Archive, color: 'bg-gray-500' });
        }
        break;
      
      case 'generated':
        if (canEdit) {
          transitions.push({ value: 'draft', label: 'Return to Draft', icon: RotateCcw, color: 'bg-gray-500' });
        }
        if (canApprove) {
          transitions.push({ value: 'approved', label: 'Approve', icon: CheckCircle, color: 'bg-grass' });
        }
        if (canArchive) {
          transitions.push({ value: 'archived', label: 'Archive', icon: Archive, color: 'bg-gray-500' });
        }
        break;
      
      case 'approved':
        if (canEdit) {
          transitions.push({ value: 'generated', label: 'Return to Generated', icon: RotateCcw, color: 'bg-sky' });
        }
        if (canPublish) {
          transitions.push({ value: 'published', label: 'Publish', icon: Share2, color: 'bg-ochre' });
        }
        if (canArchive) {
          transitions.push({ value: 'archived', label: 'Archive', icon: Archive, color: 'bg-gray-500' });
        }
        break;
      
      case 'published':
        if (canArchive) {
          transitions.push({ value: 'archived', label: 'Archive', icon: Archive, color: 'bg-gray-500' });
        }
        break;
      
      case 'archived':
        // No transitions from archived state
        break;
    }

    return transitions;
  };

  const handleStatusTransition = async () => {
    if (!selectedTransition) return;

    setProcessing(true);
    try {
      await transitionReportStatus(report.id, selectedTransition as any, {
        notes: transitionNotes || undefined
      });
      
      toast({
        title: 'Status Updated',
        description: `Report status changed to ${getReportStatusLabel(selectedTransition as any)}`,
      });
      
      setSelectedTransition('');
      setTransitionNotes('');
      onUpdate();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update report status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateReport(report.id, { force: false });
      
      toast({
        title: 'Regeneration Started',
        description: 'Report regeneration has been initiated. This may take a few moments.',
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: 'Regeneration Failed',
        description: 'Failed to regenerate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  const availableTransitions = getAvailableTransitions();

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-stratosphere mb-4">Workflow Controls</h3>
      
      {/* Current Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-sky mb-2">Current Status</label>
        <div className="flex items-center space-x-3">
          <ReportStatusBadge status={report.status} size="md" />
          <span className="text-sm text-sky">
            {report.status === 'draft' && 'Being created or edited'}
            {report.status === 'generated'}
            {report.status === 'approved' && 'Approved for publication'}
            {report.status === 'published' && 'Available to stakeholders'}
            {report.status === 'archived' && 'No longer active'}
          </span>
        </div>
      </div>

      

      {/* Regeneration */}
      {(canEdit && ['generated', 'draft'].includes(report.status)) && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-sky mb-3">Report Regeneration</label>
          
          <div className="p-4 bg-sky-tint rounded-lg">
            <div className="flex items-start space-x-3 mb-3">
              <AlertTriangle size={20} className="text-ochre mt-0.5" />
              <div>
                <p className="text-sm text-stratosphere font-medium">Regenerate Report Data</p>
                <p className="text-xs text-sky mt-1">
                  This will fetch the latest data and regenerate the report content. 
                  Any manual changes may be lost.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="w-full flex items-center justify-center px-4 py-2 border border-ochre text-ochre rounded-md hover:bg-ochre hover:text-white disabled:opacity-50"
            >
              {regenerating ? (
                <Clock size={16} className="mr-2 animate-spin" />
              ) : (
                <RotateCcw size={16} className="mr-2" />
              )}
              {regenerating ? 'Regenerating...' : 'Regenerate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Workflow History Preview */}
      {report.metadata?.workflowHistory && report.metadata.workflowHistory.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-sky mb-3">Recent Activity</label>
          <div className="space-y-2">
            {report.metadata.workflowHistory.slice(-3).map((entry, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-sky-tint rounded">
                <div className="w-2 h-2 bg-sky rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs text-stratosphere">
                    Changed from <span className="font-medium">{entry.fromStatus}</span> to{' '}
                    <span className="font-medium">{entry.toStatus}</span>
                  </p>
                  <p className="text-xs text-sky">
                    {new Date(entry.transitionedAt).toLocaleDateString()} by {entry.transitionedBy.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportWorkflowControls;