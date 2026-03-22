"use client";

import { memo, useEffect, useRef, useState } from "react";
import { MessageCircle, MoreHorizontal, PawPrint, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/src/features/auth/api/authApi";
import type { FeedPostComment, HomeFeedPost } from "@/src/features/auth/types/authTypes";
import {
  getHomeFeedImageLoadingStrategy,
  getPreferredHomeFeedImageUrl,
  resolveHomeFeedAspectRatio
} from "@/components/feed/home/homeFeedImage";

interface HomeFeedPostCardProps {
  post: HomeFeedPost;
  accessToken: string;
  viewerUserId: number | null;
  eagerImage?: boolean;
}

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "";
  }

  const diffMs = target.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return formatter.format(diffDays, "day");
  }

  return target.toLocaleDateString("ko-KR");
};

export const HomeFeedPostCard = memo(function HomeFeedPostCard({
  post,
  accessToken,
  viewerUserId,
  eagerImage = false
}: HomeFeedPostCardProps) {
  const hashtags = post.hashtags ?? [];
  const imageUrl = getPreferredHomeFeedImageUrl(post);
  const mediaStyle = imageUrl ? { aspectRatio: resolveHomeFeedAspectRatio(post) } : undefined;
  const imageLoadingStrategy = getHomeFeedImageLoadingStrategy(eagerImage);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const [pawedByMe, setPawedByMe] = useState(post.pawedByMe);
  const [pawCount, setPawCount] = useState(post.pawCount);
  const [pawLoading, setPawLoading] = useState(false);
  const [guardianRegisteredByMe, setGuardianRegisteredByMe] = useState(post.guardianRegisteredByMe);
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentsOpen, setCommentsOpen] = useState(post.commentCount === 0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<FeedPostComment[]>([]);
  const [commentValue, setCommentValue] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    setPawedByMe(post.pawedByMe);
    setPawCount(post.pawCount);
    setGuardianRegisteredByMe(post.guardianRegisteredByMe);
    setCommentCount(post.commentCount);
    setComments([]);
    setCommentsLoaded(false);
    setCommentsLoading(false);
    setCommentsOpen(post.commentCount === 0);
    setCommentValue("");
    setCommentError(null);
  }, [post]);

  const loadComments = async (force = false) => {
    if ((!force && commentsLoaded) || commentsLoading) {
      return;
    }
    setCommentsLoading(true);
    setCommentError(null);
    try {
      const response = await authApi.getFeedPostComments(accessToken, post.id);
      setComments(response);
      setCommentsLoaded(true);
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleTogglePaw = async () => {
    if (pawLoading) {
      return;
    }
    setPawLoading(true);
    try {
      const response = pawedByMe
        ? await authApi.removeFeedPostPaw(accessToken, post.id)
        : await authApi.addFeedPostPaw(accessToken, post.id);
      setPawedByMe(response.pawedByMe);
      setPawCount(response.pawCount);
    } catch {
      // 서버 응답을 다시 로컬에서 복구하지 않아도 다음 새로고침에서 정합성을 맞춘다.
    } finally {
      setPawLoading(false);
    }
  };

  const handleToggleGuardian = async () => {
    if (guardianLoading) {
      return;
    }
    setGuardianLoading(true);
    try {
      const response = guardianRegisteredByMe
        ? await authApi.unregisterGuardian(accessToken, post.authorId)
        : await authApi.registerGuardian(accessToken, post.authorId);
      setGuardianRegisteredByMe(response.guardianRegisteredByMe);
    } catch {
      // 집사 등록 버튼은 서버 응답이 실패하면 기존 상태를 유지한다.
    } finally {
      setGuardianLoading(false);
    }
  };

  const handleOpenComments = async () => {
    setCommentsOpen(true);
    await loadComments();
    commentInputRef.current?.focus();
  };

  const handleSubmitComment = async () => {
    const trimmed = commentValue.trim();
    if (!trimmed || commentSubmitting) {
      return;
    }
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const created = await authApi.addFeedPostComment(accessToken, post.id, trimmed);
      setComments((previous) => [...previous, created]);
      setCommentsOpen(true);
      setCommentsLoaded(true);
      setCommentCount((previous) => previous + 1);
      setCommentValue("");
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const shouldShowGuardianButton = viewerUserId !== null && viewerUserId !== post.authorId;

  return (
    <article className="home-feed-post-card">
      <header className="home-feed-post-header">
        <div className="home-feed-post-author">
          <Avatar className="home-feed-post-avatar">
            {post.authorProfileImageUrl ? (
              <AvatarImage src={post.authorProfileImageUrl} alt={post.authorNickname} />
            ) : (
              <AvatarFallback>{post.authorNickname[0] ?? "멍"}</AvatarFallback>
            )}
          </Avatar>
          <div className="home-feed-post-author-copy">
            <p className="home-feed-post-author-name">{post.authorNickname}</p>
            <p className="home-feed-post-author-meta">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <div className="home-feed-post-header-actions">
          {shouldShowGuardianButton ? (
            <button
              type="button"
              className={`home-feed-post-guardian-button ${guardianRegisteredByMe ? "home-feed-post-guardian-button-active" : ""}`}
              onClick={handleToggleGuardian}
              disabled={guardianLoading}
            >
              {guardianRegisteredByMe ? "집사 해제" : "집사 등록"}
            </button>
          ) : null}
          <button type="button" className="home-feed-post-menu" aria-label="더보기">
            <MoreHorizontal className="home-feed-post-menu-icon" />
          </button>
        </div>
      </header>

      {imageUrl ? (
        <div className="home-feed-post-media" style={mediaStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={post.content ?? `${post.authorNickname}의 게시물`}
            className="home-feed-post-image"
            loading={imageLoadingStrategy.loading}
            decoding="async"
            fetchPriority={imageLoadingStrategy.fetchPriority}
          />
        </div>
      ) : null}

      <div className="home-feed-post-actions">
        <div className="home-feed-post-actions-left">
          <button
            type="button"
            className={`home-feed-post-action-button ${pawedByMe ? "home-feed-post-action-button-active" : ""}`}
            aria-label="발자국 남기기"
            onClick={handleTogglePaw}
            disabled={pawLoading}
          >
            <PawPrint className="home-feed-post-action-icon" />
          </button>
          <button
            type="button"
            className="home-feed-post-action-button"
            aria-label="댓글"
            onClick={() => void handleOpenComments()}
          >
            <MessageCircle className="home-feed-post-action-icon" />
          </button>
          <button type="button" className="home-feed-post-action-button" aria-label="공유">
            <Send className="home-feed-post-action-icon" />
          </button>
        </div>
      </div>

      <div className="home-feed-post-body">
        <p className="home-feed-post-paws">발자국 {pawCount.toLocaleString("ko-KR")}개</p>
        {commentCount > 0 ? (
          <button
            type="button"
            className="home-feed-post-comment-count"
            onClick={() => {
              if (commentsOpen) {
                setCommentsOpen(false);
                return;
              }
              void handleOpenComments();
            }}
          >
            댓글 {commentCount.toLocaleString("ko-KR")}개 {commentsOpen ? "접기" : "모두 보기"}
          </button>
        ) : null}
        {post.content ? (
          <p className="home-feed-post-content">
            <span className="home-feed-post-content-author">{post.authorNickname}</span> {post.content}
          </p>
        ) : null}
        {hashtags.length > 0 ? (
          <div className="home-feed-post-hashtags">
            {hashtags.map((tag) => (
              <span key={tag} className="home-feed-post-hashtag">#{tag}</span>
            ))}
          </div>
        ) : null}

        {commentsOpen ? (
          <div className="home-feed-post-comments">
            {commentsLoading ? (
              <p className="home-feed-post-comment-status">댓글을 불러오는 중입니다.</p>
            ) : comments.length > 0 ? (
              <div className="home-feed-post-comment-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="home-feed-post-comment-item">
                    <span className="home-feed-post-comment-author">{comment.authorNickname}</span>
                    <span className="home-feed-post-comment-content">{comment.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="home-feed-post-comment-status">첫 댓글을 남겨보세요.</p>
            )}

            <div className="home-feed-post-comment-composer">
              <input
                ref={commentInputRef}
                type="text"
                value={commentValue}
                onChange={(event) => setCommentValue(event.target.value)}
                onFocus={() => {
                  if (!commentsLoaded) {
                    void loadComments();
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void handleSubmitComment();
                  }
                }}
                maxLength={300}
                placeholder="댓글을 남겨보세요."
                className="home-feed-post-comment-input"
              />
              <button
                type="button"
                className="home-feed-post-comment-submit"
                onClick={() => void handleSubmitComment()}
                disabled={commentSubmitting || commentValue.trim().length === 0}
              >
                등록
              </button>
            </div>
            {commentError ? <p className="home-feed-post-comment-error">{commentError}</p> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
});
