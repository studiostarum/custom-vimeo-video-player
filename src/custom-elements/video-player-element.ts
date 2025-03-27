import { VideoPlayer } from '../components/video-player';
import type { VideoPlayerOptions, VimeoQuality } from '../components/video-player/types';

/**
 * Custom element for Vimeo video player
 * Usage:
 * <video-player
 *   video-id="123456789"
 *   autoplay="true"
 *   muted="true"
 *   loop="true"
 *   controls="false"
 *   quality="1080p"
 *   lightbox="false">
 * </video-player>
 */
export class VideoPlayerElement extends HTMLElement {
  private player: VideoPlayer | null = null;
  
  // Define observed attributes for reactive updates
  static get observedAttributes() {
    return [
      'video-id', 
      'autoplay', 
      'muted', 
      'loop', 
      'controls', 
      'quality', 
      'lightbox'
    ];
  }
  
  constructor() {
    super();
    // Create a shadow DOM for better encapsulation
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Initialize when added to the DOM
    this.initialize();
  }

  disconnectedCallback() {
    // Clean up when removed from the DOM
    this.destroy();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Handle attribute changes if the player already exists
    if (oldValue === newValue || !this.player) return;
    
    // Reinitialize the player with new options if video-id changes
    if (name === 'video-id') {
      this.initialize();
      return;
    }
    
    // For other attributes, we could implement property updates
    // This would require adding methods to the VideoPlayer class
  }

  private initialize() {
    if (!this.shadowRoot) return;
    
    // Clear any existing content
    this.shadowRoot.innerHTML = '';
    
    // Create container
    const container = document.createElement('div');
    container.className = 'video-player-container';
    this.shadowRoot.appendChild(container);
    
    // Add styles to shadow DOM
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :host {
        display: block;
        width: 100%;
        aspect-ratio: 16/9;
      }
      .video-player-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }
    `;
    this.shadowRoot.appendChild(styleEl);
    
    // Get attributes
    const videoId = this.getAttribute('video-id');
    if (!videoId) {
      console.error('Video ID is required for <video-player> element');
      return;
    }
    
    const options: VideoPlayerOptions = {
      container,
      videoIdOrUrl: videoId,
      autoplay: this.getBoolAttribute('autoplay', true),
      muted: this.getBoolAttribute('muted', true),
      loop: this.getBoolAttribute('loop', true),
      controls: this.getBoolAttribute('controls', false),
      hasLightbox: this.getBoolAttribute('lightbox', false),
      quality: this.getAttribute('quality') as VimeoQuality || '1080p'
    };
    
    // Initialize player
    try {
      this.player = new VideoPlayer(options);
    } catch (error) {
      console.error('Error initializing video player:', error);
      this.shadowRoot.innerHTML = `<div class="error">Error loading video player: ${error}</div>`;
    }
  }
  
  private getBoolAttribute(name: string, defaultValue: boolean): boolean {
    const attr = this.getAttribute(name);
    if (attr === null) return defaultValue;
    return attr !== 'false';
  }
  
  private destroy() {
    if (this.player) {
      // Add support for destroy in VideoPlayer class
      // this.player.destroy();
      this.player = null;
    }
  }
} 