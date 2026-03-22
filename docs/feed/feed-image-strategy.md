# Feed Image Strategy

## Current State

The home feed currently renders a single image source per card and does not yet have a real derivative-image pipeline.

Today:

- uploaded feed images are stored once in local storage
- the feed API can expose the same URL as thumbnail, medium, and original
- width and height are not persisted yet
- the feed card relies on aspect-ratio metadata to stabilize layout

This means the feed is still effectively using one physical asset, but the response model now separates image roles so the API can grow without another contract rewrite.

## Changes in This Iteration

### Response shape

The feed response keeps the existing compatibility fields:

- `thumbnailImageUrl`
- `imageUrls`
- `imageAspectRatioValue`
- `imageAspectRatio`

It now also exposes structured image metadata:

- `images[].thumbnailUrl`
- `images[].mediumUrl`
- `images[].originalUrl`
- `images[].width`
- `images[].height`
- `images[].aspectRatio`
- `images[].aspectRatioCode`

Current mapping policy:

- when only one stored asset exists, all three URLs point to the same file
- width and height remain `null`
- aspect ratio is derived from existing feed image metadata

This gives the frontend a future-proof model immediately while keeping the current API usable.

### Frontend usage policy

The home feed card now resolves images through a dedicated policy helper:

- prefer `images[].thumbnailUrl`
- fall back to `images[].mediumUrl`
- then `images[].originalUrl`
- finally fall back to legacy `thumbnailImageUrl` / `imageUrls`

This keeps legacy compatibility while making “feed list image” and “original image” distinct concepts in the codebase.

### Rendering policy

Current image loading policy:

- only the first few visible cards may use eager loading
- all other cards use lazy loading
- images use `decoding="async"`
- important images set `fetchPriority="high"`
- non-critical images use `fetchPriority="auto"`

### Layout shift protection

The feed already had aspect-ratio support. This iteration makes it a formal part of the image-selection path:

- prefer structured image aspect ratio metadata
- otherwise use legacy aspect ratio values
- otherwise use the aspect ratio code fallback

This keeps card heights more stable before the image bytes finish loading.

## Remaining Limits

The home feed still does not have:

- real thumbnails
- medium-sized derivatives
- persisted width/height
- CDN resizing
- progressive placeholders or blur hashes

So the network payload can still be heavier than ideal when a source image is large.

## Recommended Future Strategy

### Derivative generation

At upload time, generate and persist:

- original
- medium
- thumbnail

Suggested usage:

- home feed card: thumbnail or medium
- feed detail: medium by default, original when zoom/fullscreen is needed
- profile grids: thumbnail

### Suggested sizes

Feed image targets:

- thumbnail: short side around `480px`
- medium: short side around `1080px`
- original: preserved upload or normalized archival image

Profile images:

- small avatar: `96px`
- standard avatar: `256px`

### CDN and caching

Recommended CDN policy:

- immutable cache keys per generated asset
- long `Cache-Control` for derivative assets
- URL versioning on regenerate

### Source of truth

When derivative generation exists, the feed should prefer:

1. `thumbnailUrl` for list rendering
2. `mediumUrl` for larger previews
3. `originalUrl` only for detail/fullscreen use

That is the intended contract direction reflected by the new response model.
