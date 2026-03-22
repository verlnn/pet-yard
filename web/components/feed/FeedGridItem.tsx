"use client";

import { FeedThumbnail } from "@/components/feed/FeedThumbnail";
import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedGridItemProps {
  post: FeedPost;
  onSelect: (post: FeedPost) => void;
}

export function FeedGridItem({ post, onSelect }: FeedGridItemProps) {
  const thumbnail = post.thumbnailImageUrl ?? null;
  const totalImages = post.imageUrls?.length ?? (post.thumbnailImageUrl ? 1 : 0);

  return (
    <button
      type="button"
      onClick={() => onSelect(post)}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 text-left"
    >
      <FeedThumbnail
        src={thumbnail}
        alt="피드 이미지"
        imageClassName="transition-transform duration-300 group-hover:scale-105"
      />
      {totalImages > 1 && (
        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white">
          {totalImages}장
        </span>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-4 text-white opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
        <p className="text-xs font-semibold">
          {post.content ? post.content.slice(0, 60) : "게시물 보기"}
        </p>
        {post.hashtags && post.hashtags.length > 0 && (
          <p className="mt-1 text-[10px] text-sky-200">
            {post.hashtags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}
            {post.hashtags.length > 2 && " ..."}
          </p>
        )}
        <span className="mt-1 text-[10px] text-white/70">
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>
    </button>
  );
}
