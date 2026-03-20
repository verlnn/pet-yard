"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import type { PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

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
  const [photoError, setPhotoError] = useState<string | null>(null);
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

  const handlePetImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("3MB 이하 이미지로 업로드해 주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === "string" ? reader.result : "");
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
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
        <form className="onboarding-pet-form" onSubmit={handleSubmit}>
          <div className="onboarding-pet-verification-card">
            <p className="onboarding-pet-verification-title">반려견 등록번호 인증</p>
            <p className="onboarding-pet-verification-description">
              프로필 페이지와 동일하게 등록번호 인증을 완료해야 반려동물을 저장할 수 있어요.
            </p>
            <div className="onboarding-pet-verification-grid">
              <label className="onboarding-pet-field">
                등록번호
                <input
                  className="onboarding-pet-input"
                  value={verification.dogRegNo}
                  onChange={(event) => setVerification((prev) => ({ ...prev, dogRegNo: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="onboarding-pet-field">
                RFID 코드
                <input
                  className="onboarding-pet-input"
                  value={verification.rfidCd}
                  onChange={(event) => setVerification((prev) => ({ ...prev, rfidCd: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="onboarding-pet-field">
                소유자 이름
                <input
                  className="onboarding-pet-input"
                  value={verification.ownerNm}
                  onChange={(event) => setVerification((prev) => ({ ...prev, ownerNm: event.target.value }))}
                  disabled={verified}
                />
              </label>
              <label className="onboarding-pet-field">
                소유자 생년월일(YYMMDD)
                <input
                  className="onboarding-pet-input"
                  value={verification.ownerBirth}
                  onChange={(event) => setVerification((prev) => ({ ...prev, ownerBirth: event.target.value }))}
                  placeholder="예: 990101"
                  disabled={verified}
                />
              </label>
            </div>

            {verificationResult && (
              <div className="onboarding-pet-verification-result">
                인증 완료 · {verificationResult.name} · {verificationResult.breed ?? "품종 미상"} ·
                {verificationResult.gender === "MALE"
                  ? " 수컷"
                  : verificationResult.gender === "FEMALE"
                    ? " 암컷"
                    : " 성별 미상"}
              </div>
            )}

            <div className="onboarding-pet-verification-actions">
              <button
                type="button"
                className="onboarding-pet-verify-button"
                onClick={handleVerify}
                disabled={verifying || verified}
              >
                {verifying ? "인증 중..." : verified ? "인증 완료" : "등록번호 인증"}
              </button>
              {verified && (
                <button
                  type="button"
                  className="onboarding-pet-reset-button"
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

          <div className={`onboarding-pet-lockable ${!verified ? "onboarding-pet-lockable-locked" : ""}`}>
            {!verified && (
              <div className="onboarding-pet-lock-overlay">
                등록번호 인증 후 입력할 수 있어요
              </div>
            )}
            <label className="onboarding-pet-field onboarding-pet-field-block">
              소개글 (선택)
              <textarea
                className="onboarding-pet-textarea"
                value={intro}
                onChange={(event) => setIntro(event.target.value)}
                disabled={!verified}
              />
            </label>
            <div className="onboarding-pet-photo-row">
              <div className="onboarding-pet-photo-preview">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="반려동물 사진" className="onboarding-pet-photo-image" />
                ) : (
                  <div className="onboarding-pet-photo-empty">No Photo</div>
                )}
              </div>
              <label className={`onboarding-pet-photo-upload ${!verified ? "onboarding-pet-photo-upload-disabled" : ""}`}>
                사진 업로드
                <input
                  type="file"
                  accept="image/*"
                  className="onboarding-pet-hidden-input"
                  onChange={(event) => handlePetImageUpload(event.target.files?.[0])}
                  disabled={!verified}
                />
              </label>
            </div>
          </div>
          {photoError && <p className="onboarding-pet-photo-error">{photoError}</p>}

          <button
            type="submit"
            className="onboarding-pet-submit-button"
            disabled={loading}
          >
            {loading ? "저장 중..." : "완료로 이동"}
          </button>
        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
