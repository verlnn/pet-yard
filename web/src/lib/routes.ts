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
  profile: "/profile",
  setting: "/accounts/edit",
  accountNotifications: "/accounts/notifications",
  accountPrivacy: "/accounts/privacy",
  accountCloseFriends: "/accounts/close-friends",
  accountBlocked: "/accounts/blocked",
  accountPets: "/accounts/pets",
  accountPetsNew: "/accounts/pets/new"
} as const;

export type RouteKey = keyof typeof ROUTES;
