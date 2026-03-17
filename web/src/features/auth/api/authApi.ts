import type {
  MeResponse,
  MyProfileResponse,
  OAuthCallbackResponse,
  OAuthStartResponse,
  OAuthProvider,
  FeedPost,
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
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
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
      name: string;
      species: string;
      breed?: string | null;
      birthDate?: string | null;
      ageGroup?: string | null;
      gender: string;
      neutered?: boolean | null;
      intro?: string | null;
      photoUrl?: string | null;
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
  getMyFeed(accessToken: string) {
    return request<FeedPost[]>("/api/feeds/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  },
  createFeedPost(
    accessToken: string,
    payload: { content?: string | null; imageUrl?: string | null }
  ) {
    return request<FeedPost>("/api/feeds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
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
