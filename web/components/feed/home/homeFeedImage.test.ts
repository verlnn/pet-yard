import { describe, expect, it } from "vitest";

import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

import {
  getHomeFeedImageLoadingStrategy,
  getPreferredHomeFeedImage,
  getPreferredHomeFeedImageUrl,
  resolveHomeFeedAspectRatio
} from "./homeFeedImage";

function post(overrides: Partial<HomeFeedPost> = {}): HomeFeedPost {
  return {
    id: 1,
    authorId: 1,
    authorNickname: "user-1",
    pawCount: 0,
    pawedByMe: false,
    createdAt: "2026-03-23T00:00:00Z",
    ...overrides
  };
}

describe("homeFeedImage", () => {
  it("prefers the structured image metadata when available", () => {
    const target = post({
      thumbnailImageUrl: "/legacy-thumb.jpg",
      images: [
        {
          thumbnailUrl: "/thumb.jpg",
          mediumUrl: "/medium.jpg",
          originalUrl: "/original.jpg",
          aspectRatio: 1.25
        }
      ]
    });

    expect(getPreferredHomeFeedImageUrl(target)).toBe("/thumb.jpg");
    expect(getPreferredHomeFeedImage(target)?.originalUrl).toBe("/original.jpg");
  });

  it("falls back to the legacy thumbnail and imageUrls when structured metadata is absent", () => {
    const thumbnailPost = post({
      thumbnailImageUrl: "/legacy-thumb.jpg"
    });
    const galleryPost = post({
      imageUrls: ["/legacy-gallery.jpg"]
    });

    expect(getPreferredHomeFeedImageUrl(thumbnailPost)).toBe("/legacy-thumb.jpg");
    expect(getPreferredHomeFeedImageUrl(galleryPost)).toBe("/legacy-gallery.jpg");
  });

  it("resolves aspect ratio from structured metadata first", () => {
    expect(resolveHomeFeedAspectRatio(post({
      imageAspectRatioValue: 0.8,
      images: [{ thumbnailUrl: "/thumb.jpg", aspectRatio: 1.4 }]
    }))).toBe(1.4);
  });

  it("falls back to the legacy aspect ratio codes", () => {
    expect(resolveHomeFeedAspectRatio(post({ imageAspectRatio: "16:9" }))).toBe(16 / 9);
    expect(resolveHomeFeedAspectRatio(post({ imageAspectRatio: "1:1" }))).toBe(1);
    expect(resolveHomeFeedAspectRatio(post({ imageAspectRatio: "4:5" }))).toBe(4 / 5);
  });

  it("returns a conservative loading strategy for non-critical cards", () => {
    expect(getHomeFeedImageLoadingStrategy(true)).toEqual({
      loading: "eager",
      fetchPriority: "high"
    });
    expect(getHomeFeedImageLoadingStrategy(false)).toEqual({
      loading: "lazy",
      fetchPriority: "auto"
    });
  });
});
