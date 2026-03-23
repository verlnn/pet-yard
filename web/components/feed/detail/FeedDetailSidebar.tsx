"use client";

import { FeedDetailActionBar } from "@/components/feed/detail/FeedDetailActionBar";
import { FeedDetailComments } from "@/components/feed/detail/FeedDetailComments";
import { FeedDetailPostBody } from "@/components/feed/detail/FeedDetailPostBody";
import type { FeedPost, FeedPostComment } from "@/src/features/auth/types/authTypes";

interface FeedDetailSidebarProps {
  post: FeedPost;
  maxHeight: number;
  currentUserId?: number | null;
  onTogglePaw: () => void;
  pawLoading?: boolean;
  comments?: FeedPostComment[];
  commentsLoading?: boolean;
  commentsErrorMessage?: string | null;
  commentValue?: string;
  onCommentValueChange?: (value: string) => void;
  onCommentSubmit?: () => void;
  commentSubmitting?: boolean;
  focusCommentToken?: number;
  replyTargetUsername?: string | null;
  onCancelReply?: () => void;
  pawingCommentId?: number | null;
  deletingCommentId?: number | null;
  onReplyComment?: (comment: FeedPostComment) => void;
  onToggleCommentPaw?: (comment: FeedPostComment) => void;
  onDeleteComment?: (comment: FeedPostComment) => void;
}

export function FeedDetailSidebar({
  post,
  maxHeight,
  currentUserId = null,
  onTogglePaw,
  pawLoading = false,
  comments = [],
  commentsLoading = false,
  commentsErrorMessage = null,
  commentValue = "",
  onCommentValueChange,
  onCommentSubmit,
  commentSubmitting = false,
  focusCommentToken = 0,
  replyTargetUsername,
  onCancelReply,
  pawingCommentId = null,
  deletingCommentId = null,
  onReplyComment,
  onToggleCommentPaw,
  onDeleteComment
}: FeedDetailSidebarProps) {
  return (
    <div
      className="feed-detail-sidebar"
      style={{
        width: "360px",
        maxHeight: `${maxHeight || 480}px`
      }}
    >
      <div className="feed-detail-sidebar-scroll">
        <FeedDetailPostBody post={post} />
        <FeedDetailComments
          comments={comments}
          loading={commentsLoading}
          errorMessage={commentsErrorMessage}
          currentUserId={currentUserId}
          pawingCommentId={pawingCommentId}
          deletingCommentId={deletingCommentId}
          onReply={onReplyComment}
          onTogglePaw={onToggleCommentPaw}
          onDelete={onDeleteComment}
        />
      </div>
      <FeedDetailActionBar
        createdAt={post.createdAt}
        pawCount={post.pawCount}
        pawedByMe={post.pawedByMe}
        onTogglePaw={onTogglePaw}
        pawLoading={pawLoading}
        commentValue={commentValue}
        onCommentValueChange={onCommentValueChange}
        onCommentSubmit={onCommentSubmit}
        commentSubmitting={commentSubmitting}
        focusCommentToken={focusCommentToken}
        replyTargetUsername={replyTargetUsername}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
