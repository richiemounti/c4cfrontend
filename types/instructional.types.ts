// types/instructional.types.ts
// Type definitions for instructional content (videos, links, texts)

export interface InstructionalVideo {
  /**
   * Path to the video file (e.g., "/videos/instructional/project-setup/creating-project.mp4")
   */
  src: string;
  
  /**
   * Title displayed above or with the video
   */
  title?: string;
  
  /**
   * Description text shown below the title
   */
  description?: string;
  
  /**
   * Path to poster/thumbnail image (e.g., "/videos/instructional/project-setup/creating-project-poster.jpg")
   */
  poster?: string;
  
  /**
   * Whether video should start playing automatically (default: false)
   * Note: Most browsers restrict autoplay with sound
   */
  autoPlay?: boolean;
  
  /**
   * Whether video should loop (default: false)
   */
  loop?: boolean;
  
  /**
   * Whether video should be muted (default: false)
   */
  muted?: boolean;
}

export interface InstructionalLink {
  /**
   * URL or path for the link
   */
  href: string;
  
  /**
   * Display label for the link
   */
  label: string;
  
  /**
   * Optional description shown below the label
   */
  description?: string;
  
  /**
   * Optional custom icon component
   */
  icon?: React.ReactNode;
  
  /**
   * Whether link opens in new tab (default: false)
   */
  external?: boolean;
}

export interface InstructionalText {
  /**
   * Text content to display
   */
  content: string;
  
  /**
   * Type of text, determines styling and icon
   */
  type?: 'info' | 'tip' | 'warning' | 'note';
  
  /**
   * Optional custom icon component
   */
  icon?: React.ReactNode;
}

export interface InstructionalPanelProps {
  /**
   * Main title of the panel
   */
  title?: string;
  
  /**
   * Subtitle or description shown under the title
   */
  subtitle?: string;
  
  /**
   * Array of video tutorials
   */
  videos?: InstructionalVideo[];
  
  /**
   * Array of external or internal links
   */
  links?: InstructionalLink[];
  
  /**
   * Array of informational text blocks
   */
  texts?: InstructionalText[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Visual variant of the panel
   */
  variant?: 'default' | 'compact' | 'sidebar';
  
  /**
   * Whether the panel is collapsed
   */
  collapsed?: boolean;
  
  /**
   * Callback when collapse button is clicked
   */
  onToggleCollapse?: () => void;
}

export interface VideoPlayerProps {
  /**
   * Path to the video file
   */
  src: string;
  
  /**
   * Title displayed above the video
   */
  title?: string;
  
  /**
   * Description shown below the title
   */
  description?: string;
  
  /**
   * Path to poster/thumbnail image
   */
  poster?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether video should autoplay
   */
  autoPlay?: boolean;
  
  /**
   * Whether video should loop
   */
  loop?: boolean;
  
  /**
   * Whether video should be muted
   */
  muted?: boolean;
  
  /**
   * Whether to show video controls
   */
  controls?: boolean;
  
  /**
   * Visual variant of the player
   */
  variant?: 'default' | 'compact';
}

/**
 * Video categories matching the directory structure
 */
export type VideoCategory =
  | 'project-setup'
  | 'organization-setup'
  | 'survey-builder'
  | 'stakeholder-mapping'
  | 'theory-of-change'
  | 'risk-register'
  | 'reporting'
  | 'dashboard'
  | 'data-collection'
  | 'review-process'
  | 'gdpr-compliance'
  | 'general';

/**
 * Helper function to construct video paths
 */
export function getVideoPath(category: VideoCategory, filename: string): string {
  return `/videos/instructional/${category}/${filename}`;
}

/**
 * Helper function to construct poster image paths
 */
export function getPosterPath(category: VideoCategory, filename: string): string {
  // Remove extension if present and add -poster.jpg
  const baseFilename = filename.replace(/\.(mp4|webm|mov)$/i, '');
  return `/videos/instructional/${category}/${baseFilename}-poster.jpg`;
}

/**
 * Helper to create a complete video object with paths
 */
export function createVideoConfig(
  category: VideoCategory,
  filename: string,
  title: string,
  description?: string,
  options?: Partial<InstructionalVideo>
): InstructionalVideo {
  return {
    src: getVideoPath(category, filename),
    poster: getPosterPath(category, filename),
    title,
    description,
    autoPlay: false,
    loop: false,
    muted: false,
    ...options
  };
}