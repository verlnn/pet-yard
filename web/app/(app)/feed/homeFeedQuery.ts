import type { HomeFeedCursor, HomeFeedPage } from "@/src/features/auth/types/authTypes";

export const HOME_FEED_QUERY_STALE_TIME = 30_000;
export const HOME_FEED_QUERY_GC_TIME = 5 * 60_000;

// Keeping a bounded page window is an intentional trade-off:
// it caps memory growth during long sessions at the cost of refetching
// older pages when a user navigates away and comes back.
export const MAX_HOME_FEED_PAGES_IN_MEMORY = 6;
export const HOME_FEED_FETCH_AHEAD_ROOT_MARGIN = "1200px 0px";

export type HomeFeedPageParam = HomeFeedCursor | null;

export function buildHomeFeedQueryKey(accessToken: string | null) {
  return ["home-feed", accessToken ?? "anonymous"] as const;
}

export function getHomeFeedNextPageParam(lastPage: HomeFeedPage): HomeFeedPageParam | undefined {
  return lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined;
}

export function shouldRequestNextHomeFeedPage(options: {
  isIntersecting: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchLocked: boolean;
}) {
  return (
    options.isIntersecting &&
    options.hasNextPage &&
    !options.isFetchingNextPage &&
    !options.isFetchLocked
  );
}
