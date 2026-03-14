export type AuthMode = "login" | "signup" | "verify";

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

export interface MeResponse {
  userId: number;
  tier: string;
  permissions: string[];
}
