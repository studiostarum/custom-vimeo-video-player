export type VimeoQuality = '4K' | '2K' | '1080p' | '720p' | '540p' | '360p' | 'auto';

export interface VideoPlayerOptions {
  containerId?: string;
  container?: HTMLElement;
  videoIdOrUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  background?: boolean;
  quality?: VimeoQuality;
}
