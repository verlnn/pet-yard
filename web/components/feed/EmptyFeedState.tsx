"use client";

import { ImagePlus } from "lucide-react";

import { CommonButton } from "@/components/ui/CommonButton";

interface EmptyFeedStateProps {
  onNewPost: () => void;
}

export function EmptyFeedState({ onNewPost }: EmptyFeedStateProps) {
  return (
    <div className="feed-empty-state">
      <div className="feed-empty-state-icon">
        <ImagePlus className="feed-empty-state-icon-mark" />
      </div>
      <p className="feed-empty-state-title">첫 기록을 남겨보세요</p>
      <p className="feed-empty-state-description">
        사진과 짧은 기록만 남겨도 멍냥마당의 아카이브가 시작됩니다.
      </p>
      <div className="feed-empty-state-actions">
        <CommonButton onClick={onNewPost}>첫 게시물 올리기</CommonButton>
        <CommonButton variant="secondary" onClick={onNewPost}>
          업로드 가이드 보기
        </CommonButton>
      </div>
      <div className="feed-empty-state-preview-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="feed-empty-state-preview-tile" />
        ))}
      </div>
    </div>
  );
}
