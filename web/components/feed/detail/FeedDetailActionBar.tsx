"use client";

import Image from "next/image";
import { MessageCircle, Send } from "lucide-react";

interface FeedDetailActionBarProps {
  createdAt: string;
}

export function FeedDetailActionBar({ createdAt }: FeedDetailActionBarProps) {
  return (
    <div className="mt-auto border-t border-slate-200/90">
      <div className="space-y-3 px-6 py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
            aria-label="발자국 남기기"
          >
            <Image
              src="/images/icons/paw-solid-full.svg"
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px]"
            />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
            aria-label="댓글 보기"
          >
            <MessageCircle className="h-5 w-5 text-ink" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
            aria-label="공유하기"
          >
            <Send className="h-5 w-5 text-ink" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">발자국 0개</p>
          <p className="mt-1 text-[11px] text-ink/45">
            {new Date(createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200/90 px-4 py-3">
        <div className="flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2.5">
          <MessageCircle className="h-4 w-4 shrink-0 text-ink/45" />
          <input
            type="text"
            placeholder="댓글을 남겨보세요."
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
          />
          <button
            type="button"
            className="text-xs font-semibold text-sky-700 transition hover:text-sky-800"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
