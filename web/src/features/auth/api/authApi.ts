import type { MeResponse, TokenResponse } from "../types/authTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const authApi = {
  signup(email: string, password: string) {
    // TODO: API 연동
    return request<void>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  verifyEmail(email: string, code: string) {
    // TODO: API 연동
    return request<void>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code })
    });
  },
  login(email: string, password: string) {
    // TODO: API 연동
    return request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  me(accessToken: string) {
    // TODO: API 연동
    return request<MeResponse>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
};
