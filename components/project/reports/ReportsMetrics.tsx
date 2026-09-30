// components/reports/ReportsMetrics.tsx
'use client';

import { FileText } from 'lucide-react';
import { ReportAnalytics } from '@/types/reports';
import { Card } from '@/components/ui/card';
import { StatGrid, StatTile } from '@/components/shared/StatTile';

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
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-c4c-grey-bg w-24 mb-2"></div>
              <div className="h-8 bg-c4c-grey-bg w-16 mb-2"></div>
              <div className="h-3 bg-c4c-grey-bg w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

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
    <div className="flex flex-col gap-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatGrid>
          <StatTile label="Total Reports" value={analytics.summary.totalReports} icon={<FileText />} />
        </StatGrid>

        {/* Reports by Type Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">Reports by Type</span>
            <FileText className="w-5 h-5 text-c4c-petrol" />
          </div>
          <div className="space-y-2">
            {sortedByType.map(([type, count]) => {
              const percentage = (count / analytics.summary.totalReports) * 100;

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-xs text-black truncate max-w-[150px]">
                      {typeLabels[type] || type}
                    </span>
                    <div className="flex-1 bg-c4c-grey-bg h-1.5">
                      <div
                        className="bg-c4c-petrol h-1.5 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-c4c-petrol ml-2">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity Trend */}
      {analytics.trends?.recentActivity && analytics.trends.recentActivity.length > 0 && (
        <Card className="p-6">
          <h3 className="font-title text-lg font-semibold text-black mb-4">Recent Activity Timeline</h3>
          <div className="relative overflow-x-auto">
            <div className="flex space-x-6 min-w-fit pb-4">
              {analytics.trends.recentActivity.slice(0, 7).map((activity: any, index: number) => {
                const date = new Date(activity.createdAt);
                const isValidDate = !isNaN(date.getTime());

                return (
                  <div key={index} className="flex flex-col items-center min-w-[100px]">
                    {/* Timeline Item */}
                    <div className="relative">
                      <div className="w-11 h-11 bg-c4c-petrol flex items-center justify-center text-white font-title font-semibold text-sm">
                        {index + 1}
                      </div>
                      {/* Connector Line */}
                      {index < analytics.trends.recentActivity.length - 1 && (
                        <div className="absolute top-[22px] left-11 w-6 h-0.5 bg-c4c-rule"></div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="mt-3 text-center">
                      <div className="text-xs font-medium text-black mb-1 line-clamp-2">
                        {typeLabels[activity.type] || activity.type}
                      </div>
                      <div className="text-xs text-c4c-petrol">
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
        </Card>
      )}
    </div>
  );
};

export default ReportsMetrics;
