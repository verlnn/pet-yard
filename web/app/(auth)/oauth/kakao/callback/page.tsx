"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import { applyOAuthResult } from "@/src/features/auth/utils/oauthFlow";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "";

function KakaoCallbackPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) {
      setError("카카오 인증 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      return;
    }

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
        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            { type: "oauth:success", provider: "kakao", payload: result },
            window.location.origin
          );
          window.close();
          return;
        }

        const { nextPath } = applyOAuthResult(result);
        router.replace(nextPath);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "카카오 인증에 실패했습니다.";
        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            { type: "oauth:error", provider: "kakao", error: message },
            window.location.origin
          );
          window.close();
          return;
        }
        setError(message);
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

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <KakaoCallbackPageContent />
    </Suspense>
  );
}
