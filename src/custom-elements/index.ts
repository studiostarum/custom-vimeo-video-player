import { VideoPlayerElement } from './video-player-element';
import { LightboxElement } from './lightbox-element';

/**
 * Register the custom elements when this module is imported
 */
export function registerCustomElements(): void {
  // Only register if customElements is available (i.e., we're in a browser)
  if (typeof window !== 'undefined' && 'customElements' in window) {
    if (!customElements.get('video-player')) {
      customElements.define('video-player', VideoPlayerElement);
    }
    
    if (!customElements.get('video-lightbox')) {
      customElements.define('video-lightbox', LightboxElement);
    }
  }
}

// Auto-register if in browser environment
if (typeof window !== 'undefined' && 'customElements' in window) {
  registerCustomElements();
}

// Export for manual registration
export { VideoPlayerElement, LightboxElement }; 