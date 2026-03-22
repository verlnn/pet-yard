"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, PawPrint, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/src/features/auth/api/authApi";
import type {
  MyProfileResponse,
  PetBreed,
  PetProfile,
  PetRegistrationVerificationResponse
} from "@/src/features/auth/types/authTypes";

const MAX_PET_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const emptyForm = {
  name: "",
  species: "DOG",
  breed: "",
  birthDate: "",
  ageGroup: "",
  gender: "UNKNOWN",
  neutered: "",
  intro: "",
  photoUrl: "",
  weightKg: "",
  vaccinationComplete: "",
  walkSafetyChecked: ""
};

const emptyVerification = {
  dogRegNo: "",
  rfidCd: "",
  ownerNm: "",
  ownerBirth: ""
};

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

interface PetSettingsPanelProps {
  mode?: "add" | "manage";
}

export function PetSettingsPanel({ mode = "manage" }: PetSettingsPanelProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [petImageError, setPetImageError] = useState<string | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [breeds, setBreeds] = useState<PetBreed[]>([]);
  const [petFormOpen, setPetFormOpen] = useState(mode === "add");
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editBreeds, setEditBreeds] = useState<PetBreed[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [verification, setVerification] = useState(emptyVerification);
  const [verificationResult, setVerificationResult] = useState<PetRegistrationVerificationResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    setPetFormOpen(mode === "add");
  }, [mode]);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        const response = await authApi.getMyProfile(accessToken);
        setProfile(response);
        setPets(response.pets ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "반려동물 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  useEffect(() => {
    const loadBreeds = async () => {
      if (!accessToken) return;
      try {
        const response = await authApi.getPetBreeds(accessToken, form.species);
        setBreeds(response);
      } catch {
        setBreeds([]);
      }
    };
    loadBreeds();
  }, [accessToken, form.species]);

  useEffect(() => {
    const loadEditBreeds = async () => {
      if (!accessToken) return;
      if (!editingPetId) {
        setEditBreeds([]);
        return;
      }
      try {
        const response = await authApi.getPetBreeds(accessToken, editForm.species);
        setEditBreeds(response);
      } catch {
        setEditBreeds([]);
      }
    };
    loadEditBreeds();
  }, [accessToken, editForm.species, editingPetId]);

  const joinedAt = useMemo(() => {
    if (!profile?.joinedAt) return "-";
    return new Date(profile.joinedAt).toLocaleDateString("ko-KR");
  }, [profile?.joinedAt]);

  const editingPet = useMemo(
    () => pets.find((pet) => pet.id === editingPetId) ?? null,
    [pets, editingPetId]
  );
  const isPetIdentityLocked = editingPet !== null;
  const isNeuteredLocked = editingPet?.neutered === true;

  const handlePetImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPetImageError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_PET_IMAGE_SIZE_BYTES) {
      setPetImageError("3MB 이하 이미지로 업로드해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoUrl: typeof reader.result === "string" ? reader.result : "" }));
      setPetImageError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setEditError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_PET_IMAGE_SIZE_BYTES) {
      setEditError("3MB 이하 이미지로 업로드해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((prev) => ({ ...prev, photoUrl: typeof reader.result === "string" ? reader.result : "" }));
      setEditError(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePetSubmit = async () => {
    if (!accessToken) return;
    if (!verificationResult) {
      setPetImageError("반려견 등록번호 인증을 먼저 완료해 주세요.");
      return;
    }
    setSavingPet(true);
    try {
      const payload = {
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim(),
        intro: form.intro || null,
        photoUrl: form.photoUrl || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        vaccinationComplete:
          form.vaccinationComplete === "" ? null : form.vaccinationComplete === "true",
        walkSafetyChecked:
          form.walkSafetyChecked === "" ? null : form.walkSafetyChecked === "true"
      };
      const saved = await authApi.createPetProfile(accessToken, payload);
      setPets((prev) => [saved, ...prev]);
      setForm(emptyForm);
      setVerification(emptyVerification);
      setVerificationResult(null);
      setVerificationError(null);
      setPetImageError(null);
    } catch (err) {
      setPetImageError(err instanceof Error ? err.message : "반려동물 저장에 실패했습니다.");
    } finally {
      setSavingPet(false);
    }
  };

  const handleVerifyRegistration = async () => {
    if (!accessToken) return;
    if (!verification.dogRegNo.trim() || !verification.rfidCd.trim() || !verification.ownerNm.trim() || !verification.ownerBirth.trim()) {
      setVerificationError("등록번호, RFID, 소유자 이름, 생년월일을 모두 입력해 주세요.");
      return;
    }
    setVerifying(true);
    setVerificationError(null);
    try {
      const result = await authApi.verifyPetRegistration(accessToken, {
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim()
      });
      setVerificationResult(result);
      setForm((prev) => ({
        ...prev,
        name: result.name ?? "",
        species: "DOG",
        breed: result.breed ?? "",
        birthDate: result.birthDate ?? "",
        gender: result.gender ?? "UNKNOWN",
        neutered:
          result.neutered === null || result.neutered === undefined ? "" : String(result.neutered)
      }));
    } catch (err) {
      setVerificationResult(null);
      setVerificationError(err instanceof Error ? err.message : "등록번호 인증에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerification(emptyVerification);
    setVerificationResult(null);
    setVerificationError(null);
    setForm((prev) => ({
      ...prev,
      name: "",
      species: "DOG",
      breed: "",
      birthDate: "",
      gender: "UNKNOWN",
      neutered: "",
      vaccinationComplete: "",
      walkSafetyChecked: ""
    }));
  };

  const startEdit = (pet: PetProfile) => {
    setEditingPetId(pet.id);
    setEditError(null);
    setEditForm({
      name: pet.name ?? "",
      species: pet.species ?? "DOG",
      breed: pet.breed ?? "",
      birthDate: pet.birthDate ?? "",
      ageGroup: pet.ageGroup ?? "",
      gender: pet.gender ?? "UNKNOWN",
      neutered: pet.neutered === null || pet.neutered === undefined ? "" : String(pet.neutered),
      intro: pet.intro ?? "",
      photoUrl: pet.photoUrl ?? "",
      weightKg: pet.weightKg ? String(pet.weightKg) : "",
      vaccinationComplete:
        pet.vaccinationComplete === null || pet.vaccinationComplete === undefined
          ? ""
          : String(pet.vaccinationComplete),
      walkSafetyChecked:
        pet.walkSafetyChecked === null || pet.walkSafetyChecked === undefined
          ? ""
          : String(pet.walkSafetyChecked)
    });
  };

  const cancelEdit = () => {
    setEditingPetId(null);
    setEditForm(emptyForm);
    setEditError(null);
  };

  const handlePetUpdate = async () => {
    if (!accessToken || editingPetId === null) return;
    if (!editForm.name.trim()) {
      setEditError("반려동물 이름을 입력해 주세요.");
      return;
    }
    setSavingEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        species: editForm.species,
        breed: editForm.breed || null,
        birthDate: editForm.birthDate || null,
        ageGroup: editForm.ageGroup || null,
        gender: editForm.gender,
        neutered: editForm.neutered === "" ? null : editForm.neutered === "true",
        intro: editForm.intro || null,
        photoUrl: editForm.photoUrl || null,
        weightKg: editForm.weightKg ? Number(editForm.weightKg) : null,
        vaccinationComplete:
          editForm.vaccinationComplete === "" ? null : editForm.vaccinationComplete === "true",
        walkSafetyChecked:
          editForm.walkSafetyChecked === "" ? null : editForm.walkSafetyChecked === "true"
      };
      const saved = await authApi.updatePetProfile(accessToken, editingPetId, payload);
      setPets((prev) => prev.map((pet) => (pet.id === saved.id ? saved : pet)));
      cancelEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "반려동물 수정에 실패했습니다.");
    } finally {
      setSavingEdit(false);
    }
  };

  const verified = Boolean(verificationResult);
  const contentTitle = mode === "add" ? "반려동물 추가" : "반려동물 관리";
  const contentDescription =
    mode === "add"
      ? "등록번호 인증을 거쳐 새 반려동물 프로필을 추가할 수 있습니다."
      : "등록된 반려동물 정보를 수정하고 새 반려동물을 추가할 수 있습니다.";

  return (
    <div className="pets-settings-panel">
      <div className="settings-page-content-header">
        <p className="settings-page-content-eyebrow">Pets</p>
        <h2 className="settings-page-content-title">{contentTitle}</h2>
        <p className="settings-page-field-helper">{contentDescription}</p>
      </div>

      {error && (
        <div className="pets-page-error">
          {error}
        </div>
      )}
      <div className="pets-page-grid">
        <Card className="gradient-shell">
          <CardContent className="pets-summary-card-content">
            <p className="pets-summary-card-title">내 반려동물</p>
            <p>가입일 {joinedAt} · 총 {profile?.petCount ?? pets.length}마리</p>
          </CardContent>
        </Card>
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
                      onClick={() => startEdit(pet)}
                      className="pets-inline-action"
                    >
                      수정
                    </button>
                  </div>
                  {editingPetId === pet.id && (
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
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, birthDate: event.target.value }))
                            }
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
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, weightKg: event.target.value }))
                            }
                          />
                        </label>
                        <label className="pets-form-field">
                          종
                          <select
                            className="pets-form-select"
                            value={editForm.species}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, species: event.target.value }))
                            }
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
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, breed: event.target.value }))
                            }
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
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, gender: event.target.value }))
                            }
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
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, neutered: event.target.value }))
                            }
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
                            onChange={(event) => handleEditImageUpload(event.target.files?.[0])}
                          />
                        </label>
                      </div>
                      {editError && <p className="pets-form-error">{editError}</p>}
                      <div className="pets-action-row">
                        <Button variant="secondary" onClick={cancelEdit}>
                          취소
                        </Button>
                        <Button onClick={handlePetUpdate} disabled={savingEdit}>
                          {savingEdit ? "저장 중..." : "수정 완료"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        <Card className="gradient-shell">
          <CardContent className="pets-card-content pets-card-content-spacious">
            <div className="pets-card-header">
              <p className="pets-summary-card-title">반려동물 추가</p>
              <button
                type="button"
                onClick={() => setPetFormOpen((prev) => !prev)}
                className="pets-inline-action"
              >
                {petFormOpen ? "접기" : "열기"}
              </button>
            </div>
            {petFormOpen && (
              <>
                <div className="pets-registration-card">
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
                        onChange={(event) =>
                          setVerification((prev) => ({ ...prev, dogRegNo: event.target.value }))
                        }
                        disabled={verified}
                      />
                    </label>
                    <label className="pets-form-field">
                      RFID 코드
                      <input
                        className="pets-form-input"
                        value={verification.rfidCd}
                        onChange={(event) =>
                          setVerification((prev) => ({ ...prev, rfidCd: event.target.value }))
                        }
                        disabled={verified}
                      />
                    </label>
                    <label className="pets-form-field">
                      소유자 이름
                      <input
                        className="pets-form-input"
                        value={verification.ownerNm}
                        onChange={(event) =>
                          setVerification((prev) => ({ ...prev, ownerNm: event.target.value }))
                        }
                        disabled={verified}
                      />
                    </label>
                    <label className="pets-form-field">
                      소유자 생년월일(YYMMDD)
                      <input
                        className="pets-form-input"
                        value={verification.ownerBirth}
                        onChange={(event) =>
                          setVerification((prev) => ({ ...prev, ownerBirth: event.target.value }))
                        }
                        disabled={verified}
                      />
                    </label>
                  </div>
                  {verificationResult && (
                    <div className="pets-registration-result">
                      인증 완료 · {verificationResult.name} · {verificationResult.breed ?? "품종 미상"} ·
                      {verificationResult.gender === "MALE"
                        ? " 수컷"
                        : verificationResult.gender === "FEMALE"
                        ? " 암컷"
                        : " 성별 미상"}
                    </div>
                  )}
                  {verificationError && <p className="pets-form-error pets-form-error-spaced">{verificationError}</p>}
                  <div className="pets-action-row pets-action-row-spaced">
                    <Button onClick={handleVerifyRegistration} disabled={verifying || verified}>
                      {verifying ? "인증 중..." : verified ? "인증 완료" : "등록번호 인증"}
                    </Button>
                    {verified && (
                      <Button variant="secondary" onClick={resetVerification}>
                        다시 인증
                      </Button>
                    )}
                  </div>
                </div>
                {verified && (
                  <>
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
                          {form.breed && !breeds.some((breed) => breed.nameKo === form.breed) && (
                            <option value={form.breed}>{form.breed}</option>
                          )}
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
                          onChange={(event) => handlePetImageUpload(event.target.files?.[0])}
                        />
                      </label>
                    </div>
                    {petImageError && <p className="pets-form-error">{petImageError}</p>}
                    <Button onClick={handlePetSubmit} disabled={savingPet}>
                      {savingPet ? "저장 중..." : "반려동물 등록"}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {!loading && pets.length === 0 && (
        <p className="pets-empty-message">등록된 반려동물이 없습니다.</p>
      )}
    </div>
  );
}
