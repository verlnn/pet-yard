"use client";

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
                <span className="feed-detail-comment-author">{comment.authorNickname}</span>
                <span className="feed-detail-comment-content">{comment.content}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
