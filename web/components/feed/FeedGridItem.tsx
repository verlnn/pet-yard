"use client";

import { MessageCircle, PawPrint } from "lucide-react";

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
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 p-4 text-white opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
        <div className="flex items-center gap-7">
          <span className="inline-flex items-center gap-2 text-base font-semibold">
            <PawPrint className="h-5 w-5 fill-current" />
            <span>{post.pawCount.toLocaleString("ko-KR")}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-base font-semibold">
            <MessageCircle className="h-5 w-5 fill-current" />
            <span>{(post as FeedPost & { commentCount?: number }).commentCount?.toLocaleString("ko-KR") ?? "0"}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
