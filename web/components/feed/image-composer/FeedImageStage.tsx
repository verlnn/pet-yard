"use client";

import type { ReactNode } from "react";

import { FeedImageFrame } from "@/components/feed/FeedImageFrame";
import type { AspectRatioMode } from "@/components/feed/imageSizing";

export function FeedImageStage({
  displayUrl,
  aspectRatio,
  aspectRatioValue,
  intrinsicRatio,
  onImageLoad,
  children
}: {
  displayUrl: string;
  aspectRatio?: AspectRatioMode | null;
  aspectRatioValue?: number | null;
  intrinsicRatio?: number | null;
  onImageLoad: (size: { width: number; height: number }) => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="relative mx-auto h-full w-full overflow-hidden rounded-2xl bg-black">
        <FeedImageFrame
          src={displayUrl}
          alt="업로드 이미지"
          aspectRatio={aspectRatio}
          aspectRatioValue={aspectRatioValue}
          intrinsicRatio={intrinsicRatio}
          outerClassName="h-full w-full"
          frameClassName="rounded-xl bg-black/90"
          onLoad={onImageLoad}
        />
        {children}
      </div>
    </div>
  );
}
