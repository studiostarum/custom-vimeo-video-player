import { VideoPlayer } from './components/video-player';
import './main.css';

let currentPlayer: VideoPlayer | null = null;

function initializeVideoPlayer() {
  // Clean up existing player if any
  if (currentPlayer) {
    currentPlayer.destroy().catch(console.error);
    currentPlayer = null;
  }

  // Create the element first
  const appElement = document.querySelector<HTMLDivElement>('#app');
  if (!appElement) {
    console.error('App element not found');
    return;
  }

  // Create the video player container
  const videoPlayerElement = document.createElement('div');
  videoPlayerElement.id = 'video-player';
  appElement.appendChild(videoPlayerElement);

  // Initialize the video player
  try {
    currentPlayer = new VideoPlayer({
      containerId: 'video-player',
      videoIdOrUrl: '933270643',
      autoplay: true,
      muted: true,
      loop: true,
      background: true
    });
  } catch (error) {
    console.error('Failed to initialize video player:', error);
  }
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeVideoPlayer);
} else {
  initializeVideoPlayer();
}

// Enable HMR for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    initializeVideoPlayer();
  });
}
