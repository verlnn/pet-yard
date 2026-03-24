"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { CommonButton } from "@/components/ui/CommonButton";
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

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    <div className="feed-new-post-modal-backdrop">
      <div className="feed-new-post-modal-shell">
        <div className="feed-new-post-modal-header">
          <button type="button" onClick={onClose} className="feed-new-post-modal-close">
            <X className="feed-new-post-modal-close-icon" />
          </button>
          <p className="feed-new-post-modal-title">새 게시물 만들기</p>
          <CommonButton onClick={onSubmit} disabled={submitting} size="sm">
            {submitting ? "공유 중..." : "공유"}
          </CommonButton>
        </div>
        <div className="feed-new-post-modal-body">
          <div className="feed-new-post-modal-stage-panel">
            <div className="feed-new-post-modal-stage-header">
              <p className="feed-new-post-modal-stage-title">사진 관리</p>
              <label className="feed-new-post-modal-add-trigger">
                <Plus className="feed-new-post-modal-add-trigger-icon" /> 사진 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => onAddImages(event.target.files)}
                />
              </label>
            </div>

            <div className="feed-new-post-modal-stage-shell">
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
                <label className="feed-new-post-modal-empty-upload">
                  <span className="feed-new-post-modal-empty-upload-button">사진 업로드</span>
                  <span className="feed-new-post-modal-empty-upload-copy">드래그하거나 클릭해서 업로드하세요</span>
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

            {imageError && <p className="feed-new-post-modal-image-error">{imageError}</p>}
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
