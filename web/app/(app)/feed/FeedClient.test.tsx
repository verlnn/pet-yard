import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

import { authApi } from "@/src/features/auth/api/authApi";
import { FeedClient } from "./FeedClient";

vi.mock("@/components/feed/home/HomeFeedStories", () => ({
  HomeFeedStories: () => <div data-testid="home-feed-stories" />
}));

vi.mock("@/components/feed/home/HomeFeedSidebar", () => ({
  HomeFeedSidebar: () => <aside data-testid="home-feed-sidebar" />
}));

vi.mock("@/components/feed/home/HomeFeedPostCard", () => ({
  HomeFeedPostCard: ({ post }: { post: HomeFeedPost }) => <div data-testid={`post-${post.id}`} />
}));

vi.mock("@/components/feed/home/HomeFeedAdCard", () => ({
  HomeFeedAdCard: ({ ad }: { ad: { id: string } }) => <div data-testid={`ad-${ad.id}`} />
}));

vi.mock("@/src/features/auth/api/authApi", () => ({
  authApi: {
    getHomeFeed: vi.fn()
  }
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
}

function renderFeedClient() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedClient />
    </QueryClientProvider>
  );
}

function post(id: number): HomeFeedPost {
  return {
    id,
    authorId: id,
    authorNickname: `user-${id}`,
    pawCount: 0,
    pawedByMe: false,
    createdAt: "2026-03-23T00:00:00Z",
    imageUrls: [`/images/${id}.jpg`]
  };
}

describe("FeedClient", () => {
  const mockedGetHomeFeed = vi.mocked(authApi.getHomeFeed);

  beforeEach(() => {
    mockedGetHomeFeed.mockReset();
    localStorage.clear();
  });

  it("does not request the home feed when no access token exists", async () => {
    renderFeedClient();

    expect(screen.getByText("로그인이 필요합니다.")).toBeInTheDocument();
    await waitFor(() => expect(mockedGetHomeFeed).not.toHaveBeenCalled());
  });

  it("requests the first home feed page when an access token exists", async () => {
    localStorage.setItem("accessToken", "token-1");
    mockedGetHomeFeed.mockResolvedValueOnce({
      items: [post(1)],
      nextCursor: { createdAt: "2026-03-23T00:00:00Z", id: 1 },
      hasMore: true
    });

    renderFeedClient();

    await waitFor(() => expect(mockedGetHomeFeed).toHaveBeenCalledTimes(1));
    expect(mockedGetHomeFeed.mock.calls[0][1]).toMatchObject({
      cursorCreatedAt: null,
      cursorId: null
    });
    expect(await screen.findByTestId("post-1")).toBeInTheDocument();
  });
});
