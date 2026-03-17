"use client";

import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Grip, Plus, Trash2, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostComposerSidebar } from "@/components/feed/PostComposerSidebar";

interface ComposerImage {
  id: string;
  name: string;
  originalUrl: string;
  aspectRatio: "original" | "1:1" | "4:5" | "16:9";
  scale: number;
  position: { x: number; y: number };
  naturalSize?: { width: number; height: number };
}

interface NewPostModalProps {
  open: boolean;
  images: ComposerImage[];
  nickname: string;
  profileImageUrl?: string | null;
  petName?: string | null;
  petBreed?: string | null;
  content: string;
  imageError?: string | null;
  onClose: () => void;
  onAddImages: (files?: FileList | null) => void;
  onRemoveImage: (id: string) => void;
  onReorderImages: (sourceId: string, targetId: string) => void;
  onUpdateImage: (id: string, update: Partial<ComposerImage>) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function NewPostModal({
  open,
  images,
  nickname,
  profileImageUrl,
  petName,
  petBreed,
  content,
  imageError,
  onClose,
  onAddImages,
  onRemoveImage,
  onReorderImages,
  onUpdateImage,
  onContentChange,
  onSubmit,
  submitting
}: NewPostModalProps) {
  if (!open) return null;

  const [activeImageId, setActiveImageId] = useState<string | null>(images[0]?.id ?? null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showRatioPanel, setShowRatioPanel] = useState(false);
  const [showZoomPanel, setShowZoomPanel] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [draggingImage, setDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffsetStart, setDragOffsetStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ratioPanelRef = useRef<HTMLDivElement | null>(null);
  const zoomPanelRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!activeImageId && images.length > 0) {
      setActiveImageId(images[0].id);
    }
    if (activeImageId && !images.some((image) => image.id === activeImageId)) {
      setActiveImageId(images[0]?.id ?? null);
    }
  }, [images, activeImageId]);

  useEffect(() => {
    setShowRatioPanel(false);
    setShowZoomPanel(false);
  }, [activeImageId]);

  const activeImage = useMemo(
    () => images.find((image) => image.id === activeImageId) ?? images[0] ?? null,
    [images, activeImageId]
  );

  const displayUrl = activeImage?.originalUrl ?? null;

  const ratioValue = useMemo(() => {
    if (!activeImage) return 1;
    if (activeImage.aspectRatio === "original") {
      if (activeImage.naturalSize?.width && activeImage.naturalSize?.height) {
        return activeImage.naturalSize.width / activeImage.naturalSize.height;
      }
      return 1;
    }
    if (activeImage.aspectRatio === "1:1") return 1;
    if (activeImage.aspectRatio === "4:5") return 4 / 5;
    return 16 / 9;
  }, [activeImage]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    });
  }, [open, ratioValue, displayUrl, showReorder]);

  useEffect(() => {
    if (!showRatioPanel && !showZoomPanel) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ratioPanelRef.current && ratioPanelRef.current.contains(target)) return;
      if (zoomPanelRef.current && zoomPanelRef.current.contains(target)) return;
      setShowRatioPanel(false);
      setShowZoomPanel(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showRatioPanel, showZoomPanel]);

  const frameSize = useMemo(() => {
    if (!containerSize.width || !containerSize.height) {
      return { width: 0, height: 0 };
    }
    const containerRatio = containerSize.width / containerSize.height;
    if (ratioValue > containerRatio) {
      return {
        width: containerSize.width,
        height: containerSize.width / ratioValue
      };
    }
    return {
      width: containerSize.height * ratioValue,
      height: containerSize.height
    };
  }, [containerSize, ratioValue]);

  const baseScale = useMemo(() => {
    if (!activeImage?.naturalSize || !frameSize.width || !frameSize.height) return 1;
    return Math.max(
      frameSize.width / activeImage.naturalSize.width,
      frameSize.height / activeImage.naturalSize.height
    );
  }, [activeImage?.naturalSize, frameSize]);

  const clampOffset = (next: { x: number; y: number }, scale: number) => {
    if (!activeImage || !activeImage.naturalSize || !frameSize.width || !frameSize.height) {
      return next;
    }
    const { width, height } = activeImage.naturalSize;
    const displayWidth = width * baseScale * scale;
    const displayHeight = height * baseScale * scale;
    const maxX = Math.max(0, (displayWidth - frameSize.width) / 2);
    const maxY = Math.max(0, (displayHeight - frameSize.height) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y))
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeImage) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingImage(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDragOffsetStart(activeImage.position);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!activeImage || !draggingImage) return;
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const next = clampOffset(
      { x: dragOffsetStart.x + deltaX, y: dragOffsetStart.y + deltaY },
      activeImage.scale
    );
    onUpdateImage(activeImage.id, { position: next });
  };

  const handlePointerUp = () => {
    setDraggingImage(false);
  };

  const handleRatioSelect = (ratio: ComposerImage["aspectRatio"]) => {
    if (!activeImage) return;
    const next = { aspectRatio: ratio, scale: 1, position: { x: 0, y: 0 } };
    onUpdateImage(activeImage.id, next);
    setShowRatioPanel(false);
  };

  const handleZoomChange = (value: number) => {
    if (!activeImage) return;
    const nextScale = Math.min(3, Math.max(1, value));
    const nextPosition = clampOffset(activeImage.position, nextScale);
    onUpdateImage(activeImage.id, { scale: nextScale, position: nextPosition });
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDrop = (id: string) => {
    if (!draggingId || draggingId === id) return;
    onReorderImages(draggingId, id);
    setDraggingId(null);
  };

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
          <div className="flex flex-col gap-4 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink/80">사진 관리</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-ink/70 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> 사진 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => onAddImages(event.target.files)}
                />
              </label>
            </div>

            <div className="flex h-full flex-col gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-4">
              {displayUrl ? (
                <>
                  <div
                    ref={containerRef}
                    className={`relative overflow-hidden rounded-2xl bg-black 
                    ${showReorder ? "h-[340px]" : "h-[420px]"}
                    ${showReorder ? "w-[340px]" : "w-[420px]"}
                    `}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
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
                          onLoad={(event) => {
                            if (!activeImage) return;
                            const target = event.currentTarget;
                            if (activeImage.naturalSize) return;
                            onUpdateImage(activeImage.id, {
                              naturalSize: { width: target.naturalWidth, height: target.naturalHeight }
                            });
                          }}
                          className="absolute left-1/2 top-1/2 select-none"
                          style={{
                            transform: `translate(-50%, -50%) translate(${activeImage?.position.x ?? 0}px, ${
                                activeImage?.position.y ?? 0
                            }px)`
                          }}
                          draggable={false}
                        />
                      </div>
                    </div>
                    <div
                      className="absolute right-3 top-3 flex items-center gap-2"
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRatioPanel((prev) => !prev);
                            setShowZoomPanel(false);
                          }}
                          className="rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black/90"
                        >
                          📐 비율
                        </button>
                        {showRatioPanel && (
                          <div
                            ref={ratioPanelRef}
                            className="absolute right-0 top-11 w-44 rounded-2xl bg-black/85 p-2 text-xs text-white shadow-lg"
                          >
                            {(["original", "1:1", "4:5", "16:9"] as const).map((ratio) => (
                              <button
                                key={ratio}
                                type="button"
                                onClick={() => handleRatioSelect(ratio)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                                  activeImage?.aspectRatio === ratio
                                    ? "bg-white/15 text-white"
                                    : "text-white/80 hover:bg-white/10"
                                }`}
                              >
                                <span>
                                  {ratio === "original"
                                    ? "원본"
                                    : ratio === "1:1"
                                    ? "1:1"
                                    : ratio === "4:5"
                                    ? "4:5"
                                    : "16:9"}
                                </span>
                                {activeImage?.aspectRatio === ratio && <span className="text-[10px]">선택됨</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowZoomPanel((prev) => !prev);
                            setShowRatioPanel(false);
                          }}
                          className="rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black/90"
                        >
                          <ZoomIn className="mr-1 inline h-3.5 w-3.5" />
                          줌
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => activeImage && onRemoveImage(activeImage.id)}
                        className="rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black/90"
                      >
                        <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                        삭제
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReorder((prev) => !prev)}
                      className="absolute bottom-3 right-3 rounded-full bg-black/70 p-2 text-white shadow-sm transition hover:bg-black/90"
                      onPointerDown={(event) => event.stopPropagation()}
                      aria-label={showReorder ? "순서 변경 닫기" : "순서 변경 열기"}
                      title="순서 변경"
                    >
                      <Grip className="h-4 w-4" />
                    </button>
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
                          value={activeImage?.scale ?? 1}
                          onChange={(event) => handleZoomChange(Number(event.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-sm text-ink/50">
                  <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2">사진 업로드</span>
                  <span>드래그하거나 클릭해서 업로드하세요</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => onAddImages(event.target.files)}
                  />
                </label>
              )}
            </div>

            {images.length > 0 && showReorder && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-ink/70">순서 변경</p>
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => {
                    const thumbUrl = image.originalUrl;
                    const isActive = image.id === activeImageId;
                    return (
                      <div
                        key={image.id}
                        draggable
                        onDragStart={() => handleDragStart(image.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(image.id)}
                        onClick={() => setActiveImageId(image.id)}
                        className={`group relative h-16 w-16 cursor-pointer overflow-hidden rounded-2xl border ${
                          isActive ? "border-ink" : "border-slate-200"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbUrl} alt={image.name} className="h-full w-full object-cover" />
                        <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-ink/50">드래그로 순서를 바꿀 수 있어요.</p>
              </div>
            )}

            {imageError && <p className="text-xs text-rose-500">{imageError}</p>}
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
