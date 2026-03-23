"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, PawPrint, Send } from "lucide-react";

interface FeedDetailActionBarProps {
  createdAt: string;
  pawCount: number;
  pawedByMe: boolean;
  onTogglePaw: () => void;
  pawLoading?: boolean;
  commentValue?: string;
  onCommentValueChange?: (value: string) => void;
  onCommentSubmit?: () => void;
  commentSubmitting?: boolean;
  onCommentButtonClick?: () => void;
  focusCommentToken?: number;
  commentPlaceholder?: string;
  replyTargetUsername?: string | null;
  onCancelReply?: () => void;
}

export function FeedDetailActionBar({
  createdAt,
  pawCount,
  pawedByMe,
  onTogglePaw,
  pawLoading = false,
  commentValue = "",
  onCommentValueChange,
  onCommentSubmit,
  commentSubmitting = false,
  onCommentButtonClick,
  focusCommentToken = 0,
  commentPlaceholder = "댓글을 남겨보세요.",
  replyTargetUsername,
  onCancelReply
}: FeedDetailActionBarProps) {
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!focusCommentToken) {
      return;
    }
    requestAnimationFrame(() => commentInputRef.current?.focus());
  }, [focusCommentToken]);

  return (
    <div className="feed-detail-action-bar">
      <div className="feed-detail-action-content">
        <div className="feed-detail-action-row">
          <button
            type="button"
            className={`feed-detail-action-button ${pawedByMe ? "feed-detail-action-button-active" : ""}`}
            aria-label="발자국 남기기"
            onClick={onTogglePaw}
            disabled={pawLoading}
          >
            <PawPrint className={`feed-detail-paw-icon ${pawedByMe ? "feed-detail-paw-icon-active" : ""}`} />
          </button>
          <button
            type="button"
            className="feed-detail-action-button"
            aria-label="댓글 보기"
            onClick={() => {
              onCommentButtonClick?.();
              commentInputRef.current?.focus();
            }}
          >
            <MessageCircle className="feed-detail-action-icon" />
          </button>
          <button
            type="button"
            className="feed-detail-action-button"
            aria-label="공유하기"
          >
            <Send className="feed-detail-action-icon" />
          </button>
        </div>
        <div>
          <p className="feed-detail-action-count">발자국 {pawCount}개</p>
          <p className="feed-detail-action-date">
            {new Date(createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
      <div className="feed-detail-comment-composer">
        {replyTargetUsername ? (
          <div className="feed-detail-comment-reply-target">
            <span className="feed-detail-comment-reply-label">{replyTargetUsername}님께 답글 남기는 중</span>
            <button type="button" className="feed-detail-comment-reply-cancel" onClick={onCancelReply}>
              취소
            </button>
          </div>
        ) : null}
        <div className="feed-detail-comment-composer-inner">
          <MessageCircle className="feed-detail-comment-icon" />
          <input
            ref={commentInputRef}
            type="text"
            value={commentValue}
            onChange={(event) => onCommentValueChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onCommentSubmit?.();
              }
            }}
            placeholder={commentPlaceholder}
            className="feed-detail-comment-input"
          />
          <button
            type="button"
            className="feed-detail-comment-submit"
            onClick={onCommentSubmit}
            disabled={commentSubmitting || commentValue.trim().length === 0}
          >
            {commentSubmitting ? "등록 중" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
