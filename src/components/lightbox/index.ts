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
    this.options = {
      ...options,
      autoplay: options.autoplay !== undefined ? options.autoplay : true,
      muted: options.muted !== undefined ? options.muted : false,
      controls: options.controls !== undefined ? options.controls : true,
      loop: options.loop !== undefined ? options.loop : false,
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
      // Pause video when tab loses focus
      this.wasPlaying = true;
      this.videoPlayer.pause().catch(err => {
        // Ignore "PlayInterrupted" errors
        if (!err.toString().includes('PlayInterrupted')) {
          console.error('Error pausing lightbox video:', err);
        }
      });
    } else if (this.wasPlaying) {
      // Resume video when tab regains focus (with a small delay)
      setTimeout(() => {
        this.videoPlayer?.play().catch(err => {
          console.warn('Could not resume lightbox video:', err);
        });
      }, 300);
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

    // Initialize video player if not already created
    if (!this.videoPlayer) {
      this.videoPlayer = new VideoPlayer({
        container: this.playerElement,
        videoIdOrUrl: this.options.videoIdOrUrl,
        autoplay: this.options.autoplay,
        muted: this.options.muted,
        controls: true, // Ensure controls are enabled
        loop: this.options.loop,
        background: false, // Ensure background mode is off
        quality: this.options.quality || '1080p'
      });

      // Ensure the player is properly sized
      this.fixPlayerSizing();

      // Remove loading spinner when player is ready
      this.playerElement.addEventListener('player-ready', () => {
        // Remove the loading spinner after a short delay
        setTimeout(() => {
          if (loadingSpinner.parentNode) {
            loadingSpinner.parentNode.removeChild(loadingSpinner);
          }
        }, 500);
      });
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
    return this.lightboxElement !== null && this.lightboxElement.classList.contains('active');
  }

  private detectIOSorMacOS(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|mac|macintosh/.test(userAgent);
  }
} 