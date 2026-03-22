export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  start: "/start",
  verify: "/verify",
  onboarding: "/onboarding",
  onboardingProfile: "/onboarding/profile",
  oauth: "/oauth",
  feed: "/feed",
  myFeed: "/my-feed",
  walks: "/walks",
  boarding: "/boarding",
  knowledge: "/knowledge",
  notifications: "/notifications",
  pets: "/pets",
  profile: "/profile"
} as const;

export type RouteKey = keyof typeof ROUTES;
