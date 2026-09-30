// app/admin/dashboard/risks/[riskId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Edit,
  Archive,
  Building2,
  FolderOpen,
  MapPin,
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Minus,
  MoreHorizontal,
  Plus,
  Download,
  Share
} from 'lucide-react';

import { getRiskDetails, updateRiskItem } from '@/lib/api/riskManagement';
import { RiskItem } from '@/types';
import { LastEditedBy } from '@/components/shared/LastEditedBy';

export default function RiskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const riskId = params.riskId as string;
  
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<RiskItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (riskId) {
      fetchRiskDetails();
    }
  }, [riskId]);

  const fetchRiskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const riskData = await getRiskDetails(riskId);
      setRisk(riskData);
    } catch (error: any) {
      console.error('Error fetching risk details:', error);
      setError(error.message || 'Failed to load risk details');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: string) => {
    switch (score) {
      case 'high':
        return 'bg-destructive text-destructive-foreground border-transparent';
      case 'medium':
        return 'bg-c4c-tint-gold text-black border-transparent';
      case 'low':
        return 'bg-c4c-tint-sage text-black border-transparent';
      default:
        return 'bg-c4c-grey-bg text-black border-transparent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-c4c-tint-coral text-c4c-burgundy';
      case 'monitoring':
        return 'bg-c4c-tint-gold text-black';
      case 'closed':
        return 'bg-c4c-tint-sage text-black';
      case 'transferred':
        return 'bg-c4c-tint-cyan text-c4c-cobalt';
      default:
        return 'bg-c4c-grey-bg text-black';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'operational':
        return <Shield className="h-5 w-5" />;
      case 'financial':
        return <TrendingDown className="h-5 w-5" />;
      case 'environmental':
        return <AlertTriangle className="h-5 w-5" />;
      case 'social':
        return <User className="h-5 w-5" />;
      case 'strategic':
        return <Target className="h-5 w-5" />;
      case 'technical':
        return <Shield className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const formatProbability = (probability: string) => {
    return probability.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatConsequences = (consequences: string) => {
    return consequences.charAt(0).toUpperCase() + consequences.slice(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-c4c-petrol border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <div className="bg-c4c-tint-coral border border-c4c-burgundy text-c4c-burgundy px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="text-c4c-petrol hover:text-black"
          >
            ← Back to Risk Register
          </button>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Risk Not Found</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 text-c4c-petrol hover:text-black"
          >
            ← Back to Risk Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-c4c-petrol hover:text-black"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">Risk Details</h1>
            <p className="text-c4c-petrol">View and manage risk information</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-c4c-rule rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-c4c-rule rounded-md shadow-sm text-sm font-medium text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              // Handle edit functionality
              router.push(`/admin/dashboard/risks/${riskId}/edit`);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Risk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Risk Overview Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${getRiskScoreColor(risk.riskScore)}`}>
                    {getRiskTypeIcon(risk.riskType)}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black mb-2">{risk.name}</h2>
                  <LastEditedBy
                    name={risk.lastUpdatedBy?.name}
                    timestamp={risk.updatedAt}
                    className="mb-3"
                  />
                  <p className="text-c4c-petrol mb-4">{risk.riskDescription}</p>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskScoreColor(risk.riskScore)}`}>
                      {risk.riskScore.toUpperCase()} RISK
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </span>
                    <span className="text-sm text-c4c-petrol capitalize">
                      {risk.riskType} Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-c4c-grey-bg rounded-lg p-4">
                <h4 className="text-sm font-medium text-c4c-petrol mb-2">Probability</h4>
                <p className="text-lg font-semibold text-black">
                  {formatProbability(risk.probability)}
                </p>
              </div>
              <div className="bg-c4c-grey-bg rounded-lg p-4">
                <h4 className="text-sm font-medium text-c4c-petrol mb-2">Consequences</h4>
                <p className="text-lg font-semibold text-black">
                  {formatConsequences(risk.consequences)}
                </p>
              </div>
              <div className="bg-c4c-grey-bg rounded-lg p-4">
                <h4 className="text-sm font-medium text-c4c-petrol mb-2">Category</h4>
                <p className="text-lg font-semibold text-black capitalize">
                  {risk.category}
                </p>
              </div>
            </div>

            {/* Impact Areas */}
            {risk.impactArea && risk.impactArea.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-black mb-3">Impact Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {risk.impactArea.map((area) => (
                    <span key={area} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-c4c-tint-cyan text-c4c-petrol">
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mitigation Strategy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-black mb-4">Mitigation Strategy</h3>
            <p className="text-c4c-petrol leading-relaxed">{risk.mitigationStrategy}</p>
          </div>

          {/* Mitigation Actions */}
          {risk.mitigationActions && risk.mitigationActions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">Mitigation Actions</h3>
                <button className="inline-flex items-center px-3 py-1 border-2 border-c4c-petrol text-sm font-medium rounded-md text-c4c-petrol bg-white hover:bg-c4c-petrol hover:text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </button>
              </div>

              <div className="space-y-4">
                {risk.mitigationActions.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-black mb-2">{action.action}</p>
                        <div className="flex items-center space-x-4 text-sm text-c4c-petrol">
                          {action.responsible && (
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {action.responsible.name}
                            </span>
                          )}
                          {action.dueDate && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(action.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {action.notes && (
                          <p className="text-sm text-c4c-petrol mt-2">{action.notes}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          action.status === 'completed' ? 'bg-c4c-tint-sage text-black' :
                          action.status === 'in_progress' ? 'bg-c4c-tint-gold text-black' :
                          action.status === 'cancelled' ? 'bg-c4c-tint-coral text-c4c-burgundy' :
                          'bg-c4c-grey-bg text-black'
                        }`}>
                          {action.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk History */}
          {risk.riskHistory && risk.riskHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-black mb-4">Risk History</h3>
              <div className="space-y-4">
                {risk.riskHistory.map((entry, index) => (
                  <div key={index} className="border-l-4 border-c4c-rule pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-black">
                          Risk assessment updated
                        </p>
                        <p className="text-sm text-c4c-petrol">
                          Probability: {formatProbability(entry.probability)} |
                          Consequences: {formatConsequences(entry.consequences)} |
                          Score: {entry.riskScore.toUpperCase()}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-c4c-petrol mt-1">{entry.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-c4c-petrol">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Risk Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-black mb-4">Risk Management</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-c4c-petrol">Risk Owner</label>
                <div className="flex items-center mt-1">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-c4c-rule rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-c4c-petrol" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-black">{risk.owner.name}</p>
                    {risk.owner.email && (
                      <p className="text-sm text-c4c-petrol">{risk.owner.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {risk.reviewDate && (
                <div>
                  <label className="text-sm font-medium text-c4c-petrol">Next Review</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-c4c-petrol mr-2" />
                    <span className={`text-sm font-medium ${
                      risk.isReviewOverdue ? 'text-c4c-burgundy' : 'text-black'
                    }`}>
                      {new Date(risk.reviewDate).toLocaleDateString()}
                    </span>
                    {risk.isReviewOverdue && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-c4c-tint-coral text-c4c-burgundy">
                        Overdue
                      </span>
                    )}
                  </div>
                  {risk.daysUntilReview !== null && risk.daysUntilReview !== undefined && !risk.isReviewOverdue && (
                    <p className="text-xs text-c4c-petrol mt-1">
                      {risk.daysUntilReview > 0
                        ? `${risk.daysUntilReview} days remaining`
                        : 'Due today'
                      }
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-c4c-petrol">Identified Date</label>
                <p className="text-sm text-black mt-1">
                  {new Date(risk.identifiedDate).toLocaleDateString()}
                </p>
              </div>

              {risk.mitigationProgress !== undefined && (
                <div>
                  <label className="text-sm font-medium text-c4c-petrol">Mitigation Progress</label>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="flex-1 bg-c4c-rule rounded-full h-2 mr-3">
                        <div
                          className="bg-c4c-petrol h-2 rounded-full"
                          style={{ width: `${risk.mitigationProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-black">
                        {risk.mitigationProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-black mb-4">Context</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-c4c-petrol mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">{risk.organization.name}</p>
                  <p className="text-xs text-c4c-petrol">Organization</p>
                  {(risk.organization.city || risk.organization.country) && (
                    <p className="text-xs text-c4c-petrol">
                      {[risk.organization.city, risk.organization.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <FolderOpen className="h-5 w-5 text-c4c-petrol mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">{risk.project.name}</p>
                  <p className="text-xs text-c4c-petrol">Project</p>
                  {risk.project.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-c4c-tint-cyan text-c4c-petrol mt-1">
                      {risk.project.status}
                    </span>
                  )}
                </div>
              </div>

              {risk.projectSite && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-c4c-petrol mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-black">{risk.projectSite.name}</p>
                    <p className="text-xs text-c4c-petrol">Project Site</p>
                    {risk.projectSite.status && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-c4c-tint-sage text-black mt-1">
                        {risk.projectSite.status}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-black mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-rule text-sm font-medium rounded-md text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
                <FileText className="h-4 w-4 mr-2" />
                Update Status
              </button>

              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-rule text-sm font-medium rounded-md text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </button>

              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-c4c-rule text-sm font-medium rounded-md text-c4c-petrol bg-white hover:bg-c4c-grey-bg">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </button>

              <button
                onClick={() => router.push(`/admin/dashboard/project/${risk.project._id}`)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-c4c-petrol text-sm font-medium rounded-md text-c4c-petrol bg-white hover:bg-c4c-petrol hover:text-white"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                View Project
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-black mb-4">Metadata</h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-c4c-petrol">Created:</span>
                <span className="ml-2 text-black">
                  {new Date(risk.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-c4c-petrol">Last Updated:</span>
                <span className="ml-2 text-black">
                  {new Date(risk.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-c4c-petrol">Created by:</span>
                <span className="ml-2 text-black">{risk.creator.name}</span>
              </div>

              {risk.lastUpdatedBy && (
                <div>
                  <span className="text-c4c-petrol">Updated by:</span>
                  <span className="ml-2 text-black">{risk.lastUpdatedBy.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}