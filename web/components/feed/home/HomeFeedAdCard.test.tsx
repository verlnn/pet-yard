import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_FEED_ADS } from "./homeFeedData";
import { HomeFeedAdCard } from "./HomeFeedAdCard";

const { tracked } = vi.hoisted(() => ({
  tracked: {
    trackImpression: vi.fn(),
    trackClick: vi.fn()
  }
}));

vi.mock("./homeFeedAdTracking", () => ({
  homeFeedAdTracker: tracked
}));

class MockIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          isIntersecting: true,
          target
        } as IntersectionObserverEntry
      ],
      this as unknown as IntersectionObserver
    );
  }

  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

describe("HomeFeedAdCard", () => {
  beforeEach(() => {
    tracked.trackImpression.mockReset();
    tracked.trackClick.mockReset();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("tracks an impression when the ad enters the viewport", async () => {
    render(<HomeFeedAdCard ad={{ ...HOME_FEED_ADS[0], targetUrl: "#" }} position={4} />);

    await waitFor(() =>
      expect(tracked.trackImpression).toHaveBeenCalledWith(
        { ...HOME_FEED_ADS[0], targetUrl: "#" },
        { position: 4 }
      )
    );
  });

  it("tracks clicks when the CTA is pressed", () => {
    const ad = { ...HOME_FEED_ADS[1], targetUrl: "#" };
    render(<HomeFeedAdCard ad={ad} position={9} />);

    fireEvent.click(screen.getByRole("link", { name: /알림 설정/i }));

    expect(tracked.trackClick).toHaveBeenCalledWith(ad, { position: 9 });
  });
});
