"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

interface HomeFeedStoriesProps {
  posts: HomeFeedPost[];
}

export function HomeFeedStories({ posts }: HomeFeedStoriesProps) {
  const stories = Array.from(
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
  ).slice(0, 10);

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="home-feed-stories" aria-label="스토리">
      <div className="home-feed-stories-track">
        {stories.map((story) => (
          <button key={story.authorId} type="button" className="home-feed-story-item">
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
          </button>
        ))}
      </div>
    </section>
  );
}
