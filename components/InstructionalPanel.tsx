// components/InstructionalPanel.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Info, 
  HelpCircle, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  BookOpen, 
  AlertCircle, 
  ChevronRight,
  Video,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from "@/lib/utils";
import VideoPlayer from './VideoPlayer';

export interface InstructionalLink {
  href: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export interface InstructionalText {
  content: string;
  type?: 'info' | 'tip' | 'warning' | 'note';
  icon?: React.ReactNode;
}

export interface InstructionalVideo {
  src: string;
  title?: string;
  description?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export interface InstructionalPanelProps {
  title?: string;
  subtitle?: string;
  links?: InstructionalLink[];
  texts?: InstructionalText[];
  videos?: InstructionalVideo[];
  className?: string;
  variant?: 'default' | 'compact' | 'sidebar';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  videosCollapsible?: boolean; // Whether videos can be collapsed
  videosDefaultCollapsed?: boolean; // Whether videos start collapsed
}

const InstructionalPanel: React.FC<InstructionalPanelProps> = ({
  title = "Help & Resources",
  subtitle,
  links = [],
  texts = [],
  videos = [],
  className,
  variant = 'default',
  collapsed = false,
  onToggleCollapse,
  videosCollapsible = true,
  videosDefaultCollapsed = true,
}) => {
  const [videosExpanded, setVideosExpanded] = useState(!videosDefaultCollapsed);

  // Determine icon for text type if not provided
  const getDefaultIcon = (type: string = 'info') => {
    switch (type) {
      case 'info':
        return <Info className="text-stratosphere" size={18} />;
      case 'tip':
        return <HelpCircle className="text-ochre" size={18} />;
      case 'warning':
        return <AlertCircle className="text-ochre" size={18} />;
      case 'note':
        return <BookOpen className="text-stratosphere" size={18} />;
      default:
        return <Info className="text-stratosphere" size={18} />;
    }
  };

  // Get default icon for link if not provided
  const getDefaultLinkIcon = (external: boolean) => {
    return external 
      ? <ExternalLink className="text-stratosphere/70" size={16} /> 
      : <LinkIcon className="text-stratosphere/70" size={16} />;
  };

  const isCompact = variant === 'compact';
  const isSidebar = variant === 'sidebar';

  // Don't render anything if there are no links, texts, or videos and the panel is collapsed
  if (collapsed && !onToggleCollapse) {
    return null;
  }

  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden", 
        isSidebar ? "border-l-4 border-stratosphere" : "border border-sky",
        isCompact ? "p-3" : "p-5",
        isSidebar ? "bg-sky-tint" : "bg-sky-tint",
        className
      )}
    >
      {/* Header with optional collapse functionality */}
      <div className="flex justify-between items-center mb-3">
        <div>
          {title && (
            <h3 className={cn(
              "font-medium flex items-center gap-2",
              isCompact ? "text-sm" : "text-base"
            )}>
              <HelpCircle className="text-stratosphere" size={isCompact ? 16 : 20} />
              {title}
            </h3>
          )}
          {subtitle && <p className="text-stratosphere/70 text-sm mt-1">{subtitle}</p>}
        </div>
        
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="text-stratosphere/50 hover:text-stratosphere"
            aria-label={collapsed ? "Expand help panel" : "Collapse help panel"}
          >
            <ChevronRight 
              className={`transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`} 
              size={20} 
            />
          </button>
        )}
      </div>

      {/* Only show content if not collapsed */}
      {!collapsed && (
        <>
          {/* Videos Section */}
          {videos.length > 0 && (
            <div className={cn(
              "space-y-4",
              (texts.length > 0 || links.length > 0) ? "mb-4" : ""
            )}>
              {/* Video Section Header - Collapsible */}
              <div 
                className={cn(
                  "flex items-center justify-between py-2 rounded-md transition-colors",
                  videosCollapsible && "cursor-pointer hover:bg-sky/5"
                )}
                onClick={videosCollapsible ? () => setVideosExpanded(!videosExpanded) : undefined}
              >
                <div className="flex items-center gap-2">
                  <Video className="text-stratosphere" size={18} />
                  <h4 className="text-sm font-medium text-stratosphere">
                    Video Tutorials {videos.length > 1 && `(${videos.length})`}
                  </h4>
                </div>
                {videosCollapsible && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideosExpanded(!videosExpanded);
                    }}
                    className="text-stratosphere/70 hover:text-stratosphere transition-colors"
                    aria-label={videosExpanded ? "Collapse videos" : "Expand videos"}
                  >
                    {videosExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                )}
              </div>

              {/* Video Content - Animated Collapse */}
              <div 
                className={cn(
                  "space-y-4 overflow-hidden transition-all duration-300 ease-in-out",
                  videosExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {videos.map((video, index) => (
                  <VideoPlayer
                    key={`video-${index}`}
                    src={video.src}
                    title={video.title}
                    description={video.description}
                    poster={video.poster}
                    autoPlay={video.autoPlay}
                    loop={video.loop}
                    variant={isCompact ? 'compact' : 'default'}
                    className="mb-3"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Instructional Texts Section */}
          {texts.length > 0 && (
            <div className={cn("space-y-3", links.length > 0 ? "mb-4" : "")}>
              {texts.map((text, index) => (
                <div 
                  key={`text-${index}`} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-md",
                    text.type === 'info' && "bg-sky/10",
                    text.type === 'tip' && "bg-ochre/10",
                    text.type === 'warning' && "bg-ochre/20",
                    text.type === 'note' && "bg-stratosphere/10",
                    text.type === undefined && "bg-sky/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {text.icon || getDefaultIcon(text.type)}
                  </div>
                  <p className="text-sm text-stratosphere">{text.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link, index) => (
                <Link 
                  key={`link-${index}`}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="block hover:bg-sky/10 rounded-md p-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-sky/20 p-2 rounded-md">
                      {link.icon || getDefaultLinkIcon(!!link.external)}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-stratosphere flex items-center">
                        {link.label}
                        {link.external && (
                          <ExternalLink className="ml-1 text-stratosphere/50" size={12} />
                        )}
                      </p>
                      {link.description && (
                        <p className="text-xs text-stratosphere/70 mt-0.5">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="text-stratosphere/50" size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstructionalPanel;