"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/10";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [hasPet, setHasPet] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupToken) return;
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.signupProfile(signupToken, {
        nickname: nickname.trim(),
        regionCode: regionCode.trim() || null,
        profileImageUrl: profileImageUrl.trim() || null,
        marketingOptIn,
        hasPet
      });
      if (result.nextStep === "CONSENTS") {
        router.push("/onboarding/consents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="추가 정보를 알려주세요"
        subtitle="서비스에 꼭 필요한 정보만 먼저 받습니다."
        error={error}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            닉네임
            <input
              className={inputClassName}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="멍냥마당에서 사용할 이름"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            지역 코드 (선택)
            <input
              className={inputClassName}
              value={regionCode}
              onChange={(event) => setRegionCode(event.target.value)}
              placeholder="예: SEOUL-SONGPA"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            프로필 이미지 URL (선택)
            <input
              className={inputClassName}
              value={profileImageUrl}
              onChange={(event) => setProfileImageUrl(event.target.value)}
              placeholder="https://"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
            />
            마케팅 수신 동의 (선택)
          </label>
          <div className="space-y-2 text-sm text-slate-600">
            반려동물 유무
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold ${
                  hasPet
                    ? "border-ink bg-ink text-sand"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                onClick={() => setHasPet(true)}
              >
                반려동물이 있어요
              </button>
              <button
                type="button"
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold ${
                  !hasPet
                    ? "border-ink bg-ink text-sand"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                onClick={() => setHasPet(false)}
              >
                나중에 등록할게요
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
            disabled={loading}
          >
            {loading ? "저장 중..." : "다음"}
          </button>
        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
