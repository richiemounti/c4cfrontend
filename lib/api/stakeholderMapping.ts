// lib/api/stakeholderMapping.ts
import { apiClient } from './client';
import { 
  StakeholderGroup, 
  TaskOption, 
  CompletionStats, 
  CreateStakeholderGroupDto, 
  UpdateTaskDto,
  TaskPrompt,
  KeyInsightsResponse, // NEW: Import key insights response type
  TaskResponse
} from '@/types';

const stakeholderMappingApi = {
  // Get stakeholder groups for a project or site
  getStakeholderGroups: async (projectId: string, siteId?: string) => {
    const url = siteId 
      ? `/stakeholderMapping/project/${projectId}/site/${siteId}`
      : `/stakeholderMapping/project/${projectId}`;
    return apiClient.get(url);
  },

  // Get stakeholder groups by category
  getStakeholderGroupsByCategory: async (projectId: string, categoryId: string, siteId?: string) => {
    const url = siteId
      ? `/stakeholderMapping/project/${projectId}/site/${siteId}/category/${categoryId}`
      : `/stakeholderMapping/project/${projectId}/category/${categoryId}`;
    return apiClient.get(url);
  },

  // Get a single stakeholder group by ID
  getStakeholderGroup: async (id: string) => {
    return apiClient.get(`/stakeholderMapping/${id}`);
  },

  // Get options for a specific task and category
  getTaskOptions: async (categoryId: string, taskType: string) => {
    return apiClient.get(`/stakeholderMapping/taskOptions/${categoryId}/${taskType}`);
  },

  // Create a new stakeholder group
  createStakeholderGroup: async (data: CreateStakeholderGroupDto) => {
    return apiClient.post('/stakeholderMapping', data);
  },

  // Update a stakeholder group
  updateStakeholderGroup: async (id: string, data: any) => {
    return apiClient.put(`/stakeholderMapping/${id}`, data);
  },

  // Delete a stakeholder group
  deleteStakeholderGroup: async (id: string) => {
    return apiClient.delete(`/stakeholderMapping/${id}`);
  },

  // Update a task for a stakeholder group
  updateTask: async (id: string, taskType: string, data: UpdateTaskDto) => {
    return apiClient.post(`/stakeholderMapping/${id}/tasks/${taskType}`, data);
  },

  // Get completion statistics
  getCompletionStats: async (projectId: string, siteId?: string) => {
    const url = siteId
      ? `/stakeholderMapping/stats/project/${projectId}/site/${siteId}`
      : `/stakeholderMapping/stats/project/${projectId}`;
    return apiClient.get(url);
  },

  // NEW: Get all key insights for a project or site
  getKeyInsights: async (projectId: string, siteId?: string): Promise<KeyInsightsResponse> => {
    const url = siteId
      ? `/stakeholderMapping/project/${projectId}/site/${siteId}/key-insights`
      : `/stakeholderMapping/project/${projectId}/key-insights`;
    return apiClient.get(url);
  },

  // NEW: Get key insights for a specific stakeholder group
  getStakeholderGroupKeyInsights: async (stakeholderGroupId: string) => {
    const response = await apiClient.get(`/stakeholderMapping/${stakeholderGroupId}`);
    
    // Extract only key insights from the stakeholder group
    if (response && response.data) {
      const keyInsights = response.data.tasks
        .map((task: any) => ({
          taskType: task.taskType,
          rating: task.rating,
          tags: task.tags,
          insights: task.responses.filter((r: any) => r.isKeyInsight === true),
          updatedAt: task.updatedAt
        }))
        .filter((task: any) => task.insights.length > 0);
      
      return {
        success: true,
        stakeholderGroup: {
          id: response.data._id,
          name: response.data.name,
          category: response.data.category
        },
        keyInsights
      };
    }
    
    return { success: false, keyInsights: [] };
  },

  // NEW: Toggle key insight flag for a specific response
  toggleKeyInsight: async (
    stakeholderGroupId: string, 
    taskType: string, 
    responses: TaskResponse[],
    rating: number,
    tags?: string[]
  ) => {
    return apiClient.post(`/stakeholderMapping/${stakeholderGroupId}/tasks/${taskType}`, {
      responses,
      rating,
      tags
    });
  }
};

export default stakeholderMappingApi;