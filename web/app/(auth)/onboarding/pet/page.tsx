"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/10";

export default function OnboardingPetPage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("MALE");
  const [ageGroup, setAgeGroup] = useState("");
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
    if (!name.trim()) {
      setError("반려동물 이름을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.signupPet(signupToken, {
        name,
        species,
        breed: breed || null,
        gender,
        ageGroup: ageGroup || null
      });
      if (result.nextStep === "COMPLETE") {
        router.push("/onboarding/complete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "반려동물 정보 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="반려동물 정보"
        subtitle="간단한 정보만 먼저 입력해 주세요."
        error={error}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            이름
            <input className={inputClassName} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            종류
            <select className={inputClassName} value={species} onChange={(event) => setSpecies(event.target.value)}>
              <option value="DOG">강아지</option>
              <option value="CAT">고양이</option>
              <option value="OTHER">기타</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            품종 (선택)
            <input className={inputClassName} value={breed} onChange={(event) => setBreed(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            성별
            <select className={inputClassName} value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value="MALE">남아</option>
              <option value="FEMALE">여아</option>
              <option value="UNKNOWN">모름</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            나이대 (선택)
            <input
              className={inputClassName}
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
              placeholder="예: 1-3세"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
            disabled={loading}
          >
            {loading ? "저장 중..." : "완료로 이동"}
          </button>
        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
