"use client";

import { useEffect } from "react";

interface FeedPostPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onGoVerify: () => void;
}

export function FeedPostPermissionDialog({
  open,
  onClose,
  onGoVerify
}: FeedPostPermissionDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="feed-post-permission-overlay" onClick={onClose}>
      <div
        className="feed-post-permission-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feed-post-permission-title"
      >
        <div className="feed-post-permission-body">
          <p className="feed-post-permission-eyebrow">게시물 작성 안내</p>
          <h2 id="feed-post-permission-title" className="feed-post-permission-title">
            아직 피드를 올리실 수 없어요
          </h2>
          <p className="feed-post-permission-description">
            멍냥마당 피드는 반려동물 인증을 마친 뒤에 작성할 수 있어요. 먼저 반려동물 인증을 완료해 주세요.
          </p>
        </div>
        <div className="feed-post-permission-actions">
          <button type="button" className="feed-post-permission-button feed-post-permission-close" onClick={onClose}>
            닫기
          </button>
          <button
            type="button"
            className="feed-post-permission-button feed-post-permission-confirm"
            onClick={onGoVerify}
          >
            인증하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
