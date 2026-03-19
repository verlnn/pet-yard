"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostComposerSidebar } from "@/components/feed/PostComposerSidebar";
import { FeedImageOverlayControls } from "@/components/feed/image-composer/FeedImageOverlayControls";
import { FeedImageStage } from "@/components/feed/image-composer/FeedImageStage";
import { FeedReorderStrip } from "@/components/feed/image-composer/FeedReorderStrip";
import { getTargetRatio } from "@/components/feed/imageSizing";
import type { ComposerImage } from "@/components/feed/image-composer/feedImageTypes";

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
  const [activeImageId, setActiveImageId] = useState<string | null>(images[0]?.id ?? null);
  const [showRatioPanel, setShowRatioPanel] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const ratioPanelRef = useRef<HTMLDivElement | null>(null);

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
  }, [activeImageId]);

  const activeImage = useMemo(
    () => images.find((image) => image.id === activeImageId) ?? images[0] ?? null,
    [images, activeImageId]
  );

  const displayUrl = activeImage?.originalUrl ?? null;

  const ratioValue = useMemo(() => {
    return getTargetRatio({
      aspectRatio: activeImage?.aspectRatio,
      intrinsicRatio:
        activeImage?.naturalSize?.width && activeImage?.naturalSize?.height
          ? activeImage.naturalSize.width / activeImage.naturalSize.height
          : null
    });
  }, [activeImage]);

  useEffect(() => {
    if (!showRatioPanel) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ratioPanelRef.current && ratioPanelRef.current.contains(target)) return;
      setShowRatioPanel(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showRatioPanel]);

  const handleRatioSelect = (ratio: ComposerImage["aspectRatio"]) => {
    if (images.length === 0) return;
    const next = { aspectRatio: ratio };
    images.forEach((image) => {
      onUpdateImage(image.id, next);
    });
    setShowRatioPanel(false);
  };

  const handleReorder = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    onReorderImages(sourceId, targetId);
  };

  if (!open) return null;

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

            <div className="mx-auto flex aspect-square w-full max-w-[480px] min-h-0 flex-col gap-3 self-center rounded-3xl border border-dashed border-slate-200 bg-white/80 p-4">
              {displayUrl ? (
                <>
                  <FeedImageStage
                    displayUrl={displayUrl}
                    aspectRatio={activeImage?.aspectRatio}
                    aspectRatioValue={ratioValue}
                    intrinsicRatio={ratioValue}
                    onImageLoad={(size) => {
                      if (!activeImage || activeImage.naturalSize) return;
                      onUpdateImage(activeImage.id, { naturalSize: size });
                    }}
                  >
                    <FeedImageOverlayControls
                      activeImage={activeImage}
                      showRatioPanel={showRatioPanel}
                      showReorder={showReorder}
                      ratioPanelRef={ratioPanelRef}
                      onToggleRatio={() => {
                        setShowRatioPanel((prev) => !prev);
                      }}
                      onRemove={() => activeImage && onRemoveImage(activeImage.id)}
                      onToggleReorder={() => setShowReorder((prev) => !prev)}
                      onSelectRatio={handleRatioSelect}
                    />
                    {showReorder && images.length > 0 && (
                      <FeedReorderStrip
                        images={images}
                        activeImageId={activeImageId}
                        onSelect={setActiveImageId}
                        onReorder={handleReorder}
                      />
                    )}
                  </FeedImageStage>
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
