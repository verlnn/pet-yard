"use client";

import { useEffect, useMemo, useState } from "react";

import { authApi } from "@/src/features/auth/api/authApi";
import type {
  MyProfileResponse,
  PetBreed,
  PetProfile,
  PetRegistrationVerificationResponse
} from "@/src/features/auth/types/authTypes";
import { PetAddSection } from "@/src/features/pets/components/PetAddSection";
import { PetManagementSection } from "@/src/features/pets/components/PetManagementSection";
import type { PetFormState, PetVerificationState } from "@/src/features/pets/components/petFormTypes";

const MAX_PET_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const emptyForm: PetFormState = {
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

const emptyVerification: PetVerificationState = {
  dogRegNo: "",
  rfidCd: "",
  ownerNm: "",
  ownerBirth: ""
};

const dispatchProfileRefresh = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event("petyard:profile-refresh"));
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
  const [form, setForm] = useState<PetFormState>(emptyForm);
  const [petImageError, setPetImageError] = useState<string | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [breeds, setBreeds] = useState<PetBreed[]>([]);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PetFormState>(emptyForm);
  const [editBreeds, setEditBreeds] = useState<PetBreed[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [verification, setVerification] = useState<PetVerificationState>(emptyVerification);
  const [verificationResult, setVerificationResult] = useState<PetRegistrationVerificationResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

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
      if (!accessToken || !editingPetId) {
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

  const editingPet = useMemo(
    () => pets.find((pet) => pet.id === editingPetId) ?? null,
    [pets, editingPetId]
  );
  const isPetIdentityLocked = editingPet !== null;
  const isNeuteredLocked = editingPet?.neutered === true;
  const isAddMode = mode === "add";
  const verified = Boolean(verificationResult);

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
      setProfile((prev) => prev ? {
        ...prev,
        pets: [saved, ...prev.pets],
        petCount: (prev.petCount ?? prev.pets.length) + 1
      } : prev);
      setForm(emptyForm);
      setVerification(emptyVerification);
      setVerificationResult(null);
      setVerificationError(null);
      setPetImageError(null);
      dispatchProfileRefresh();
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

  const handleResetVerification = () => {
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

  const handleStartEdit = (pet: PetProfile) => {
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

  const handleCancelEdit = () => {
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
      setProfile((prev) => prev ? {
        ...prev,
        pets: prev.pets.map((pet) => (pet.id === saved.id ? saved : pet))
      } : prev);
      dispatchProfileRefresh();
      handleCancelEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "반려동물 수정에 실패했습니다.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="pets-settings-panel">
      {!isAddMode ? (
        <div className="settings-page-content-header">
          <h2 className="settings-page-content-title">반려동물 관리</h2>
        </div>
      ) : null}

      {error ? (
        <div className="pets-page-error">
          {error}
        </div>
      ) : null}

      <div className="pets-page-grid">
        {isAddMode ? (
          <PetAddSection
            verification={verification}
            verificationResult={verificationResult}
            verificationError={verificationError}
            verifying={verifying}
            verified={verified}
            form={form}
            breeds={breeds}
            petImageError={petImageError}
            savingPet={savingPet}
            setVerification={setVerification}
            setForm={setForm}
            onVerifyRegistration={handleVerifyRegistration}
            onResetVerification={handleResetVerification}
            onPetImageUpload={handlePetImageUpload}
            onPetSubmit={handlePetSubmit}
          />
        ) : (
          <PetManagementSection
            pets={pets}
            editingPetId={editingPetId}
            editForm={editForm}
            editBreeds={editBreeds}
            editError={editError}
            isPetIdentityLocked={isPetIdentityLocked}
            isNeuteredLocked={isNeuteredLocked}
            savingEdit={savingEdit}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onUpdate={handlePetUpdate}
            onEditImageUpload={handleEditImageUpload}
            setEditForm={setEditForm}
          />
        )}
      </div>

      {!loading && !isAddMode && pets.length === 0 ? (
        <p className="pets-empty-message">등록된 반려동물이 없습니다.</p>
      ) : null}
    </div>
  );
}
