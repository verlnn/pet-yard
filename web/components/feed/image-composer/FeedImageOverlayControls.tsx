"use client";

import type { RefObject } from "react";
import { Grip, Trash2 } from "lucide-react";

import type { ComposerImage } from "@/components/feed/image-composer/feedImageTypes";

interface FeedImageOverlayControlsProps {
  activeImage: ComposerImage | null;
  showRatioPanel: boolean;
  showReorder: boolean;
  ratioPanelRef: RefObject<HTMLDivElement | null>;
  onToggleRatio: () => void;
  onRemove: () => void;
  onToggleReorder: () => void;
  onSelectRatio: (ratio: ComposerImage["aspectRatio"]) => void;
}

const ratioOptions: Array<{ value: ComposerImage["aspectRatio"]; label: string }> = [
  { value: "original", label: "원본" },
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "16:9", label: "16:9" }
];

export function FeedImageOverlayControls({
  activeImage,
  showRatioPanel,
  showReorder,
  ratioPanelRef,
  onToggleRatio,
  onRemove,
  onToggleReorder,
  onSelectRatio
}: FeedImageOverlayControlsProps) {
  return (
    <>
      <div
        className="absolute right-3 top-3 flex items-center gap-2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="relative">
          <button
            type="button"
            onClick={onToggleRatio}
            className="rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black/90"
          >
            📐 비율
          </button>
          {showRatioPanel && (
            <div
              ref={ratioPanelRef}
              className="absolute right-0 top-11 w-44 rounded-2xl bg-black/85 p-2 text-xs text-white shadow-lg"
            >
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => onSelectRatio(ratio.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    activeImage?.aspectRatio === ratio.value
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span>{ratio.label}</span>
                  {activeImage?.aspectRatio === ratio.value && <span className="text-[10px]">선택됨</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black/90"
        >
          <Trash2 className="mr-1 inline h-3.5 w-3.5" />
          삭제
        </button>
      </div>
      <button
        type="button"
        onClick={onToggleReorder}
        className="absolute bottom-3 right-3 rounded-full bg-black/70 p-2 text-white shadow-sm transition hover:bg-black/90"
        onPointerDown={(event) => event.stopPropagation()}
        aria-label={showReorder ? "순서 변경 닫기" : "순서 변경 열기"}
        title="순서 변경"
      >
        <Grip className="h-4 w-4" />
      </button>
    </>
  );
}
