const HOME_FEED_SCROLL_STORAGE_PREFIX = "feed:scroll";

export interface HomeFeedScrollState {
  scrollY: number;
  savedAt: number;
}

export function getHomeFeedScrollStorageKey(accessToken: string | null) {
  return `${HOME_FEED_SCROLL_STORAGE_PREFIX}:${accessToken ?? "anonymous"}`;
}

export function loadHomeFeedScrollState(accessToken: string | null): HomeFeedScrollState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.sessionStorage.getItem(getHomeFeedScrollStorageKey(accessToken));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as HomeFeedScrollState;
    if (typeof parsed.scrollY !== "number" || typeof parsed.savedAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveHomeFeedScrollState(accessToken: string | null, state: HomeFeedScrollState) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(getHomeFeedScrollStorageKey(accessToken), JSON.stringify(state));
}
