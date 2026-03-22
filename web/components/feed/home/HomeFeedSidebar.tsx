"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

interface HomeFeedSidebarProps {
  posts: HomeFeedPost[];
}

const FALLBACK_USERS = [
  { authorId: 1, authorNickname: "멍냥마당", authorProfileImageUrl: null },
  { authorId: 2, authorNickname: "우리동네 친구", authorProfileImageUrl: null },
  { authorId: 3, authorNickname: "산책 메이트", authorProfileImageUrl: null },
  { authorId: 4, authorNickname: "보호자 커뮤니티", authorProfileImageUrl: null },
  { authorId: 5, authorNickname: "반려생활 팁", authorProfileImageUrl: null },
  { authorId: 6, authorNickname: "입양 이야기", authorProfileImageUrl: null }
];

const SIDEBAR_NATIVE_AD = {
  sponsor: "PetYard Plus",
  title: "반려생활 루틴을 한눈에 정리해보세요",
  description: "산책, 건강 체크, 기록 메모를 보호자 대시보드에서 이어서 관리할 수 있어요.",
  ctaLabel: "둘러보기"
};

export function HomeFeedSidebar({ posts }: HomeFeedSidebarProps) {
  const users = Array.from(
    new Map(
      posts.map((post) => [
        post.authorId,
        {
          authorId: post.authorId,
          authorNickname: post.authorNickname,
          authorProfileImageUrl: post.authorProfileImageUrl
        }
      ])
    ).values()
  );

  const displayUsers = users.length > 0 ? users : FALLBACK_USERS;
  const featuredUser = displayUsers[0] ?? null;
  const suggestions = displayUsers.slice(1, 6);

  return (
    <aside className="home-feed-sidebar">
      <div className="home-feed-sidebar-account">
        <div className="home-feed-sidebar-account-main">
          <Avatar className="home-feed-sidebar-avatar">
            {featuredUser.authorProfileImageUrl ? (
              <AvatarImage src={featuredUser.authorProfileImageUrl} alt={featuredUser.authorNickname} />
            ) : (
              <AvatarFallback>{featuredUser.authorNickname[0] ?? "멍"}</AvatarFallback>
            )}
          </Avatar>
          <div className="home-feed-sidebar-account-copy">
            <p className="home-feed-sidebar-account-name">{featuredUser.authorNickname}</p>
            <p className="home-feed-sidebar-account-subtitle">
              {users.length > 0 ? "멍냥마당 추천 피드" : "새 게시물이 올라오면 여기서 바로 확인할 수 있어요."}
            </p>
          </div>
        </div>
        <button type="button" className="home-feed-sidebar-link">전환</button>
      </div>

      <div className="home-feed-sidebar-section">
        <div className="home-feed-sidebar-section-header">
          <p className="home-feed-sidebar-section-title">
            {users.length > 0 ? "회원님을 위한 추천" : "둘러볼 만한 주제"}
          </p>
          <button type="button" className="home-feed-sidebar-link">모두 보기</button>
        </div>
        <div className="home-feed-sidebar-suggestions">
          {suggestions.map((user) => (
            <div key={user.authorId} className="home-feed-sidebar-suggestion">
              <div className="home-feed-sidebar-suggestion-main">
                <Avatar className="home-feed-sidebar-suggestion-avatar">
                  {user.authorProfileImageUrl ? (
                    <AvatarImage src={user.authorProfileImageUrl} alt={user.authorNickname} />
                  ) : (
                    <AvatarFallback>{user.authorNickname[0] ?? "멍"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="home-feed-sidebar-suggestion-copy">
                  <p className="home-feed-sidebar-suggestion-name">{user.authorNickname}</p>
                  <p className="home-feed-sidebar-suggestion-meta">
                    {users.length > 0 ? "회원님을 위한 추천" : "새 피드가 등록되면 가장 먼저 보일 수 있어요."}
                  </p>
                </div>
              </div>
              <button type="button" className="home-feed-sidebar-link">팔로우</button>
            </div>
          ))}
        </div>
      </div>

      <section className="home-feed-sidebar-native-ad" aria-label="홈 피드 네이티브 광고">
        <p className="home-feed-sidebar-native-ad-badge">광고 · {SIDEBAR_NATIVE_AD.sponsor}</p>
        <div className="home-feed-sidebar-native-ad-copy">
          <p className="home-feed-sidebar-native-ad-title">{SIDEBAR_NATIVE_AD.title}</p>
          <p className="home-feed-sidebar-native-ad-description">{SIDEBAR_NATIVE_AD.description}</p>
        </div>
        <a href="/knowledge" className="home-feed-sidebar-native-ad-link">
          {SIDEBAR_NATIVE_AD.ctaLabel}
        </a>
      </section>

      <footer className="home-feed-sidebar-footer">
        소개 · 도움말 · 홍보 센터 · API · 채용 정보 · 개인정보처리방침 · 약관
      </footer>
    </aside>
  );
}
