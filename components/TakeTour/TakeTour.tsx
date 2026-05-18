// components/TakeTour/TakeTour.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaSrc: string;
  duration?: number; // for videos, in seconds
}

export interface TakeTourProps {
  tourId: string;
  tourTitle: string;
  tourDescription?: string;
  steps: TourStep[];
  autoShowForNewUsers?: boolean;
  showTourButton?: boolean;
  buttonText?: string;
  onTourComplete?: () => void;
  onTourSkip?: () => void;
}

const TakeTour: React.FC<TakeTourProps> = ({
  tourId,
  tourTitle,
  tourDescription,
  steps,
  autoShowForNewUsers = true,
  showTourButton = true,
  buttonText = "Take Tour",
  onTourComplete,
  onTourSkip
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const storageKey = `c4c_tour_${tourId}`;

  // Check if user has seen this tour before
  useEffect(() => {
    if (autoShowForNewUsers) {
      const hasSeenTour = localStorage.getItem(storageKey);
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }
  }, [tourId, autoShowForNewUsers, storageKey]);

  // Mark tour as seen when completed or skipped
  const markTourAsSeen = () => {
    localStorage.setItem(storageKey, JSON.stringify({
      seen: true,
      timestamp: new Date().toISOString()
    }));
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
    setIsVideoPlaying(false);
    markTourAsSeen();
    onTourSkip?.();
  };

  const handleComplete = () => {
    setIsOpen(false);
    setCurrentStep(0);
    setIsVideoPlaying(false);
    markTourAsSeen();
    onTourComplete?.();
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsVideoPlaying(false);
    } else {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsVideoPlaying(false);
    }
  };

  const handleVideoToggle = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!isOpen) {
    return showTourButton ? (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-500/90 
                   text-white rounded-lg font-medium transition-colors duration-200
                   shadow-lg hover:shadow-xl"
      >
        <Info size={18} />
        {buttonText}
      </button>
    ) : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stratosphere-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl 
                      border border-concrete-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-stratosphere-500 to-stratosphere-900 
                        text-white p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full 
                       transition-colors duration-200"
          >
            <X size={20} />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold font-sora mb-2">{tourTitle}</h2>
            {tourDescription && (
              <p className="text-sky-100 text-sm">{tourDescription}</p>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-sky-100">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-sky-100">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-ochre-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Media Section */}
            <div className="relative">
              <div className="aspect-video bg-concrete-100 rounded-xl overflow-hidden 
                              border border-concrete-500/20">
                {currentStepData.mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={setVideoRef}
                      src={currentStepData.mediaSrc}
                      className="w-full h-full object-cover"
                      onEnded={() => setIsVideoPlaying(false)}
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                    />
                    
                    {/* Video controls overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handleVideoToggle}
                        className="bg-stratosphere-900/80 text-white p-4 rounded-full 
                                   hover:bg-stratosphere-900 transition-colors duration-200
                                   backdrop-blur-sm"
                      >
                        {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentStepData.mediaSrc}
                    alt={currentStepData.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Media type indicator */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-stratosphere-900/80 
                                text-white text-xs rounded-full backdrop-blur-sm">
                  {currentStepData.mediaType === 'video' ? (
                    <>
                      <Play size={12} />
                      Video
                    </>
                  ) : (
                    'Image'
                  )}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-sora text-stratosphere-500">
                  {currentStepData.title}
                </h3>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-stratosphere-900/80 leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {currentStepData.duration && currentStepData.mediaType === 'video' && (
                  <div className="flex items-center gap-2 text-sm text-sky-500">
                    <Play size={14} />
                    Duration: {Math.floor(currentStepData.duration / 60)}:
                    {(currentStepData.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-concrete-500/20 p-6 bg-concrete-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-stratosphere-500
                         hover:text-stratosphere-900 disabled:text-concrete-500
                         disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-primary-500 scale-110'
                      : index < currentStep
                      ? 'bg-grass-500'
                      : 'bg-concrete-500/30'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-stratosphere-500 hover:text-stratosphere-900
                           transition-colors duration-200"
              >
                Skip Tour
              </button>
              
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 
                           hover:bg-primary-500/90 text-white rounded-lg font-medium
                           transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTour;