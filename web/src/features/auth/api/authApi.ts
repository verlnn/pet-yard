import type {
  MeResponse,
  MyProfileResponse,
  PublicProfileResponse,
  OAuthCallbackResponse,
  OAuthStartResponse,
  OAuthProvider,
  FeedPost,
  FeedPostComment,
  HomeFeedPage,
  GuardianRegistrationResponse,
  UserNotification,
  UserNotificationActionResponse,
  PetBreed,
  PetProfile,
  PetRegistrationVerificationResponse,
  SignupCompleteResponse,
  SignupProgressResponse,
  SignupResponse,
  SignupStepResponse,
  TermsResponse,
  TokenResponse,
  VerificationExpiryResponse
} from "../types/authTypes";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const REFRESH_PATH = "/api/auth/refresh";
let refreshInFlight: Promise<TokenResponse> | null = null;

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

function cloneInit(init?: RequestInit): RequestInit | undefined {
  if (!init) return undefined;
  return {
    ...init,
    headers: new Headers(init.headers ?? {})
  };
}

function setAuthHeader(init: RequestInit | undefined, accessToken: string) {
  if (!init) return;
  const headers = new Headers(init.headers ?? {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  init.headers = headers;
}

async function refreshTokens(): Promise<TokenResponse> {
  if (!refreshInFlight) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new ApiError("Missing refresh token", 401, "REFRESH_TOKEN_NOT_FOUND");
    }
    refreshInFlight = request<TokenResponse>(REFRESH_PATH, {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    if (response.status === 401 && path !== REFRESH_PATH) {
      try {
        const tokens = await refreshTokens();
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        const retryInit = cloneInit(init);
        setAuthHeader(retryInit, tokens.accessToken);
        return request<T>(path, retryInit);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        document.cookie = "accessToken=; path=/; max-age=0";
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw error;
      }
    }
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
  signup(username: string, email: string, password: string) {
    return request<SignupResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
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
  refresh(refreshToken: string) {
    return request<TokenResponse>(REFRESH_PATH, {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    });
  },
  oauthStart(provider: OAuthProvider, options?: { prompt?: string }) {
    const params = new URLSearchParams();
    if (options?.prompt) {
      params.set("prompt", options.prompt);
    }
    const url = params.size
      ? `/api/auth/oauth/${provider}/start?${params.toString()}`
      : `/api/auth/oauth/${provider}/start`;
    return request<OAuthStartResponse>(url, { method: "POST" });
  },
  oauthCallback(provider: OAuthProvider, code: string, state: string, redirectUri: string) {
    const params = new URLSearchParams({ code, state, redirectUri });
    return request<OAuthCallbackResponse>(`/api/auth/oauth/${provider}/callback?${params.toString()}`, {
      method: "GET"
    });
  },
  signupProgress(signupToken: string) {
    return request<SignupProgressResponse>("/api/auth/signup/progress", {
      method: "GET",
      headers: {
        "X-Signup-Token": signupToken
      }
    });
  },
  signupProfile(
    signupToken: string,
    payload: {
      nickname: string;
      username: string;
      regionCode?: string | null;
      profileImageUrl?: string | null;
      marketingOptIn: boolean;
      hasPet: boolean;
    }
  ) {
    return request<SignupStepResponse>("/api/auth/signup/profile", {
      method: "POST",
      headers: {
        "X-Signup-Token": signupToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  },
  signupConsents(signupToken: string, consents: Array<{ code: string; agreed: boolean }>) {
    return request<SignupStepResponse>("/api/auth/signup/consents", {
      method: "POST",
      headers: {
        "X-Signup-Token": signupToken
      },
      body: JSON.stringify({ consents })
    });
  },
  signupPet(
    signupToken: string,
    payload: {
      dogRegNo: string;
      rfidCd: string;
      ownerNm: string;
      ownerBirth: string;
      photoUrl?: string | null;
      weightKg?: number | null;
      vaccinationComplete?: boolean | null;
      walkSafetyChecked?: boolean | null;
    }
  ) {
    return request<SignupStepResponse>("/api/auth/signup/pet", {
      method: "POST",
      headers: {
        "X-Signup-Token": signupToken
      },
      body: JSON.stringify(payload)
    });
  },
  signupVerifyPetRegistration(
    payload: { dogRegNo: string; rfidCd: string; ownerNm: string; ownerBirth: string }
  ) {
    return request<PetRegistrationVerificationResponse>("/api/auth/signup/pet/verify", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  signupComplete(signupToken: string) {
    return request<SignupCompleteResponse>("/api/auth/signup/complete", {
      method: "POST",
      headers: {
        "X-Signup-Token": signupToken
      }
    });
  },
  terms() {
    return request<TermsResponse>("/api/auth/terms", {
      method: "GET"
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
  },
  getMyProfile(accessToken: string) {
    return request<MyProfileResponse>("/api/users/me/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getPublicProfile(accessToken: string, username: string) {
    return request<PublicProfileResponse>(`/api/users/${encodeURIComponent(username)}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getHomeFeed(
    accessToken: string,
    options?: {
      cursorCreatedAt?: string | null;
      cursorId?: number | null;
      limit?: number | null;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.cursorCreatedAt) {
      params.set("cursorCreatedAt", options.cursorCreatedAt);
    }
    if (options?.cursorId) {
      params.set("cursorId", String(options.cursorId));
    }
    if (options?.limit) {
      params.set("limit", String(options.limit));
    }
    const query = params.toString();
    const path = query ? `/api/feeds?${query}` : "/api/feeds";
    return request<HomeFeedPage>(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  updateMyProfileSettings(
    accessToken: string,
    payload: {
      username?: string | null;
      bio?: string | null;
      gender: string;
      primaryPetId?: number | null;
    }
  ) {
    return request<MyProfileResponse>("/api/users/me/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
  },
  createPetProfile(
    accessToken: string,
    payload: {
      dogRegNo: string;
      rfidCd: string;
      ownerNm: string;
      ownerBirth: string;
      intro?: string | null;
      photoUrl?: string | null;
      weightKg?: number | null;
      vaccinationComplete?: boolean | null;
      walkSafetyChecked?: boolean | null;
    }
  ) {
    return request<PetProfile>("/api/pets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
  },
  updatePetProfile(
    accessToken: string,
    id: number,
    payload: {
      name: string;
      species: string;
      breed?: string | null;
      birthDate?: string | null;
      ageGroup?: string | null;
      gender: string;
      neutered?: boolean | null;
      intro?: string | null;
      photoUrl?: string | null;
      weightKg?: number | null;
      vaccinationComplete?: boolean | null;
      walkSafetyChecked?: boolean | null;
    }
  ) {
    return request<PetProfile>(`/api/pets/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
  },
  getPetBreeds(accessToken: string, species: string) {
    const params = new URLSearchParams({ species });
    return request<PetBreed[]>(`/api/pets/breeds?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getOwnPosts(accessToken: string) {
    return request<FeedPost[]>("/api/feeds/own-posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getUserPosts(accessToken: string, username: string) {
    return request<FeedPost[]>(`/api/feeds/users/${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  createFeedPost(
    accessToken: string,
    payload: FormData
  ) {
    return request<FeedPost>("/api/feeds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: payload
    });
  },
  deleteFeedPost(accessToken: string, id: number) {
    return request<void>(`/api/feeds/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  addFeedPostPaw(accessToken: string, id: number) {
    return request<import("../types/authTypes").FeedPostPawResponse>(`/api/feeds/${id}/paws`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  removeFeedPostPaw(accessToken: string, id: number) {
    return request<import("../types/authTypes").FeedPostPawResponse>(`/api/feeds/${id}/paws`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getFeedPostComments(accessToken: string, id: number) {
    return request<FeedPostComment[]>(`/api/feeds/${id}/comments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  addFeedPostComment(accessToken: string, id: number, content: string) {
    return request<FeedPostComment>(`/api/feeds/${id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ content })
    });
  },
  registerGuardian(accessToken: string, targetUserId: number) {
    return request<GuardianRegistrationResponse>(`/api/users/${targetUserId}/guardians`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  unregisterGuardian(accessToken: string, targetUserId: number) {
    return request<GuardianRegistrationResponse>(`/api/users/${targetUserId}/guardians`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  getNotifications(accessToken: string) {
    return request<UserNotification[]>("/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  acceptGuardianRequestNotification(accessToken: string, notificationId: number) {
    return request<UserNotificationActionResponse>(`/api/notifications/${notificationId}/guardians/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  rejectGuardianRequestNotification(accessToken: string, notificationId: number) {
    return request<UserNotificationActionResponse>(`/api/notifications/${notificationId}/guardians/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  verifyPetRegistration(
    accessToken: string,
    payload: { dogRegNo: string; rfidCd: string; ownerNm: string; ownerBirth: string }
  ) {
    return request<PetRegistrationVerificationResponse>("/api/pets/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
  }
};
