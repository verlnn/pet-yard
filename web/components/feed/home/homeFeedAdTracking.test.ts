import { describe, expect, it, vi } from "vitest";

import { DebugHomeFeedAdTracker } from "./homeFeedAdTracking";
import { HOME_FEED_ADS } from "./homeFeedData";

describe("DebugHomeFeedAdTracker", () => {
  it("tracks impression events with the ad contract fields", () => {
    const logger = { log: vi.fn() };
    const tracker = new DebugHomeFeedAdTracker(logger);

    tracker.trackImpression(HOME_FEED_ADS[0], { position: 4 });

    expect(logger.log).toHaveBeenCalledWith("home-feed-ad-impression", {
      adId: HOME_FEED_ADS[0].adId,
      campaignId: HOME_FEED_ADS[0].campaignId,
      slotKey: HOME_FEED_ADS[0].slotKey,
      targetUrl: HOME_FEED_ADS[0].targetUrl,
      position: 4,
      source: HOME_FEED_ADS[0].tracking.source,
      placement: HOME_FEED_ADS[0].tracking.placement,
      experimentKey: null
    });
  });

  it("tracks click events with the same contract", () => {
    const logger = { log: vi.fn() };
    const tracker = new DebugHomeFeedAdTracker(logger);

    tracker.trackClick(HOME_FEED_ADS[1], { position: 9 });

    expect(logger.log).toHaveBeenCalledWith("home-feed-ad-click", {
      adId: HOME_FEED_ADS[1].adId,
      campaignId: HOME_FEED_ADS[1].campaignId,
      slotKey: HOME_FEED_ADS[1].slotKey,
      targetUrl: HOME_FEED_ADS[1].targetUrl,
      position: 9,
      source: HOME_FEED_ADS[1].tracking.source,
      placement: HOME_FEED_ADS[1].tracking.placement,
      experimentKey: null
    });
  });
});
