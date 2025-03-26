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
    } else if (options.containerId) {
      const container = document.getElementById(options.containerId);
      if (!container) {
        throw new Error(`Container with ID "${options.containerId}" not found`);
      }
      this.container = container;
    } else {
      throw new Error('Either container or containerId must be provided');
    }

    // Parse video ID
    const videoId = this.extractVideoId(options.videoIdOrUrl);

    // Default player options
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

    // Create loading spinner
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'vimeo-loading';
    this.loadingElement.innerHTML = '<div class="vimeo-spinner"></div>';
    this.container.appendChild(this.loadingElement);

    // Create thumbnail
    this.thumbnailElement = document.createElement('img');
    this.thumbnailElement.className = 'vimeo-thumbnail';
    this.container.appendChild(this.thumbnailElement);

    // Set thumbnail URL
    this.setThumbnail(videoId);

    this.player = new Player(this.container, playerOptions);

    // Handle video states
    this.player.ready().then(() => {
      if (options.autoplay) {
        // Start playing before fading out the loading states
        this.play().then(() => {
          this.fadeOutLoadingStates();
        });
      } else {
        this.fadeOutLoadingStates();
      }
    });

    this.player.on('error', () => {
      this.loadingElement.style.display = 'flex';
      this.loadingElement.classList.remove('fade-out');
    });
  }

  private fadeOutLoadingStates(): void {
    // Add a small delay before starting the fade out
    setTimeout(() => {
      this.loadingElement.classList.add('fade-out');
      this.thumbnailElement.classList.add('fade-out');
      
      // Remove elements from DOM after fade completes
      setTimeout(() => {
        this.loadingElement.style.display = 'none';
        this.thumbnailElement.style.display = 'none';
      }, 500); // Match this with the CSS transition duration
    }, 300); // Delay before starting fade out
  }

  private async setThumbnail(videoId: number): Promise<void> {
    try {
      const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
      const data = await response.json();
      if (data?.[0]?.thumbnail_large) {
        this.thumbnailElement.src = data[0].thumbnail_large;
      }
    } catch (error) {
      console.error('Failed to fetch thumbnail:', error);
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