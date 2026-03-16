"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      setError("카카오 인증 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }

    const baseUrl = APP_BASE || window.location.origin;
    const redirectUri = `${baseUrl}/oauth/kakao/callback`;

    authApi
      .oauthCallback("kakao", code, state, redirectUri)
      .then((result) => {
        if (result.status === "LOGIN" && result.accessToken && result.refreshToken) {
          localStorage.setItem("accessToken", result.accessToken);
          localStorage.setItem("refreshToken", result.refreshToken);
          document.cookie = `accessToken=${result.accessToken}; path=/`;
          router.replace("/feed");
          return;
        }
        if (result.status === "ONBOARDING" && result.signupToken) {
          localStorage.setItem("signupToken", result.signupToken);
          router.replace("/onboarding/profile");
          return;
        }
        setError("회원가입 상태를 확인할 수 없습니다. 다시 시도해 주세요.");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "카카오 인증에 실패했습니다.");
      });
  }, [params, router]);

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="카카오 인증 처리 중"
        subtitle="잠시만 기다려 주세요."
        error={error}
      >
        {!error && <p className="text-sm text-slate-500">안전하게 로그인 정보를 확인하고 있습니다.</p>}
      </OnboardingCard>
    </OnboardingLayout>
  );
}
