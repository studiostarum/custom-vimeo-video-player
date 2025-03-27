import { VideoPlayer } from './components/video-player';
import { Lightbox } from './components/lightbox';
import './main.css';

let players: VideoPlayer[] = [];
let lightboxes: Lightbox[] = [];
let wasPlaying = false;

// Handle tab visibility changes
function handleVisibilityChange() {
  if (document.hidden) {
    // When tab loses focus
    players.forEach(player => {
      wasPlaying = true;
      player.pause().catch(err => {
        // Ignore "PlayInterrupted" errors when pausing
        if (!err.toString().includes('PlayInterrupted')) {
          console.error('Error pausing video:', err);
        }
      });
    });
  } else if (wasPlaying) {
    // When tab regains focus
    setTimeout(() => {
      players.forEach(player => {
        player.play().catch(err => {
          // Gracefully handle play errors
          if (err.toString().includes('PlayInterrupted')) {
            console.info('Play was interrupted, will retry once');
            // Try one more time after a delay
            setTimeout(() => {
              player.play().catch(error => {
                console.warn('Could not resume playback after retry:', error);
              });
            }, 500);
          } else {
            console.warn('Could not resume playback:', err);
          }
        });
      });
    }, 300);
  }
}

// Add visibility change listener
document.addEventListener('visibilitychange', handleVisibilityChange);

// Initialize video players from DOM elements
function initializeVideoPlayers() {
  // Clean up existing players
  players.forEach(player => player.destroy().catch(console.error));
  players = [];
  
  // Clean up existing lightboxes
  lightboxes.forEach(lightbox => lightbox.destroy());
  lightboxes = [];

  // Find all video player containers in the DOM
  const videoElements = document.querySelectorAll('[data-video-id]');
  
  videoElements.forEach((element, index) => {
    const container = element as HTMLElement;
    const videoId = container.dataset.videoId;
    const useLightbox = container.dataset.lightbox === 'true';
    
    if (!videoId) return; // Skip if no video ID
    
    const playerId = `video-player-${index}`;
    container.id = playerId;
    
    try {
      // Initialize video player with common options
      const player = new VideoPlayer({
        containerId: playerId,
        videoIdOrUrl: videoId,
        autoplay: container.dataset.autoplay !== 'false', // Default to true
        muted: container.dataset.muted !== 'false', // Default to true
        loop: container.dataset.loop !== 'false', // Default to true
        controls: container.dataset.controls === 'true', // Default to false
        background: !useLightbox // Background mode for preview players
      });
      
      players.push(player);
      
      // If lightbox is enabled, create a trigger button and lightbox
      if (useLightbox) {
        // Create lightbox trigger button
        const buttonElement = document.createElement('button');
        const triggerId = `lightbox-trigger-${index}`;
        buttonElement.id = triggerId;
        buttonElement.setAttribute('aria-label', 'Open Video');
        buttonElement.classList.add('lightbox-trigger-button');
        
        // Add solid play icon to the button
        buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        
        container.appendChild(buttonElement);
        
        // Make the entire container clickable
        const handleContainerClick = (e: Event) => {
          // Don't trigger if clicking on the button itself (it has its own handler)
          if (!(e.target as HTMLElement).closest('.lightbox-trigger-button')) {
            e.preventDefault();
            buttonElement.click(); // Simulate click on the button to open lightbox
          }
        };
        
        // Store the handler reference on the container to prevent it from being garbage collected
        (container as any)._clickHandler = handleContainerClick;
        
        // Remove any existing click listener before adding a new one
        container.removeEventListener('click', (container as any)._clickHandler);
        container.addEventListener('click', (container as any)._clickHandler);
        
        // Listen for the player-ready event (both thumbnail and video loaded)
        container.addEventListener('player-ready', () => {
          // Add a short delay before showing the button for a smoother animation
          setTimeout(() => {
            // The container class 'preview-ready' will trigger the button animation
            if (!container.classList.contains('preview-ready')) {
              container.classList.add('preview-ready');
            }
          }, 250);
        });
        
        // Create lightbox for this trigger
        const lightbox = new Lightbox({
          triggerSelector: `#${triggerId}`,
          videoIdOrUrl: videoId,
          autoplay: container.dataset.lightboxAutoplay !== 'false', // Default to true
          muted: container.dataset.lightboxMuted === 'true', // Default to false
          controls: container.dataset.lightboxControls !== 'false', // Default to true
          loop: container.dataset.lightboxLoop === 'true', // Default to false
          quality: (container.dataset.quality || '1080p') as any
        });
        
        lightboxes.push(lightbox);
      }
    } catch (error) {
      console.error(`Failed to initialize video player ${playerId}:`, error);
    }
  });
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const hasVideoElements = document.querySelectorAll('[data-video-id]').length > 0;
    if (hasVideoElements) {
      initializeVideoPlayers();
    }
  });
} else {
  const hasVideoElements = document.querySelectorAll('[data-video-id]').length > 0;
  if (hasVideoElements) {
    initializeVideoPlayers();
  }
}

// Enable HMR for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Remove old visibility change listener
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // Reinitialize everything
    initializeVideoPlayers();
    
    // Re-add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });
}
