'use client';

import { useState, useEffect } from 'react';
import {
  Clock, GitBranch, User, Calendar, FileText, Eye,
  ArrowRight, RotateCcw, X, Download, AlertCircle,
  CheckCircle, Diff, ChevronDown, ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getReportVersionHistory,
  getSnapshotById,
  compareSnapshots,
  restoreFromSnapshot,
  createReportSnapshot
} from '@/lib/api/reports/history';

interface ReportVersionHistoryProps {
  reportId: string;
  onClose: () => void;
}

interface VersionEntry {
  _id: string;
  version: number;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email?: string;
  };
  snapshotType: 'manual' | 'automatic' | 'backup';
  reason?: string;
  changesSummary?: {
    totalChanges: number;
    sectionsChanged: string[];
    changesBreakdown: {
      added: number;
      modified: number;
      deleted: number;
    };
  };
}

const ReportVersionHistory: React.FC<ReportVersionHistoryProps> = ({
  reportId,
  onClose
}) => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [newSnapshotReason, setNewSnapshotReason] = useState('');

  useEffect(() => {
    fetchVersionHistory();
  }, [reportId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      const response = await getReportVersionHistory(reportId, 20);
      setVersions(response.data.versions);
    } catch (error) {
      console.error('Error fetching version history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        // Replace the first selected version
        return [prev[1], versionId];
      }
    });
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) return;

    try {
      setComparing(true);
      const response = await compareSnapshots(selectedVersions[0], selectedVersions[1]);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast({
        title: 'Comparison Failed',
        description: 'Failed to compare selected versions',
        variant: 'destructive',
      });
    } finally {
      setComparing(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a backup of the current version.')) {
      return;
    }

    try {
      setRestoring(versionId);
      await restoreFromSnapshot(versionId, true);
      toast({
        title: 'Version Restored',
        description: 'Report has been restored to the selected version',
      });
      onClose();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Restore Failed',
        description: 'Failed to restore the selected version',
        variant: 'destructive',
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for creating this snapshot',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingSnapshot(true);
      await createReportSnapshot(reportId, newSnapshotReason);
      toast({
        title: 'Snapshot Created',
        description: 'Manual snapshot has been created successfully',
      });
      setNewSnapshotReason('');
      fetchVersionHistory();
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast({
        title: 'Snapshot Failed',
        description: 'Failed to create snapshot',
        variant: 'destructive',
      });
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const toggleVersionDetails = (versionId: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  const getSnapshotTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <User className="text-c4c-petrol" size={16} />;
      case 'automatic': return <Clock className="text-c4c-sage" size={16} />;
      case 'backup': return <Download className="text-c4c-petrol" size={16} />;
      default: return <FileText className="text-c4c-petrol" size={16} />;
    }
  };

  const getSnapshotTypeBadge = (type: string) => {
    const badges = {
      manual: 'bg-c4c-grey-bg text-black',
      automatic: 'bg-c4c-tint-sage text-black',
      backup: 'bg-c4c-tint-gold text-black'
    };
    return badges[type as keyof typeof badges] || 'bg-c4c-grey-bg text-c4c-petrol';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GitBranch className="text-c4c-petrol" size={24} />
          <h3 className="text-lg font-medium text-black">Version History</h3>
        </div>
        <button
          onClick={onClose}
          className="text-c4c-petrol hover:text-black"
        >
          <X size={20} />
        </button>
      </div>

      {/* Create New Snapshot */}
      <div className="bg-c4c-grey-bg rounded-lg p-4 mb-6">
        <h4 className="font-medium text-black mb-3">Create Manual Snapshot</h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newSnapshotReason}
            onChange={(e) => setNewSnapshotReason(e.target.value)}
            placeholder="Reason for creating snapshot..."
            className="flex-1 px-3 py-2 border border-c4c-petrol rounded-md focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
          />
          <button
            onClick={handleCreateSnapshot}
            disabled={creatingSnapshot || !newSnapshotReason.trim()}
            className="px-4 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white disabled:opacity-50"
          >
            {creatingSnapshot ? (
              <Clock size={16} className="animate-spin" />
            ) : (
              'Create'
            )}
          </button>
        </div>
      </div>

      {/* Comparison Controls */}
      {selectedVersions.length > 0 && (
        <div className="bg-c4c-tint-gold border border-c4c-yellow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Diff className="text-c4c-petrol" size={20} />
              <span className="text-black font-medium">
                {selectedVersions.length} version{selectedVersions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              {selectedVersions.length === 2 && (
                <button
                  onClick={handleCompareVersions}
                  disabled={comparing}
                  className="px-4 py-2 bg-c4c-yellow text-black rounded-md hover:bg-c4c-petrol hover:text-white disabled:opacity-50"
                >
                  {comparing ? (
                    <Clock size={16} className="animate-spin" />
                  ) : (
                    'Compare Versions'
                  )}
                </button>
              )}
              <button
                onClick={() => setSelectedVersions([])}
                className="px-3 py-2 border border-c4c-yellow text-c4c-petrol rounded-md hover:bg-c4c-tint-gold"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Clock size={24} className="animate-spin text-c4c-petrol" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8">
          <GitBranch size={48} className="mx-auto text-c4c-petrol mb-4" />
          <p className="text-c4c-petrol">No version history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version._id}
              className={`rounded-lg border-2 transition-all duration-200 ${
                selectedVersions.includes(version._id)
                  ? 'border-c4c-petrol bg-c4c-grey-bg'
                  : 'border-c4c-grey-bg hover:border-c4c-petrol bg-white'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVersionSelect(version._id)}
                      className={`w-4 h-4 rounded border-2 transition-colors ${
                        selectedVersions.includes(version._id)
                          ? 'bg-c4c-petrol border-c4c-petrol'
                          : 'border-c4c-grey-bg hover:border-c4c-petrol'
                      }`}
                    >
                      {selectedVersions.includes(version._id) && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </button>

                    <div className="flex items-center space-x-3">
                      {getSnapshotTypeIcon(version.snapshotType)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">
                            Version {version.version}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSnapshotTypeBadge(version.snapshotType)}`}>
                            {version.snapshotType}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 text-xs bg-c4c-tint-sage text-black rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-c4c-petrol mt-1">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(version.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <User size={14} className="mr-1" />
                            {version.createdBy.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {version.changesSummary && (
                      <button
                        onClick={() => toggleVersionDetails(version._id)}
                        className="flex items-center space-x-1 text-c4c-petrol hover:text-black"
                      >
                        <span className="text-sm">
                          {version.changesSummary.totalChanges} changes
                        </span>
                        {expandedVersions[version._id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    )}

                    {index > 0 && (
                      <button
                        onClick={() => handleRestoreVersion(version._id)}
                        disabled={restoring === version._id}
                        className="flex items-center space-x-1 px-3 py-1 text-c4c-petrol border border-c4c-yellow rounded hover:bg-c4c-yellow hover:text-white disabled:opacity-50"
                      >
                        {restoring === version._id ? (
                          <Clock size={14} className="animate-spin" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                        <span className="text-sm">Restore</span>
                      </button>
                    )}
                  </div>
                </div>

                {version.reason && (
                  <div className="mt-3 p-3 bg-c4c-grey-bg rounded border">
                    <p className="text-sm text-black">{version.reason}</p>
                  </div>
                )}

                {/* Expanded Details */}
                {expandedVersions[version._id] && version.changesSummary && (
                  <div className="mt-4 pt-4 border-t border-c4c-grey-bg">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-c4c-sage">
                          {version.changesSummary.changesBreakdown.added}
                        </div>
                        <div className="text-xs text-c4c-petrol">Added</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-c4c-petrol">
                          {version.changesSummary.changesBreakdown.modified}
                        </div>
                        <div className="text-xs text-c4c-petrol">Modified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-c4c-burgundy">
                          {version.changesSummary.changesBreakdown.deleted}
                        </div>
                        <div className="text-xs text-c4c-petrol">Deleted</div>
                      </div>
                    </div>

                    {version.changesSummary.sectionsChanged.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-black mb-2">Sections Changed:</h5>
                        <div className="flex flex-wrap gap-2">
                          {version.changesSummary.sectionsChanged.map((section, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-c4c-grey-bg text-black text-xs rounded"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Results Modal */}
      {comparisonData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-black">Version Comparison</h4>
              <button
                onClick={() => setComparisonData(null)}
                className="text-c4c-petrol hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-c4c-grey-bg rounded-lg p-4">
                  <h5 className="font-medium text-black mb-2">From Version</h5>
                  <p className="text-sm text-c4c-petrol">Version {comparisonData.fromSnapshot.version}</p>
                  <p className="text-xs text-c4c-petrol">{new Date(comparisonData.fromSnapshot.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-c4c-grey-bg rounded-lg p-4">
                  <h5 className="font-medium text-black mb-2">To Version</h5>
                  <p className="text-sm text-c4c-petrol">Version {comparisonData.toSnapshot.version}</p>
                  <p className="text-xs text-c4c-petrol">{new Date(comparisonData.toSnapshot.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-c4c-grey-bg rounded-lg p-4">
                <h5 className="font-medium text-black mb-3">Changes Summary</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-c4c-sage">
                      {comparisonData.summary.changesBreakdown.added}
                    </div>
                    <div className="text-sm text-c4c-petrol">Added</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-c4c-petrol">
                      {comparisonData.summary.changesBreakdown.modified}
                    </div>
                    <div className="text-sm text-c4c-petrol">Modified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-c4c-burgundy">
                      {comparisonData.summary.changesBreakdown.deleted}
                    </div>
                    <div className="text-sm text-c4c-petrol">Deleted</div>
                  </div>
                </div>
              </div>

              {comparisonData.changes && comparisonData.changes.length > 0 && (
                <div>
                  <h5 className="font-medium text-black mb-3">Detailed Changes</h5>
                  <div className="space-y-2">
                    {comparisonData.changes.slice(0, 10).map((change: any, index: number) => (
                      <div key={index} className="p-3 border border-c4c-grey-bg rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            change.type === 'added' ? 'bg-c4c-tint-sage text-black' :
                            change.type === 'modified' ? 'bg-c4c-tint-gold text-black' :
                            'bg-c4c-tint-coral text-black'
                          }`}>
                            {change.type}
                          </span>
                          <span className="text-sm font-medium text-black">{change.field}</span>
                        </div>
                        {change.description && (
                          <p className="text-sm text-c4c-petrol">{change.description}</p>
                        )}
                      </div>
                    ))}
                    {comparisonData.changes.length > 10 && (
                      <p className="text-sm text-c4c-petrol text-center">
                        +{comparisonData.changes.length - 10} more changes
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportVersionHistory;