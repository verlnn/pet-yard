"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostComposerSidebar } from "@/components/feed/PostComposerSidebar";

interface NewPostModalProps {
  open: boolean;
  imageUrl?: string | null;
  nickname: string;
  profileImageUrl?: string | null;
  petName?: string | null;
  petBreed?: string | null;
  content: string;
  imageError?: string | null;
  onClose: () => void;
  onImageUpload: (file?: File) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function NewPostModal({
  open,
  imageUrl,
  nickname,
  profileImageUrl,
  petName,
  petBreed,
  content,
  imageError,
  onClose,
  onImageUpload,
  onContentChange,
  onSubmit,
  submitting
}: NewPostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold">새 게시물 만들기</p>
          <Button onClick={onSubmit} disabled={submitting} size="sm">
            {submitting ? "공유 중..." : "공유"}
          </Button>
        </div>
        <div className="grid min-h-[520px] gap-0 md:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col items-center justify-center bg-slate-50 p-6">
            <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="업로드 이미지" className="h-full w-full rounded-3xl object-cover" />
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-sm text-ink/50">
                  <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2">사진 업로드</span>
                  <span>드래그하거나 클릭해서 업로드하세요</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => onImageUpload(event.target.files?.[0])}
                  />
                </label>
              )}
            </div>
            {imageError && <p className="mt-3 text-xs text-rose-500">{imageError}</p>}
          </div>
          <PostComposerSidebar
            nickname={nickname}
            profileImageUrl={profileImageUrl}
            petName={petName}
            petBreed={petBreed}
            content={content}
            onContentChange={onContentChange}
          />
        </div>
      </div>
    </div>
  );
}
