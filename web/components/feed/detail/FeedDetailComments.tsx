"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, PawPrint } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FeedPostComment } from "@/src/features/auth/types/authTypes";

interface FeedDetailCommentsProps {
  className?: string;
  comments?: FeedPostComment[];
  loading?: boolean;
  errorMessage?: string | null;
  currentUserId?: number | null;
  pawingCommentId?: number | null;
  deletingCommentId?: number | null;
  onReply?: (comment: FeedPostComment) => void;
  onTogglePaw?: (comment: FeedPostComment) => void;
  onDelete?: (comment: FeedPostComment) => void;
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

function formatCommentRelativeTime(value: string) {
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "";
  }
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60000);
  if (Math.abs(diffMinutes) < 1) {
    return "지금";
  }
  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormat.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormat.format(diffHours, "hour");
  }
  return relativeTimeFormat.format(Math.round(diffHours / 24), "day");
}

export function FeedDetailComments({
  className,
  comments = [],
  loading = false,
  errorMessage = null,
  currentUserId = null,
  pawingCommentId = null,
  deletingCommentId = null,
  onReply,
  onTogglePaw,
  onDelete
}: FeedDetailCommentsProps) {
  const [expandedParentIds, setExpandedParentIds] = useState<number[]>([]);
  const [openMenuCommentId, setOpenMenuCommentId] = useState<number | null>(null);

  const { rootComments, repliesByParentId } = useMemo(() => {
    const roots: FeedPostComment[] = [];
    const replies = new Map<number, FeedPostComment[]>();
    comments.forEach((comment) => {
      if (comment.parentCommentId) {
        const existing = replies.get(comment.parentCommentId) ?? [];
        existing.push(comment);
        replies.set(comment.parentCommentId, existing);
      } else {
        roots.push(comment);
      }
    });
    return { rootComments: roots, repliesByParentId: replies };
  }, [comments]);

  const toggleReplies = (commentId: number) => {
    setExpandedParentIds((previous) =>
      previous.includes(commentId)
        ? previous.filter((id) => id !== commentId)
        : [...previous, commentId]
    );
  };

  useEffect(() => {
    if (deletingCommentId != null) {
      setOpenMenuCommentId(null);
    }
  }, [deletingCommentId]);

  const renderComment = (comment: FeedPostComment, nested = false) => (
    <div key={comment.id} className={`feed-detail-comment-item ${nested ? "feed-detail-comment-item-nested" : ""}`}>
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
          {comment.replyToUsername ? <span className="feed-detail-comment-mention">@{comment.replyToUsername}</span> : null}
          <span className="feed-detail-comment-content">{comment.content}</span>
        </p>
        <div className="feed-detail-comment-meta">
          <span>{formatCommentRelativeTime(comment.createdAt)}</span>
          {comment.pawCount > 0 ? <span>발자국 {comment.pawCount}개</span> : null}
          <button type="button" className="feed-detail-comment-reply-trigger" onClick={() => onReply?.(comment)}>
            답글 달기
          </button>
          {currentUserId === comment.authorId ? (
            <div className="feed-detail-comment-more-shell">
              <button
                type="button"
                className={`feed-detail-comment-more-trigger ${openMenuCommentId === comment.id ? "feed-detail-comment-more-trigger-active" : ""}`}
                aria-label="댓글 더보기"
                onClick={() => setOpenMenuCommentId((previous) => previous === comment.id ? null : comment.id)}
              >
                <MoreHorizontal className="feed-detail-comment-more-icon" />
              </button>
              {openMenuCommentId === comment.id ? (
                <div className="feed-detail-comment-more-menu">
                  <button
                    type="button"
                    className="feed-detail-comment-more-item feed-detail-comment-more-item-danger"
                    onClick={() => onDelete?.(comment)}
                    disabled={deletingCommentId === comment.id}
                  >
                    {deletingCommentId === comment.id ? "삭제 중..." : "삭제"}
                  </button>
                  <button
                    type="button"
                    className="feed-detail-comment-more-item"
                    onClick={() => setOpenMenuCommentId(null)}
                  >
                    취소
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className={`feed-detail-comment-paw-button ${comment.pawedByMe ? "feed-detail-comment-paw-button-active" : ""}`}
        onClick={() => onTogglePaw?.(comment)}
        disabled={pawingCommentId === comment.id}
        aria-label="댓글 발자국 남기기"
      >
        <PawPrint className={`feed-detail-comment-paw-icon ${comment.pawedByMe ? "feed-detail-comment-paw-icon-active" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className={["feed-detail-comments-panel", className].filter(Boolean).join(" ")}>
      <div className="feed-detail-comments">
        <p className="feed-detail-comments-title">댓글</p>
        {loading ? <p className="feed-detail-comments-status">댓글을 불러오는 중입니다.</p> : null}
        {errorMessage ? <p className="feed-detail-comments-status">{errorMessage}</p> : null}
        {!loading && !errorMessage && rootComments.length > 0 ? (
          <div className="feed-detail-comments-list">
            {rootComments.map((comment) => {
              const replies = repliesByParentId.get(comment.id) ?? [];
              const expanded = expandedParentIds.includes(comment.id);
              return (
                <div key={comment.id} className="feed-detail-comment-thread">
                  {renderComment(comment)}
                  {replies.length > 0 ? (
                    <div className="feed-detail-comment-replies">
                      <button type="button" className="feed-detail-comment-replies-toggle" onClick={() => toggleReplies(comment.id)}>
                        {expanded ? "답글 숨기기" : `답글 보기(${replies.length}개)`}
                      </button>
                      {expanded ? (
                        <div className="feed-detail-comment-replies-list">
                          {replies.map((reply) => renderComment(reply, true))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
