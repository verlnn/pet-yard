import { describe, expect, it } from "vitest";

import type { HomeFeedPost } from "@/src/features/auth/types/authTypes";

import {
  buildHomeFeedItems,
  DEFAULT_HOME_FEED_AD_INTERVAL,
  HOME_FEED_ADS
} from "./homeFeedData";

function post(id: number): HomeFeedPost {
  return {
    id,
    authorId: id,
    authorNickname: `user-${id}`,
    pawCount: 0,
    pawedByMe: false,
    createdAt: "2026-03-23T00:00:00Z"
  };
}

describe("buildHomeFeedItems", () => {
  it("injects one ad after every four posts on the cumulative feed list", () => {
    const items = buildHomeFeedItems([post(1), post(2), post(3), post(4), post(5)]);

    expect(items.map((item) => item.type)).toEqual([
      "post",
      "post",
      "post",
      "post",
      "ad",
      "post"
    ]);
  });

  it("does not append an ad after the final post", () => {
    const items = buildHomeFeedItems([post(1), post(2), post(3), post(4)]);

    expect(items.every((item) => item.type === "post")).toBe(true);
  });

  it("keeps ad placement stable across page boundaries because it uses the accumulated post list", () => {
    const firstPageItems = buildHomeFeedItems([post(1), post(2), post(3)]);
    const secondPageItems = buildHomeFeedItems([post(1), post(2), post(3), post(4), post(5), post(6)]);

    expect(firstPageItems.every((item) => item.type === "post")).toBe(true);
    expect(secondPageItems[4]).toMatchObject({
      type: "ad",
      ad: HOME_FEED_ADS[0]
    });
  });

  it("can disable ad injection with a non-positive interval", () => {
    const items = buildHomeFeedItems([post(1), post(2), post(3)], HOME_FEED_ADS, 0);

    expect(items.map((item) => item.type)).toEqual(["post", "post", "post"]);
  });

  it("uses the documented default interval", () => {
    expect(DEFAULT_HOME_FEED_AD_INTERVAL).toBe(4);
  });

  it("keeps the fallback ads on the future-proof contract shape", () => {
    expect(HOME_FEED_ADS[0]).toMatchObject({
      adId: "ad-training",
      campaignId: expect.any(String),
      slotKey: expect.any(String),
      targetUrl: expect.any(String),
      tracking: {
        source: "client-fallback",
        placement: "feed-inline"
      }
    });
  });
});
