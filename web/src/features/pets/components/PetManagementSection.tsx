"use client";

import type { Dispatch, SetStateAction } from "react";
import { BadgeCheck, PawPrint, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PetBreed, PetProfile } from "@/src/features/auth/types/authTypes";
import type { PetFormState } from "@/src/features/pets/components/petFormTypes";

const speciesLabel: Record<string, string> = {
  DOG: "강아지",
  CAT: "고양이",
  OTHER: "기타"
};

const genderLabel: Record<string, string> = {
  MALE: "수컷",
  FEMALE: "암컷",
  UNKNOWN: "모름"
};

const getAgeText = (birthDate?: string | null) => {
  if (!birthDate) return null;
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return `${age}살`;
};

interface PetManagementSectionProps {
  pets: PetProfile[];
  editingPetId: number | null;
  editForm: PetFormState;
  editBreeds: PetBreed[];
  editError: string | null;
  isPetIdentityLocked: boolean;
  isNeuteredLocked: boolean;
  savingEdit: boolean;
  onStartEdit: (pet: PetProfile) => void;
  onCancelEdit: () => void;
  onUpdate: () => void;
  onEditImageUpload: (file?: File) => void;
  setEditForm: Dispatch<SetStateAction<PetFormState>>;
}

export function PetManagementSection({
  pets,
  editingPetId,
  editForm,
  editBreeds,
  editError,
  isPetIdentityLocked,
  isNeuteredLocked,
  savingEdit,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onEditImageUpload,
  setEditForm
}: PetManagementSectionProps) {
  return (
    <>
      {pets.map((pet) => (
        <Card key={pet.id} className="gradient-shell">
          <CardContent className="pets-card-content">
            <div className="pets-pet-header">
              <div className="pets-photo-preview pets-photo-preview-small">
                {pet.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pet.photoUrl} alt={pet.name} className="pets-photo-image" />
                ) : (
                  <div className="pets-photo-empty">
                    No Photo
                  </div>
                )}
              </div>
              <div className="pets-pet-header-main">
                <div className="pets-pet-title-row">
                  <PawPrint className="h-4 w-4" />
                  <p className="pets-pet-title">{pet.name}</p>
                  <Badge variant="soft">{speciesLabel[pet.species] ?? pet.species}</Badge>
                </div>
                <p className="pets-pet-breed">{pet.breed ?? "품종 미설정"}</p>
              </div>
            </div>
            <p className="pets-pet-meta">
              {getAgeText(pet.birthDate) ? `${getAgeText(pet.birthDate)} · ` : ""}
              {genderLabel[pet.gender] ?? pet.gender} {pet.neutered ? "· 중성화 완료" : ""}
              {pet.weightKg ? ` · 체중 ${pet.weightKg}kg` : ""}
            </p>
            <div className="pets-status-row">
              <span className="pets-status-item">
                <BadgeCheck className="h-4 w-4" />
                {pet.vaccinationComplete === true
                  ? "예방접종 완료"
                  : pet.vaccinationComplete === false
                  ? "예방접종 미완료"
                  : "예방접종 미확인"}
              </span>
              <span className="pets-status-item">
                <Shield className="h-4 w-4" />
                {pet.walkSafetyChecked === true
                  ? "산책 안전 확인"
                  : pet.walkSafetyChecked === false
                  ? "산책 안전 미확인"
                  : "산책 안전 미설정"}
              </span>
            </div>
            <div className="pets-inline-action-row">
              <button
                type="button"
                onClick={() => onStartEdit(pet)}
                className="pets-inline-action"
              >
                수정
              </button>
            </div>
            {editingPetId === pet.id ? (
              <div className="pets-edit-panel">
                <div className="pets-form-grid">
                  <label className="pets-form-field">
                    이름
                    <input
                      className="pets-form-input"
                      value={editForm.name}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label className="pets-form-field">
                    생일
                    <input
                      type="date"
                      className="pets-form-input"
                      value={editForm.birthDate}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                      disabled={isPetIdentityLocked}
                    />
                  </label>
                  <label className="pets-form-field">
                    체중(kg)
                    <input
                      type="number"
                      step="0.1"
                      className="pets-form-input"
                      value={editForm.weightKg}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, weightKg: event.target.value }))}
                    />
                  </label>
                  <label className="pets-form-field">
                    종
                    <select
                      className="pets-form-select"
                      value={editForm.species}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, species: event.target.value }))}
                      disabled={isPetIdentityLocked}
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
                      value={editForm.breed}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, breed: event.target.value }))}
                      disabled={isPetIdentityLocked || editForm.species === "OTHER"}
                    >
                      <option value="">
                        {editForm.species === "OTHER" ? "기타 종은 품종 선택 없음" : "선택 안함"}
                      </option>
                      {editBreeds.map((breed) => (
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
                      value={editForm.gender}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, gender: event.target.value }))}
                      disabled={isPetIdentityLocked}
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
                      value={editForm.neutered}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, neutered: event.target.value }))}
                      disabled={isNeuteredLocked}
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
                      value={editForm.vaccinationComplete}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, vaccinationComplete: event.target.value }))
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
                      value={editForm.walkSafetyChecked}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, walkSafetyChecked: event.target.value }))
                      }
                    >
                      <option value="">미설정</option>
                      <option value="true">확인</option>
                      <option value="false">미확인</option>
                    </select>
                  </label>
                </div>
                <p className="pets-helper-text">
                  생일, 종, 품종, 성별은 인증 정보를 기준으로 고정되며, 중성화는 완료 처리된 이후에는 변경할 수 없어요.
                </p>
                <label className="pets-form-field">
                  소개
                  <input
                    className="pets-form-input"
                    value={editForm.intro}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, intro: event.target.value }))}
                  />
                </label>
                <div className="pets-photo-row">
                  <div className="pets-photo-preview">
                    {editForm.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editForm.photoUrl} alt="반려동물 사진" className="pets-photo-image" />
                    ) : (
                      <div className="pets-photo-empty">
                        No Photo
                      </div>
                    )}
                  </div>
                  <label className="pets-photo-upload">
                    사진 변경
                    <input
                      type="file"
                      accept="image/*"
                      className="pets-hidden-input"
                      onChange={(event) => onEditImageUpload(event.target.files?.[0])}
                    />
                  </label>
                </div>
                {editError ? <p className="pets-form-error">{editError}</p> : null}
                <div className="pets-edit-action-row">
                  <button type="button" className="pets-edit-action app-alert-dialog-action" onClick={onCancelEdit}>
                    취소
                  </button>
                  <div className="pets-edit-action-divider" />
                  <button
                    type="button"
                    className="pets-edit-action app-alert-dialog-action app-alert-dialog-action-accent"
                    onClick={onUpdate}
                    disabled={savingEdit}
                  >
                    {savingEdit ? "저장 중..." : "수정 완료"}
                  </button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
