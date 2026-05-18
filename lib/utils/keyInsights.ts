// lib/utils/keyInsights.ts
import { Task, TaskResponse, KeyInsight, StakeholderGroup } from '@/types';

/**
 * Check if a task has any key insights
 */
export const hasKeyInsights = (task: Task): boolean => {
  return task.responses.some(response => response.isKeyInsight === true);
};

/**
 * Get count of key insights in a task
 */
export const getKeyInsightCount = (task: Task): number => {
  return task.responses.filter(response => response.isKeyInsight === true).length;
};

/**
 * Get all key insight responses from a task
 */
export const getKeyInsightResponses = (task: Task): TaskResponse[] => {
  return task.responses.filter(response => response.isKeyInsight === true);
};

/**
 * Toggle the isKeyInsight flag for a specific response
 */
export const toggleResponseKeyInsight = (
  responses: TaskResponse[],
  optionId: string
): TaskResponse[] => {
  return responses.map(response => {
    if (response.optionId === optionId) {
      return {
        ...response,
        isKeyInsight: !response.isKeyInsight
      };
    }
    return response;
  });
};

/**
 * Get total count of key insights across all tasks in a stakeholder group
 */
export const getTotalKeyInsights = (stakeholderGroup: StakeholderGroup): number => {
  return stakeholderGroup.tasks.reduce((total, task) => {
    return total + getKeyInsightCount(task);
  }, 0);
};

/**
 * Get all key insights from a stakeholder group organized by task type
 */
export const getKeyInsightsByTask = (stakeholderGroup: StakeholderGroup): Record<string, TaskResponse[]> => {
  const keyInsightsByTask: Record<string, TaskResponse[]> = {};
  
  stakeholderGroup.tasks.forEach(task => {
    const keyInsights = getKeyInsightResponses(task);
    if (keyInsights.length > 0) {
      keyInsightsByTask[task.taskType] = keyInsights;
    }
  });
  
  return keyInsightsByTask;
};

/**
 * Filter stakeholder groups that have key insights
 */
export const filterGroupsWithKeyInsights = (groups: StakeholderGroup[]): StakeholderGroup[] => {
  return groups.filter(group => getTotalKeyInsights(group) > 0);
};

/**
 * Sort key insights by update date (most recent first)
 */
export const sortKeyInsightsByDate = (insights: KeyInsight[]): KeyInsight[] => {
  return [...insights].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

/**
 * Group key insights by category
 */
export const groupKeyInsightsByCategory = (insights: KeyInsight[]): Record<string, KeyInsight[]> => {
  return insights.reduce((acc, insight) => {
    const category = insight.stakeholderGroup.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(insight);
    return acc;
  }, {} as Record<string, KeyInsight[]>);
};

/**
 * Group key insights by task type
 */
export const groupKeyInsightsByTaskType = (insights: KeyInsight[]): Record<string, KeyInsight[]> => {
  return insights.reduce((acc, insight) => {
    const taskType = insight.taskType;
    if (!acc[taskType]) {
      acc[taskType] = [];
    }
    acc[taskType].push(insight);
    return acc;
  }, {} as Record<string, KeyInsight[]>);
};

/**
 * Search key insights by keyword
 */
export const searchKeyInsights = (insights: KeyInsight[], keyword: string): KeyInsight[] => {
  const lowerKeyword = keyword.toLowerCase();
  
  return insights.filter(insight => {
    // Search in stakeholder group name
    if (insight.stakeholderGroup.name.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // Search in category
    if (insight.stakeholderGroup.category.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // Search in tags
    if (insight.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))) {
      return true;
    }
    
    // Search in insight descriptions
    if (insight.insights.some(i => i.description.toLowerCase().includes(lowerKeyword))) {
      return true;
    }
    
    return false;
  });
};