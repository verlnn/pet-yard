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
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow-sm transition hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
              {index + 1}/{total}
            </div>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-2 bg-black/90 px-4 py-3">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={`h-12 w-12 overflow-hidden rounded-lg border ${
                imageIndex === index ? "border-white" : "border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="미리보기" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
