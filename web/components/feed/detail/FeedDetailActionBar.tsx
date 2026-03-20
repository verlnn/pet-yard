"use client";

import { useRef } from "react";
import { MessageCircle, PawPrint, Send } from "lucide-react";

interface FeedDetailActionBarProps {
  createdAt: string;
}

export function FeedDetailActionBar({ createdAt }: FeedDetailActionBarProps) {
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="feed-detail-action-bar">
      <div className="feed-detail-action-content">
        <div className="feed-detail-action-row">
          <button
            type="button"
            className="feed-detail-action-button"
            aria-label="발자국 남기기"
          >
            <PawPrint className="feed-detail-paw-icon" />
          </button>
          <button
            type="button"
            className="feed-detail-action-button"
            aria-label="댓글 보기"
            onClick={() => commentInputRef.current?.focus()}
          >
            <MessageCircle className="h-5 w-5 text-ink" />
          </button>
          <button
            type="button"
            className="feed-detail-action-button"
            aria-label="공유하기"
          >
            <Send className="h-5 w-5 text-ink" />
          </button>
        </div>
        <div>
          <p className="feed-detail-action-count">발자국 0개</p>
          <p className="feed-detail-action-date">
            {new Date(createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
      <div className="feed-detail-comment-composer">
        <div className="feed-detail-comment-composer-inner">
          <MessageCircle className="feed-detail-comment-icon" />
          <input
            ref={commentInputRef}
            type="text"
            placeholder="댓글을 남겨보세요."
            className="feed-detail-comment-input"
          />
          <button
            type="button"
            className="feed-detail-comment-submit"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
