"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";
import { buildProfileRoute } from "@/src/lib/routes";

interface HomeFeedStoriesProps {
  posts: HomeFeedPost[];
}

const FALLBACK_STORIES = [
  "새 친구 찾기",
  "산책 기록",
  "인기 피드",
  "반려동물 팁",
  "커뮤니티",
  "이벤트"
];

export function HomeFeedStories({ posts }: HomeFeedStoriesProps) {
  const stories = Array.from(
    new Map(
      posts.map((post) => [
        post.authorId,
        {
          authorId: post.authorId,
          authorUsername: post.authorUsername,
          authorNickname: post.authorNickname,
          authorProfileImageUrl: post.authorProfileImageUrl
        }
      ])
    ).values()
  ).slice(0, 10);

  return (
    <section className="home-feed-stories" aria-label="스토리">
      <div className="home-feed-stories-track">
        {stories.length > 0
          ? stories.map((story) => (
              <Link key={story.authorId} href={buildProfileRoute(story.authorUsername)} className="home-feed-story-item">
                <span className="home-feed-story-ring">
                  <Avatar className="home-feed-story-avatar">
                    {story.authorProfileImageUrl ? (
                      <AvatarImage src={story.authorProfileImageUrl} alt={story.authorNickname} />
                    ) : (
                      <AvatarFallback>{story.authorNickname[0] ?? "멍"}</AvatarFallback>
                    )}
                  </Avatar>
                </span>
                <span className="home-feed-story-label">{story.authorNickname}</span>
              </Link>
            ))
          : FALLBACK_STORIES.map((label) => (
              <div key={label} className="home-feed-story-item" aria-hidden="true">
                <span className="home-feed-story-ring home-feed-story-ring-muted">
                  <span className="home-feed-story-avatar home-feed-story-avatar-placeholder" />
                </span>
                <span className="home-feed-story-label">{label}</span>
              </div>
            ))}
      </div>
    </section>
  );
}
