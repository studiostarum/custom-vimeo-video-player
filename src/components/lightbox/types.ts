export interface LightboxOptions {
  triggerSelector: string;
  videoIdOrUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  quality?: '4K' | '2K' | '1080p' | '720p' | '540p' | '360p' | 'auto';
  resumeOnVisibilityChange?: boolean;
} 