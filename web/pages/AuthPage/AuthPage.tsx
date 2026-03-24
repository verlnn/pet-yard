"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("signupToken");
    }
  }, []);
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
          <div className="auth-page-hero">
            <div className="auth-page-hero-header">
              <div className="auth-page-hero-brand">
                <Image
                  src="/images/brand/petyard-logo.png"
                  alt="멍냥마당 로고"
                  width={72}
                  height={72}
                  className="auth-page-hero-logo"
                  priority
                />
                <div className="auth-page-hero-brand-copy">
                  <span className="auth-page-hero-brand-name">멍냥마당</span>
                  <span className="auth-page-hero-brand-tag">PetYard</span>
                </div>
              </div>
            </div>
            <div className="auth-page-hero-copy">
              <p className="auth-page-hero-eyebrow">PetYard Social Login</p>
              <h1 className="auth-page-hero-title">
                <span className="auth-page-hero-title-accent">친한 이웃</span>의 반려 일상을
                더 가까이 만나보세요.
              </h1>
              <p className="auth-page-hero-description">
                산책 메이트를 찾고, 우리 동네 반려 일상을 공유하고, 믿을 수 있는 케어 정보를
                한곳에서 이어보는 반려생활 커뮤니티입니다.
              </p>
            </div>
            <div className="auth-page-hero-showcase" aria-hidden="true">
              <div className="auth-page-hero-card auth-page-hero-card-back">
                <span className="auth-page-hero-card-label">동네 산책</span>
                <span className="auth-page-hero-card-pill">Meet</span>
              </div>
              <div className="auth-page-hero-card auth-page-hero-card-middle">
                <span className="auth-page-hero-card-label">산책 기록</span>
                <span className="auth-page-hero-card-pill">Daily</span>
              </div>
              <div className="auth-page-hero-card auth-page-hero-card-front">
                <div className="auth-page-hero-card-badge">PAW</div>
                <span className="auth-page-hero-card-label">우리 동네 피드</span>
                <span className="auth-page-hero-card-pill">PetYard</span>
              </div>
              <div className="auth-page-hero-orb auth-page-hero-orb-orange" />
              <div className="auth-page-hero-orb auth-page-hero-orb-teal" />
              <div className="auth-page-hero-heart" />
            </div>
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
              <div className="auth-page-social-panel">
                <p className="auth-page-social-title">
                  다른 계정으로 계속
                </p>
                <div className="auth-page-social-actions">
                  <KakaoLoginButton onClick={() => handleOAuthLogin("kakao")} />
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
