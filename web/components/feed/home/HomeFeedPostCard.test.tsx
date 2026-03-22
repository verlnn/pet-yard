import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/src/features/auth/api/authApi";
import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

import { HomeFeedPostCard } from "./HomeFeedPostCard";

vi.mock("@/src/features/auth/api/authApi", () => ({
  authApi: {
    addFeedPostPaw: vi.fn(),
    removeFeedPostPaw: vi.fn(),
    registerGuardian: vi.fn(),
    unregisterGuardian: vi.fn()
  }
}));

function createPost(overrides: Partial<HomeFeedPost> = {}): HomeFeedPost {
  return {
    id: 1,
    authorId: 2,
    authorNickname: "essl2_2",
    authorProfileImageUrl: null,
    guardianRegisteredByMe: false,
    commentCount: 0,
    pawCount: 0,
    pawedByMe: false,
    createdAt: "2026-03-23T00:00:00Z",
    content: "테스트 게시물",
    imageUrls: ["/images/test.jpg"],
    ...overrides
  };
}

describe("HomeFeedPostCard", () => {
  const mockedRegisterGuardian = vi.mocked(authApi.registerGuardian);
  const mockedUnregisterGuardian = vi.mocked(authApi.unregisterGuardian);

  beforeEach(() => {
    mockedRegisterGuardian.mockReset();
    mockedUnregisterGuardian.mockReset();
  });

  it("집사 등록 상태가 아닐 때는 바로 집사 등록 API를 호출한다", async () => {
    mockedRegisterGuardian.mockResolvedValueOnce({
      targetUserId: 2,
      guardianRegisteredByMe: true
    });

    render(
      <HomeFeedPostCard
        post={createPost()}
        accessToken="token"
        viewerUserId={99}
        onOpenComments={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "집사 등록" }));

    await waitFor(() =>
      expect(mockedRegisterGuardian).toHaveBeenCalledWith("token", 2)
    );
    expect(mockedUnregisterGuardian).not.toHaveBeenCalled();
  });

  it("이미 집사 등록된 상태에서 집사 해제를 누르면 확인 카드를 띄우고 확인 후 해제한다", async () => {
    mockedUnregisterGuardian.mockResolvedValueOnce({
      targetUserId: 2,
      guardianRegisteredByMe: false
    });

    render(
      <HomeFeedPostCard
        post={createPost({ guardianRegisteredByMe: true })}
        accessToken="token"
        viewerUserId={99}
        onOpenComments={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "집사 해제" }));

    expect(
      screen.getByText("@essl2_2님의 집사 등록을 해제하시겠어요?")
    ).toBeInTheDocument();
    expect(mockedUnregisterGuardian).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "집사 해제" })[1]);

    await waitFor(() =>
      expect(mockedUnregisterGuardian).toHaveBeenCalledWith("token", 2)
    );
  });
});
