"use client";

import type { FeedPost } from "@/src/features/auth/types/authTypes";

interface FeedDetailPostBodyProps {
  post: FeedPost;
}

export function FeedDetailPostBody({ post }: FeedDetailPostBodyProps) {
  return (
    <div className="space-y-4 p-6 pb-4">
      <div>
        <p className="text-xs text-ink/50">작성일</p>
        <p className="text-sm font-semibold">
          {new Date(post.createdAt).toLocaleString("ko-KR")}
        </p>
      </div>
      <div>
        <p className="text-xs text-ink/50">내용</p>
        <p className="text-sm whitespace-pre-wrap text-ink/80">
          {post.content || "작성된 내용이 없습니다."}
        </p>
      </div>
      {post.hashtags && post.hashtags.length > 0 && (
        <div>
          <p className="text-xs text-ink/50">해시태그</p>
          <p className="mt-1 flex flex-wrap gap-2 text-xs text-sky-700">
            {post.hashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-1">
                #{tag}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
