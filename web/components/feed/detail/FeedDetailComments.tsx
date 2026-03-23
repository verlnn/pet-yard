"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FeedPostComment } from "@/src/features/auth/types/authTypes";

interface FeedDetailCommentsProps {
  className?: string;
  comments?: FeedPostComment[];
  loading?: boolean;
  errorMessage?: string | null;
}

export function FeedDetailComments({
  className,
  comments = [],
  loading = false,
  errorMessage = null
}: FeedDetailCommentsProps) {
  return (
    <div className={["feed-detail-comments-panel", className].filter(Boolean).join(" ")}>
      <div className="feed-detail-comments">
        <p className="feed-detail-comments-title">댓글</p>
        {loading ? <p className="feed-detail-comments-status">댓글을 불러오는 중입니다.</p> : null}
        {errorMessage ? <p className="feed-detail-comments-status">{errorMessage}</p> : null}
        {!loading && !errorMessage && comments.length > 0 ? (
          <div className="feed-detail-comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="feed-detail-comment-item">
                <div className="feed-detail-comment-avatar-shell">
                  <Avatar className="feed-detail-comment-avatar">
                    {comment.authorProfileImageUrl ? (
                      <AvatarImage src={comment.authorProfileImageUrl} alt={comment.authorUsername ?? comment.authorNickname} />
                    ) : null}
                    <AvatarFallback>{(comment.authorUsername ?? comment.authorNickname ?? "멍")[0] ?? "멍"}</AvatarFallback>
                  </Avatar>
                  {comment.authorPrimaryPetImageUrl ? (
                    <span className="feed-detail-comment-pet-badge" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={comment.authorPrimaryPetImageUrl} alt="" className="feed-detail-comment-pet-badge-image" />
                    </span>
                  ) : null}
                </div>
                <div className="feed-detail-comment-body">
                  <p className="feed-detail-comment-line">
                    <span className="feed-detail-comment-username">{comment.authorUsername ?? comment.authorNickname}</span>
                    <span className="feed-detail-comment-content">{comment.content}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
