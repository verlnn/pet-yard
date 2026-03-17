"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ComposerImage } from "@/components/feed/image-composer/feedImageTypes";

interface FeedReorderStripProps {
  images: ComposerImage[];
  activeImageId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
}

export function FeedReorderStrip({ images, activeImageId, onSelect, onReorder }: FeedReorderStripProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const dragStateRef = useRef({
    activeId: "" as string,
    sourceIndex: -1,
    targetIndex: -1,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    itemRect: null as DOMRect | null,
    containerRect: null as DOMRect | null,
    itemRects: [] as DOMRect[],
    scrollLeftStart: 0,
    itemWidth: 0,
    itemGap: 0
  });
  const rafRef = useRef<number | null>(null);
  const [dragState, setDragState] = useState({
    activeId: null as string | null,
    sourceIndex: -1,
    targetIndex: -1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false
  });

  const itemSpacing = useMemo(() => {
    const first = itemRefs.current.get(images[0]?.id ?? "");
    const second = itemRefs.current.get(images[1]?.id ?? "");
    if (first && second) {
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      return Math.max(0, secondRect.left - firstRect.left - firstRect.width);
    }
    return 8;
  }, [images]);

  const scheduleUpdate = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const state = dragStateRef.current;
      setDragState({
        activeId: state.activeId,
        sourceIndex: state.sourceIndex,
        targetIndex: state.targetIndex,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        isDragging: state.isDragging
      });
    });
  };

  const updateTargetIndex = () => {
    const state = dragStateRef.current;
    if (!state.containerRect || state.sourceIndex === -1 || state.itemRects.length === 0) return;
    const scrollDelta = (containerRef.current?.scrollLeft ?? 0) - state.scrollLeftStart;
    const centers = state.itemRects.map((rect) => rect.left + rect.width / 2 - scrollDelta);
    const draggedCenter = (state.itemRect?.left ?? 0) + (state.itemRect?.width ?? 0) / 2 + state.offsetX;
    let targetIndex = state.sourceIndex;
    for (let i = 0; i < centers.length; i += 1) {
      if (draggedCenter < centers[i]) {
        targetIndex = i;
        break;
      }
      targetIndex = i;
    }
    state.targetIndex = targetIndex;
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    const container = containerRef.current;
    const node = itemRefs.current.get(id);
    if (!container || !node) return;
    const rect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const state = dragStateRef.current;
    state.activeId = id;
    state.sourceIndex = images.findIndex((image) => image.id === id);
    state.targetIndex = state.sourceIndex;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.offsetX = 0;
    state.offsetY = 0;
    state.isDragging = false;
    state.itemRect = rect;
    state.containerRect = containerRect;
    state.itemRects = images
      .map((image) => itemRefs.current.get(image.id)?.getBoundingClientRect())
      .filter(Boolean) as DOMRect[];
    state.scrollLeftStart = container.scrollLeft;
    state.itemWidth = rect.width;
    state.itemGap = itemSpacing;
    scheduleUpdate();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.activeId) return;
    const state = dragStateRef.current;
    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    if (!state.isDragging && Math.hypot(deltaX, deltaY) > 4) {
      state.isDragging = true;
    }
    if (!state.isDragging) {
      scheduleUpdate();
      return;
    }
    state.offsetX = deltaX;
    state.offsetY = deltaY;

    const container = containerRef.current;
    if (container && state.containerRect) {
      const rect = state.containerRect;
      if (event.clientX < rect.left + 40) {
        container.scrollBy({ left: -12 });
      } else if (event.clientX > rect.right - 40) {
        container.scrollBy({ left: 12 });
      }
    }

    updateTargetIndex();
    scheduleUpdate();
  };

  const handlePointerUp = () => {
    const state = dragStateRef.current;
    if (state.isDragging && state.activeId && state.targetIndex !== -1 && state.sourceIndex !== -1) {
      const targetId = images[state.targetIndex]?.id;
      if (targetId && targetId !== state.activeId) {
        onReorder(state.activeId, targetId);
      }
    } else if (state.activeId) {
      onSelect(state.activeId);
    }

    dragStateRef.current = {
      activeId: "",
      sourceIndex: -1,
      targetIndex: -1,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      itemRect: null,
      containerRect: null,
      itemRects: [],
      scrollLeftStart: 0,
      itemWidth: 0,
      itemGap: itemSpacing
    };
    setDragState({
      activeId: null,
      sourceIndex: -1,
      targetIndex: -1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false
    });
  };

  useEffect(() => {
    const handlePointerUpGlobal = () => handlePointerUp();
    window.addEventListener("pointerup", handlePointerUpGlobal);
    window.addEventListener("pointercancel", handlePointerUpGlobal);
    return () => {
      window.removeEventListener("pointerup", handlePointerUpGlobal);
      window.removeEventListener("pointercancel", handlePointerUpGlobal);
    };
  });

  const dragPreviewShift = dragState.isDragging
    ? (dragStateRef.current.itemWidth || 56) + (dragStateRef.current.itemGap || 8)
    : 0;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-12 left-1/2 flex w-[92%] -translate-x-1/2 flex-nowrap gap-2 overflow-x-auto rounded-2xl bg-black/70 p-3"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {images.map((image, index) => {
        const isActive = image.id === activeImageId;
        const isDragging = dragState.isDragging && image.id === dragState.activeId;
        const isTarget =
          dragState.isDragging && index === dragState.targetIndex && image.id !== dragState.activeId;
        let offset = 0;
        if (dragState.isDragging && dragState.sourceIndex !== -1 && dragState.targetIndex !== -1) {
          if (index > dragState.sourceIndex && index <= dragState.targetIndex) {
            offset = -dragPreviewShift;
          } else if (index < dragState.sourceIndex && index >= dragState.targetIndex) {
            offset = dragPreviewShift;
          }
        }
        return (
          <button
            key={image.id}
            type="button"
            data-reorder-id={image.id}
            onPointerDown={(event) => handlePointerDown(event, image.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative h-14 w-14 flex-none overflow-hidden rounded-xl border ${
              isActive ? "border-white" : "border-white/40"
            } ${isDragging ? "z-20 cursor-grabbing shadow-lg" : "cursor-grab"} ${
              isTarget ? "ring-2 ring-white/70" : ""
            } touch-none`}
            style={{
              transform: isDragging
                ? `translate3d(${dragState.offsetX}px, ${dragState.offsetY}px, 0) scale(1.05)`
                : offset
                ? `translate3d(${offset}px, 0, 0)`
                : undefined,
              transition: isDragging ? "none" : "transform 180ms ease-out",
              boxShadow: isDragging ? "0 16px 30px rgba(0,0,0,0.35)" : undefined,
              opacity: isDragging ? 0.98 : 1
            }}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(image.id, node);
              } else {
                itemRefs.current.delete(image.id);
              }
            }}
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
