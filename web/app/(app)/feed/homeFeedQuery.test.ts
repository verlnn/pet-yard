import { describe, expect, it } from "vitest";

import type { HomeFeedPage } from "@/src/features/auth/types/authTypes";

import {
  buildHomeFeedQueryKey,
  getHomeFeedNextPageParam,
  HOME_FEED_FETCH_AHEAD_ROOT_MARGIN,
  HOME_FEED_QUERY_GC_TIME,
  HOME_FEED_QUERY_STALE_TIME,
  MAX_HOME_FEED_PAGES_IN_MEMORY,
  shouldRequestNextHomeFeedPage
} from "./homeFeedQuery";

describe("homeFeedQuery", () => {
  it("keeps the cache key separated per viewer token", () => {
    expect(buildHomeFeedQueryKey("token-a")).toEqual(["home-feed", "token-a"]);
    expect(buildHomeFeedQueryKey("token-b")).toEqual(["home-feed", "token-b"]);
  });

  it("returns nextCursor when the API says more pages exist", () => {
    const page: HomeFeedPage = {
      items: [],
      nextCursor: { createdAt: "2026-03-23T00:00:00Z", id: 11 },
      hasMore: true
    };

    expect(getHomeFeedNextPageParam(page)).toEqual(page.nextCursor);
  });

  it("stops pagination when hasMore is false", () => {
    expect(
      getHomeFeedNextPageParam({
        items: [],
        nextCursor: { createdAt: "2026-03-23T00:00:00Z", id: 11 },
        hasMore: false
      })
    ).toBeUndefined();
  });

  it("allows the observer to fetch only when all guard conditions pass", () => {
    expect(
      shouldRequestNextHomeFeedPage({
        isIntersecting: true,
        hasNextPage: true,
        isFetchingNextPage: false,
        isFetchLocked: false
      })
    ).toBe(true);

    expect(
      shouldRequestNextHomeFeedPage({
        isIntersecting: true,
        hasNextPage: false,
        isFetchingNextPage: false,
        isFetchLocked: false
      })
    ).toBe(false);

    expect(
      shouldRequestNextHomeFeedPage({
        isIntersecting: true,
        hasNextPage: true,
        isFetchingNextPage: true,
        isFetchLocked: false
      })
    ).toBe(false);

    expect(
      shouldRequestNextHomeFeedPage({
        isIntersecting: true,
        hasNextPage: true,
        isFetchingNextPage: false,
        isFetchLocked: true
      })
    ).toBe(false);
  });

  it("exports the documented query tuning constants", () => {
    expect(HOME_FEED_QUERY_STALE_TIME).toBe(30_000);
    expect(HOME_FEED_QUERY_GC_TIME).toBe(300_000);
    expect(MAX_HOME_FEED_PAGES_IN_MEMORY).toBe(6);
    expect(HOME_FEED_FETCH_AHEAD_ROOT_MARGIN).toBe("1200px 0px");
  });
});
