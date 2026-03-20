"use client";

interface FeedDetailCommentsProps {
  className?: string;
}

export function FeedDetailComments({ className }: FeedDetailCommentsProps) {
  return (
    <div className={className}>
      <div className="feed-detail-comments">
        <p className="feed-detail-comments-title">댓글</p>
        <div className="feed-detail-comments-empty">
          아직 댓글이 없습니다.
        </div>
      </div>
    </div>
  );
}
