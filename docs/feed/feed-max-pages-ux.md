# Feed maxPages UX

## Current State

The home feed intentionally keeps only a bounded number of pages in React Query cache.

Current policy:

- `MAX_HOME_FEED_PAGES_IN_MEMORY = 6`

Why this exists:

- long sessions should not grow memory indefinitely
- the React tree should not retain an unlimited number of image-heavy cards
- feed cache pressure needs to stay bounded

## Trade-off

Using `maxPages` means older feed pages can be removed from memory while the user keeps scrolling.

That is acceptable for the current product stage, but it has UX consequences:

- going very deep and returning later may cause refetches
- re-entry can feel abrupt if scroll position is not restored
- stale cache windows and token changes can affect what the user sees

## Changes in This Iteration

### Scroll state persistence

The feed now stores per-viewer scroll state in session storage.

Current behavior:

- save `window.scrollY` while scrolling
- save again on unmount
- restore once when the feed re-enters after the first page is available

The key is scoped by access token so cached position does not leak across viewer changes.

### Query key separation

The query key already includes the viewer token. This means feed cache and scroll state are now aligned around the same viewer boundary.

That matters for:

- account switching
- logout/login cycles
- avoiding accidental cache reuse between users

## Practical UX Scenarios

### Long scroll session

- older pages can leave memory
- visible pages remain usable
- future back-navigation may refetch dropped pages

### Open a detail-like surface and come back

The current route structure does not yet have a separate home-feed detail route. Still, the feed now preserves window scroll so returning to the feed page is less jarring.

### Tab switch or temporary leave

- if the cache window still exists, React Query can reuse it
- if some pages have been dropped, the feed can refetch but scroll restoration still helps recover the user’s place

### Token change

- feed query cache is split per token
- scroll state is split per token
- this prevents cross-user cache pollution

## When to Revisit the Policy

The current strategy is still valid while:

- feed cards stay variable-height
- the product is primarily chronological
- session lengths are moderate
- the current `maxPages` value does not cause visible frustration

We should revisit stronger windowing or virtualization when:

- average session depth grows significantly
- memory usage becomes measurable on lower-end devices
- re-entry / back-navigation refetch cost becomes a common complaint
- the feed starts mixing many more heterogeneous item types

## Remaining Limits

- scroll restore is page-level, not per-item anchoring
- dropped pages can still require refetch
- the current route model does not preserve a dedicated feed-detail navigation state

## Next Improvements

Potential future work:

1. anchor restoration using item id rather than only `scrollY`
2. preserve a small “back buffer” for recently viewed feed windows
3. add route-aware detail navigation if the product moves to standalone feed detail pages
