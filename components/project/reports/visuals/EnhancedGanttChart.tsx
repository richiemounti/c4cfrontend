// components/reports/visuals/EnhancedGanttChart.tsx
'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar, Clock, Users, AlertTriangle, CheckCircle, 
  PlayCircle, PauseCircle, StopCircle, Zap, Timer,
  TrendingUp, Activity, Target, ArrowRight
} from 'lucide-react';

interface GanttChartProps {
  ganttTimeline: any[];
  timelineAnalysis: any;
  workloadDistribution?: any[];
  showMetrics?: boolean;
}

const EnhancedGanttChart: React.FC<GanttChartProps> = ({
  ganttTimeline,
  timelineAnalysis,
  workloadDistribution,
  showMetrics = true
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'workload' | 'metrics'>('timeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Filter timeline based on selections
  const filteredTimeline = useMemo(() => {
    return ganttTimeline.filter(item => {
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || item.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  }, [ganttTimeline, filterStatus, filterPriority]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-400';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress': return <PlayCircle size={16} className="text-blue-600" />;
      case 'not_started': return <StopCircle size={16} className="text-gray-600" />;
      case 'on_hold': return <PauseCircle size={16} className="text-yellow-600" />;
      default: return <StopCircle size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate timeline boundaries
  const timelineBounds = useMemo(() => {
    if (filteredTimeline.length === 0) return null;

    const dates = filteredTimeline
      .filter(item => item.startDate && item.endDate)
      .flatMap(item => [new Date(item.startDate), new Date(item.endDate)]); // ✅ Convert to Date objects

    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000)) || 1;

    return { minDate, maxDate, totalDays };
  }, [filteredTimeline]);

  // Render key metrics
  const renderMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Activities */}
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
        <div className="flex items-center justify-between mb-2">
          <Activity className="text-sky" size={20} />
          <span className="text-xs text-sky font-medium">TOTAL</span>
        </div>
        <div className="text-2xl font-bold text-stratosphere">{ganttTimeline.length}</div>
        <div className="text-xs text-sky">Activities</div>
      </div>

      {/* Completion Rate */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-xs text-green-700 font-medium">COMPLETE</span>
        </div>
        <div className="text-2xl font-bold text-green-800">
          {Math.round((timelineAnalysis.statusBreakdown?.completed || 0) / ganttTimeline.length * 100) || 0}%
        </div>
        <div className="text-xs text-green-700">
          {timelineAnalysis.statusBreakdown?.completed || 0} of {ganttTimeline.length}
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <PlayCircle className="text-blue-600" size={20} />
          <span className="text-xs text-blue-700 font-medium">ACTIVE</span>
        </div>
        <div className="text-2xl font-bold text-blue-800">
          {timelineAnalysis.statusBreakdown?.in_progress || 0}
        </div>
        <div className="text-xs text-blue-700">In Progress</div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-gradient-to-br from-ochre-50 to-ochre-100 rounded-lg p-4 border border-ochre-200">
        <div className="flex items-center justify-between mb-2">
          <Timer className="text-ochre" size={20} />
          <span className="text-xs text-ochre-700 font-medium">URGENT</span>
        </div>
        <div className="text-2xl font-bold text-ochre-800">
          {timelineAnalysis.upcomingDeadlines?.length || 0}
        </div>
        <div className="text-xs text-ochre-700">Next 30 days</div>
      </div>
    </div>
  );

  // Render timeline view
  const renderTimelineView = () => {
    if (!timelineBounds) {
      return (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-sky mb-4" />
          <p className="text-sky">No timeline data available</p>
        </div>
      );
    }

    const { minDate, maxDate, totalDays } = timelineBounds;

    return (
      <div className="space-y-6">
        {/* Timeline Header */}
        <div className="bg-sky-tint rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-sky mb-1">Project Start</div>
              <div className="text-lg font-bold text-stratosphere">
                {minDate.toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-sky mb-1">Duration</div>
              <div className="text-lg font-bold text-stratosphere">{totalDays} days</div>
            </div>
            <div>
              <div className="text-sm text-sky mb-1">Project End</div>
              <div className="text-lg font-bold text-stratosphere">
                {maxDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-stratosphere mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stratosphere mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="w-full overflow-x-auto bg-white rounded-lg border border-sky shadow-sm">
          <div className="min-w-[800px] p-6">
            {/* Chart Header */}
            <div className="flex mb-4 pb-2 border-b-2 border-sky">
              <div className="w-64 flex-shrink-0 font-semibold text-sm text-stratosphere pr-4">
                Activity
              </div>
              <div className="flex-1 min-w-[400px]">
                <div className="flex justify-between text-xs text-sky px-2">
                  <span>{minDate.toLocaleDateString()}</span>
                  <span className="text-center">{totalDays} days</span>
                  <span>{maxDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="w-32 text-center font-semibold text-sm text-stratosphere flex-shrink-0">
                Progress
              </div>
            </div>

            {/* Chart Rows */}
            {filteredTimeline.slice(0, 20).map((item) => {
              const start = new Date(item.startDate);
              const end = new Date(item.endDate);
              const leftOffset = ((start.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
              const width = Math.max(((end.getTime() - start.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100, 2);

              return (
                <div key={item.id} className="flex items-center py-3 border-b border-sky-tint/30 hover:bg-sky-tint/10 transition-colors">
                  {/* Activity Info */}
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-stratosphere truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-xs text-sky ml-6 truncate">{item.stakeholder.name}</div>
                    <div className="flex items-center space-x-2 ml-6 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-sky">{item.duration} days</span>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 min-w-[400px] relative h-12 px-2">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {[0, 25, 50, 75, 100].map(pos => (
                        <div 
                          key={pos}
                          className="absolute h-full border-l border-sky-tint/30"
                          style={{ left: `${pos}%` }}
                        />
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div 
                      className={`absolute h-8 rounded shadow-md hover:shadow-lg transition-all group cursor-pointer ${getStatusColor(item.status)}`}
                      style={{ 
                        left: `${leftOffset}%`, 
                        width: `${width}%`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {/* Progress Fill */}
                      <div 
                        className="h-full bg-white/30 rounded"
                        style={{ width: `${item.progress}%` }}
                      />

                      {/* Hover Tooltip */}
                      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-stratosphere text-white text-xs rounded py-2 px-3 whitespace-nowrap z-20 shadow-lg">
                        <div className="font-semibold mb-1">{item.name}</div>
                        <div className="text-sky-tint">{item.stakeholder.name}</div>
                        <div className="mt-1 pt-1 border-t border-white/20">
                          <div>{start.toLocaleDateString()} → {end.toLocaleDateString()}</div>
                          <div>Duration: {item.duration} days</div>
                          <div>Progress: {item.progress}%</div>
                          <div className="capitalize">Status: {item.status.replace('_', ' ')}</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-stratosphere"></div>
                        </div>
                      </div>

                      {/* Status Label */}
                      {width > 15 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-2 truncate capitalize">
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-32 text-center flex-shrink-0">
                    <div className="text-sm font-semibold text-stratosphere mb-1">
                      {item.progress}%
                    </div>
                    <div className="w-full bg-sky-tint rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getStatusColor(item.status)}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTimeline.length > 20 && (
              <div className="text-center py-4 bg-sky-tint/20 rounded-b text-sm text-sky">
                Showing 20 of {filteredTimeline.length} activities
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render workload view
  const renderWorkloadView = () => {
    if (!workloadDistribution || workloadDistribution.length === 0) {
      return (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-sky mb-4" />
          <p className="text-sky">No workload data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {workloadDistribution.slice(0, 10).map((workload, index) => (
          <div key={index} className="bg-white rounded-lg border border-sky p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Users className="text-sky" size={20} />
                <div>
                  <h4 className="font-semibold text-stratosphere">{workload.stakeholder.name}</h4>
                  <p className="text-xs text-sky">{workload.activityCount} activities</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-stratosphere">{workload.workloadScore}</div>
                <div className="text-xs text-sky">Workload Score</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-sm font-semibold text-stratosphere">{workload.totalDuration}</div>
                <div className="text-xs text-sky">Days</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{workload.completionRate}%</div>
                <div className="text-xs text-sky">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">{workload.averageProgress}%</div>
                <div className="text-xs text-sky">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-ochre">{workload.upcomingDeadlines}</div>
                <div className="text-xs text-sky">Due Soon</div>
              </div>
            </div>

            <div className="w-full bg-sky-tint rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-sky to-grass h-3 rounded-full transition-all"
                style={{ width: `${workload.completionRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="flex items-center space-x-2 border-b border-sky-tint">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'timeline'
              ? 'text-sky border-b-2 border-sky'
              : 'text-concrete hover:text-sky'
          }`}
        >
          Timeline View
        </button>
        <button
          onClick={() => setViewMode('workload')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'workload'
              ? 'text-sky border-b-2 border-sky'
              : 'text-concrete hover:text-sky'
          }`}
        >
          Workload View
        </button>
        <button
          onClick={() => setViewMode('metrics')}
          className={`px-4 py-2 font-medium transition-colors ${
            viewMode === 'metrics'
              ? 'text-sky border-b-2 border-sky'
              : 'text-concrete hover:text-sky'
          }`}
        >
          Metrics View
        </button>
      </div>

      {/* Metrics (always show if enabled) */}
      {showMetrics && renderMetrics()}

      {/* Content based on view mode */}
      {viewMode === 'timeline' && renderTimelineView()}
      {viewMode === 'workload' && renderWorkloadView()}
      {viewMode === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical Path */}
          <div className="bg-white rounded-lg border border-sky p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="text-ochre" size={20} />
              <h4 className="font-semibold text-stratosphere">Critical Path</h4>
            </div>
            <div className="space-y-2">
              {timelineAnalysis.criticalPath?.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-sky-tint rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stratosphere truncate">{item.name}</div>
                    <div className="text-xs text-sky">{item.stakeholder.name}</div>
                  </div>
                  <ArrowRight className="text-ochre" size={16} />
                </div>
              )) || <p className="text-sm text-sky">No critical path identified</p>}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg border border-sky p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Timer className="text-red-500" size={20} />
              <h4 className="font-semibold text-stratosphere">Upcoming Deadlines</h4>
            </div>
            <div className="space-y-2">
              {timelineAnalysis.upcomingDeadlines?.slice(0, 5).map((deadline: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stratosphere truncate">{deadline.item.name}</div>
                    <div className="text-xs text-sky">{deadline.item.stakeholder.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{deadline.daysUntilDue}</div>
                    <div className="text-xs text-red-500">days</div>
                  </div>
                </div>
              )) || <p className="text-sm text-sky">No upcoming deadlines</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGanttChart;