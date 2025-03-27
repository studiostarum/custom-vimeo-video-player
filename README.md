# Custom Vimeo Player

A modern, responsive video player implementation built on top of the Vimeo Player SDK. Features both inline preview and lightbox modes with comprehensive customization options.

## Features at a Glance

- 🎥 Responsive Vimeo video playback
- 🖼️ Preview and lightbox modes
- ⚡ Performance optimized
- 🎨 Highly customizable
- ♿ Accessibility focused
- 📱 Mobile-friendly

## Installation

```bash
npm install @studiostarum/custom-vimeo-player @vimeo/player
```

## Usage

```typescript
import { VideoPlayer } from '@studiostarum/custom-vimeo-player';
import '@studiostarum/custom-vimeo-player/styles';

// Create a new video player
const player = new VideoPlayer({
  containerId: 'video-container',
  videoIdOrUrl: 'YOUR_VIMEO_ID',
  hasLightbox: true,
  autoplay: true,
  muted: true,
  loop: true
});
```

### HTML Setup

```html
<div id="video-container"></div>
```

Or use data attributes for automatic initialization:

```html
<div class="video-container" 
     data-video-id="YOUR_VIMEO_ID" 
     data-lightbox="true">
</div>
```

## Documentation

For detailed implementation and configuration options, please see our [Video Player Documentation](docs/VIDEO_PLAYER.md).

## License

MIT 