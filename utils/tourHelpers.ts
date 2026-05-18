// utils/tourHelpers.ts
import { TourStep } from '../types';

export const createTourStep = (
  id: string,
  title: string,
  description: string,
  mediaType: 'image' | 'video',
  mediaSrc: string,
  duration?: number
): TourStep => ({   
  id,
  title,
  description,
  mediaType,
  mediaSrc,
  duration
});

// Helper to validate media file paths
export const validateMediaPath = (path: string, type: 'image' | 'video'): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  
  const extensions = type === 'image' ? imageExtensions : videoExtensions;
  return extensions.some(ext => path.toLowerCase().endsWith(ext));
};

// Helper to format video duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Predefined tour configurations for common pages
export const TOUR_CONFIGS = {
  DASHBOARD: {
    tourId: 'dashboard_overview',
    tourTitle: 'Dashboard Overview',
    tourDescription: 'Learn how to navigate and use your C4C dashboard effectively'
  },
  PROJECT_SETUP: {
    tourId: 'project_setup',
    tourTitle: 'Project Setup Guide',
    tourDescription: 'Step-by-step guide to setting up your first project'
  },
  SURVEY_BUILDER: {
    tourId: 'survey_builder',
    tourTitle: 'Building Surveys',
    tourDescription: 'Learn how to create and customize surveys for your projects'
  },
  THEORY_OF_CHANGE: {
    tourId: 'theory_of_change',
    tourTitle: 'Theory of Change',
    tourDescription: 'Understanding and creating your theory of change framework'
  },
  ANALYTICS: {
    tourId: 'analytics_dashboard',
    tourTitle: 'Analytics & Insights',
    tourDescription: 'Discover how to interpret your project data and insights'
  }
} as const;