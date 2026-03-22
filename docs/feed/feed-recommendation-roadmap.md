# Feed Recommendation Roadmap

## Current state
- The current home feed is a chronological feed.
- It uses cursor pagination based on `createdAt desc, id desc`.
- The current cursor contract is optimized for timeline browsing, not ranking or recommendation mixing.

## Changes in this iteration
- No recommendation feed was implemented.
- Instead, the limits of the current chronological contract and the likely migration paths are documented so later changes do not overload the existing feed API by accident.

## Current home feed characteristics
- deterministic ordering
- stable continuation through `createdAt + id`
- predictable infinite scroll behavior
- simpler debugging than score-driven ranking

This makes the current feed a strong fit for:
- latest-first browsing
- stable cursor pagination
- bounded client caching with `maxPages`

## Recommendation expansion scenarios

### 1. Keep home chronological, add a separate recommendations surface
- Pros:
  - lowest risk
  - current home contract remains unchanged
  - easier A/B rollout
- Cons:
  - users need to switch surfaces
  - engagement may split between tabs
- Fit with the current architecture:
  - best fit
  - recommended first step

### 2. Mix chronological and recommended items in home
- Pros:
  - recommendations can appear naturally in the main feed
  - gradual rollout is possible
- Cons:
  - ordering rules become more complex
  - debugging gets harder
  - placement competition with ads increases
- Fit with the current architecture:
  - possible, but requires a clearer mixed-item contract and stronger cursor semantics

### 3. Move to a score-based unified home feed
- Pros:
  - maximum personalization flexibility
  - one ranking system can control the entire feed
- Cons:
  - highest implementation cost
  - chronological expectations weaken
  - cache invalidation and replay debugging become much harder
- Fit with the current architecture:
  - weakest fit unless a dedicated feed-serving layer is introduced

## Cursor evolution options

### Score + id cursor
- Example order:
  - `score desc, id desc`
- Useful when ranking is mostly score-driven.
- Risk:
  - scores can change after a cursor was issued.

### Publish time + score hybrid cursor
- Example order:
  - `publish_bucket desc, score desc, id desc`
- Useful for “fresh but relevant” ranking.
- Risk:
  - ordering semantics become harder to explain and test.

### Server-issued feed token
- The server returns an opaque token that represents a ranked snapshot.
- The client sends the token back for continuation.
- Useful when ranking is dynamic or experimentation-heavy.
- Risk:
  - requires a more stateful feed-serving strategy.

## Candidate recommendation signals
- likes
- comments
- dwell time
- hides / reports / blocks
- follow graph
- user interest categories
- pet interest categories
- regional affinity
- freshness decay

## Guardrails
- Keep the current home feed explicitly chronological until a replacement contract is documented.
- Do not overload the existing cursor with recommendation semantics without updating tests and docs.
- Keep ads and recommendations conceptually separate unless the serving layer owns both.

## Remaining limitations
- No recommendation API exists yet.
- No ranking store or scoring pipeline has been introduced.
- No mixed recommended item contract exists yet.

## Follow-up opportunities
- add a separate recommendation tab or API first
- define a recommendation item contract parallel to the ad contract
- evaluate a token-based continuation model when ranking becomes non-deterministic
