"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
  }, [router]);

  const handleStart = async () => {
    if (!signupToken) return;
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.signupComplete(signupToken);
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      document.cookie = `accessToken=${result.accessToken}; path=/`;
      localStorage.removeItem("signupToken");
      router.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입 완료 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="멍냥마당에 오신 것을 환영해요"
        subtitle="기본 정보 설정이 모두 끝났어요. 이제 멍냥마당을 둘러보세요."
        error={error}
      >
        <div className="onboarding-complete-body">
          <p className="onboarding-complete-message">
            반가워요. 이제 우리 아이와 함께 멍냥마당을 시작할 준비가 됐어요.
          </p>
          <button
            type="button"
            className="onboarding-complete-button"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "입장 준비 중..." : "멍냥마당 시작하기"}
          </button>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
