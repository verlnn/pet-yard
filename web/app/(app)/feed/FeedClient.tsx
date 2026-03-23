"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleMore, X } from "lucide-react";

import { FeedDetailPhotoPanel } from "@/components/feed/detail/FeedDetailPhotoPanel";
import { FeedDetailSidebar } from "@/components/feed/detail/FeedDetailSidebar";
import { getBoxSize, getTargetRatio } from "@/components/feed/imageSizing";
import { HomeFeedAdCard } from "@/components/feed/home/HomeFeedAdCard";
import { HomeFeedPostCard } from "@/components/feed/home/HomeFeedPostCard";
import { HomeFeedSidebar } from "@/components/feed/home/HomeFeedSidebar";
import { HomeFeedStories } from "@/components/feed/home/HomeFeedStories";
import { buildHomeFeedItems } from "@/components/feed/home/homeFeedData";
import { authApi } from "@/src/features/auth/api/authApi";
import type { FeedPostComment, HomeFeedPost } from "@/src/features/auth/types/authTypes";
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

const FEED_DETAIL_SHELL_TRANSITION = {
  duration: 0.4,
  ease: [0.22, 1.5, 0.36, 1] as const
};

export function FeedClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [viewerUserId, setViewerUserId] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [selectedPost, setSelectedPost] = useState<HomeFeedPost | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<FeedPostComment[]>([]);
  const [selectedPostCommentsLoading, setSelectedPostCommentsLoading] = useState(false);
  const [selectedPostCommentsError, setSelectedPostCommentsError] = useState<string | null>(null);
  const [selectedPostCommentValue, setSelectedPostCommentValue] = useState("");
  const [selectedPostCommentSubmitting, setSelectedPostCommentSubmitting] = useState(false);
  const [selectedReplyTargetComment, setSelectedReplyTargetComment] = useState<FeedPostComment | null>(null);
  const [selectedCommentPawLoadingId, setSelectedCommentPawLoadingId] = useState<number | null>(null);
  const [selectedPostPawLoading, setSelectedPostPawLoading] = useState(false);
  const [commentFocusToken, setCommentFocusToken] = useState(0);
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

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setViewerUserId(null);
      return;
    }

    let cancelled = false;
    void authApi.me(accessToken)
      .then((meResponse) => {
        if (!cancelled) {
          setViewerUserId(meResponse.userId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewerUserId(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

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
  const selectedPostPhotoSize = useMemo(() => {
    if (!selectedPost || !viewportSize.width || !viewportSize.height) {
      return { width: 0, height: 0 };
    }

    const targetRatio = getTargetRatio({
      aspectRatio: selectedPost.imageAspectRatio,
      aspectRatioValue: selectedPost.imageAspectRatioValue
    });
    const modalMaxHeight = Math.min(viewportSize.height * 0.88, 820);
    const sidebarWidth = 360;
    const modalMaxWidth = Math.min(viewportSize.width - 32, 1280);
    const photoMaxWidth = Math.max(280, modalMaxWidth - sidebarWidth);
    const isWideLandscape = selectedPost.imageAspectRatio === "16:9";

    if (isWideLandscape) {
      return {
        width: photoMaxWidth,
        height: modalMaxHeight
      };
    }

    return getBoxSize({
      containerWidth: photoMaxWidth,
      containerHeight: modalMaxHeight,
      targetRatio
    });
  }, [selectedPost, viewportSize]);
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

  useEffect(() => {
    if (!selectedPost) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost]);

  const loadSelectedPostComments = async (postId: number) => {
    if (!accessToken) {
      return;
    }
    setSelectedPostCommentsLoading(true);
    setSelectedPostCommentsError(null);
    try {
      const response = await authApi.getFeedPostComments(accessToken, postId);
      setSelectedPostComments(response);
    } catch (error) {
      setSelectedPostCommentsError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
    } finally {
      setSelectedPostCommentsLoading(false);
    }
  };

  const handleOpenComments = (post: HomeFeedPost) => {
    setSelectedPost(post);
    setSelectedPostComments([]);
    setSelectedPostCommentsError(null);
    setSelectedPostCommentValue("");
    setSelectedReplyTargetComment(null);
    setCommentFocusToken((previous) => previous + 1);
    void loadSelectedPostComments(post.id);
  };

  const handleToggleSelectedPostPaw = async () => {
    if (!selectedPost || !accessToken || selectedPostPawLoading) {
      return;
    }
    setSelectedPostPawLoading(true);
    try {
      const response = selectedPost.pawedByMe
        ? await authApi.removeFeedPostPaw(accessToken, selectedPost.id)
        : await authApi.addFeedPostPaw(accessToken, selectedPost.id);
      setSelectedPost((previous) => previous ? {
        ...previous,
        pawCount: response.pawCount,
        pawedByMe: response.pawedByMe
      } : previous);
    } finally {
      setSelectedPostPawLoading(false);
    }
  };

  const handleSubmitSelectedPostComment = async () => {
    if (!selectedPost || !accessToken || selectedPostCommentSubmitting) {
      return;
    }
    const trimmed = selectedPostCommentValue.trim();
    if (!trimmed) {
      return;
    }
    setSelectedPostCommentSubmitting(true);
    setSelectedPostCommentsError(null);
    try {
      const created = await authApi.addFeedPostComment(
        accessToken,
        selectedPost.id,
        trimmed,
        selectedReplyTargetComment?.id ?? null
      );
      setSelectedPostComments((previous) => [...previous, created]);
      setSelectedPost((previous) => previous ? {
        ...previous,
        commentCount: previous.commentCount + 1
      } : previous);
      setSelectedPostCommentValue("");
      setSelectedReplyTargetComment(null);
      setCommentFocusToken((previous) => previous + 1);
    } catch (error) {
      setSelectedPostCommentsError(error instanceof Error ? error.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setSelectedPostCommentSubmitting(false);
    }
  };

  const handleReplyToSelectedComment = (comment: FeedPostComment) => {
    setSelectedReplyTargetComment(comment);
    setCommentFocusToken((previous) => previous + 1);
  };

  const handleToggleSelectedCommentPaw = async (comment: FeedPostComment) => {
    if (!accessToken || selectedCommentPawLoadingId === comment.id) {
      return;
    }
    setSelectedCommentPawLoadingId(comment.id);
    setSelectedPostCommentsError(null);
    try {
      const response = comment.pawedByMe
        ? await authApi.removeFeedCommentPaw(accessToken, comment.id)
        : await authApi.addFeedCommentPaw(accessToken, comment.id);
      setSelectedPostComments((previous) => previous.map((item) => (item.id === response.id ? response : item)));
    } catch (error) {
      setSelectedPostCommentsError(error instanceof Error ? error.message : "댓글 발자국 처리에 실패했습니다.");
    } finally {
      setSelectedCommentPawLoadingId(null);
    }
  };

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
                  accessToken={accessToken}
                  viewerUserId={viewerUserId}
                  eagerImage={index < 2}
                  onOpenComments={handleOpenComments}
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

      <AnimatePresence>
        {selectedPost ? (
          <motion.div
            className="feed-detail-overlay"
            onClick={() => setSelectedPost(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="feed-detail-shell"
              onClick={(event) => event.stopPropagation()}
              initial={{
                opacity: 0,
                scale: 0.7,
                y: -20
              }}
              animate={{
                opacity: 1,
                scale: [0.7, 1.1, 0.95, 1],
                y: [-20, 0]
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 10
              }}
              transition={FEED_DETAIL_SHELL_TRANSITION}
            >
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="feed-detail-close-button"
                aria-label="피드 상세 닫기"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="feed-detail-content">
                <FeedDetailPhotoPanel
                  post={selectedPost}
                  width={selectedPostPhotoSize.width || 480}
                  height={selectedPostPhotoSize.height || 480}
                />
                <FeedDetailSidebar
                  post={selectedPost}
                  maxHeight={selectedPostPhotoSize.height || 480}
                  onTogglePaw={handleToggleSelectedPostPaw}
                  pawLoading={selectedPostPawLoading}
                  comments={selectedPostComments}
                  commentsLoading={selectedPostCommentsLoading}
                  commentsErrorMessage={selectedPostCommentsError}
                  commentValue={selectedPostCommentValue}
                  onCommentValueChange={setSelectedPostCommentValue}
                  onCommentSubmit={handleSubmitSelectedPostComment}
                  commentSubmitting={selectedPostCommentSubmitting}
                  focusCommentToken={commentFocusToken}
                  replyTargetUsername={selectedReplyTargetComment?.authorUsername ?? selectedReplyTargetComment?.authorNickname ?? null}
                  onCancelReply={() => setSelectedReplyTargetComment(null)}
                  pawingCommentId={selectedCommentPawLoadingId}
                  onReplyComment={handleReplyToSelectedComment}
                  onToggleCommentPaw={handleToggleSelectedCommentPaw}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
