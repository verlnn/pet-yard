"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/src/features/auth/components/AuthLayout/AuthLayout";
import AuthCard from "@/src/features/auth/components/AuthCard/AuthCard";
import { useAuthForms } from "@/src/features/auth/hooks/useAuthForms";
import type { AuthMode, OAuthProvider } from "@/src/features/auth/types/authTypes";
import KakaoLoginButton from "@/src/features/auth/components/AuthEntry/KakaoLoginButton";
import AuthEntryActions from "@/src/features/auth/components/AuthEntry/AuthEntryActions";
import { applyOAuthResult, openOAuthPopup, openOAuthPopupWindow } from "@/src/features/auth/utils/oauthFlow";
import { authApi } from "@/src/features/auth/api/authApi";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialError, setSocialError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const {
    title,
    subtitle,
    message,
    error
  } = useAuthForms({ mode, onModeChange: setMode, nextPath });

  const displayError = error ?? socialError;

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setSocialError(null);
    const popup = openOAuthPopupWindow(provider);
    if (!popup) {
      setSocialError("팝업을 열 수 없습니다. 브라우저의 팝업 차단을 확인해 주세요.");
      return;
    }
    try {
      const start = await authApi.oauthStart(provider);
      const result = await openOAuthPopup({ authorizeUrl: start.authorizeUrl, provider });
      const { nextPath: next } = applyOAuthResult(result);
      router.replace(next);
    } catch (err) {
      setSocialError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen">
      <AuthLayout
        brand={
          <div className="flex w-full max-w-md items-center justify-between text-white/70">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/70">
                M
              </span>
              <span className="text-sm font-semibold text-white">멍냥마당</span>
            </div>
            <span className="text-xs tracking-[0.3em] text-white/40">PetYard</span>
          </div>
        }
        card={
          <AuthCard
            title={title}
            subtitle={subtitle}
            message={message}
            error={displayError}
          >
            <div className="space-y-6">
              <KakaoLoginButton onClick={() => handleOAuthLogin("kakao")} />
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  다른 계정으로 계속
                </p>
                <div className="mt-4">
                  <AuthEntryActions
                    onGoogleLogin={() => handleOAuthLogin("google")}
                    onAppleLogin={() => handleOAuthLogin("apple")}
                    onNaverLogin={() => handleOAuthLogin("naver")}
                  />
                </div>
              </div>
              <p className="text-center text-sm text-white/60">
                멍냥마당은 소셜 계정으로만 가입 및 로그인할 수 있어요.
              </p>
            </div>
          </AuthCard>
        }
      />
    </div>
  );
}
