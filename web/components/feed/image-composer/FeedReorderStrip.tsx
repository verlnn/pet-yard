"use client";

import type { ComposerImage } from "@/components/feed/image-composer/feedImageTypes";

interface FeedReorderStripProps {
  images: ComposerImage[];
  activeImageId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
}

export function FeedReorderStrip({
  images,
  activeImageId,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop
}: FeedReorderStripProps) {
  return (
    <div
      className="absolute bottom-12 left-1/2 flex max-w-[90%] -translate-x-1/2 flex-wrap gap-2 rounded-2xl bg-black/70 p-3"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {images.map((image, index) => {
        const isActive = image.id === activeImageId;
        return (
          <button
            key={image.id}
            type="button"
            draggable
            onDragStart={() => onDragStart(image.id)}
            onDragEnd={onDragEnd}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(image.id)}
            onClick={() => onSelect(image.id)}
            className={`relative h-14 w-14 overflow-hidden rounded-xl border ${
              isActive ? "border-white" : "border-white/40"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.originalUrl} alt={image.name} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
