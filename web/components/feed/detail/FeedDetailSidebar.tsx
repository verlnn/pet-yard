"use client";

import { FeedDetailActionBar } from "@/components/feed/detail/FeedDetailActionBar";
import { FeedDetailComments } from "@/components/feed/detail/FeedDetailComments";
import { FeedDetailPostBody } from "@/components/feed/detail/FeedDetailPostBody";
import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedDetailSidebarProps {
  post: FeedPost;
  maxHeight: number;
}

export function FeedDetailSidebar({ post, maxHeight }: FeedDetailSidebarProps) {
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
        <FeedDetailComments />
      </div>
      <FeedDetailActionBar createdAt={post.createdAt} />
    </div>
  );
}
