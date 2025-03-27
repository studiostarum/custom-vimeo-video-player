import Player from '@vimeo/player';
import { VideoPlayer } from './components/video-player';
import { Lightbox } from './components/lightbox';

// Import styles
import './components/video-player/index.css';
import './components/lightbox/index.css';
import './components/shared/video-lightbox.css';

// Make Player available globally for the VideoPlayer component
(window as any).Vimeo = { Player };

// Auto-initialize when the DOM is ready
function initializePlayers() {
  const videoElements = document.querySelectorAll('[data-video-id]');
  const players: VideoPlayer[] = [];
  const lightboxes: Lightbox[] = [];

  videoElements.forEach((element, index) => {
    const container = element as HTMLElement;
    const videoId = container.dataset.videoId;
    const useLightbox = container.dataset.lightbox === 'true';
    
    if (!videoId) return;
    
    const playerId = `video-player-${index}`;
    container.id = playerId;
    
    try {
      // Initialize video player
      const player = new VideoPlayer({
        containerId: playerId,
        videoIdOrUrl: videoId,
        autoplay: container.dataset.autoplay !== 'false',
        muted: container.dataset.muted !== 'false',
        loop: container.dataset.loop !== 'false',
        controls: container.dataset.controls === 'true',
        background: !useLightbox
      });
      
      players.push(player);
      
      // Setup lightbox if enabled
      if (useLightbox) {
        const buttonElement = document.createElement('button');
        const triggerId = `lightbox-trigger-${index}`;
        buttonElement.id = triggerId;
        buttonElement.setAttribute('aria-label', 'Open Video');
        buttonElement.classList.add('lightbox-trigger-button');
        
        buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        
        container.appendChild(buttonElement);
        
        const lightbox = new Lightbox({
          triggerSelector: `#${triggerId}`,
          videoIdOrUrl: videoId,
          autoplay: container.dataset.lightboxAutoplay !== 'false',
          muted: container.dataset.lightboxMuted === 'true',
          controls: container.dataset.lightboxControls !== 'false',
          loop: container.dataset.lightboxLoop === 'true',
          quality: (container.dataset.quality || '1080p') as any
        });
        
        lightboxes.push(lightbox);
      }
    } catch (error) {
      console.error(`Failed to initialize video player ${playerId}:`, error);
    }
  });

  // Handle tab visibility for all players
  let wasPlaying = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      players.forEach(player => {
        wasPlaying = true;
        player.pause().catch(err => {
          if (!err.toString().includes('PlayInterrupted')) {
            console.error('Error pausing video:', err);
          }
        });
      });
    } else if (wasPlaying) {
      setTimeout(() => {
        players.forEach(player => {
          player.play().catch(console.error);
        });
      }, 300);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlayers);
} else {
  initializePlayers();
}

// Export components for manual usage if needed
export { VideoPlayer, Lightbox }; 