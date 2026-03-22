import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

export interface HomeFeedAd {
  id: string;
  sponsor: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
}

export type HomeFeedListItem =
  | { type: "post"; id: string; post: HomeFeedPost }
  | { type: "ad"; id: string; ad: HomeFeedAd };

export const HOME_FEED_ADS: HomeFeedAd[] = [
  {
    id: "ad-training",
    sponsor: "PetYard Plus",
    title: "산책 기록을 훈련 루틴으로 이어보세요",
    description: "산책 거리, 배변 기록, 컨디션 메모를 한 번에 정리하는 프리미엄 루틴 플래너",
    imageUrl: "/images/auth/auth-hero-showcase.png",
    ctaLabel: "자세히 보기"
  },
  {
    id: "ad-care",
    sponsor: "Paw Care",
    title: "예방접종과 건강 체크 일정을 놓치지 마세요",
    description: "반려동물 일정 캘린더와 보호자 리마인더를 홈 피드에서 바로 확인할 수 있어요.",
    imageUrl: "/images/brand/petyard-symbol.png",
    ctaLabel: "알림 설정"
  }
];

export function injectAds(posts: HomeFeedPost[], interval = 4): HomeFeedListItem[] {
  if (posts.length === 0) {
    return [];
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
      HOME_FEED_ADS.length > 0;

    if (shouldInsertAd) {
      const ad = HOME_FEED_ADS[adIndex % HOME_FEED_ADS.length];
      result.push({
        type: "ad",
        id: `ad-${ad.id}-${index}`,
        ad
      });
      adIndex += 1;
    }
  });

  return result;
}
