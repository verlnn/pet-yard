import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

export interface HomeFeedAdTrackingMetadata {
  source: "client-fallback" | "server-sponsored";
  placement: "feed-inline";
  experimentKey?: string | null;
}

export interface HomeFeedAdEmbed {
  type: "iframe";
  src: string;
  width: number;
  height: number;
}

export interface HomeFeedAd {
  adId: string;
  campaignId: string;
  slotKey: string;
  sponsor: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  ctaLabel: string;
  tracking: HomeFeedAdTrackingMetadata;
  embed?: HomeFeedAdEmbed | null;
}

export type HomeFeedListItem =
  | { type: "post"; id: string; post: HomeFeedPost }
  | { type: "ad"; id: string; ad: HomeFeedAd };

export const DEFAULT_HOME_FEED_AD_INTERVAL = 4;

export const HOME_FEED_ADS: HomeFeedAd[] = [
  {
    adId: "ad-training",
    campaignId: "campaign-walk-routine",
    slotKey: "feed-inline-1",
    sponsor: "PetYard Plus",
    title: "산책 기록을 훈련 루틴으로 이어보세요",
    description: "산책 거리, 배변 기록, 컨디션 메모를 한 번에 정리하는 프리미엄 루틴 플래너",
    imageUrl: "/images/auth/auth-hero-showcase.png",
    targetUrl: "/knowledge",
    ctaLabel: "자세히 보기",
    embed: {
      type: "iframe",
      src: "https://ads-partners.coupang.com/widgets.html?id=974617&template=carousel&trackingCode=AF8275210&subId=&width=300&height=400&tsource=",
      width: 300,
      height: 400
    },
    tracking: {
      source: "client-fallback",
      placement: "feed-inline"
    }
  },
  {
    adId: "ad-care",
    campaignId: "campaign-health-reminder",
    slotKey: "feed-inline-2",
    sponsor: "Paw Care",
    title: "예방접종과 건강 체크 일정을 놓치지 마세요",
    description: "반려동물 일정 캘린더와 보호자 리마인더를 홈 피드에서 바로 확인할 수 있어요.",
    imageUrl: "/images/brand/petyard-symbol.png",
    targetUrl: "/notifications",
    ctaLabel: "알림 설정",
    embed: {
      type: "iframe",
      src: "https://ads-partners.coupang.com/widgets.html?id=974617&template=carousel&trackingCode=AF8275210&subId=&width=300&height=400&tsource=",
      width: 300,
      height: 400
    },
    tracking: {
      source: "client-fallback",
      placement: "feed-inline"
    }
  }
];

// The feed API currently returns posts only. Client-side ad injection keeps the
// rendering model explicit until the backend starts returning sponsored items.
export function buildHomeFeedItems(
  posts: HomeFeedPost[],
  ads: HomeFeedAd[] = HOME_FEED_ADS,
  interval = DEFAULT_HOME_FEED_AD_INTERVAL
): HomeFeedListItem[] {
  const buildAdItems = (prefix: string) =>
    ads.map((ad, index) => ({
      type: "ad" as const,
      id: `${prefix}-${ad.adId}-${index}`,
      ad
    }));

  if (interval <= 0) {
    return posts.map((post) => ({
      type: "post",
      id: `post-${post.id}`,
      post
    }));
  }

  if (posts.length === 0) {
    return buildAdItems("ad-empty");
  }

  const result: HomeFeedListItem[] = [];
  let adIndex = 0;

  posts.forEach((post, index) => {
    result.push({
      type: "post",
      id: `post-${post.id}`,
      post
    });

    const shouldInsertAd =
      (index + 1) % interval === 0 &&
      index < posts.length - 1 &&
      ads.length > 0;

    if (shouldInsertAd) {
      const ad = ads[adIndex % ads.length];
      result.push({
        type: "ad",
        id: `ad-${ad.adId}-${index}`,
        ad
      });
      adIndex += 1;
    }
  });

  return result;
}

export const injectAds = buildHomeFeedItems;
