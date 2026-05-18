// lib/api/bugReport.ts - Updated for New Field Structure

import { apiClient } from './client';

export interface BugReportSubmission {
  // Basic fields
  feedbackType: 'bug_report' | 'user_experience' | 'thematic_feedback' | 'feature_suggestion' | 'general_feedback';
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  
  // NEW FIELDS
  assignedToTeamMember?: 'kate' | 'sam' | 'belinda';
  sourceOfFeedback?: {
    source: string;
    contactPerson?: string;
  };
  
  // Bug-specific fields
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  
  // User Experience fields
  userExperienceRating?: {
    overallSatisfaction: number;
    easeOfUse?: number;
    speed?: number;
    visualAppeal?: number;
    functionalityClarity?: number;
  };
  
  // Performance fields
  performanceIssues?: {
    pageLoadTime?: string;
    timeToInteractive?: string;
    specificSlowAreas?: string[];
    browserFreeze?: boolean;
    memoryIssues?: boolean;
  };
  
  // Thematic feedback
  thematicFeedback?: {
    lookAndFeelRating?: number;
    colorSchemeAppropriate?: boolean | null;
    fontReadability?: number;
    layoutIntuitive?: number;
    brandConsistency?: number;
    specificThematicComments?: string;
  };
  
  // Feature suggestion
  featureSuggestion?: {
    description: string;
    businessValue: 'low' | 'medium' | 'high';
    userImpact: 'low' | 'medium' | 'high';
    suggestedPriority: 'low' | 'medium' | 'high';
    discussedInternally?: boolean;
  };
  
  // UPDATED ASSESSMENT FIELDS
  urgencyLevel: 'fix_24_hours' | 'fix_1_3_days' | 'fix_this_week' | 'fix_2_weeks' | 'fix_next_month' | 'later';
  bugType?: 'fix' | 'food_for_thought' | 'pipeline' | '';
  
  // Business impact
  businessImpact: {
    affectedUsers: 'few' | 'some' | 'many' | 'most' | 'all';
    functionalityBlocked: boolean;
    workaroundAvailable: boolean;
    revenueImpact: boolean;
    complianceImpact: boolean;
  };
  
  // Additional fields
  tags: string[];
  requiresFollowUp: boolean;
  systemInfo: any;
  
  // File attachments
  attachments?: File[];
}

export interface BugReportResponse {
  success: boolean;
  message: string;
  data: {
    reportId: string;
    feedbackType: string;
    priority: string;
    overallScore?: number;
  };
}

/**
 * Submit a bug report or feedback with enhanced field support
 */
export const submitBugReport = async (data: BugReportSubmission | FormData): Promise<BugReportResponse> => {
  try {
    let submissionData: FormData;
    
    // Handle both FormData (new) and object (legacy) submissions
    if (data instanceof FormData) {
      submissionData = data;
    } else {
      // Convert object to FormData
      submissionData = new FormData();
      
      // Add all non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments') {
          // Handle files separately
          return;
        }
        
        if (typeof value === 'object' && value !== null) {
          submissionData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== '') {
          submissionData.append(key, String(value));
        }
      });
      
      // Handle attachments array
      if (data.attachments) {
        data.attachments.forEach(file => {
          submissionData.append('attachments', file);
        });
      }
    }
    
    const response = await apiClient.post('/bug-reports', submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to submit report. Please try again.');
  }
};

/**
 * Get all bug reports with enhanced filtering (admin only)
 */
export const getBugReports = async (params?: {
  search?: string;
  feedbackType?: string;
  status?: string;
  priority?: string;
  category?: string;
  urgencyLevel?: string;
  bugType?: string;
  affectedUsers?: string;
  assignedTo?: string;
  assignedToTeamMember?: string; // NEW
  sourceText?: string; // NEW
  verificationStatus?: string; // NEW
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await apiClient.get('/bug-reports', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch bug reports');
  }
};

/**
 * Get single bug report by ID (admin only)
 */
export const getBugReport = async (id: string) => {
  try {
    const response = await apiClient.get(`/bug-reports/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch bug report');
  }
};

/**
 * Update bug report with new fields (admin only)
 */
export const updateBugReport = async (id: string, updates: {
  status?: string;
  priority?: string;
  urgencyLevel?: string;
  bugType?: string;
  assignedTo?: string;
  assignedToTeamMember?: string;
  sourceOfFeedback?: {
    source: string;
    contactPerson?: string;
  };
  resolved?: boolean;
  resolution?: string;
  // NEW: Verification fields
  verified?: boolean;
  verificationDetails?: string;
  businessImpact?: any;
  tags?: string[];
  requiresFollowUp?: boolean;
  followUpDate?: string;
  relatedIssues?: string[];
  verifiedByReporter?: boolean;
}) => {
  try {
    const response = await apiClient.patch(`/bug-reports/${id}`, updates);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to update bug report');
  }
};

/**
 * Get bug report analytics (admin only)
 */
export const getBugReportAnalytics = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  try {
    const response = await apiClient.get('/bug-reports/analytics', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch analytics');
  }
};

/**
 * Test email functionality (admin only)
 */
export const testEmail = async (email: string) => {
  try {
    const response = await apiClient.post('/email/test', { email });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to send test email');
  }
};

/**
 * NEW: Verify a resolved bug report (admin only)
 */
export const verifyBugReport = async (id: string, verificationDetails: string) => {
  try {
    const response = await apiClient.patch(`/bug-reports/${id}/verify`, {
      verificationDetails
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to verify bug report');
  }
};