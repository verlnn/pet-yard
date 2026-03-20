"use client";

import { FeedImageFrame } from "@/components/feed/FeedImageFrame";
import { PostImageCarousel } from "@/components/feed/PostImageCarousel";
import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedDetailPhotoPanelProps {
  post: FeedPost;
  width: number;
  height: number;
}

export function FeedDetailPhotoPanel({ post, width, height }: FeedDetailPhotoPanelProps) {
  return (
    <div
      className="flex items-center justify-center bg-black"
      style={{
        width: `${width || 480}px`,
        height: `${height || 480}px`
      }}
    >
      {post.imageUrls && post.imageUrls.length > 0 ? (
        <PostImageCarousel
          images={post.imageUrls}
          aspectRatio={post.imageAspectRatio}
          aspectRatioValue={post.imageAspectRatioValue}
        />
      ) : post.thumbnailImageUrl ? (
        <FeedImageFrame
          src={post.thumbnailImageUrl}
          alt="피드 이미지"
          aspectRatio={post.imageAspectRatio}
          aspectRatioValue={post.imageAspectRatioValue}
          outerClassName="h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
          이미지 없음
        </div>
      )}
    </div>
  );
}
