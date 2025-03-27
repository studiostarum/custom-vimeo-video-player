# Video Player Documentation

## Overview
The video player is a customizable Vimeo player implementation that supports both inline preview and lightbox modes. It provides a responsive, accessible, and feature-rich video playback experience with automatic handling of player states, loading indicators, and error handling.

## Installation

1. Ensure you have the Vimeo Player SDK installed:
```bash
npm install @vimeo/player
```

## Basic Usage

Add a video container to your HTML:

```html
<div class="video-container" data-video-id="YOUR_VIMEO_ID" data-lightbox="true"></div>
```

## Configuration Options

### HTML Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-video-id` | String | Required | Vimeo video ID or URL |
| `data-lightbox` | Boolean | false | Enable lightbox mode |
| `data-autoplay` | Boolean | true | Automatically play video |
| `data-muted` | Boolean | true | Mute video by default |
| `data-loop` | Boolean | true | Loop video playback |
| `data-controls` | Boolean | false | Show video controls |
| `data-quality` | String | "1080p" | Video quality setting |

### Video Quality Options

- `4K`
- `2K`
- `1080p`
- `720p`
- `540p`
- `360p`
- `auto`

## Features

### 1. Responsive Design
- Automatically adjusts to container size
- Maintains aspect ratio across different screen sizes
- Optimized scaling for different viewport widths

### 2. Preview Mode
- Background video playback
- Customizable thumbnail support
- Smooth loading transitions
- Play button overlay for lightbox triggering

### 3. Lightbox Mode
- Full-screen video presentation
- Independent player controls
- Custom video quality selection
- Smooth open/close transitions

### 4. Performance Optimizations
- Automatic pause on tab visibility change
- Lazy loading of thumbnails
- Memory management through proper cleanup
- Automatic quality adjustment

### 5. Error Handling
- Graceful fallbacks for loading failures
- User-friendly error messages
- Automatic retry mechanisms
- Comprehensive error state management

## JavaScript API

### VideoPlayer Class

```typescript
interface VideoPlayerOptions {
  container?: HTMLElement;
  containerId?: string;
  videoIdOrUrl: string;
  thumbnailUrl?: string;
  hasLightbox?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  background?: boolean;
  muted?: boolean;
  loop?: boolean;
  quality?: VimeoQuality;
}

// Create a new video player instance
const player = new VideoPlayer(options);
```

### Methods

| Method | Description |
|--------|-------------|
| `play()` | Start video playback |
| `pause()` | Pause video playback |
| `stop()` | Stop and unload the video |
| `destroy()` | Clean up the player instance |
| `getPlaying()` | Check if video is currently playing |

## CSS Customization

The video player comes with default styling but can be customized using CSS variables and classes:

### Key CSS Classes
- `.video-container` - Main container
- `.vimeo-player-container` - Player wrapper
- `.vimeo-thumbnail` - Thumbnail image
- `.vimeo-loading` - Loading indicator
- `.lightbox-trigger-button` - Lightbox trigger
- `.preview-ready` - Ready state indicator

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works across desktop and mobile devices
- Fallback support for older browsers

## Best Practices

1. **Performance**
   - Use appropriate video quality for the context
   - Enable thumbnails for faster initial load
   - Implement proper cleanup when destroying players

2. **Accessibility**
   - Provide proper ARIA labels
   - Ensure keyboard navigation in lightbox mode
   - Support screen readers

3. **User Experience**
   - Show loading states during initialization
   - Provide clear error messages
   - Implement smooth transitions

## Example Implementation

```html
<!-- Basic implementation -->
<div class="video-container" 
     data-video-id="123456789" 
     data-lightbox="true"
     data-quality="1080p"
     data-autoplay="true"
     data-muted="true"
     data-loop="true">
</div>

<!-- Advanced implementation with custom attributes -->
<div class="video-container" 
     data-video-id="123456789" 
     data-lightbox="true"
     data-quality="1080p"
     data-lightbox-autoplay="true"
     data-lightbox-controls="true"
     data-lightbox-muted="false"
     data-lightbox-loop="false">
</div>
```

## Troubleshooting

### Common Issues

1. **Video Not Playing**
   - Check if the video ID is correct
   - Verify network connectivity
   - Ensure autoplay is enabled if needed

2. **Loading Spinner Persists**
   - Check browser console for errors
   - Verify video availability
   - Check network connectivity

3. **Lightbox Not Opening**
   - Ensure proper initialization
   - Check for JavaScript errors
   - Verify trigger button functionality

### Error Messages

- "Video failed to load" - Indicates initialization or network issues
- "PlayInterrupted" - Normal during tab switching or player cleanup

## Support

For additional support or feature requests, please refer to the documentation or contact the development team. 