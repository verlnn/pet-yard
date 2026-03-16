"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";
import KakaoLoginButton from "@/src/features/onboarding/components/KakaoLoginButton";

export default function StartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKakaoStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.oauthStart("kakao");
      window.location.href = result.authorizeUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "카카오 인증에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="멍냥마당에 오신 걸 환영해요"
        subtitle="카카오톡으로 빠르게 시작하고, 필요한 정보만 추가로 입력해 주세요."
        error={error}
      >
        <KakaoLoginButton onClick={handleKakaoStart} disabled={loading} />
        <Link
          href="/signup"
          className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-ink/30 hover:text-ink"
        >
          이메일로 가입
        </Link>
        <div className="text-center text-sm text-slate-500">
          이미 계정이 있나요?{" "}
          <button
            type="button"
            className="font-semibold text-ink hover:text-ink/80"
            onClick={() => router.push("/login")}
          >
            로그인
          </button>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
