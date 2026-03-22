# Feed Observability

## Current State

The home feed now has minimal application-level observability on both backend and frontend without adding heavy metric infrastructure.

This iteration intentionally focuses on:

- structured timing logs on the backend
- debug-only timing and fetch diagnostics on the frontend
- an explicit list of operational metrics we should watch

## Changes in This Iteration

### Backend timing logs

`FeedApplicationService.listHomeFeed(...)` now emits a structured timing log for each home feed request.

Current fields:

- `userId`
- `pageSize`
- `hasCursor`
- `itemCount`
- `hasMore`
- `postQueryMs`
- `relatedQueryMs`
- `assemblyMs`
- `totalMs`

The measured phases are:

1. post slice query
2. related batch lookup queries
3. DTO assembly

This is intentionally lightweight. It does not require a full metrics platform to be useful during local debugging or initial production triage.

### Frontend debug instrumentation

The feed client now exposes debug-only instrumentation behind the `feed:debug=true` local storage flag or `NEXT_PUBLIC_FEED_DEBUG=true`.

Current frontend debug events:

- first page rendered
- next-page request started
- next-page fetch skipped because observer guards blocked it
- saved scroll restored on re-entry

This avoids noisy production console output while still making development-time diagnosis easier.

## Metrics Worth Watching

### Backend

- `/api/feeds` latency p50 / p95 / p99
- average SQL count per page
- post slice query time
- related batch lookup time
- DTO assembly time

### Frontend

- first page request to first render time
- next-page request count per session
- skipped next-page attempts due to observer guards
- image load failure count
- feed re-entry scroll restore success rate

### Ad-related

- impression count
- click count
- click-through rate

Ad transport is still client-side fallback today, so these values are not yet sent to a real analytics backend.

## What Is Implemented vs. Deferred

Implemented now:

- backend timing logs
- frontend debug-only diagnostics

Deferred for later infrastructure work:

- centralized metrics aggregation
- dashboard-level p95/p99 tracking
- distributed tracing
- log shipping / correlation IDs
- image failure telemetry collection
- persisted ad analytics pipeline

## Remaining Limits

- backend timings are log-based, not yet exported as metrics
- frontend timings are debug-only, not persisted
- no end-to-end tracing exists between browser requests and backend feed assembly

## Next Improvements

Recommended next steps:

1. export backend timing values to the project’s eventual metrics backend
2. attach a request correlation id from controller to service logs
3. record image loading failures in a lightweight client event buffer
4. connect ad impression and click events to a real analytics sink
