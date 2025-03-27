import Player from '@vimeo/player';
import type { VideoPlayerOptions } from './types';

export class VideoPlayer {
  private player: Player;
  private container: HTMLElement;
  private thumbnailElement: HTMLImageElement;
  private loadingElement: HTMLDivElement;

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
      this.container.style.position = 'relative'; // Ensure container has relative positioning
      this.container.style.overflow = 'hidden'; // Prevent content overflow
    } else {
      throw new Error('Either container or containerId must be provided');
    }

    // Add player container to ensure consistent sizing
    const playerContainer = document.createElement('div');
    playerContainer.className = 'vimeo-player-container';
    this.container.appendChild(playerContainer);

    // Create loading spinner
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'vimeo-loading';
    this.loadingElement.innerHTML = '<div class="vimeo-spinner"></div>';
    this.container.appendChild(this.loadingElement);

    // Create thumbnail
    this.thumbnailElement = document.createElement('img');
    this.thumbnailElement.className = 'vimeo-thumbnail';
    this.thumbnailElement.style.width = '100%';
    this.thumbnailElement.style.height = '100%';
    this.container.appendChild(this.thumbnailElement);

    // Parse video ID
    const videoId = this.extractVideoId(options.videoIdOrUrl);

    // Default player options with sensible defaults
    const playerOptions = {
      id: videoId,
      responsive: true,
      controls: options.controls ?? false,
      background: options.background ?? true,
      muted: options.muted ?? true,
      loop: options.loop ?? true,
      quality: options.quality ?? '1080p',
      speed: true,
      transparent: true,
      dnt: true,
      pip: false,
      playsinline: true
    };

    // Set thumbnail URL - this will track loading
    this.setThumbnail(videoId);

    // Initialize player in the player container rather than directly in the container
    this.player = new Player(playerContainer, playerOptions);

    // Track loading states
    let thumbnailLoaded = false;
    let videoLoaded = false;

    // Function to check if everything is loaded
    const checkAllLoaded = () => {
      if (thumbnailLoaded && videoLoaded) {
        // Dispatch ready event only when both video and thumbnail are loaded
        const readyEvent = new CustomEvent('player-ready', {
          bubbles: true,
          detail: { videoId }
        });
        this.container.dispatchEvent(readyEvent);
        
        // Add ready class only after both are loaded
        this.container.classList.add('preview-ready');
        
        // Now fade out loading states
        this.fadeOutLoadingStates();
      }
    };

    // Listen for thumbnail loaded event
    this.thumbnailElement.addEventListener('load', () => {
      thumbnailLoaded = true;
      checkAllLoaded();
    });

    // Handle video states
    this.player.ready().then(() => {
      // Rather than autoplaying immediately, wait for loaded event
      this.player.on('loaded', () => {
        videoLoaded = true;
        checkAllLoaded();

        // If autoplay is enabled, start playing
        if (options.autoplay ?? true) {
          this.play().catch(error => {
            console.warn('Autoplay failed, likely due to browser restrictions:', error);
          });
        }
      });
      
      // Fallback: If loaded event doesn't fire within 5 seconds, consider video loaded anyway
      setTimeout(() => {
        if (!videoLoaded) {
          console.warn('Vimeo loaded event did not fire within timeout, forcing loaded state');
          videoLoaded = true;
          checkAllLoaded();
        }
      }, 5000);
    });

    this.player.on('error', () => {
      this.loadingElement.classList.add('error-state');
      this.loadingElement.classList.remove('fade-out');
    });
  }

  private fadeOutLoadingStates(): void {
    // First ensure the player is fully loaded and sized before starting transitions
    setTimeout(() => {
      // Make sure elements still exist
      if (!this.loadingElement || !this.thumbnailElement) return;
      
      // Add fade-out class to start transition
      this.loadingElement.classList.add('fade-out');
      this.thumbnailElement.classList.add('fade-out');
      
      // After transition completes, hide elements completely but preserve structure
      setTimeout(() => {
        if (!this.loadingElement || !this.thumbnailElement) return;
        
        // Use hidden class that preserves the element structure
        this.loadingElement.classList.add('hidden');
        this.thumbnailElement.classList.add('hidden');
      }, 500); // Match this with the CSS transition duration
    }, 500); // Longer delay to ensure player is ready
  }

  private async setThumbnail(videoId: number): Promise<void> {
    try {
      const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
      const data = await response.json();
      if (data?.[0]?.thumbnail_large) {
        this.thumbnailElement.src = data[0].thumbnail_large;
        // The load event listener is now in constructor
      }
    } catch (error) {
      console.error('Failed to fetch thumbnail:', error);
      // If thumbnail fails, consider it "loaded" anyway
      this.container.dispatchEvent(new CustomEvent('thumbnail-error'));
    }
  }

  private extractVideoId(url: string): number {
    if (!url) {
      throw new Error('Video ID not found');
    }

    // Handle direct numeric ID
    if (/^\d+$/.test(url)) {
      const id = parseInt(url, 10);
      if (id > 0) {
        return id;
      }
    }

    // Handle Vimeo URL
    const match = url.match(/(?:vimeo\.com\/|\/)?(\d+)/i);
    if (match && match[1]) {
      const id = parseInt(match[1], 10);
      if (id > 0) {
        return id;
      }
    }

    throw new Error('Invalid video ID or URL provided');
  }

  public play(): Promise<void> {
    return this.player.play();
  }

  public pause(): Promise<void> {
    return this.player.pause();
  }

  public async destroy(): Promise<void> {
    // Clean up loading and thumbnail elements
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
    }
    if (this.thumbnailElement && this.thumbnailElement.parentNode) {
      this.thumbnailElement.parentNode.removeChild(this.thumbnailElement);
    }

    // Destroy the Vimeo player
    await this.player.destroy();

    // Clear the container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
} 