"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import type { TermsItem } from "@/src/features/auth/types/authTypes";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

export default function OnboardingConsentsPage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [terms, setTerms] = useState<TermsItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
    authApi
      .terms()
      .then((response) => {
        setTerms(response.terms);
        const initial: Record<string, boolean> = {};
        response.terms.forEach((item) => {
          initial[item.code] = false;
        });
        setChecked(initial);
      })
      .catch(() => setError("약관 정보를 불러오지 못했습니다."));
  }, [router]);

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    terms.forEach((item) => {
      next[item.code] = value;
    });
    setChecked(next);
  };

  const handleSubmit = async () => {
    if (!signupToken) return;
    setLoading(true);
    setError(null);
    try {
      const consents = terms.map((item) => ({ code: item.code, agreed: Boolean(checked[item.code]) }));
      const result = await authApi.signupConsents(signupToken, consents);
      if (result.nextStep === "COMPLETE") {
        router.push("/onboarding/complete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "약관 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const allChecked = terms.length > 0 && terms.every((item) => checked[item.code]);

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="약관 동의"
        subtitle="서비스 이용을 위해 꼭 필요한 약관이에요."
        error={error}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={allChecked} onChange={(event) => toggleAll(event.target.checked)} />
            전체 동의
          </label>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {terms.map((item) => (
              <label key={item.code} className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  {item.title} {item.mandatory ? "(필수)" : "(선택)"}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(checked[item.code])}
                  onChange={(event) =>
                    setChecked((prev) => ({
                      ...prev,
                      [item.code]: event.target.checked
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
        >
          {loading ? "저장 중..." : "다음"}
        </button>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
