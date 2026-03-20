"use client";

import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeedThumbnailProps {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
}

export function FeedThumbnail({
  src,
  alt = "피드 이미지",
  className,
  imageClassName
}: FeedThumbnailProps) {
  return (
    <div className={cn("aspect-[3/4] w-full overflow-hidden bg-black", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={cn("h-full w-full object-cover object-center", imageClassName)} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-[var(--color-text-subtle)]">
          <ImageIcon className="h-4 w-4" />
          사진 없음
        </div>
      )}
    </div>
  );
}
