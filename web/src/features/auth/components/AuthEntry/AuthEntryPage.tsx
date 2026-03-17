"use client";

import Link from "next/link";
import SpeechBubbleBadge from "./SpeechBubbleBadge";
import KakaoLoginButton from "./KakaoLoginButton";
import AuthDivider from "./AuthDivider";
import AuthEntryActions from "./AuthEntryActions";
import { authApi } from "@/src/features/auth/api/authApi";
import { applyOAuthResult, openOAuthPopup } from "@/src/features/auth/utils/oauthFlow";
import type { OAuthProvider } from "@/src/features/auth/types/authTypes";
import { useState } from "react";

export default function AuthEntryPage() {
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setError(null);
    try {
      const start = await authApi.oauthStart(provider, { prompt: "login" });
      const result = await openOAuthPopup({ authorizeUrl: start.authorizeUrl, provider });
      const { nextPath } = applyOAuthResult(result);
      window.location.assign(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <SpeechBubbleBadge text="5초만에 빠른 회원가입" />

        <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="space-y-6">
            <KakaoLoginButton onClick={() => handleOAuthLogin("kakao")} />
            <AuthDivider />
            <AuthEntryActions
              onGoogleLogin={() => handleOAuthLogin("google")}
              onAppleLogin={() => handleOAuthLogin("apple")}
              onNaverLogin={() => handleOAuthLogin("naver")}
            />
          </div>

          {error && <p className="mt-4 text-center text-sm text-rose-500">{error}</p>}
          <div className="mt-6 text-center text-sm text-slate-500">
            <Link href="#" className="font-semibold text-slate-700 hover:text-slate-900">
              회원가입 문의
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
