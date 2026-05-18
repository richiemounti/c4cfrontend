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
      case 'manual': return <User className="text-sky" size={16} />;
      case 'automatic': return <Clock className="text-grass" size={16} />;
      case 'backup': return <Download className="text-ochre" size={16} />;
      default: return <FileText className="text-gray-500" size={16} />;
    }
  };

  const getSnapshotTypeBadge = (type: string) => {
    const badges = {
      manual: 'bg-sky-100 text-sky-800',
      automatic: 'bg-green-100 text-green-800',
      backup: 'bg-orange-100 text-orange-800'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GitBranch className="text-sky" size={24} />
          <h3 className="text-lg font-medium text-stratosphere">Version History</h3>
        </div>
        <button
          onClick={onClose}
          className="text-sky hover:text-stratosphere"
        >
          <X size={20} />
        </button>
      </div>

      {/* Create New Snapshot */}
      <div className="bg-sky-tint rounded-lg p-4 mb-6">
        <h4 className="font-medium text-stratosphere mb-3">Create Manual Snapshot</h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newSnapshotReason}
            onChange={(e) => setNewSnapshotReason(e.target.value)}
            placeholder="Reason for creating snapshot..."
            className="flex-1 px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
          />
          <button
            onClick={handleCreateSnapshot}
            disabled={creatingSnapshot || !newSnapshotReason.trim()}
            className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere disabled:opacity-50"
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
        <div className="bg-ochre-50 border border-ochre-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Diff className="text-ochre" size={20} />
              <span className="text-ochre-800 font-medium">
                {selectedVersions.length} version{selectedVersions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              {selectedVersions.length === 2 && (
                <button
                  onClick={handleCompareVersions}
                  disabled={comparing}
                  className="px-4 py-2 bg-ochre text-white rounded-md hover:bg-ochre-900 disabled:opacity-50"
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
                className="px-3 py-2 border border-ochre text-ochre rounded-md hover:bg-ochre-50"
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
          <Clock size={24} className="animate-spin text-sky" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8">
          <GitBranch size={48} className="mx-auto text-sky mb-4" />
          <p className="text-sky">No version history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version._id}
              className={`rounded-lg border-2 transition-all duration-200 ${
                selectedVersions.includes(version._id)
                  ? 'border-sky bg-sky-tint'
                  : 'border-sky-tint hover:border-sky bg-white'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVersionSelect(version._id)}
                      className={`w-4 h-4 rounded border-2 transition-colors ${
                        selectedVersions.includes(version._id)
                          ? 'bg-sky border-sky'
                          : 'border-sky-tint hover:border-sky'
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
                          <span className="font-medium text-stratosphere">
                            Version {version.version}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSnapshotTypeBadge(version.snapshotType)}`}>
                            {version.snapshotType}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 text-xs bg-grass-100 text-grass-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-sky mt-1">
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
                        className="flex items-center space-x-1 text-sky hover:text-stratosphere"
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
                        className="flex items-center space-x-1 px-3 py-1 text-ochre border border-ochre rounded hover:bg-ochre hover:text-white disabled:opacity-50"
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
                  <div className="mt-3 p-3 bg-sky-tint rounded border">
                    <p className="text-sm text-stratosphere">{version.reason}</p>
                  </div>
                )}

                {/* Expanded Details */}
                {expandedVersions[version._id] && version.changesSummary && (
                  <div className="mt-4 pt-4 border-t border-sky-tint">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {version.changesSummary.changesBreakdown.added}
                        </div>
                        <div className="text-xs text-sky">Added</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {version.changesSummary.changesBreakdown.modified}
                        </div>
                        <div className="text-xs text-sky">Modified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {version.changesSummary.changesBreakdown.deleted}
                        </div>
                        <div className="text-xs text-sky">Deleted</div>
                      </div>
                    </div>

                    {version.changesSummary.sectionsChanged.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-stratosphere mb-2">Sections Changed:</h5>
                        <div className="flex flex-wrap gap-2">
                          {version.changesSummary.sectionsChanged.map((section, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded"
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
              <h4 className="text-lg font-medium text-stratosphere">Version Comparison</h4>
              <button
                onClick={() => setComparisonData(null)}
                className="text-sky hover:text-stratosphere"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sky-tint rounded-lg p-4">
                  <h5 className="font-medium text-stratosphere mb-2">From Version</h5>
                  <p className="text-sm text-sky">Version {comparisonData.fromSnapshot.version}</p>
                  <p className="text-xs text-sky">{new Date(comparisonData.fromSnapshot.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-sky-tint rounded-lg p-4">
                  <h5 className="font-medium text-stratosphere mb-2">To Version</h5>
                  <p className="text-sm text-sky">Version {comparisonData.toSnapshot.version}</p>
                  <p className="text-xs text-sky">{new Date(comparisonData.toSnapshot.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-sky-tint rounded-lg p-4">
                <h5 className="font-medium text-stratosphere mb-3">Changes Summary</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {comparisonData.summary.changesBreakdown.added}
                    </div>
                    <div className="text-sm text-sky">Added</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {comparisonData.summary.changesBreakdown.modified}
                    </div>
                    <div className="text-sm text-sky">Modified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {comparisonData.summary.changesBreakdown.deleted}
                    </div>
                    <div className="text-sm text-sky">Deleted</div>
                  </div>
                </div>
              </div>

              {comparisonData.changes && comparisonData.changes.length > 0 && (
                <div>
                  <h5 className="font-medium text-stratosphere mb-3">Detailed Changes</h5>
                  <div className="space-y-2">
                    {comparisonData.changes.slice(0, 10).map((change: any, index: number) => (
                      <div key={index} className="p-3 border border-sky-tint rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            change.type === 'added' ? 'bg-green-100 text-green-800' :
                            change.type === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {change.type}
                          </span>
                          <span className="text-sm font-medium text-stratosphere">{change.field}</span>
                        </div>
                        {change.description && (
                          <p className="text-sm text-sky">{change.description}</p>
                        )}
                      </div>
                    ))}
                    {comparisonData.changes.length > 10 && (
                      <p className="text-sm text-sky text-center">
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