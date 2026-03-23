"use client";

import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyFeedStateProps {
  onNewPost?: () => void;
  title?: string;
  description?: string;
}

export function EmptyFeedState({
  onNewPost,
  title = "첫 기록을 남겨보세요",
  description = "사진과 짧은 기록만 남겨도 멍냥마당의 아카이브가 시작됩니다."
}: EmptyFeedStateProps) {
  return (
    <div className="feed-empty-state">
      <div className="feed-empty-state-icon">
        <ImagePlus className="feed-empty-state-icon-mark" />
      </div>
      <p className="feed-empty-state-title">{title}</p>
      <p className="feed-empty-state-description">{description}</p>
      {onNewPost ? (
        <div className="feed-empty-state-actions">
          <Button onClick={onNewPost}>첫 게시물 올리기</Button>
          <Button variant="secondary" onClick={onNewPost}>
            업로드 가이드 보기
          </Button>
        </div>
      ) : null}
      <div className="feed-empty-state-preview-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="feed-empty-state-preview-tile" />
        ))}
      </div>
    </div>
  );
}
