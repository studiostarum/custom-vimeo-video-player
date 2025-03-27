import { VideoPlayer } from '../video-player';
import type { LightboxOptions } from './types';

export class Lightbox {
  private options: LightboxOptions;
  private lightboxElement: HTMLDivElement | null = null;
  private contentElement: HTMLDivElement | null = null;
  private playerElement: HTMLDivElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private videoPlayer: VideoPlayer | null = null;
  private triggerElements: NodeListOf<Element> | null = null;
  private wasPlaying = false;

  constructor(options: LightboxOptions) {
    // Ensure options is an object, even if undefined is passed
    const safeOptions = options || {} as LightboxOptions;
    
    // Validate required properties
    if (!safeOptions.triggerSelector) {
      console.error('Lightbox requires a triggerSelector option');
      safeOptions.triggerSelector = '.lightbox-trigger'; // Fallback default
    }
    
    if (!safeOptions.videoIdOrUrl) {
      console.error('Lightbox requires a videoIdOrUrl option');
      safeOptions.videoIdOrUrl = ''; // Empty fallback
    }
    
    this.options = {
      ...safeOptions,
      autoplay: safeOptions.autoplay !== undefined ? safeOptions.autoplay : true,
      muted: safeOptions.muted !== undefined ? safeOptions.muted : false,
      controls: safeOptions.controls !== undefined ? safeOptions.controls : true,
      loop: safeOptions.loop !== undefined ? safeOptions.loop : false,
      resumeOnVisibilityChange: safeOptions.resumeOnVisibilityChange !== undefined ? safeOptions.resumeOnVisibilityChange : false,
    };

    this.createLightbox();
    this.setupTriggers();

    // Set up visibility change handler
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange(): void {
    if (!this.isOpen() || !this.videoPlayer) {
      return;
    }

    if (document.hidden) {
      // Store playing state before pausing
      this.videoPlayer.getPlaying().then(playing => {
        this.wasPlaying = playing;
        
        // Always pause video when tab loses focus
        this.videoPlayer?.pause().catch(err => {
          // Ignore "PlayInterrupted" errors
          if (!err.toString().includes('PlayInterrupted')) {
            console.error('Error pausing lightbox video:', err);
          }
        });
      }).catch(err => {
        console.warn('Could not determine video state:', err);
        // Fallback - always pause
        this.videoPlayer?.pause().catch(console.error);
      });
    } else {
      // Do not auto-resume when tab regains focus
      // Only resume if explicitly set to resume
      if (this.options.resumeOnVisibilityChange && this.wasPlaying) {
        setTimeout(() => {
          this.videoPlayer?.play().catch(err => {
            console.warn('Could not resume lightbox video:', err);
          });
        }, 300);
      }
    }
  }

  private createLightbox(): void {
    // Create the main lightbox container
    this.lightboxElement = document.createElement('div');
    this.lightboxElement.className = 'lightbox';

    // Create the content container
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'lightbox-content';
    this.lightboxElement.appendChild(this.contentElement);

    // Create the close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'lightbox-close';
    this.closeButton.setAttribute('aria-label', 'Close lightbox');
    this.contentElement.appendChild(this.closeButton);

    // Create the player container
    this.playerElement = document.createElement('div');
    this.playerElement.className = 'lightbox-player';
    this.contentElement.appendChild(this.playerElement);

    // Add event listeners
    this.closeButton.addEventListener('click', this.close.bind(this));
    this.lightboxElement.addEventListener('click', (e) => {
      if (e.target === this.lightboxElement) {
        this.close();
      }
    });

    // Listen for escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Append to body
    document.body.appendChild(this.lightboxElement);
  }

  private setupTriggers(): void {
    this.triggerElements = document.querySelectorAll(this.options.triggerSelector);

    if (this.triggerElements.length === 0) {
      console.warn(`No elements found matching selector: ${this.options.triggerSelector}`);
      return;
    }

    this.triggerElements.forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  }

  private handleClose = (e: MouseEvent): void => {
    if (e.target === this.lightboxElement) {
      this.close();
    }
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  };

  public open(): void {
    if (!this.lightboxElement || !this.playerElement) {
      return;
    }

    // Add loading spinner to lightbox
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'lightbox-loading';
    loadingSpinner.innerHTML = '<div class="loading-spinner"></div>';
    this.contentElement?.appendChild(loadingSpinner);

    // Activate lightbox
    document.body.classList.add('lightbox-open');
    this.lightboxElement.classList.add('active');

    // Set a timeout to remove the loading spinner if it takes too long
    const loadingTimeout = setTimeout(() => {
      if (loadingSpinner.parentNode) {
        console.warn('Lightbox loading timeout - removing spinner');
        loadingSpinner.parentNode.removeChild(loadingSpinner);
      }
    }, 15000); // 15 seconds timeout

    // Initialize video player if not already created
    if (!this.videoPlayer) {
      try {
        // Add lightbox-player class to the player element
        this.playerElement.classList.add('lightbox-player');
        
        this.videoPlayer = new VideoPlayer({
          container: this.playerElement,
          videoIdOrUrl: this.options.videoIdOrUrl,
          autoplay: this.options.autoplay,
          muted: this.options.muted,
          controls: true,
          loop: this.options.loop,
          background: false,
          hasLightbox: true,
          quality: this.options.quality || '1080p'
        });

        // Listen for player error events
        this.playerElement.addEventListener('player-error', () => {
          // Remove the loading spinner if there's an error
          clearTimeout(loadingTimeout);
          if (loadingSpinner.parentNode) {
            loadingSpinner.parentNode.removeChild(loadingSpinner);
          }
          
          // Add an error message to the lightbox
          const errorMessage = document.createElement('div');
          errorMessage.className = 'lightbox-error-message';
          errorMessage.textContent = 'Video failed to load. Please try again later.';
          this.contentElement?.appendChild(errorMessage);
        });

        // Ensure the player is properly sized
        this.fixPlayerSizing();

        // Remove loading spinner immediately when created
        // This is faster than waiting for player-ready event
        if (loadingSpinner.parentNode) {
          loadingSpinner.parentNode.removeChild(loadingSpinner);
        }
        clearTimeout(loadingTimeout);

        // This is a backup in case the above removal doesn't work
        this.playerElement.addEventListener('player-ready', () => {
          clearTimeout(loadingTimeout);
          if (loadingSpinner.parentNode) {
            loadingSpinner.parentNode.removeChild(loadingSpinner);
          }
        });
      } catch (error) {
        console.error('Error creating video player:', error);
        clearTimeout(loadingTimeout);
        if (loadingSpinner.parentNode) {
          loadingSpinner.parentNode.removeChild(loadingSpinner);
        }
        
        // Add an error message to the lightbox
        const errorMessage = document.createElement('div');
        errorMessage.className = 'lightbox-error-message';
        errorMessage.textContent = 'Video failed to load. Please try again later.';
        this.contentElement?.appendChild(errorMessage);
      }
    }

    // Add event listener for closing the lightbox
    this.lightboxElement.addEventListener('click', this.handleClose);
    document.addEventListener('keydown', this.handleKeydown);
  }

  private fixPlayerSizing(): void {
    if (this.playerElement) {
      // Give a small delay for the Vimeo player to initialize
      setTimeout(() => {
        // Force a resize event to ensure Vimeo player updates its size
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }

  public close(): void {
    if (!this.lightboxElement) {
      return;
    }

    // Remove event listeners
    this.lightboxElement.removeEventListener('click', this.handleClose);
    document.removeEventListener('keydown', this.handleKeydown);

    // Deactivate lightbox
    this.lightboxElement.classList.remove('active');
    document.body.classList.remove('lightbox-open');

    // Reset playing state
    this.wasPlaying = false;

    // Pause and reset video player
    if (this.videoPlayer) {
      // First pause the video
      this.videoPlayer.pause().catch(err => {
        // Ignore "PlayInterrupted" errors when closing
        if (!err.toString().includes('PlayInterrupted')) {
          console.error('Error pausing video during close:', err);
        }
      });

      // Destroy the current player
      this.videoPlayer.destroy().catch(err => {
        console.error('Error destroying video player:', err);
      });

      // Set to null so a new player will be created next time
      this.videoPlayer = null;

      // Clear the player element contents
      if (this.playerElement) {
        this.playerElement.innerHTML = '';
      }
    }
  }

  public destroy(): void {
    // Remove event listeners
    if (this.lightboxElement) {
      this.lightboxElement.removeEventListener('click', this.handleClose);
    }
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    // Remove event listeners from triggers
    if (this.triggerElements) {
      this.triggerElements.forEach(element => {
        element.removeEventListener('click', this.open);
      });
    }

    // Destroy video player
    if (this.videoPlayer) {
      this.videoPlayer.destroy().catch(console.error);
      this.videoPlayer = null;
    }

    // Remove lightbox from DOM
    if (this.lightboxElement && this.lightboxElement.parentNode) {
      this.lightboxElement.parentNode.removeChild(this.lightboxElement);
    }

    this.lightboxElement = null;
    this.contentElement = null;
    this.playerElement = null;
    this.closeButton = null;
  }

  private isOpen(): boolean {
    return this.lightboxElement?.classList.contains('active') || false;
  }
} 