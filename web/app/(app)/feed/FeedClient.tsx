"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageCircleMore } from "lucide-react";

import { HomeFeedAdCard } from "@/components/feed/home/HomeFeedAdCard";
import { HomeFeedPostCard } from "@/components/feed/home/HomeFeedPostCard";
import { HomeFeedSidebar } from "@/components/feed/home/HomeFeedSidebar";
import { HomeFeedStories } from "@/components/feed/home/HomeFeedStories";
import { injectAds } from "@/components/feed/home/homeFeedData";
import { authApi } from "@/src/features/auth/api/authApi";

const FETCH_AHEAD_ROOT_MARGIN = "1200px 0px";
const MAX_PAGES_IN_MEMORY = 6;

export function FeedClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
    queryKey: ["home-feed"],
    enabled: Boolean(accessToken),
    initialPageParam: null as { createdAt: string; id: number } | null,
    queryFn: ({ pageParam }) =>
      authApi.getHomeFeed(accessToken as string, {
        cursorCreatedAt: pageParam?.createdAt ?? null,
        cursorId: pageParam?.id ?? null
      }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    maxPages: MAX_PAGES_IN_MEMORY
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );
  const deferredPosts = useDeferredValue(posts);
  const feedItems = useMemo(() => injectAds(deferredPosts), [deferredPosts]);
  const isEmptyFeed = !isLoading && deferredPosts.length === 0;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: FETCH_AHEAD_ROOT_MARGIN,
        threshold: 0
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
            {feedItems.map((item, index) =>
              item.type === "post" ? (
                <HomeFeedPostCard
                  key={item.id}
                  post={item.post}
                  eagerImage={index < 2}
                />
              ) : (
                <HomeFeedAdCard key={item.id} ad={item.ad} />
              )
            )}

            {isLoading ? (
              <>
                <div className="home-feed-skeleton-card" />
                <div className="home-feed-skeleton-card" />
              </>
            ) : null}

            {isEmptyFeed ? (
              <article className="home-feed-empty-card">
                <div className="home-feed-empty-copy">
                  <p className="home-feed-empty-eyebrow">HOME</p>
                  <h2 className="home-feed-empty-title">아직 홈 피드에 표시할 게시물이 없어요.</h2>
                  <p className="home-feed-empty-description">
                    첫 게시물이 등록되면 이 영역에 최신순으로 쌓입니다. 지금은 스토리와 추천 영역만 먼저
                    준비된 상태예요.
                  </p>
                </div>
              </article>
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
