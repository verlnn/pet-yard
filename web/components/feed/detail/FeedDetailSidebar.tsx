"use client";

import { FeedDetailActionBar } from "@/components/feed/detail/FeedDetailActionBar";
import { FeedDetailComments } from "@/components/feed/detail/FeedDetailComments";
import { FeedDetailPostBody } from "@/components/feed/detail/FeedDetailPostBody";
import type { FeedPost, FeedPostComment } from "@/src/features/auth/types/authTypes";

interface FeedDetailSidebarProps {
  post: FeedPost;
  maxHeight: number;
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
  commenterUsername?: string | null;
  commenterProfileImageUrl?: string | null;
  commenterPrimaryPetImageUrl?: string | null;
}

export function FeedDetailSidebar({
  post,
  maxHeight,
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
  commenterUsername,
  commenterProfileImageUrl,
  commenterPrimaryPetImageUrl
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
        commenterUsername={commenterUsername}
        commenterProfileImageUrl={commenterProfileImageUrl}
        commenterPrimaryPetImageUrl={commenterPrimaryPetImageUrl}
      />
    </div>
  );
}
