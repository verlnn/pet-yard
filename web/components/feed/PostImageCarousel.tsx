"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostImageCarouselProps {
  images: string[];
}

export function PostImageCarousel({ images }: PostImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const current = images[index] ?? images[0];

  if (total === 0) {
    return null;
  }

  const goPrev = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="피드 이미지" className="h-full w-full object-cover" />
        {total > 1 && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
              <button
                type="button"
                onClick={goPrev}
                className="pointer-events-auto rounded-full bg-white/80 p-2 text-ink shadow-sm transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="pointer-events-auto rounded-full bg-white/80 p-2 text-ink shadow-sm transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
              {index + 1}/{total}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
