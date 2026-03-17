export type AuthMode = "login" | "signup" | "verify";
export type OAuthProvider = "kakao" | "google" | "apple" | "naver";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  email: string;
  expiresAt: string;
}

export interface VerificationExpiryResponse {
  expiresAt: string;
}

export interface OAuthStartResponse {
  authorizeUrl: string;
  state: string;
  expiresAt: string;
}

export interface OAuthCallbackResponse {
  status: "LOGIN" | "ONBOARDING";
  signupToken?: string | null;
  nextStep?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface SignupProgressResponse {
  step: string;
  expiresAt: string;
  hasPet: boolean;
  nickname?: string | null;
  profileImageUrl?: string | null;
}

export interface SignupStepResponse {
  nextStep: string;
}

export interface SignupCompleteResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TermsItem {
  code: string;
  version: number;
  title: string;
  mandatory: boolean;
  contentUrl?: string | null;
}

export interface TermsResponse {
  terms: TermsItem[];
}

export interface MeResponse {
  userId: number;
  tier: string;
  permissions: string[];
}
