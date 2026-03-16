"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    authApi
      .signupComplete(token)
      .then((result) => {
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        document.cookie = `accessToken=${result.accessToken}; path=/`;
        localStorage.removeItem("signupToken");
        router.replace("/feed");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "가입 완료에 실패했습니다.");
      });
  }, [router]);

  return (
    <OnboardingLayout>
      <OnboardingCard title="가입을 완료하고 있어요" subtitle="곧 멍냥마당으로 이동합니다." error={error}>
        {!error && <p className="text-sm text-slate-500">프로필을 준비하고 있어요.</p>}
      </OnboardingCard>
    </OnboardingLayout>
  );
}
