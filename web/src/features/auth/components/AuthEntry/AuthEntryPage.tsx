"use client";

import Link from "next/link";
import SpeechBubbleBadge from "./SpeechBubbleBadge";
import KakaoLoginButton from "./KakaoLoginButton";
import AuthEntryActions from "./AuthEntryActions";
import { authApi } from "@/src/features/auth/api/authApi";
import { applyOAuthResult, openOAuthPopupWindow, waitForOAuthPopup } from "@/src/features/auth/utils/oauthFlow";
import type { OAuthProvider } from "@/src/features/auth/types/authTypes";
import { useState } from "react";

export default function AuthEntryPage() {
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setError(null);
    const popup = openOAuthPopupWindow(provider);
    if (!popup) {
      setError("팝업을 열 수 없습니다. 브라우저의 팝업 차단을 확인해 주세요.");
      return;
    }
    try {
      const start = await authApi.oauthStart(provider);
      popup.location.href = start.authorizeUrl;
      const result = await waitForOAuthPopup({ popup, provider });
      const { nextPath } = applyOAuthResult(result);
      window.location.assign(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <SpeechBubbleBadge text="5초 만에 빠른 회원가입" />

        <div className="w-full rounded-[30px] border border-white/70 bg-white/85 px-6 py-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="space-y-6">
            <KakaoLoginButton onClick={() => handleOAuthLogin("kakao")} />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
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
            <p className="text-center text-sm text-slate-500">
              멍냥마당은 소셜 계정으로만 가입 및 로그인할 수 있어요.
            </p>
          </div>

          {error && <p className="mt-5 text-center text-sm text-rose-500">{error}</p>}
          <div className="mt-6 text-center text-xs text-slate-500">
            계정 문의가 필요하신가요?{" "}
            <Link href="#" className="font-semibold text-slate-700 hover:text-slate-900">
              고객센터
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
