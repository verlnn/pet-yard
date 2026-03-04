export type AuthMode = "login" | "signup" | "verify";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  userId: number;
  tier: string;
  permissions: string[];
}
