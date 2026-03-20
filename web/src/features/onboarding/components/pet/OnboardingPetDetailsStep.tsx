"use client";

import type { PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";

type DetailsForm = {
  photoUrl: string;
  weightKg: string;
  vaccinationComplete: "" | "true" | "false";
  walkSafetyChecked: "" | "true" | "false";
};

type OnboardingPetDetailsStepProps = {
  verificationResult: PetRegistrationVerificationResponse;
  form: DetailsForm;
  photoError: string | null;
  loading: boolean;
  onPhotoSelect: (file: File | null) => void;
  onWeightChange: (value: string) => void;
  onVaccinationChange: (value: "" | "true" | "false") => void;
  onWalkSafetyChange: (value: "" | "true" | "false") => void;
  onPrev: () => void;
};

export default function OnboardingPetDetailsStep({
  verificationResult,
  form,
  photoError,
  loading,
  onPhotoSelect,
  onWeightChange,
  onVaccinationChange,
  onWalkSafetyChange,
  onPrev
}: OnboardingPetDetailsStepProps) {
  return (
    <>
      <div className="onboarding-pet-step-content">
        <div className="onboarding-pet-field-block">
          <p className="onboarding-pet-section-title">2단계 · 반려동물 기본정보</p>
          <p className="onboarding-pet-section-description">
            인증된 정보는 그대로 보여주고, 추가 정보와 사진은 여기서 등록해요.
          </p>
        </div>

        <div className="onboarding-pet-details-grid">
          <label className="onboarding-pet-field">
            이름
            <input className="onboarding-pet-input" value={verificationResult.name} disabled />
          </label>
          <label className="onboarding-pet-field">
            생일
            <input
              type="date"
              className="onboarding-pet-input"
              value={verificationResult.birthDate ?? ""}
              disabled
            />
          </label>
          <label className="onboarding-pet-field">
            체중(kg)
            <input
              type="number"
              step="0.1"
              className="onboarding-pet-input"
              value={form.weightKg}
              onChange={(event) => onWeightChange(event.target.value)}
            />
          </label>
          <label className="onboarding-pet-field">
            종
            <select className="onboarding-pet-input" value="DOG" disabled>
              <option value="DOG">강아지</option>
            </select>
          </label>
          <label className="onboarding-pet-field onboarding-pet-field-span">
            품종
            <input
              className="onboarding-pet-input"
              value={verificationResult.breed ?? "품종 미상"}
              disabled
            />
          </label>
          <label className="onboarding-pet-field">
            성별
            <select className="onboarding-pet-input" value={verificationResult.gender} disabled>
              <option value="MALE">수컷</option>
              <option value="FEMALE">암컷</option>
              <option value="UNKNOWN">모름</option>
            </select>
          </label>
          <label className="onboarding-pet-field">
            중성화
            <select
              className="onboarding-pet-input"
              value={
                verificationResult.neutered === true
                  ? "true"
                  : verificationResult.neutered === false
                    ? "false"
                    : ""
              }
              disabled
            >
              <option value="">선택 안함</option>
              <option value="true">완료</option>
              <option value="false">미완료</option>
            </select>
          </label>
          <label className="onboarding-pet-field">
            예방접종
            <select
              className="onboarding-pet-input"
              value={form.vaccinationComplete}
              onChange={(event) => onVaccinationChange(event.target.value as "" | "true" | "false")}
            >
              <option value="">미설정</option>
              <option value="true">완료</option>
              <option value="false">미완료</option>
            </select>
          </label>
          <label className="onboarding-pet-field">
            산책 안전
            <select
              className="onboarding-pet-input"
              value={form.walkSafetyChecked}
              onChange={(event) => onWalkSafetyChange(event.target.value as "" | "true" | "false")}
            >
              <option value="">미설정</option>
              <option value="true">확인</option>
              <option value="false">미확인</option>
            </select>
          </label>
        </div>

        <div className="onboarding-pet-field-block">
          <p className="onboarding-pet-section-title">사진 업로드</p>
          <div className="onboarding-pet-photo-row">
            <div className="onboarding-pet-photo-preview">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photoUrl} alt="반려동물 사진" className="onboarding-pet-photo-image" />
              ) : (
                <div className="onboarding-pet-photo-empty">No Photo</div>
              )}
            </div>
            <label className="onboarding-pet-photo-upload">
              사진 업로드
              <input
                type="file"
                accept="image/*"
                className="onboarding-pet-hidden-input"
                onChange={(event) => onPhotoSelect(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {photoError && <p className="onboarding-pet-photo-error">{photoError}</p>}
        </div>

        <div className="onboarding-pet-notice">
          온보딩에서는 반려동물 1마리만 먼저 등록할 수 있어요. 추가 등록은 가입 완료 후 설정 페이지에서 할 수 있습니다.
        </div>
      </div>

      <div className="onboarding-pet-step-actions">
        <button
          type="button"
          className="onboarding-pet-reset-button"
          onClick={onPrev}
        >
          이전
        </button>
        <button
          type="submit"
          className="onboarding-pet-submit-button onboarding-pet-submit-button-half"
          disabled={loading}
        >
          {loading ? "저장 중..." : "완료로 이동"}
        </button>
      </div>
    </>
  );
}
