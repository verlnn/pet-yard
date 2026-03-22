"use client";

import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedDetailPostBodyProps {
  post: FeedPost;
}

export function FeedDetailPostBody({ post }: FeedDetailPostBodyProps) {
  return (
    <div className="feed-detail-post-body">
      <div>
        <p className="feed-detail-section-label">작성일</p>
        <p className="feed-detail-section-value">
          {new Date(post.createdAt).toLocaleString("ko-KR")}
        </p>
      </div>
      <div>
        <p className="feed-detail-section-label">내용</p>
        <p className="feed-detail-content-text">
          {post.content || "작성된 내용이 없습니다."}
        </p>
      </div>
      {post.hashtags && post.hashtags.length > 0 && (
        <div>
          <p className="feed-detail-section-label">해시태그</p>
          <p className="feed-detail-hashtag-list">
            {post.hashtags.map((tag) => (
              <span key={tag} className="feed-detail-hashtag-chip">
                #{tag}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
