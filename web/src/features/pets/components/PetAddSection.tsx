"use client";

import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import type { PetBreed, PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";
import type { PetFormState, PetVerificationState } from "@/src/features/pets/components/petFormTypes";

interface PetAddSectionProps {
  verification: PetVerificationState;
  verificationResult: PetRegistrationVerificationResponse | null;
  verificationError: string | null;
  verifying: boolean;
  verified: boolean;
  form: PetFormState;
  breeds: PetBreed[];
  petImageError: string | null;
  savingPet: boolean;
  setVerification: Dispatch<SetStateAction<PetVerificationState>>;
  setForm: Dispatch<SetStateAction<PetFormState>>;
  onVerifyRegistration: () => void;
  onResetVerification: () => void;
  onPetImageUpload: (file?: File) => void;
  onPetSubmit: () => void;
}

export function PetAddSection({
  verification,
  verificationResult,
  verificationError,
  verifying,
  verified,
  form,
  breeds,
  petImageError,
  savingPet,
  setVerification,
  setForm,
  onVerifyRegistration,
  onResetVerification,
  onPetImageUpload,
  onPetSubmit
}: PetAddSectionProps) {
  return (
    <>
      <h2 className="settings-page-content-title">반려동물 추가</h2>
      <div className="pets-registration-card pets-registration-card-standalone">
        <p className="pets-registration-title">반려견 등록번호 인증</p>
        <p className="pets-registration-description">
          등록번호 인증을 완료해야 반려동물을 등록할 수 있어요.
        </p>
        <div className="pets-form-grid pets-form-grid-compact-top">
          <label className="pets-form-field">
            등록번호
            <input
              className="pets-form-input"
              value={verification.dogRegNo}
              onChange={(event) => setVerification((prev) => ({ ...prev, dogRegNo: event.target.value }))}
              disabled={verified}
            />
          </label>
          <label className="pets-form-field">
            RFID 코드
            <input
              className="pets-form-input"
              value={verification.rfidCd}
              onChange={(event) => setVerification((prev) => ({ ...prev, rfidCd: event.target.value }))}
              disabled={verified}
            />
          </label>
          <label className="pets-form-field">
            소유자 이름
            <input
              className="pets-form-input"
              value={verification.ownerNm}
              onChange={(event) => setVerification((prev) => ({ ...prev, ownerNm: event.target.value }))}
              disabled={verified}
            />
          </label>
          <label className="pets-form-field">
            소유자 생년월일(YYMMDD)
            <input
              className="pets-form-input"
              value={verification.ownerBirth}
              onChange={(event) => setVerification((prev) => ({ ...prev, ownerBirth: event.target.value }))}
              disabled={verified}
            />
          </label>
        </div>
        {verificationResult ? (
          <div className="pets-registration-result">
            인증 완료 · {verificationResult.name} · {verificationResult.breed ?? "품종 미상"} ·
            {verificationResult.gender === "MALE"
              ? " 수컷"
              : verificationResult.gender === "FEMALE"
              ? " 암컷"
              : " 성별 미상"}
          </div>
        ) : null}
        {verificationError ? <p className="pets-form-error pets-form-error-spaced">{verificationError}</p> : null}
        <div className="pets-action-row pets-action-row-spaced pets-registration-action-row">
          <Button onClick={onVerifyRegistration} disabled={verifying || verified}>
            {verifying ? "인증 중..." : verified ? "인증 완료" : "등록번호 인증"}
          </Button>
          {verified ? (
            <Button variant="secondary" onClick={onResetVerification}>
              다시 인증
            </Button>
          ) : null}
        </div>
        {verified ? (
          <div className="pets-registration-form-section">
            <div className="pets-form-grid">
              <label className="pets-form-field">
                이름
                <input
                  className="pets-form-input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  disabled
                />
              </label>
              <label className="pets-form-field">
                생일
                <input
                  type="date"
                  className="pets-form-input"
                  value={form.birthDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  disabled
                />
              </label>
              <label className="pets-form-field">
                체중(kg)
                <input
                  type="number"
                  step="0.1"
                  className="pets-form-input"
                  value={form.weightKg}
                  onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))}
                />
              </label>
              <label className="pets-form-field">
                종
                <select
                  className="pets-form-select"
                  value={form.species}
                  onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
                  disabled
                >
                  <option value="DOG">강아지</option>
                  <option value="CAT">고양이</option>
                  <option value="OTHER">기타</option>
                </select>
              </label>
              <label className="pets-form-field pets-form-field-span">
                품종
                <select
                  className="pets-form-select"
                  value={form.breed}
                  onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))}
                  disabled={form.species === "OTHER"}
                >
                  <option value="">
                    {form.species === "OTHER" ? "기타 종은 품종 선택 없음" : "선택 안함"}
                  </option>
                  {form.breed && !breeds.some((breed) => breed.nameKo === form.breed) ? (
                    <option value={form.breed}>{form.breed}</option>
                  ) : null}
                  {breeds.map((breed) => (
                    <option key={breed.id} value={breed.nameKo}>
                      {breed.nameKo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="pets-form-field">
                성별
                <select
                  className="pets-form-select"
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                  disabled
                >
                  <option value="MALE">수컷</option>
                  <option value="FEMALE">암컷</option>
                  <option value="UNKNOWN">모름</option>
                </select>
              </label>
              <label className="pets-form-field">
                중성화
                <select
                  className="pets-form-select"
                  value={form.neutered}
                  onChange={(event) => setForm((prev) => ({ ...prev, neutered: event.target.value }))}
                  disabled
                >
                  <option value="">선택 안함</option>
                  <option value="true">완료</option>
                  <option value="false">미완료</option>
                </select>
              </label>
              <label className="pets-form-field">
                예방접종
                <select
                  className="pets-form-select"
                  value={form.vaccinationComplete}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, vaccinationComplete: event.target.value }))
                  }
                >
                  <option value="">미설정</option>
                  <option value="true">완료</option>
                  <option value="false">미완료</option>
                </select>
              </label>
              <label className="pets-form-field">
                산책 안전
                <select
                  className="pets-form-select"
                  value={form.walkSafetyChecked}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, walkSafetyChecked: event.target.value }))
                  }
                >
                  <option value="">미설정</option>
                  <option value="true">확인</option>
                  <option value="false">미확인</option>
                </select>
              </label>
            </div>
            <label className="pets-form-field">
              소개
              <input
                className="pets-form-input"
                value={form.intro}
                onChange={(event) => setForm((prev) => ({ ...prev, intro: event.target.value }))}
              />
            </label>
            <div className="pets-photo-row">
              <div className="pets-photo-preview">
                {form.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photoUrl} alt="반려동물 사진" className="pets-photo-image" />
                ) : (
                  <div className="pets-photo-empty">
                    No Photo
                  </div>
                )}
              </div>
              <label className="pets-photo-upload">
                사진 업로드
                <input
                  type="file"
                  accept="image/*"
                  className="pets-hidden-input"
                  onChange={(event) => onPetImageUpload(event.target.files?.[0])}
                />
              </label>
            </div>
            {petImageError ? <p className="pets-form-error">{petImageError}</p> : null}
            <Button onClick={onPetSubmit} disabled={savingPet}>
              {savingPet ? "저장 중..." : "반려동물 등록"}
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
