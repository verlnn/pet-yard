"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthLayout from "@/src/features/auth/components/AuthLayout/AuthLayout";
import AuthCard from "@/src/features/auth/components/AuthCard/AuthCard";
import { useAuthForms } from "@/src/features/auth/hooks/useAuthForms";
import type { AuthMode, OAuthProvider } from "@/src/features/auth/types/authTypes";
import KakaoLoginButton from "@/src/features/auth/components/social-auth/KakaoLoginButton";
import AuthEntryActions from "@/src/features/auth/components/social-auth/AuthEntryActions";
import { applyOAuthResult, openOAuthPopupWindow, waitForOAuthPopup } from "@/src/features/auth/utils/oauthFlow";
import { authApi } from "@/src/features/auth/api/authApi";

interface AuthPageProps {
  initialMode?: AuthMode;
}

function AuthPageContent({ initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialError, setSocialError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next");
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
      const start =
        mode === "signup"
          ? await authApi.oauthStart(provider, { prompt: "login" })
          : await authApi.oauthStart(provider);
      popup.location.href = start.authorizeUrl;
      const result = await waitForOAuthPopup({ popup, provider });
      const { nextPath: next } = applyOAuthResult(result);
      router.replace(next);
    } catch (err) {
      setSocialError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="auth-page">
      <AuthLayout
        brand={
          <div className="auth-page-brandbar">
            <div className="auth-page-brandlink">
              <span className="auth-page-brandmark">
                M
              </span>
              <span className="auth-page-brandtitle">멍냥마당</span>
            </div>
            <span className="auth-page-wordmark">PetYard</span>
          </div>
        }
        card={
          <AuthCard
            title={title}
            subtitle={subtitle}
            message={message}
            error={displayError}
          >
            <div className="auth-page-actions">
              <KakaoLoginButton onClick={() => handleOAuthLogin("kakao")} />
              <div className="auth-page-social-panel">
                <p className="auth-page-social-title">
                  다른 계정으로 계속
                </p>
                <div className="auth-page-social-actions">
                  <AuthEntryActions
                    onGoogleLogin={() => handleOAuthLogin("google")}
                    onAppleLogin={() => handleOAuthLogin("apple")}
                    onNaverLogin={() => handleOAuthLogin("naver")}
                  />
                </div>
              </div>
              <p className="auth-page-helper-text">
                멍냥마당은 소셜 계정으로만 가입 및 로그인할 수 있어요.
              </p>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="auth-page-mode-button"
                >
                  회원가입으로 이동
                </button>
              )}
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="auth-page-mode-button"
                >
                  로그인으로 이동
                </button>
              )}
            </div>
          </AuthCard>
        }
      />
    </div>
  );
}

export default function AuthPage(props: AuthPageProps) {
  return (
    <Suspense fallback={null}>
      <AuthPageContent {...props} />
    </Suspense>
  );
}
