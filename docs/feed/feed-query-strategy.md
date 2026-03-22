# Feed Query Strategy

## Why the Feed Query Is Split

The home feed uses two repository queries:

- first-page query
- cursor-after query

This split is intentional.

An earlier attempt used a single JPQL shape similar to:

```sql
(:cursorCreatedAt is null)
or (createdAt < :cursorCreatedAt)
or (createdAt = :cursorCreatedAt and id < :cursorId)
```

With PostgreSQL this caused:

`could not determine data type of parameter $1`

The problem is that a `null` cursor parameter inside that JPQL branch can leave PostgreSQL without enough type information during query planning.

## Why We Do Not Recombine It

We do not try to force the query back into one branch because:

- the split version is simpler to reason about
- it avoids PostgreSQL null-typing ambiguity
- it keeps the continuation rule explicit
- it is easier to test

Current repository intent:

- first page: `order by createdAt desc, id desc`
- cursor page: rows strictly after the cursor in the same descending order

## Cursor Rule

Continuation is defined as:

- `createdAt < cursorCreatedAt`
- or `createdAt = cursorCreatedAt and id < cursorId`

This matters because multiple posts can share the same timestamp.

Without the `id` tie-breaker:

- posts can be duplicated
- posts can be skipped
- continuation becomes nondeterministic under concurrent inserts

Repository tests now cover:

- first-page ordering
- same-timestamp tie-break behavior
- no duplicate / no-gap continuation

## Page Size Resolution

Page-size resolution lives in `FeedProperties`.

That is the clearest place because the policy depends on configuration, not transport.

Current behavior:

- `initialLoadSize`
- `maxLoadSize`
- `resolvePageSize(requestedLimit)`

This keeps the controller thin and prevents the service from accumulating scattered magic numbers.

## Batch Query Plan

For one feed page, the application executes:

1. post slice query
2. post images query
3. paw count aggregation query
4. pawed-by-viewer query
5. hashtag lookup query
6. author profile lookup query

That means the feed read path is page-bounded and predictable.

The service does not load related data per post.

This prevents the classic N+1 pattern that would appear if each post triggered its own:

- images lookup
- reaction count lookup
- viewer reaction lookup
- profile lookup
- hashtag lookup

## Query Count Verification

The test suite now includes a Hibernate statistics-based verification path for the home feed read.

The purpose is not to freeze every SQL implementation detail forever.

The purpose is to catch regressions such as:

- a new per-post profile query
- a new per-post hashtag query
- accidental lazy loading during DTO assembly

As long as the feed continues to resolve one page plus batched lookups, the statement count stays bounded and explainable.

## Index Strategy

The current feed query pattern benefits from these indexes:

### `feed.feed_posts`

- `(created_at desc, id desc)`

Why:

- matches the timeline ordering
- supports cursor continuation on `(created_at, id)`

### `feed.feed_post_images`

- `(post_id, sort_order)`

Why:

- page assembly loads images by `post_id`
- images must already be returned in stable display order

### `feed.feed_post_paws`

- unique `(post_id, user_id)` already supports exact existence checks
- added `(user_id, post_id)` for viewer-specific `post_id in (...)` lookups

Why:

- count and existence do not have the same access pattern
- the viewer-specific query benefits from `user_id` as the leading column

### `feed.feed_post_hashtags`

- `(post_id)`

Why:

- page assembly joins hashtags by the current post slice

## Current Limitations

The current query strategy is strong for a chronological feed, but a few limits remain:

- ranking signals are not yet part of the cursor contract
- ads are not server-driven
- recommendation candidates are not mixed into the backend result yet
- image delivery still depends on the quality of uploaded assets

These are acceptable at the current stage because the query boundary is clean:

- chronological slice first
- page-bounded batch assembly second

That boundary is the main thing worth preserving during future expansion.
