"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageCircleMore } from "lucide-react";

import { HomeFeedAdCard } from "@/components/feed/home/HomeFeedAdCard";
import { HomeFeedPostCard } from "@/components/feed/home/HomeFeedPostCard";
import { HomeFeedSidebar } from "@/components/feed/home/HomeFeedSidebar";
import { HomeFeedStories } from "@/components/feed/home/HomeFeedStories";
import { buildHomeFeedItems } from "@/components/feed/home/homeFeedData";
import { authApi } from "@/src/features/auth/api/authApi";
import {
  buildHomeFeedQueryKey,
  getHomeFeedNextPageParam,
  HOME_FEED_FETCH_AHEAD_ROOT_MARGIN,
  HOME_FEED_QUERY_GC_TIME,
  HOME_FEED_QUERY_STALE_TIME,
  MAX_HOME_FEED_PAGES_IN_MEMORY,
  shouldRequestNextHomeFeedPage,
  type HomeFeedPageParam
} from "./homeFeedQuery";
import { consoleFeedDebugLogger, createFeedRenderTimer } from "./feedObservability";
import { loadHomeFeedScrollState, saveHomeFeedScrollState } from "./homeFeedScrollState";

export function FeedClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const fetchLockRef = useRef(false);
  const hasNextPageRef = useRef(false);
  const isFetchingNextPageRef = useRef(false);
  const firstPageTimerRef = useRef<ReturnType<typeof createFeedRenderTimer> | null>(null);
  const hasRestoredScrollRef = useRef(false);
  const nextPageRequestCountRef = useRef(0);
  const blockedFetchAttemptCountRef = useRef(0);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: buildHomeFeedQueryKey(accessToken),
    enabled: Boolean(accessToken),
    initialPageParam: null as HomeFeedPageParam,
    queryFn: ({ pageParam }) => {
      if (!pageParam) {
        firstPageTimerRef.current = createFeedRenderTimer();
      } else {
        nextPageRequestCountRef.current += 1;
        consoleFeedDebugLogger.log("home-feed-next-page-request", {
          requestCount: nextPageRequestCountRef.current,
          cursorCreatedAt: pageParam.createdAt,
          cursorId: pageParam.id
        });
      }
      return authApi.getHomeFeed(accessToken as string, {
        cursorCreatedAt: pageParam?.createdAt ?? null,
        cursorId: pageParam?.id ?? null
      });
    },
    getNextPageParam: getHomeFeedNextPageParam,
    staleTime: HOME_FEED_QUERY_STALE_TIME,
    gcTime: HOME_FEED_QUERY_GC_TIME,
    retry: 1,
    maxPages: MAX_HOME_FEED_PAGES_IN_MEMORY
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );
  // Defer the mixed feed list so a just-fetched page does not block interactions
  // such as scrolling or opening overlays while large image cards reconcile.
  const deferredPosts = useDeferredValue(posts);
  const feedItems = useMemo(() => buildHomeFeedItems(deferredPosts), [deferredPosts]);
  const isEmptyFeed = !isLoading && deferredPosts.length === 0;

  useEffect(() => {
    hasNextPageRef.current = Boolean(hasNextPage);
    isFetchingNextPageRef.current = isFetchingNextPage;
    if (!isFetchingNextPage) {
      fetchLockRef.current = false;
    }
  }, [hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    hasRestoredScrollRef.current = false;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const persistScrollState = () => {
      saveHomeFeedScrollState(accessToken, {
        scrollY: window.scrollY,
        savedAt: Date.now()
      });
    };

    window.addEventListener("scroll", persistScrollState, { passive: true });
    return () => {
      persistScrollState();
      window.removeEventListener("scroll", persistScrollState);
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || isLoading || hasRestoredScrollRef.current) {
      return;
    }
    hasRestoredScrollRef.current = true;

    const previousScrollState = loadHomeFeedScrollState(accessToken);
    if (!previousScrollState) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: previousScrollState.scrollY, behavior: "auto" });
      consoleFeedDebugLogger.log("home-feed-scroll-restored", {
        scrollY: previousScrollState.scrollY,
        savedAt: previousScrollState.savedAt
      });
    });
  }, [accessToken, isLoading, posts.length]);

  useEffect(() => {
    if (isLoading || posts.length === 0 || !firstPageTimerRef.current) {
      return;
    }

    firstPageTimerRef.current.complete("home-feed-first-page-rendered", consoleFeedDebugLogger, {
      itemCount: posts.length
    });
    firstPageTimerRef.current = null;
  }, [isLoading, posts.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const shouldRequestNextPage = shouldRequestNextHomeFeedPage({
          isIntersecting: Boolean(entry?.isIntersecting),
          hasNextPage: hasNextPageRef.current,
          isFetchingNextPage: isFetchingNextPageRef.current,
          isFetchLocked: fetchLockRef.current
        });
        if (!shouldRequestNextPage) {
          if (entry?.isIntersecting) {
            blockedFetchAttemptCountRef.current += 1;
            consoleFeedDebugLogger.log("home-feed-next-page-skipped", {
              blockedAttempts: blockedFetchAttemptCountRef.current,
              hasNextPage: hasNextPageRef.current,
              isFetchingNextPage: isFetchingNextPageRef.current,
              isFetchLocked: fetchLockRef.current
            });
          }
          return;
        }

        fetchLockRef.current = true;
        void fetchNextPage().finally(() => {
          fetchLockRef.current = false;
        });
      },
      {
        root: null,
        rootMargin: HOME_FEED_FETCH_AHEAD_ROOT_MARGIN,
        threshold: 0
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage]);

  if (!accessToken) {
    return (
      <section className="home-feed-shell">
        <div className="home-feed-status-card">로그인이 필요합니다.</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="home-feed-shell">
        <div className="home-feed-status-card">
          {error instanceof Error ? error.message : "홈 피드를 불러오지 못했습니다."}
        </div>
      </section>
    );
  }

  return (
    <section className="home-feed-shell">
      <div className="home-feed-layout">
        <main className="home-feed-main">
          <HomeFeedStories posts={posts} />

          <div className="home-feed-stream">
            {isEmptyFeed ? (
              <article className="home-feed-empty-card">
                <div className="home-feed-empty-copy">
                  <p className="home-feed-empty-eyebrow">HOME</p>
                  <h2 className="home-feed-empty-title">아직 홈 피드에 표시할 게시물이 없어요.</h2>
                  <p className="home-feed-empty-description">
                    첫 게시물이 등록되면 이 영역에 최신순으로 쌓입니다. 지금은 살펴볼 수 있는 광고 피드와
                    추천 영역을 먼저 보여드리고 있어요.
                  </p>
                </div>
              </article>
            ) : null}

            {feedItems.map((item, index) =>
              item.type === "post" ? (
                <HomeFeedPostCard
                  key={item.id}
                  post={item.post}
                  eagerImage={index < 2}
                />
              ) : (
                <HomeFeedAdCard key={item.id} ad={item.ad} position={index} />
              )
            )}

            {isLoading ? (
              <>
                <div className="home-feed-skeleton-card" />
                <div className="home-feed-skeleton-card" />
              </>
            ) : null}

            <div ref={loadMoreRef} className="home-feed-load-more-sentinel" aria-hidden="true" />

            {isFetchingNextPage ? (
              <div className="home-feed-loading-indicator">게시물을 더 불러오는 중...</div>
            ) : null}
          </div>
        </main>

        <HomeFeedSidebar posts={posts} />
      </div>

      <button type="button" className="home-feed-messages-bubble">
        <MessageCircleMore className="home-feed-messages-bubble-icon" />
        메시지
      </button>
    </section>
  );
}
