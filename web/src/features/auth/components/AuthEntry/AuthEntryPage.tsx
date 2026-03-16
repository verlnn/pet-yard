"use client";

import Link from "next/link";
import SpeechBubbleBadge from "./SpeechBubbleBadge";
import KakaoLoginButton from "./KakaoLoginButton";
import AuthDivider from "./AuthDivider";
import AuthEntryActions from "./AuthEntryActions";

export default function AuthEntryPage() {
  const handleKakaoLogin = () => {
    console.log("kakao login");
  };

  const handleGoogleLogin = () => {
    console.log("google login");
  };

  const handleAppleLogin = () => {
    console.log("apple login");
  };

  const handleNaverLogin = () => {
    console.log("naver login");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <SpeechBubbleBadge text="5초만에 빠른 회원가입" />

        <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <div className="space-y-6">
            <KakaoLoginButton onClick={handleKakaoLogin} />
            <AuthDivider />
            <AuthEntryActions
              onGoogleLogin={handleGoogleLogin}
              onAppleLogin={handleAppleLogin}
              onNaverLogin={handleNaverLogin}
            />
          </div>

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
