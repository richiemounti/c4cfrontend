// components/reports/ReportsMetrics.tsx
'use client';

import { 
  FileText, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Download, Users, Calendar 
} from 'lucide-react';
import { ReportAnalytics } from '@/types/reports';

interface ReportsMetricsProps {
  analytics: ReportAnalytics;
  loading?: boolean;
}

const ReportsMetrics: React.FC<ReportsMetricsProps> = ({
  analytics,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-sky p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-sky-tint rounded w-24 mb-2"></div>
              <div className="h-8 bg-sky-tint rounded w-16 mb-2"></div>
              <div className="h-3 bg-sky-tint rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Reports',
      value: analytics.summary.totalReports,
      icon: FileText,
      color: 'text-stratosphere',
      bgColor: 'bg-stratosphere/10',
    }
  ];

  const typeLabels: Record<string, string> = {
    'project_setup': 'Project Setup',
    'project_site_setup': 'Site Setup',
    'stakeholder_mapping': 'Stakeholder Mapping',
    'theory_of_change': 'Theory of Change',
    'risk_register': 'Risk Register'
  };

  // Define order for report types
  const typeOrder = [
    'project_setup',
    'project_site_setup',
    'stakeholder_mapping',
    'theory_of_change',
    'risk_register'
  ];

  // Sort byType entries according to typeOrder
  const sortedByType = typeOrder
    .filter(type => analytics.breakdown.byType[type] !== undefined)
    .map(type => [type, analytics.breakdown.byType[type]] as [string, number]);

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Reports Card */}
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg border border-sky p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sky">{metric.title}</p>
                <p className="text-2xl font-semibold text-stratosphere mt-1">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}

        {/* Reports by Type Card */}
        <div className="bg-white rounded-lg border border-sky p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-sky">Reports by Type</p>
            <div className="p-3 rounded-lg bg-grass/10">
              <FileText className="w-6 h-6 text-grass" />
            </div>
          </div>
          <div className="space-y-2">
            {sortedByType.map(([type, count]) => {
              const percentage = (count / analytics.summary.totalReports) * 100;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-xs text-stratosphere truncate max-w-[150px]">
                      {typeLabels[type] || type}
                    </span>
                    <div className="flex-1 bg-sky-tint rounded-full h-1.5">
                      <div 
                        className="bg-sky h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-sky ml-2">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Trend */}
      {analytics.trends?.recentActivity && analytics.trends.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-sky p-6">
          <h3 className="text-lg font-medium text-stratosphere mb-4">Recent Activity Timeline</h3>
          <div className="relative overflow-x-auto">
            <div className="flex space-x-6 min-w-fit pb-4">
              {analytics.trends.recentActivity.slice(0, 7).map((activity: any, index: number) => {
                const date = new Date(activity.createdAt);
                const isValidDate = !isNaN(date.getTime());

                return (
                  <div key={index} className="flex flex-col items-center min-w-[100px]">
                    {/* Timeline Item */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      {/* Connector Line */}
                      {index < analytics.trends.recentActivity.length - 1 && (
                        <div className="absolute top-6 left-12 w-6 h-0.5 bg-sky-tint"></div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="mt-3 text-center">
                      <div className="text-xs font-medium text-stratosphere mb-1 line-clamp-2">
                        {typeLabels[activity.type] || activity.type}
                      </div>
                      <div className="text-xs text-sky">
                        {isValidDate ? date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Invalid Date'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMetrics;