import type { FeedImageAsset, HomeFeedPost } from "@/src/features/auth/types/authTypes";

const DEFAULT_HOME_FEED_ASPECT_RATIO = 4 / 5;

export function getPreferredHomeFeedImage(post: HomeFeedPost): FeedImageAsset | null {
  const preferredImage = post.images?.find(
    (image) => image?.thumbnailUrl || image?.mediumUrl || image?.originalUrl
  );

  if (preferredImage) {
    return preferredImage;
  }

  const legacyImageUrl = post.thumbnailImageUrl ?? post.imageUrls?.[0] ?? null;
  if (!legacyImageUrl) {
    return null;
  }

  return {
    thumbnailUrl: legacyImageUrl,
    mediumUrl: legacyImageUrl,
    originalUrl: legacyImageUrl,
    aspectRatio: post.imageAspectRatioValue ?? null,
    aspectRatioCode: post.imageAspectRatio ?? null
  };
}

export function getPreferredHomeFeedImageUrl(post: HomeFeedPost) {
  const image = getPreferredHomeFeedImage(post);
  return image?.thumbnailUrl ?? image?.mediumUrl ?? image?.originalUrl ?? null;
}

export function resolveHomeFeedAspectRatio(post: HomeFeedPost) {
  const image = getPreferredHomeFeedImage(post);
  if (typeof image?.aspectRatio === "number" && image.aspectRatio > 0) {
    return image.aspectRatio;
  }
  if (typeof post.imageAspectRatioValue === "number" && post.imageAspectRatioValue > 0) {
    return post.imageAspectRatioValue;
  }

  switch (image?.aspectRatioCode ?? post.imageAspectRatio) {
    case "16:9":
      return 16 / 9;
    case "1:1":
      return 1;
    case "4:5":
      return 4 / 5;
    default:
      return DEFAULT_HOME_FEED_ASPECT_RATIO;
  }
}

export function getHomeFeedImageLoadingStrategy(eagerImage: boolean) {
  return {
    loading: eagerImage ? "eager" : "lazy",
    fetchPriority: eagerImage ? "high" : "auto"
  } as const;
}
