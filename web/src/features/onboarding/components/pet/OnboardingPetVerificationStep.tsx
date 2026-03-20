"use client";

import type { PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";

type VerificationForm = {
  dogRegNo: string;
  rfidCd: string;
  ownerNm: string;
  ownerBirth: string;
};

type OnboardingPetVerificationStepProps = {
  verification: VerificationForm;
  verificationResult: PetRegistrationVerificationResponse | null;
  verifying: boolean;
  onChange: (field: keyof VerificationForm, value: string) => void;
  onVerify: () => void;
  onReset: () => void;
  onNext: () => void;
};

export default function OnboardingPetVerificationStep({
  verification,
  verificationResult,
  verifying,
  onChange,
  onVerify,
  onReset,
  onNext
}: OnboardingPetVerificationStepProps) {
  const verified = Boolean(verificationResult);

  return (
    <>
      <div className="onboarding-pet-step-content">
        <div className="onboarding-pet-verification-card">
          <p className="onboarding-pet-verification-title">1단계 · 반려견 등록번호 인증</p>
          <p className="onboarding-pet-verification-description">
            등록번호 인증이 완료되어야 다음 단계로 이동할 수 있어요.
          </p>
          <div className="onboarding-pet-verification-grid">
            <label className="onboarding-pet-field">
              등록번호
              <input
                className="onboarding-pet-input"
                value={verification.dogRegNo}
                onChange={(event) => onChange("dogRegNo", event.target.value)}
                disabled={verified}
              />
            </label>
            <label className="onboarding-pet-field">
              RFID 코드
              <input
                className="onboarding-pet-input"
                value={verification.rfidCd}
                onChange={(event) => onChange("rfidCd", event.target.value)}
                disabled={verified}
              />
            </label>
            <label className="onboarding-pet-field">
              소유자 이름
              <input
                className="onboarding-pet-input"
                value={verification.ownerNm}
                onChange={(event) => onChange("ownerNm", event.target.value)}
                disabled={verified}
              />
            </label>
            <label className="onboarding-pet-field">
              소유자 생년월일(YYMMDD)
              <input
                className="onboarding-pet-input"
                value={verification.ownerBirth}
                onChange={(event) => onChange("ownerBirth", event.target.value)}
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
            {!verified ? (
              <button
                type="button"
                className="onboarding-pet-verify-button"
                onClick={onVerify}
                disabled={verifying}
              >
                {verifying ? "인증 중..." : "등록번호 인증"}
              </button>
            ) : (
              <button
                type="button"
                className="onboarding-pet-reset-button onboarding-pet-reset-button-wide"
                onClick={onReset}
              >
                다시 인증
              </button>
            )}
          </div>
        </div>

        <div className="onboarding-pet-notice">
          온보딩에서는 반려동물 1마리만 먼저 등록할 수 있어요. 추가 등록은 가입 완료 후 설정 페이지에서 할 수 있습니다.
        </div>
      </div>

      <div className="onboarding-pet-step-actions-single">
        <button
          type="button"
          className="onboarding-pet-submit-button"
          onClick={onNext}
          disabled={!verified}
        >
          다음 단계
        </button>
      </div>
    </>
  );
}
