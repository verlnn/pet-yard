"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, PawPrint, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  commenterUsername?: string | null;
  commenterProfileImageUrl?: string | null;
  commenterPrimaryPetImageUrl?: string | null;
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
  commentPlaceholder = "댓글 달기...",
  commenterUsername,
  commenterProfileImageUrl,
  commenterPrimaryPetImageUrl
}: FeedDetailActionBarProps) {
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const commentComposerUsername = commenterUsername?.trim() || "username";

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
        <div className="feed-detail-comment-composer-inner">
          <div className="feed-detail-comment-author-shell">
            <Avatar className="feed-detail-comment-avatar">
              {commenterProfileImageUrl ? (
                <AvatarImage src={commenterProfileImageUrl} alt={commentComposerUsername} />
              ) : (
                <AvatarFallback>{commentComposerUsername[0] ?? "멍"}</AvatarFallback>
              )}
            </Avatar>
            {commenterPrimaryPetImageUrl ? (
              <span className="feed-detail-comment-pet-badge" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={commenterPrimaryPetImageUrl} alt="" className="feed-detail-comment-pet-badge-image" />
              </span>
            ) : null}
          </div>
          <span className="feed-detail-comment-username">{commentComposerUsername}</span>
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
