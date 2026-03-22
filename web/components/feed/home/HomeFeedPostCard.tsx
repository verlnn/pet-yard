"use client";

import { Heart, MessageCircle, MoreHorizontal, Send, Bookmark } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

interface HomeFeedPostCardProps {
  post: HomeFeedPost;
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

export function HomeFeedPostCard({ post, eagerImage = false }: HomeFeedPostCardProps) {
  const hashtags = post.hashtags ?? [];
  const imageUrl = post.thumbnailImageUrl ?? post.imageUrls?.[0] ?? null;

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
        <button type="button" className="home-feed-post-menu" aria-label="더보기">
          <MoreHorizontal className="home-feed-post-menu-icon" />
        </button>
      </header>

      {imageUrl ? (
        <div className="home-feed-post-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={post.content ?? `${post.authorNickname}의 게시물`}
            className="home-feed-post-image"
            loading={eagerImage ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      ) : null}

      <div className="home-feed-post-actions">
        <div className="home-feed-post-actions-left">
          <button type="button" className="home-feed-post-action-button" aria-label="좋아요">
            <Heart className="home-feed-post-action-icon" />
          </button>
          <button type="button" className="home-feed-post-action-button" aria-label="댓글">
            <MessageCircle className="home-feed-post-action-icon" />
          </button>
          <button type="button" className="home-feed-post-action-button" aria-label="공유">
            <Send className="home-feed-post-action-icon" />
          </button>
        </div>
        <button type="button" className="home-feed-post-action-button" aria-label="저장">
          <Bookmark className="home-feed-post-action-icon" />
        </button>
      </div>

      <div className="home-feed-post-body">
        <p className="home-feed-post-paws">발자국 {post.pawCount.toLocaleString("ko-KR")}개</p>
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
}
