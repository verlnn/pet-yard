# Feed Architecture

## Overview

The home feed is an Instagram-style infinite scroll timeline built around three constraints:

- image cards have variable heights
- users can scroll for a long time in a single session
- ads are currently injected on the client, not returned by the feed API

The current architecture therefore uses:

- backend cursor pagination via `GET /api/feeds`
- frontend `useInfiniteQuery`
- `IntersectionObserver` on a bottom sentinel
- bounded in-memory page retention with `maxPages`
- batched lookup queries per page instead of N+1 loading

This keeps the implementation simple enough to operate now while leaving a clean path for future ad-serving and recommendation work.

## Request Flow

### Backend

`GET /api/feeds`

Request params:

- `cursorCreatedAt`
- `cursorId`
- `limit`

Sorting:

- `createdAt desc`
- `id desc`

Pageing strategy:

- first page: latest posts, no cursor
- next page: rows older than the last item returned to the client
- over-fetch by `pageSize + 1`
- if one extra row exists, `hasMore = true`

The service resolves the effective page size through `FeedProperties.resolvePageSize(...)`.

Current policy:

- default page size: `app.feed.initial-load-size`
- maximum page size: `app.feed.max-load-size`
- invalid values (`null`, `0`, negative): fall back to the configured default
- oversized values: clamp to the configured maximum

### Data assembly

The feed service loads the post slice first, then batch-loads related data for only that slice:

- post images
- paw counts
- current viewer pawed-post ids
- hashtags
- author profiles

The read model is intentionally separated into:

- `HomeFeedAuthorView`
- `HomeFeedMediaView`
- `HomeFeedReactionView`
- `HomeFeedPostView`

The API response remains flat for frontend compatibility, but the backend read model is now easier to extend without turning one DTO into a grab bag.

## Why Cursor Pagination

Offset pagination is a poor fit for a social feed because it gets more expensive and less stable as rows are inserted during active scrolling.

Cursor pagination is a better fit here because:

- it follows the same ordering the user sees
- it avoids large-offset scans
- it is more resilient when new rows arrive at the top of the feed
- it gives deterministic continuation when `createdAt` ties are broken by `id`

Current cursor rule:

- `createdAt < cursorCreatedAt`
- or `createdAt = cursorCreatedAt and id < cursorId`

This preserves a strict descending order and avoids duplicates when many posts share the same timestamp.

## Why Virtualization Is Not Used Yet

Full feed virtualization is intentionally not enabled yet.

Reasons:

- cards have variable image heights
- feed cards are relatively rich and interactive
- ad items are mixed into the list
- virtualization would add noticeable complexity around measurement, scroll restoration, and future inserted items

The current trade-off is:

- use cursor pagination to avoid loading everything
- use `IntersectionObserver` to prefetch before the user hits the bottom
- keep only a bounded number of pages in memory
- lazy-load images and set an aspect ratio on media containers to reduce layout shift

This is sufficient for the current scale without forcing a more fragile rendering stack.

## Frontend Query Strategy

The feed client uses:

- `buildHomeFeedQueryKey(accessToken)` for viewer-scoped caching
- `getHomeFeedNextPageParam(...)` to map API pagination to React Query
- `shouldRequestNextHomeFeedPage(...)` to centralize observer guard conditions

Guard conditions for loading another page:

- the sentinel is intersecting
- `hasNextPage` is true
- a next-page request is not already running
- the local fetch lock is not set

The local fetch lock protects against duplicate observer callbacks before React Query flips `isFetchingNextPage`.

## Memory and UX Trade-off

`maxPages` is intentionally capped.

Benefits:

- prevents unlimited memory growth during long sessions
- reduces retained React tree size
- keeps cached page objects bounded

Trade-off:

- if a user goes far down the feed, leaves, and comes back, older pages may need to be fetched again

For the current product stage this is acceptable. The trade-off is documented directly in the query config so it remains explicit during future tuning.

## Ad Injection Structure

The server currently returns posts only.

The client transforms:

- raw post list

into:

- renderable mixed feed items (`post | ad`)

Current behavior:

- inject one ad after every four posts
- compute insertion over the accumulated feed list, not per page

This is important because page-local insertion would shift ads around as new pages arrive.

## Future Expansion

### Server-driven ads

When the backend starts returning sponsored items, the client should keep the same final render contract:

- a single renderable union list of feed items

Recommended transition:

1. keep `HomeFeedListItem` as the rendering contract
2. add a server adapter that converts sponsored rows into the same union type
3. remove or bypass client fallback ad injection when sponsored items are present

### Recommendation feeds

Likely extensions that fit the current structure:

- follow graph ranking
- location-aware ranking
- pet profile relevance
- ad-serving experiments

The current read-model separation and batched loading path are designed to allow those concerns to grow without rewriting the transport contract first.

## Related documents

- `docs/feed-query-strategy.md`
- `docs/feed-image-strategy.md`
- `docs/feed-observability.md`
- `docs/feed-max-pages-ux.md`
- `docs/feed-ad-contract.md`
- `docs/feed-recommendation-roadmap.md`
