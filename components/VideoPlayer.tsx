// components/VideoPlayer.tsx
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  src: string;
  title?: string;
  description?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean; // Use native controls or custom
  variant?: 'default' | 'compact';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  description,
  poster,
  className,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  variant = 'default',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isCompact = variant === 'compact';

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className={cn("rounded-lg overflow-hidden", className)}>
      {/* Title and Description */}
      {(title || description) && (
        <div className={cn("mb-3", isCompact ? "px-2" : "px-1")}>
          {title && (
            <h4 className={cn(
              "font-medium text-stratosphere",
              isCompact ? "text-sm" : "text-base"
            )}>
              {title}
            </h4>
          )}
          {description && (
            <p className={cn(
              "text-stratosphere/70 mt-1",
              isCompact ? "text-xs" : "text-sm"
            )}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Video Container */}
      <div className="relative bg-concrete rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleVideoEnd}
          controls={controls && !isCompact} // Use native controls for default variant
          className="w-full h-auto cursor-pointer"
          onClick={togglePlay}
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls Overlay (only for compact variant) */}
        {controls && isCompact && (
          <div className="absolute inset-0 flex items-center justify-center bg-stratosphere/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={togglePlay}
                className="bg-stratosphere/80 hover:bg-stratosphere text-white p-3 rounded-full transition-colors"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Controls Bar (for compact variant) */}
        {controls && isCompact && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stratosphere/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-sky transition-colors"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-sky transition-colors"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-sky transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;