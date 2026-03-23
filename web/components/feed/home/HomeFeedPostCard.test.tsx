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
    authorUsername: "essl2_2",
    authorNickname: "essl2_2",
    authorProfileImageUrl: null,
    guardianRelationStatus: "NONE",
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

  it("집사 관계가 없을 때는 집사 요청 API를 호출하고 요청됨 상태로 바뀐다", async () => {
    mockedRegisterGuardian.mockResolvedValueOnce({
      targetUserId: 2,
      guardianRelationStatus: "OUTGOING_REQUESTED",
      guardianRegisteredByMe: false
    });

    render(
      <HomeFeedPostCard
        post={createPost()}
        accessToken="token"
        viewerUserId={99}
        onOpenComments={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "집사 요청" }));

    await waitFor(() =>
      expect(mockedRegisterGuardian).toHaveBeenCalledWith("token", 2)
    );
    expect(screen.getByRole("button", { name: "요청됨" })).toBeDisabled();
    expect(mockedUnregisterGuardian).not.toHaveBeenCalled();
  });

  it("이미 연결된 상태에서 집사 해제를 누르면 확인 카드를 띄우고 확인 후 해제한다", async () => {
    mockedUnregisterGuardian.mockResolvedValueOnce({
      targetUserId: 2,
      guardianRelationStatus: "NONE",
      guardianRegisteredByMe: false
    });

    render(
      <HomeFeedPostCard
        post={createPost({ guardianRelationStatus: "CONNECTED", guardianRegisteredByMe: true })}
        accessToken="token"
        viewerUserId={99}
        onOpenComments={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "집사 해제" }));

    expect(
      screen.getByText("@essl2_2님과 맺은 집사 관계를 해제하시겠어요?")
    ).toBeInTheDocument();
    expect(mockedUnregisterGuardian).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "집사 해제" })[1]);

    await waitFor(() =>
      expect(mockedUnregisterGuardian).toHaveBeenCalledWith("token", 2)
    );
  });

  it("받은 요청이 있을 때는 집사 요청 수락으로 동작한다", async () => {
    mockedRegisterGuardian.mockResolvedValueOnce({
      targetUserId: 2,
      guardianRelationStatus: "CONNECTED",
      guardianRegisteredByMe: true
    });

    render(
      <HomeFeedPostCard
        post={createPost({ guardianRelationStatus: "INCOMING_REQUESTED" })}
        accessToken="token"
        viewerUserId={99}
        onOpenComments={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "집사 요청 수락" }));

    await waitFor(() =>
      expect(mockedRegisterGuardian).toHaveBeenCalledWith("token", 2)
    );
    expect(screen.getByRole("button", { name: "집사 해제" })).toBeInTheDocument();
  });
});
