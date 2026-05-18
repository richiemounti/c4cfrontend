// lib/api/reports/monitoring.ts
import { apiClient } from '../client';
import { ApiResponse, QueueStats } from '@/types/reports';

// System health and metrics (for monitoring dashboards)
export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }>;
  recommendations: string[];
}

export interface SystemMetrics {
  uptime: number;
  performance: {
    cacheHitRate: number;
    averageQueryTime: number;
    queueHealthScore: number;
  };
  usage: {
    totalReports: number;
    reportsGeneratedToday: number;
    activeJobs: number;
    cacheSize: number;
  };
  health: {
    overall: string;
    components: string[];
  };
}

// Get system health status
export const getSystemHealth = async () => {
  // This would be a custom endpoint you'd need to add to your backend
  const response = await apiClient.get('/reports/system/health');
  return response.data as ApiResponse<SystemHealth>;
};

// Get system metrics for monitoring
export const getSystemMetrics = async () => {
  // This would be a custom endpoint you'd need to add to your backend  
  const response = await apiClient.get('/reports/system/metrics');
  return response.data as ApiResponse<SystemMetrics>;
};

// Run system diagnostics
export const runSystemDiagnostics = async () => {
  // This would be a custom endpoint you'd need to add to your backend
  const response = await apiClient.post('/reports/system/diagnostics');
  return response.data as ApiResponse<{
    systemInfo: any;
    performanceTest: any;
    configurationCheck: any;
    recommendations: string[];
  }>;
};
