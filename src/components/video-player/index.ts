import Player from '@vimeo/player';
import type { VideoPlayerOptions } from './types';

interface PlayerConstructorOptions {
  container: HTMLElement;
  videoId: string;
  thumbnailUrl?: string;
  shouldLoadImmediately?: boolean;
  hasLightbox?: boolean;
  options?: Record<string, any>;
}

export class VideoPlayer {
  private player!: Player;
  private container: HTMLElement;
  private thumbnailElement!: HTMLImageElement;
  private loadingElement!: HTMLDivElement;
  private isPlayerReady: boolean = false;
  private videoWidth: number = 0;
  private videoHeight: number = 0;
  private thumbnail?: HTMLImageElement;

  constructor(options: VideoPlayerOptions) {
    // Handle container initialization
    if (options.container) {
      this.container = options.container;
      this.container.style.position = 'relative'; // Ensure container has relative positioning
      this.container.style.overflow = 'hidden'; // Prevent content overflow
    } else if (options.containerId) {
      const container = document.getElementById(options.containerId);
      if (!container) {
        throw new Error(`Container with ID "${options.containerId}" not found`);
      }
      this.container = container;
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
    } else {
      throw new Error('No container provided for video player');
    }

    this.initialize(options);
  }

  // Initialize the player
  private initialize(options: VideoPlayerOptions): void {
    const { videoIdOrUrl, thumbnailUrl, hasLightbox } = options;
    const videoId = this.extractVideoId(videoIdOrUrl);
    
    this.container.classList.add('video-container');
    
    // Set container styles
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#000';
    
    if (hasLightbox) {
      this.container.setAttribute('data-lightbox', 'true');
    }

    // Create player container
    const playerContainer = document.createElement('div');
    playerContainer.className = 'vimeo-player-container';
    this.container.appendChild(playerContainer);

    // Set thumbnail if provided
    if (thumbnailUrl) {
      const thumbnail = document.createElement('img');
      thumbnail.className = 'vimeo-thumbnail';
      thumbnail.src = thumbnailUrl;
      thumbnail.loading = 'lazy';
      this.container.appendChild(thumbnail);
      
      this.thumbnail = thumbnail;
      this.thumbnailElement = thumbnail;
    }

    // Set loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'vimeo-loading';
    
    const spinner = document.createElement('div');
    spinner.className = 'vimeo-spinner';
    loadingIndicator.appendChild(spinner);
    
    this.container.appendChild(loadingIndicator);
    this.loadingElement = loadingIndicator;

    // Set player options with sensible defaults
    const playerOptions = {
      id: videoId,
      responsive: true,
      controls: hasLightbox ? true : (options.controls ?? false),
      background: hasLightbox ? false : (options.background ?? true),
      muted: hasLightbox ? false : (options.muted ?? true),
      loop: options.loop ?? true,
      quality: options.quality ?? '1080p',
      autopause: false,
      playsinline: true,
      title: hasLightbox,
      byline: hasLightbox,
      portrait: hasLightbox
    };

    try {
      // Initialize player
      this.player = new Player(playerContainer, playerOptions);

      // Set loading and error event handlers
      this.player.on('loaded', () => {
        this.onPlayerReady();
        // Force remove loading states immediately on any player type
        this.forceRemoveLoadingStates();
      });

      // Handle the 'ready' event from the Vimeo player
      this.player.on('ready', () => {
        // Also force-remove loading states on ready event
        this.forceRemoveLoadingStates();
      });

      this.player.on('play', () => {
        this.onPlayerPlay();
        // Immediately remove loading states on play
        this.forceRemoveLoadingStates();
      });

      this.player.on('error', this.onPlayerError);
      this.player.on('pause', this.onPlayerPause);

      // Handle lightbox click events
      if (hasLightbox) {
        this.container.addEventListener('click', (e) => {
          if (e.target === this.container) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }

      // Set a timeout to automatically remove the loading state
      // if the player takes too long to initialize or encounters silent errors
      const loadingTimeout = setTimeout(() => {
        if (this.loadingElement && this.loadingElement.parentNode) {
          console.warn('Video player initialization timeout - forcing loading state removal');
          this.forceRemoveLoadingStates();
        }
      }, 10000); // 10 seconds timeout

      // Start playing if not in lightbox mode
      this.player.ready().then(() => {
        clearTimeout(loadingTimeout);
        // Remove loading states immediately on player ready
        this.forceRemoveLoadingStates();
        
        if (hasLightbox) {
          // No need to play for lightbox mode
        } else {
          this.play().catch(err => {
            console.error('Error playing video:', err);
            // Force remove loading state on play error
            this.forceRemoveLoadingStates();
          });
        }
      }).catch(err => {
        clearTimeout(loadingTimeout);
        console.error('Player ready error:', err);
        this.onPlayerError();
      });
    } catch (error) {
      console.error('Error initializing Vimeo player:', error);
      this.onPlayerError();
    }
  }

  // Extract video ID from URL or ID string
  private extractVideoId(videoIdOrUrl: string): number {
    // Handle direct numeric ID case
    if (/^\d+$/.test(videoIdOrUrl)) {
      return parseInt(videoIdOrUrl, 10);
    }

    // Handle URL cases
    const urlMatch = videoIdOrUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (urlMatch && urlMatch[1]) {
      return parseInt(urlMatch[1], 10);
    }

    throw new Error(`Invalid Vimeo video ID or URL: ${videoIdOrUrl}`);
  }

  // Player ready handler
  private onPlayerReady = (): void => {
    this.isPlayerReady = true;
    
    // Immediately remove loading states
    this.forceRemoveLoadingStates();
    
    // Mark as ready
    this.container.classList.add('preview-ready');
    
    // Get video dimensions to set proper aspect ratio
    this.player.getVideoWidth().then(width => {
      this.videoWidth = width;
      
      this.player.getVideoHeight().then(height => {
        this.videoHeight = height;
        
        // For non-lightbox mode, start playing
        if (!this.container.hasAttribute('data-lightbox')) {
          this.play().catch(console.error);
        }
      });
    });
  };

  // Player error handler
  private onPlayerError = (): void => {
    if (this.loadingElement) {
      this.loadingElement.classList.add('error-state');
      this.loadingElement.classList.remove('fade-out');
      this.loadingElement.style.display = 'flex';
      
      // Add a timeout to forcefully remove the loading spinner after a few seconds
      // even if the error persists
      setTimeout(() => {
        this.forceRemoveLoadingStates();
      }, 3000);
    }
    
    // Mark the container as having an error
    this.container.classList.add('video-error');
    
    // Dispatch an error event
    const errorEvent = new CustomEvent('player-error');
    this.container.dispatchEvent(errorEvent);
  };

  // Player play handler
  private onPlayerPlay = (): void => {
    // Always fade out loading states when video plays
    this.fadeOutLoadingStates();
  };

  // Player pause handler
  private onPlayerPause = (): void => {
    // Do nothing for now, but we might need this later
  };

  // Method to force remove loading states
  public forceRemoveLoadingStates(): void {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.remove();
    }
    if (this.thumbnailElement && this.thumbnailElement.parentNode) {
      this.thumbnailElement.remove();
    }
    
    // Also mark the player as ready to ensure UI elements update properly
    if (!this.container.classList.contains('preview-ready')) {
      this.container.classList.add('preview-ready');
    }
  }

  // Helper method to fade out loading states
  private fadeOutLoadingStates(): void {
    // Use forceRemoveLoadingStates for immediate removal in all cases
    this.forceRemoveLoadingStates();
  }

  // Public methods
  public play(): Promise<void> {
    return this.player.play().then(() => {
      // Ensure loading states are removed after successful play
      this.fadeOutLoadingStates();
    });
  }

  public pause(): Promise<void> {
    return this.player.pause();
  }

  public getPlaying(): Promise<boolean> {
    return this.player.getPaused().then(isPaused => !isPaused);
  }

  public stop(): Promise<void> {
    return this.player.unload();
  }

  public destroy(): Promise<void> {
    // Clean up event listeners and DOM elements
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.remove();
    }
    if (this.thumbnailElement && this.thumbnailElement.parentNode) {
      this.thumbnailElement.remove();
    }
    // Destroy the Vimeo player instance
    return this.player.destroy();
  }
} 