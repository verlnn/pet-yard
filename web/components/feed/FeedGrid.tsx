"use client";

import type { FeedPost } from "@/src/features/auth/types/authTypes";
import { FeedGridItem } from "@/components/feed/FeedGridItem";

interface FeedGridProps {
  posts: FeedPost[];
  onSelect: (post: FeedPost) => void;
}

export function FeedGrid({ posts, onSelect }: FeedGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {posts.map((post) => (
        <FeedGridItem key={post.id} post={post} onSelect={onSelect} />
      ))}
    </div>
  );
}
