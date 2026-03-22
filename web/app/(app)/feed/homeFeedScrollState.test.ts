import { beforeEach, describe, expect, it } from "vitest";

import {
  getHomeFeedScrollStorageKey,
  loadHomeFeedScrollState,
  saveHomeFeedScrollState
} from "./homeFeedScrollState";

describe("homeFeedScrollState", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("separates saved scroll state by access token", () => {
    expect(getHomeFeedScrollStorageKey("token-a")).not.toBe(getHomeFeedScrollStorageKey("token-b"));
  });

  it("persists and loads feed scroll state", () => {
    saveHomeFeedScrollState("token-a", {
      scrollY: 1820,
      savedAt: 123456789
    });

    expect(loadHomeFeedScrollState("token-a")).toEqual({
      scrollY: 1820,
      savedAt: 123456789
    });
  });

  it("returns null for malformed saved state", () => {
    sessionStorage.setItem(getHomeFeedScrollStorageKey("token-a"), "not-json");

    expect(loadHomeFeedScrollState("token-a")).toBeNull();
  });
});
