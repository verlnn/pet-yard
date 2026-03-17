"use client";

import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyFeedStateProps {
  onNewPost: () => void;
}

export function EmptyFeedState({ onNewPost }: EmptyFeedStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ember/10 text-ember">
        <ImagePlus className="h-7 w-7" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold">첫 기록을 남겨보세요</p>
      <p className="mt-2 text-sm text-ink/60">
        사진과 짧은 기록만 남겨도 멍냥마당의 아카이브가 시작됩니다.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button onClick={onNewPost}>첫 게시물 올리기</Button>
        <Button variant="secondary" onClick={onNewPost}>
          업로드 가이드 보기
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 opacity-60">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
