"use client";

import { consoleFeedDebugLogger, type FeedDebugLogger } from "@/app/(app)/feed/feedObservability";

import type { HomeFeedAd } from "./homeFeedData";

export interface HomeFeedAdTrackingContext {
  position: number;
}

export interface HomeFeedAdTrackingEvent {
  adId: string;
  campaignId: string;
  slotKey: string;
  targetUrl: string;
  position: number;
  source: HomeFeedAd["tracking"]["source"];
  placement: HomeFeedAd["tracking"]["placement"];
  experimentKey?: string | null;
}

export interface HomeFeedAdTracker {
  trackImpression(ad: HomeFeedAd, context: HomeFeedAdTrackingContext): void;
  trackClick(ad: HomeFeedAd, context: HomeFeedAdTrackingContext): void;
}

function buildTrackingEvent(
  ad: HomeFeedAd,
  context: HomeFeedAdTrackingContext
): HomeFeedAdTrackingEvent {
  return {
    adId: ad.adId,
    campaignId: ad.campaignId,
    slotKey: ad.slotKey,
    targetUrl: ad.targetUrl,
    position: context.position,
    source: ad.tracking.source,
    placement: ad.tracking.placement,
    experimentKey: ad.tracking.experimentKey ?? null
  };
}

export class DebugHomeFeedAdTracker implements HomeFeedAdTracker {
  constructor(private readonly logger: FeedDebugLogger = consoleFeedDebugLogger) {}

  trackImpression(ad: HomeFeedAd, context: HomeFeedAdTrackingContext) {
    this.logger.log("home-feed-ad-impression", {
      ...buildTrackingEvent(ad, context)
    });
  }

  trackClick(ad: HomeFeedAd, context: HomeFeedAdTrackingContext) {
    this.logger.log("home-feed-ad-click", {
      ...buildTrackingEvent(ad, context)
    });
  }
}

export const homeFeedAdTracker = new DebugHomeFeedAdTracker();
