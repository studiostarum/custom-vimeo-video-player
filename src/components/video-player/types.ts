export type VimeoQuality = '4K' | '2K' | '1080p' | '720p' | '540p' | '360p' | 'auto';

export interface VideoPlayerOptions {
  container?: HTMLElement;
  containerId?: string;
  videoIdOrUrl: string;
  thumbnailUrl?: string;
  hasLightbox?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  background?: boolean;
  muted?: boolean;
  loop?: boolean;
  quality?: VimeoQuality;
}
