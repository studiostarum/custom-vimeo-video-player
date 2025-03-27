// Import components
import { VideoPlayer } from './components/video-player';
import { Lightbox } from './components/lightbox';

// Import all styles
import './components/video-player/index.css';
import './components/lightbox/index.css';
import './components/shared/video-lightbox.css';

// Auto-init module - helps with automatic initialization
import './auto-init';

// Add a note about CSS for consumers of the library
console.log('[Custom Vimeo Player] Styles loaded. If you don\'t see styles, import CSS with: import "@studiostarum/custom-vimeo-player/dist/custom-vimeo-player.css"');

// Export components
export { VideoPlayer, Lightbox };

// Export types
export type { VideoPlayerOptions } from './components/video-player/types';
export type { LightboxOptions } from './components/lightbox/types'; 