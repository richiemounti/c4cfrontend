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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'transferred':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Risk Register
          </button>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Risk Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Risk Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Details</h1>
            <p className="text-gray-600">View and manage risk information</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => {
              // Handle edit functionality
              router.push(`/admin/dashboard/risks/${riskId}/edit`);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{risk.name}</h2>
                  <p className="text-gray-600 mb-4">{risk.riskDescription}</p>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskScoreColor(risk.riskScore)}`}>
                      {risk.riskScore.toUpperCase()} RISK
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(risk.status)}`}>
                      {risk.status}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {risk.riskType} Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Probability</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {formatProbability(risk.probability)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Consequences</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {formatConsequences(risk.consequences)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {risk.category}
                </p>
              </div>
            </div>

            {/* Impact Areas */}
            {risk.impactArea && risk.impactArea.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Impact Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {risk.impactArea.map((area) => (
                    <span key={area} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mitigation Strategy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mitigation Strategy</h3>
            <p className="text-gray-600 leading-relaxed">{risk.mitigationStrategy}</p>
          </div>

          {/* Mitigation Actions */}
          {risk.mitigationActions && risk.mitigationActions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mitigation Actions</h3>
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </button>
              </div>
              
              <div className="space-y-4">
                {risk.mitigationActions.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{action.action}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                          <p className="text-sm text-gray-600 mt-2">{action.notes}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          action.status === 'completed' ? 'bg-green-100 text-green-800' :
                          action.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          action.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk History</h3>
              <div className="space-y-4">
                {risk.riskHistory.map((entry, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Risk assessment updated
                        </p>
                        <p className="text-sm text-gray-600">
                          Probability: {formatProbability(entry.probability)} | 
                          Consequences: {formatConsequences(entry.consequences)} | 
                          Score: {entry.riskScore.toUpperCase()}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Risk Owner</label>
                <div className="flex items-center mt-1">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{risk.owner.name}</p>
                    {risk.owner.email && (
                      <p className="text-sm text-gray-500">{risk.owner.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {risk.reviewDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Review</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`text-sm font-medium ${
                      risk.isReviewOverdue ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(risk.reviewDate).toLocaleDateString()}
                    </span>
                    {risk.isReviewOverdue && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </div>
                  {risk.daysUntilReview !== null && risk.daysUntilReview !== undefined && !risk.isReviewOverdue && (
                    <p className="text-xs text-gray-500 mt-1">
                      {risk.daysUntilReview > 0 
                        ? `${risk.daysUntilReview} days remaining`
                        : 'Due today'
                      }
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Identified Date</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(risk.identifiedDate).toLocaleDateString()}
                </p>
              </div>

              {risk.mitigationProgress !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mitigation Progress</label>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${risk.mitigationProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Context</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{risk.organization.name}</p>
                  <p className="text-xs text-gray-500">Organization</p>
                  {(risk.organization.city || risk.organization.country) && (
                    <p className="text-xs text-gray-500">
                      {[risk.organization.city, risk.organization.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <FolderOpen className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{risk.project.name}</p>
                  <p className="text-xs text-gray-500">Project</p>
                  {risk.project.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {risk.project.status}
                    </span>
                  )}
                </div>
              </div>

              {risk.projectSite && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{risk.projectSite.name}</p>
                    <p className="text-xs text-gray-500">Project Site</p>
                    {risk.projectSite.status && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <FileText className="h-4 w-4 mr-2" />
                Update Status
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </button>
              
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </button>
              
              <button 
                onClick={() => router.push(`/admin/dashboard/project/${risk.project._id}`)}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                View Project
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(risk.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(risk.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">Created by:</span>
                <span className="ml-2 text-gray-900">{risk.creator.name}</span>
              </div>
              
              {risk.lastUpdatedBy && (
                <div>
                  <span className="text-gray-500">Updated by:</span>
                  <span className="ml-2 text-gray-900">{risk.lastUpdatedBy.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}