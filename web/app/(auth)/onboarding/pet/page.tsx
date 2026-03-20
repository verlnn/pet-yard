"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import type { PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/10";

const emptyVerification = {
  dogRegNo: "",
  rfidCd: "",
  ownerNm: "",
  ownerBirth: ""
};

export default function OnboardingPetPage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [verification, setVerification] = useState(emptyVerification);
  const [verificationResult, setVerificationResult] = useState<PetRegistrationVerificationResponse | null>(null);
  const [intro, setIntro] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verified = Boolean(verificationResult);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
  }, [router]);

  const handleVerify = async () => {
    if (!verification.dogRegNo.trim() || !verification.rfidCd.trim() || !verification.ownerNm.trim() || !verification.ownerBirth.trim()) {
      setError("등록번호, RFID, 소유자 이름, 생년월일을 모두 입력해 주세요.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await authApi.signupVerifyPetRegistration({
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim()
      });
      setVerificationResult(result);
    } catch (err) {
      setVerificationResult(null);
      setError(err instanceof Error ? err.message : "반려동물 등록번호 인증에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupToken) return;
    if (!verificationResult) {
      setError("반려동물 등록번호 인증을 먼저 완료해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.signupPet(signupToken, {
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim(),
        intro: intro || null,
        photoUrl: photoUrl || null
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
        subtitle="등록번호 인증으로 반려동물 정보를 확인한 뒤 저장해 주세요."
        error={error}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="font-display text-sm font-semibold text-emerald-700">반려견 등록번호 인증</p>
            <p className="mt-1 text-xs text-emerald-600">
              프로필 페이지와 동일하게 등록번호 인증을 완료해야 반려동물을 저장할 수 있어요.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-700">
                등록번호
                <input
                  className={`${inputClassName} mt-2`}
                  value={verification.dogRegNo}
                  onChange={(event) => setVerification((prev) => ({ ...prev, dogRegNo: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="text-sm text-slate-700">
                RFID 코드
                <input
                  className={`${inputClassName} mt-2`}
                  value={verification.rfidCd}
                  onChange={(event) => setVerification((prev) => ({ ...prev, rfidCd: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="text-sm text-slate-700">
                소유자 이름
                <input
                  className={`${inputClassName} mt-2`}
                  value={verification.ownerNm}
                  onChange={(event) => setVerification((prev) => ({ ...prev, ownerNm: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="text-sm text-slate-700">
                소유자 생년월일(YYMMDD)
                <input
                  className={`${inputClassName} mt-2`}
                  value={verification.ownerBirth}
                  onChange={(event) => setVerification((prev) => ({ ...prev, ownerBirth: event.target.value }))}
                  placeholder="예: 990101"
                  disabled={verified}
                />
              </label>
            </div>

            {verificationResult && (
              <div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-xs text-emerald-700">
                인증 완료 · {verificationResult.name} · {verificationResult.breed ?? "품종 미상"} ·
                {verificationResult.gender === "MALE"
                  ? " 수컷"
                  : verificationResult.gender === "FEMALE"
                    ? " 암컷"
                    : " 성별 미상"}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
                onClick={handleVerify}
                disabled={verifying || verified}
              >
                {verifying ? "인증 중..." : verified ? "인증 완료" : "등록번호 인증"}
              </button>
              {verified && (
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    setVerification(emptyVerification);
                    setVerificationResult(null);
                    setError(null);
                  }}
                >
                  다시 인증
                </button>
              )}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            소개글 (선택)
            <textarea
              className={`${inputClassName} min-h-28 resize-none`}
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            사진 URL (선택)
            <input
              className={inputClassName}
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
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
