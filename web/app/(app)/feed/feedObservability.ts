const FEED_DEBUG_STORAGE_KEY = "feed:debug";

export interface FeedDebugLogger {
  log(event: string, payload?: Record<string, unknown>): void;
}

class ConsoleFeedDebugLogger implements FeedDebugLogger {
  log(event: string, payload: Record<string, unknown> = {}) {
    if (!isFeedDebugEnabled()) {
      return;
    }
    console.debug(`[feed] ${event}`, payload);
  }
}

export const consoleFeedDebugLogger = new ConsoleFeedDebugLogger();

export function isFeedDebugEnabled() {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.localStorage.getItem(FEED_DEBUG_STORAGE_KEY) === "true" ||
    process.env.NEXT_PUBLIC_FEED_DEBUG === "true"
  );
}

export function createFeedRenderTimer() {
  const startedAt = performance.now();

  return {
    complete(label: string, logger: FeedDebugLogger, payload: Record<string, unknown> = {}) {
      logger.log(label, {
        ...payload,
        elapsedMs: Math.round(performance.now() - startedAt)
      });
    }
  };
}
