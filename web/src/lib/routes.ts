export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  start: "/start",
  verify: "/verify",
  onboarding: "/onboarding",
  oauth: "/oauth",
  feed: "/feed",
  myFeed: "/my-feed",
  walks: "/walks",
  profile: "/profile"
} as const;

export type RouteKey = keyof typeof ROUTES;
