"use client";

import type { PointerEvent, ReactNode, RefObject } from "react";

interface FeedImageStageProps {
  containerRef: RefObject<HTMLDivElement | null>;
  zoomPanelRef: RefObject<HTMLDivElement | null>;
  displayUrl: string;
  frameSize: { width: number; height: number };
  transform: string;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onImageLoad: (size: { width: number; height: number }) => void;
  showZoomPanel: boolean;
  zoomValue: number;
  onZoomChange: (value: number) => void;
  children?: ReactNode;
}

export function FeedImageStage({
  containerRef,
  zoomPanelRef,
  displayUrl,
  frameSize,
  transform,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onImageLoad,
  showZoomPanel,
  zoomValue,
  onZoomChange,
  children
}: FeedImageStageProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        ref={containerRef}
        className={`relative mx-auto overflow-hidden rounded-2xl bg-black 
          h-[420px]
          w-[420px]
        `}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div className="relative flex h-full w-full items-center justify-center bg-black">
          <div
            className="relative overflow-hidden rounded-xl bg-black/90"
            style={{
              width: `${frameSize.width}px`,
              height: `${frameSize.height}px`
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="업로드 이미지"
              onLoad={(event) =>
                onImageLoad({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight
                })
              }
              className="absolute left-1/2 top-1/2 select-none"
              style={{ transform }}
              draggable={false}
            />
          </div>
        </div>
        {children}
        {showZoomPanel && (
          <div
            ref={zoomPanelRef}
            className="absolute bottom-4 left-1/2 w-[70%] -translate-x-1/2 rounded-full bg-black/80 px-4 py-3 text-xs text-white shadow-lg"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoomValue}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
