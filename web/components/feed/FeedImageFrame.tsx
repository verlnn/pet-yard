"use client";

import { cn } from "@/lib/utils";
import { getFrameStyle, getTargetRatio, type AspectRatioMode } from "@/components/feed/imageSizing";

interface FeedImageFrameProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatioMode | null;
  aspectRatioValue?: number | null;
  intrinsicRatio?: number | null;
  outerClassName?: string;
  frameClassName?: string;
  imageClassName?: string;
  onLoad?: (size: { width: number; height: number }) => void;
}

export function FeedImageFrame({
  src,
  alt,
  aspectRatio,
  aspectRatioValue,
  intrinsicRatio,
  outerClassName,
  frameClassName,
  imageClassName,
  onLoad
}: FeedImageFrameProps) {
  const targetRatio = getTargetRatio({
    aspectRatio,
    aspectRatioValue,
    intrinsicRatio
  });

  return (
    <div className={cn("flex h-full w-full items-center justify-center overflow-hidden", outerClassName)}>
      <div className={cn("relative overflow-hidden", frameClassName)} style={getFrameStyle(targetRatio)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={(event) =>
            onLoad?.({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight
            })
          }
          className={cn("absolute inset-0 h-full w-full object-cover object-center", imageClassName)}
          draggable={false}
        />
      </div>
    </div>
  );
}
