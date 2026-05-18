// hooks/useTour.ts
import { useState, useEffect, useCallback } from 'react';
import { TourProgress } from '../types';

export const useTour = (tourId: string) => {
  const [tourProgress, setTourProgress] = useState<TourProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `c4c_tour_${tourId}`;

  // Load tour progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTourProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load tour progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Check if user has seen the tour
  const hasSeenTour = useCallback((): boolean => {
    return tourProgress?.seen || false;
  }, [tourProgress]);

  // Mark tour as seen
  const markTourAsSeen = useCallback((stepIndex?: number) => {
    const progress: TourProgress = {
      seen: true,
      timestamp: new Date().toISOString(),
      lastStepViewed: stepIndex,
      completedSteps: tourProgress?.completedSteps || []
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      setTourProgress(progress);
    } catch (error) {
      console.warn('Failed to save tour progress:', error);
    }
  }, [storageKey, tourProgress]);

  // Mark specific step as completed
  const markStepCompleted = useCallback((stepId: string) => {
    const updatedSteps = [...(tourProgress?.completedSteps || [])];
    if (!updatedSteps.includes(stepId)) {
      updatedSteps.push(stepId);
    }

    const progress: TourProgress = {
      ...tourProgress,
      seen: tourProgress?.seen || false,
      timestamp: tourProgress?.timestamp || new Date().toISOString(),
      completedSteps: updatedSteps
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
      setTourProgress(progress);
    } catch (error) {
      console.warn('Failed to save step progress:', error);
    }
  }, [storageKey, tourProgress]);

  // Reset tour progress (useful for testing or re-showing tours)
  const resetTourProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setTourProgress(null);
    } catch (error) {
      console.warn('Failed to reset tour progress:', error);
    }
  }, [storageKey]);

  // Get progress percentage
  const getProgressPercentage = useCallback((totalSteps: number): number => {
    if (!tourProgress?.completedSteps) return 0;
    return Math.round((tourProgress.completedSteps.length / totalSteps) * 100);
  }, [tourProgress]);

  return {
    tourProgress,
    isLoading,
    hasSeenTour,
    markTourAsSeen,
    markStepCompleted,
    resetTourProgress,
    getProgressPercentage
  };
};