import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  consoleFeedDebugLogger,
  createFeedRenderTimer,
  isFeedDebugEnabled
} from "./feedObservability";

describe("feedObservability", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enables feed debug logging when the local storage flag is present", () => {
    expect(isFeedDebugEnabled()).toBe(false);

    localStorage.setItem("feed:debug", "true");

    expect(isFeedDebugEnabled()).toBe(true);
  });

  it("logs timing payload only when feed debug mode is enabled", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const timer = createFeedRenderTimer();

    timer.complete("home-feed-first-page-rendered", consoleFeedDebugLogger, { itemCount: 2 });
    expect(debugSpy).not.toHaveBeenCalled();

    localStorage.setItem("feed:debug", "true");
    timer.complete("home-feed-first-page-rendered", consoleFeedDebugLogger, { itemCount: 2 });

    expect(debugSpy).toHaveBeenCalledWith(
      "[feed] home-feed-first-page-rendered",
      expect.objectContaining({
        itemCount: 2,
        elapsedMs: expect.any(Number)
      })
    );
    debugSpy.mockRestore();
  });
});
