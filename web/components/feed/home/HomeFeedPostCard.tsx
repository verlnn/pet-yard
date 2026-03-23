"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { MessageCircle, MoreHorizontal, PawPrint, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppAlertDialog } from "@/components/ui/AppAlertDialog";
import { authApi } from "@/src/features/auth/api/authApi";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";
import {
  getHomeFeedImageLoadingStrategy,
  getPreferredHomeFeedImageUrl,
  resolveHomeFeedAspectRatio
} from "@/components/feed/home/homeFeedImage";
import { buildProfileRoute } from "@/src/lib/routes";

interface HomeFeedPostCardProps {
  post: HomeFeedPost;
  accessToken: string;
  viewerUserId: number | null;
  eagerImage?: boolean;
  onOpenComments: (post: HomeFeedPost) => void;
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
  eagerImage = false,
  onOpenComments
}: HomeFeedPostCardProps) {
  const hashtags = post.hashtags ?? [];
  const imageUrl = getPreferredHomeFeedImageUrl(post);
  const mediaStyle = imageUrl ? { aspectRatio: resolveHomeFeedAspectRatio(post) } : undefined;
  const imageLoadingStrategy = getHomeFeedImageLoadingStrategy(eagerImage);

  const [pawedByMe, setPawedByMe] = useState(post.pawedByMe);
  const [pawCount, setPawCount] = useState(post.pawCount);
  const [pawLoading, setPawLoading] = useState(false);
  const [guardianRegisteredByMe, setGuardianRegisteredByMe] = useState(post.guardianRegisteredByMe);
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [guardianUnregisterAlertOpen, setGuardianUnregisterAlertOpen] = useState(false);

  useEffect(() => {
    setPawedByMe(post.pawedByMe);
    setPawCount(post.pawCount);
    setGuardianRegisteredByMe(post.guardianRegisteredByMe);
  }, [post]);

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
    } finally {
      setPawLoading(false);
    }
  };

  const updateGuardianRegistration = async (nextRegistered: boolean) => {
    if (guardianLoading) {
      return;
    }
    setGuardianLoading(true);
    try {
      const response = nextRegistered
        ? await authApi.registerGuardian(accessToken, post.authorId)
        : await authApi.unregisterGuardian(accessToken, post.authorId);
      setGuardianRegisteredByMe(response.guardianRegisteredByMe);
    } finally {
      setGuardianLoading(false);
    }
  };

  const handleGuardianButtonClick = async () => {
    if (guardianRegisteredByMe) {
      setGuardianUnregisterAlertOpen(true);
      return;
    }
    await updateGuardianRegistration(true);
  };

  const handleConfirmGuardianUnregister = async () => {
    await updateGuardianRegistration(false);
    setGuardianUnregisterAlertOpen(false);
  };

  const shouldShowGuardianButton = viewerUserId !== null && viewerUserId !== post.authorId;
  const authorProfileHref = buildProfileRoute(post.authorUsername);

  return (
    <article className="home-feed-post-card">
      <AppAlertDialog
        open={guardianUnregisterAlertOpen}
        title={`@${post.authorNickname}님의 집사 등록을 해제하시겠어요?`}
        visual={(
          <Avatar className="size-16 border-0 bg-[#f25d95] p-1.5 text-white">
            {post.authorProfileImageUrl ? (
              <AvatarImage src={post.authorProfileImageUrl} alt={post.authorNickname} />
            ) : (
              <AvatarFallback className="bg-[#f25d95] text-sm font-semibold text-white">
                {post.authorNickname[0] ?? "멍"}
              </AvatarFallback>
            )}
          </Avatar>
        )}
        actionsClassName="app-alert-dialog-actions-vertical"
        actions={[
          { label: "집사 해제", onClick: handleConfirmGuardianUnregister, tone: "danger" },
          { label: "취소", onClick: () => setGuardianUnregisterAlertOpen(false) }
        ]}
        onClose={() => setGuardianUnregisterAlertOpen(false)}
      />
      <header className="home-feed-post-header">
        <Link href={authorProfileHref} className="home-feed-post-author">
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
        </Link>
        <div className="home-feed-post-header-actions">
          {shouldShowGuardianButton ? (
            <button
              type="button"
              className={`home-feed-post-guardian-button ${guardianRegisteredByMe ? "home-feed-post-guardian-button-active" : ""}`}
              onClick={handleGuardianButtonClick}
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
            <PawPrint className={`home-feed-post-action-icon ${pawedByMe ? "home-feed-post-action-icon-active" : ""}`} />
          </button>
          <button
            type="button"
            className="home-feed-post-action-button"
            aria-label="댓글"
            onClick={() =>
              onOpenComments({
                ...post,
                pawedByMe,
                pawCount,
                guardianRegisteredByMe
              })
            }
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
        {post.commentCount > 0 ? (
          <button
            type="button"
            className="home-feed-post-comment-count"
            onClick={() =>
              onOpenComments({
                ...post,
                pawedByMe,
                pawCount,
                guardianRegisteredByMe
              })
            }
          >
            댓글 {post.commentCount.toLocaleString("ko-KR")}개 모두 보기
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
      </div>
    </article>
  );
});
