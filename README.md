# Custom Vimeo Video Player

A lightweight, customizable Vimeo video player with lightbox support. Perfect for Webflow and other website builders.

## Features

- 🎥 Responsive Vimeo video player
- 💡 Optional lightbox mode
- 🎯 Background video mode
- 🎮 Customizable controls
- 🔄 Auto-play and loop options
- 🎨 Customizable styles
- 📱 Mobile-friendly
- ⌨️ Keyboard navigation in lightbox mode
- 🔍 High-quality video options

## Installation

### Option 1: CDN (Recommended for Webflow)

Add this script to your page's `<head>` section:

```html
<script src="https://unpkg.com/@studiostarum/custom-vimeo-player@1.4.4/dist/custom-vimeo-player.min.js"></script>
```

### Option 2: npm (For JavaScript Projects)

```bash
npm install @studiostarum/custom-vimeo-player
```

## Recent Updates

### v1.4.4
- Fixed Lightbox component initialization error with improved error handling
- Added defensive coding to prevent errors when options are undefined
- Updated documentation

### v1.4.3
- Fixed "Cannot read properties of undefined (reading 'autoplay')" error in VideoPlayer
- Improved error handling
- Fixed issue with circular dependencies

## Usage

### Using with CDN

Just add video containers anywhere in your HTML:

```html
<!-- Basic Video Player -->
<div class="video-container" 
     data-video-id="75406915">
</div>

<!-- Video Player with Lightbox -->
<div class="video-container" 
     data-video-id="75406915"
     data-lightbox="true"
     data-autoplay="true"
     data-muted="true">
</div>
```

That's it! The player will automatically initialize.

### Using with npm

```typescript
// Import the components (CSS is automatically imported)
import { VideoPlayer, Lightbox } from '@studiostarum/custom-vimeo-player';

// Create a basic video player
const player = new VideoPlayer({
  containerId: 'video-container',
  videoIdOrUrl: '75406915',
  autoplay: true,
  muted: true
});

// Create a video player with lightbox
const playerWithLightbox = new VideoPlayer({
  containerId: 'video-container-2',
  videoIdOrUrl: '75406915',
  autoplay: true,
  muted: true,
  background: true // Use background mode for preview
});

// Initialize lightbox separately
const lightbox = new Lightbox({
  triggerSelector: '#video-container-2',
  videoIdOrUrl: '75406915',
  autoplay: true,
  controls: true
});
```

## Data Attributes

### Basic Player Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-video-id` | string | required | Vimeo video ID or URL |
| `data-autoplay` | boolean | true | Auto-play the video |
| `data-muted` | boolean | true | Mute the video |
| `data-loop` | boolean | true | Loop the video |
| `data-controls` | boolean | false | Show video controls |
| `data-lightbox` | boolean | false | Enable lightbox mode |

### Lightbox-specific Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-lightbox-autoplay` | boolean | true | Auto-play in lightbox |
| `data-lightbox-muted` | boolean | false | Mute in lightbox |
| `data-lightbox-controls` | boolean | true | Show controls in lightbox |
| `data-lightbox-loop` | boolean | false | Loop in lightbox |
| `data-quality` | string | '1080p' | Video quality (360p, 540p, 720p, 1080p, etc.) |

## Examples

### Background Video

```html
<div class="video-container" 
     data-video-id="75406915"
     data-autoplay="true"
     data-muted="true"
     data-loop="true"
     data-controls="false">
</div>
```

### Lightbox with Custom Settings

```html
<div class="video-container" 
     data-video-id="75406915"
     data-lightbox="true"
     data-autoplay="true"
     data-muted="true"
     data-lightbox-controls="true"
     data-lightbox-autoplay="true"
     data-quality="1080p">
</div>
```

### Interactive Video Player

```html
<div class="video-container" 
     data-video-id="75406915"
     data-controls="true"
     data-autoplay="false"
     data-muted="false"
     data-loop="false">
</div>
```

## Styling

The player comes with default styles but can be customized using CSS:

```css
/* Video container */
.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
}

/* Lightbox trigger button */
.lightbox-trigger-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  color: white;
  transition: background 0.3s ease;
}

.lightbox-trigger-button:hover {
  background: rgba(0, 0, 0, 0.9);
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License 