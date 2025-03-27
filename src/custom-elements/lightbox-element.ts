import { Lightbox } from '../components/lightbox';
import type { LightboxOptions } from '../components/lightbox/types';

/**
 * Custom element for Vimeo video lightbox
 * Usage:
 * <video-lightbox
 *   video-id="123456789"
 *   trigger-selector="#my-button"
 *   autoplay="true"
 *   muted="false"
 *   controls="true"
 *   loop="false"
 *   quality="1080p">
 * </video-lightbox>
 */
export class LightboxElement extends HTMLElement {
  private lightbox: Lightbox | null = null;
  
  // Define observed attributes for reactive updates
  static get observedAttributes() {
    return [
      'video-id', 
      'trigger-selector',
      'autoplay', 
      'muted', 
      'controls', 
      'loop', 
      'quality'
    ];
  }
  
  constructor() {
    super();
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
    // Handle attribute changes if the lightbox already exists
    if (oldValue === newValue || !this.lightbox) return;
    
    // Reinitialize if key attributes change
    if (name === 'video-id' || name === 'trigger-selector') {
      this.initialize();
    }
  }

  private initialize() {
    // Get required attributes
    const videoId = this.getAttribute('video-id');
    const triggerSelector = this.getAttribute('trigger-selector');
    
    if (!videoId) {
      console.error('Video ID is required for <video-lightbox> element');
      return;
    }
    
    if (!triggerSelector) {
      console.error('Trigger selector is required for <video-lightbox> element');
      return;
    }
    
    // Create options
    const options: LightboxOptions = {
      videoIdOrUrl: videoId,
      triggerSelector: triggerSelector,
      autoplay: this.getBoolAttribute('autoplay', true),
      muted: this.getBoolAttribute('muted', false),
      controls: this.getBoolAttribute('controls', true),
      loop: this.getBoolAttribute('loop', false),
      quality: this.getAttribute('quality') as any || '1080p'
    };
    
    // Initialize lightbox
    try {
      this.lightbox = new Lightbox(options);
    } catch (error) {
      console.error('Error initializing lightbox:', error);
    }
  }
  
  private getBoolAttribute(name: string, defaultValue: boolean): boolean {
    const attr = this.getAttribute(name);
    if (attr === null) return defaultValue;
    return attr !== 'false';
  }
  
  private destroy() {
    if (this.lightbox) {
      // Add destroy() call when available
      this.lightbox = null;
    }
  }
} 