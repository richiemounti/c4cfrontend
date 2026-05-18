'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { RiskItem } from '@/types';
import { getRiskTypeDisplayName } from '@/lib/api/riskManagement';

interface RiskChartsProps {
  risks: RiskItem[];
  metrics: any;
  projectId: string;
}

const RiskCharts: React.FC<RiskChartsProps> = ({ risks, metrics }) => {
  // Brand colors
  const COLORS = {
    high: '#CE701C',    // sand
    medium: '#CD8028',  // ochre
    low: '#65865A',     // grass
    open: '#CE701C',    // sand
    monitoring: '#CD8028', // ochre
    closed: '#65865A',  // grass
    transferred: '#89A0AE' // sky
  };

  // Risk Score Distribution Data
  const scoreData = [
    { name: 'High', value: metrics.highRisks, color: COLORS.high },
    { name: 'Medium', value: metrics.mediumRisks, color: COLORS.medium },
    { name: 'Low', value: metrics.lowRisks, color: COLORS.low }
  ].filter(item => item.value > 0);

  // Risk Status Distribution Data
  const statusData = [
    { name: 'Open', value: risks.filter(r => r.status === 'open').length, color: COLORS.open },
    { name: 'Monitoring', value: risks.filter(r => r.status === 'monitoring').length, color: COLORS.monitoring },
    { name: 'Closed', value: risks.filter(r => r.status === 'closed').length, color: COLORS.closed },
    { name: 'Transferred', value: risks.filter(r => r.status === 'transferred').length, color: COLORS.transferred }
  ].filter(item => item.value > 0);

  // UPDATED: Risk Type Distribution Data for Bar Chart (was sourceData)
  const typeData = Object.entries(metrics.risksByType)
    .map(([type, count]) => ({
      name: getRiskTypeDisplayName(type),
      count: count as number
    }))
    .sort((a, b) => b.count - a.count);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-sky-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-stratosphere">{payload[0].name}</p>
          <p className="text-sm text-sky-600">
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
          {payload[0].payload.percent && (
            <p className="text-xs text-sky-500">
              {payload[0].payload.percent.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie charts
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / entry.payload.total) * 100).toFixed(0);
    return `${entry.name} (${percent}%)`;
  };

  // Calculate total for percentage
  const scoreTotal = scoreData.reduce((sum, item) => sum + item.value, 0);
  const statusTotal = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Score Distribution */}
      <Card className="border-sky-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-stratosphere">Risk Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreData.map(item => ({ ...item, total: scoreTotal, percent: (item.value / scoreTotal) * 100 }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-stratosphere">
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sky-400">No risk score data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Status Distribution */}
      <Card className="border-sky-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-stratosphere">Risk Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.map(item => ({ ...item, total: statusTotal, percent: (item.value / statusTotal) * 100 }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-stratosphere">
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sky-400">No risk status data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPDATED: Risk Type Bar Chart - Full Width (was Risk Source) */}
      <Card className="border-sky-200 bg-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg text-stratosphere">Risks by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0E1" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#272236', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#272236' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#89A0AE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sky-400">No risk type data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskCharts;