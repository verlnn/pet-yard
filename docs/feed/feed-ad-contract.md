# Feed Ad Contract

## Current state
- The home feed API still returns posts only.
- Inline ads are injected on the client after the post list is assembled.
- Ads appear after every 4 posts, based on the accumulated feed list instead of each page boundary.
- Impression and click tracking are implemented as internal adapter interfaces only. They do not call an external ad server yet.

## Changes in this iteration
- `HomeFeedAd` now carries a future-proof contract:
  - `adId`
  - `campaignId`
  - `slotKey`
  - `title`
  - `description`
  - `imageUrl`
  - `targetUrl`
  - `ctaLabel`
  - `tracking`
- The fallback ad array follows the same contract as future sponsored items.
- Inline ad cards report:
  - impression: once the card enters the viewport
  - click: when the CTA or media link is clicked
- Tracking is routed through a dedicated `HomeFeedAdTracker` boundary so analytics or an ads backend can be connected later without changing the card rendering logic.

## Current client-side injection contract
- Pure post data and the mixed render list remain separated.
- `buildHomeFeedItems(posts, ads, interval)` stays a pure function.
- The insertion rule is cumulative:
  - after posts 4, 8, 12, ...
  - never after the final post in the current accumulated list
- This keeps the placement stable even when new pages are appended.

## Tracking contract
- Impression and click events currently include:
  - `adId`
  - `campaignId`
  - `slotKey`
  - `targetUrl`
  - `position`
  - `source`
  - `placement`
  - `experimentKey`
- The default implementation logs through the existing feed debug logger.
- Production analytics wiring is intentionally left outside this iteration.

## Extension path for server-driven sponsored items
- If the backend starts returning sponsored items, the rendering layer should continue to consume a single mixed item contract.
- The recommended migration path is:
  1. backend returns `post` and `sponsored` items in one feed payload
  2. client mapping converts them into the same `HomeFeedListItem` union
  3. `HomeFeedAdTracker` remains unchanged
- This keeps feed UI and tracking code mostly stable while shifting placement authority to the server.

## Client injection vs server injection

### Client injection
- Pros:
  - simple rollout
  - no backend ad dependency
  - easy fallback behavior
- Cons:
  - no centralized pacing or targeting
  - weaker deduplication guarantees
  - limited frequency control per session/user

### Server injection
- Pros:
  - consistent placement and pacing
  - easier audience targeting
  - better campaign-level deduplication and reporting
- Cons:
  - more backend complexity
  - tighter contract management
  - ad-serving latency becomes part of the feed path

## Concepts reserved for the future
- frequency cap
- audience targeting
- campaign pacing
- deduplication across sessions and tabs
- experiment bucketing

## Remaining limitations
- Inline ads still use fallback static creatives.
- Impression tracking is viewport-based only and does not include dwell time.
- Click tracking is local only and is not forwarded to analytics infrastructure yet.

## Follow-up opportunities
- connect `HomeFeedAdTracker` to the internal analytics pipeline
- support sponsored items from the backend without changing feed card composition
- add campaign pacing and deduplication rules once real ad delivery starts
