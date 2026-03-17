"use client";

import { ImageIcon } from "lucide-react";

import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedGridItemProps {
  post: FeedPost;
  onSelect: (post: FeedPost) => void;
}

export function FeedGridItem({ post, onSelect }: FeedGridItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(post)}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 text-left"
    >
      <div className="aspect-square w-full overflow-hidden">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt="피드 이미지"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-ink/40">
            <ImageIcon className="h-4 w-4" />
            사진 없음
          </div>
        )}
      </div>
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
