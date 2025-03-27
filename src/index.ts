// Import components
import { VideoPlayer } from './components/video-player';
import { Lightbox } from './components/lightbox';

// Import CSS via the dedicated CSS file
import './css';

// Auto-init module - helps with automatic initialization
import './auto-init';

// Add a note about CSS for consumers of the library
console.log('[Custom Vimeo Player] Styles loaded. If you don\'t see styles, import CSS with: import "@studiostarum/custom-vimeo-player/dist/custom-vimeo-player.css"');

// Export components
export { VideoPlayer, Lightbox };

// Export types
export type { VideoPlayerOptions } from './components/video-player/types';
export type { LightboxOptions } from './components/lightbox/types'; 