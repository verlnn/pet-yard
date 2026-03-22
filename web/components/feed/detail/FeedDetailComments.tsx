"use client";

interface FeedDetailCommentsProps {
  className?: string;
}

export function FeedDetailComments({ className }: FeedDetailCommentsProps) {
  return (
    <div className={["feed-detail-comments-panel", className].filter(Boolean).join(" ")}>
      <div className="feed-detail-comments">
        <p className="feed-detail-comments-title">댓글</p>
        <div className="feed-detail-comments-empty">
          <p className="feed-detail-comments-empty-title">아직 댓글이 없습니다.</p>
          <p className="feed-detail-comments-empty-description">댓글을 남겨보세요.</p>
        </div>
      </div>
    </div>
  );
}
