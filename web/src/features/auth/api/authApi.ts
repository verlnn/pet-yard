import type { MeResponse, SignupResponse, TokenResponse, VerificationExpiryResponse } from "../types/authTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { message?: string; code?: string };
      const message = payload?.message ?? payload?.code ?? "Request failed";
      throw new ApiError(message, response.status, payload?.code);
    }
    const message = await response.text();
    throw new ApiError(message || "Request failed", response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export const authApi = {
  signup(email: string, password: string) {
    return request<SignupResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  verifyEmail(email: string, code: string) {
    return request<void>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code })
    });
  },
  extendEmail(email: string) {
    return request<VerificationExpiryResponse>("/api/auth/extend-email", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },
  resendEmail(email: string) {
    return request<VerificationExpiryResponse>("/api/auth/resend-email", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },
  logout(refreshToken: string) {
    return request<void>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    });
  },
  login(email: string, password: string) {
    return request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  me(accessToken: string) {
    return request<MeResponse>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
};
