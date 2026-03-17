"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, PawPrint, Shield } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
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
  weightKg: ""
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

export default function PetsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [petImageError, setPetImageError] = useState<string | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [breeds, setBreeds] = useState<PetBreed[]>([]);
  const [petFormOpen, setPetFormOpen] = useState(true);
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

  const handlePetImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPetImageError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPetImageError("2MB 이하 이미지로 업로드해 주세요.");
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
    if (file.size > 2 * 1024 * 1024) {
      setEditError("2MB 이하 이미지로 업로드해 주세요.");
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
        weightKg: form.weightKg ? Number(form.weightKg) : null
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
      neutered: ""
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
      weightKg: pet.weightKg ? String(pet.weightKg) : ""
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
        weightKg: editForm.weightKg ? Number(editForm.weightKg) : null
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

  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="Pets"
          title="반려동물 관리"
          description="등록번호 인증을 통해 반려견 정보를 안전하게 등록하세요."
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <div className="grid gap-4">
            <Card className="gradient-shell">
              <CardContent className="space-y-2 text-sm text-ink/70">
                <p className="font-display text-lg font-semibold">내 반려동물</p>
                <p>가입일 {joinedAt} · 총 {profile?.petCount ?? pets.length}마리</p>
              </CardContent>
            </Card>
            {pets.map((pet) => (
              <Card key={pet.id} className="gradient-shell">
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/70 shadow-inner">
                      {pet.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/40">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4" />
                        <p className="font-display text-lg font-semibold">{pet.name}</p>
                        <Badge variant="soft">{speciesLabel[pet.species] ?? pet.species}</Badge>
                      </div>
                      <p className="text-xs text-ink/60">{pet.breed ?? "품종 미설정"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-ink/70">
                    {getAgeText(pet.birthDate) ? `${getAgeText(pet.birthDate)} · ` : ""}
                    {genderLabel[pet.gender] ?? pet.gender} {pet.neutered ? "· 중성화 완료" : ""}
                    {pet.weightKg ? ` · 체중 ${pet.weightKg}kg` : ""}
                  </p>
                  <div className="flex gap-2 text-sm text-ink/60">
                    <BadgeCheck className="h-4 w-4" /> 예방접종 완료
                    <Shield className="ml-2 h-4 w-4" /> 산책 안전 필터 적용
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => startEdit(pet)}
                      className="text-xs font-semibold text-ink/60 hover:text-ink"
                    >
                      수정
                    </button>
                  </div>
                  {editingPetId === pet.id && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-ink/70">
                          이름
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.name}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          생일
                          <input
                            type="date"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.birthDate}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, birthDate: event.target.value }))
                            }
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          체중(kg)
                          <input
                            type="number"
                            step="0.1"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.weightKg}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, weightKg: event.target.value }))
                            }
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          종
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.species}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, species: event.target.value }))
                            }
                          >
                            <option value="DOG">강아지</option>
                            <option value="CAT">고양이</option>
                            <option value="OTHER">기타</option>
                          </select>
                        </label>
                        <label className="text-sm text-ink/70 md:col-span-2">
                          품종
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.breed}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, breed: event.target.value }))
                            }
                            disabled={editForm.species === "OTHER"}
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
                        <label className="text-sm text-ink/70">
                          성별
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.gender}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, gender: event.target.value }))
                            }
                          >
                            <option value="MALE">수컷</option>
                            <option value="FEMALE">암컷</option>
                            <option value="UNKNOWN">모름</option>
                          </select>
                        </label>
                        <label className="text-sm text-ink/70">
                          중성화
                          <select
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={editForm.neutered}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, neutered: event.target.value }))
                            }
                          >
                            <option value="">선택 안함</option>
                            <option value="true">완료</option>
                            <option value="false">미완료</option>
                          </select>
                        </label>
                      </div>
                      <label className="text-sm text-ink/70">
                        소개
                        <input
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={editForm.intro}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, intro: event.target.value }))}
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-ink/70">
                          사진 변경
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleEditImageUpload(event.target.files?.[0])}
                          />
                        </label>
                        {editForm.photoUrl && <span className="text-xs text-ink/60">사진 선택됨</span>}
                      </div>
                      {editError && <p className="text-xs text-rose-500">{editError}</p>}
                      <div className="flex gap-2">
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
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">반려동물 추가</p>
                  <button
                    type="button"
                    onClick={() => setPetFormOpen((prev) => !prev)}
                    className="text-xs font-semibold text-ink/60 hover:text-ink"
                  >
                    {petFormOpen ? "접기" : "열기"}
                  </button>
                </div>
                {petFormOpen && (
                  <>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="font-display text-sm font-semibold text-emerald-700">반려견 등록번호 인증</p>
                      <p className="mt-1 text-xs text-emerald-600">
                        등록번호 인증을 완료해야 반려동물을 등록할 수 있어요.
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-ink/70">
                          등록번호
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={verification.dogRegNo}
                            onChange={(event) =>
                              setVerification((prev) => ({ ...prev, dogRegNo: event.target.value }))
                            }
                            disabled={verified}
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          RFID 코드
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={verification.rfidCd}
                            onChange={(event) =>
                              setVerification((prev) => ({ ...prev, rfidCd: event.target.value }))
                            }
                            disabled={verified}
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          소유자 이름
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={verification.ownerNm}
                            onChange={(event) =>
                              setVerification((prev) => ({ ...prev, ownerNm: event.target.value }))
                            }
                            disabled={verified}
                          />
                        </label>
                        <label className="text-sm text-ink/70">
                          소유자 생년월일(YYMMDD)
                          <input
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                            value={verification.ownerBirth}
                            onChange={(event) =>
                              setVerification((prev) => ({ ...prev, ownerBirth: event.target.value }))
                            }
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
                      {verificationError && <p className="mt-2 text-xs text-rose-500">{verificationError}</p>}
                      <div className="mt-3 flex gap-2">
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm text-ink/70">
                        이름
                        <input
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.name}
                          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                          disabled={verified}
                        />
                      </label>
                      <label className="text-sm text-ink/70">
                        생일
                        <input
                          type="date"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.birthDate}
                          onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                          disabled={verified}
                        />
                      </label>
                      <label className="text-sm text-ink/70">
                        체중(kg)
                        <input
                          type="number"
                          step="0.1"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.weightKg}
                          onChange={(event) => setForm((prev) => ({ ...prev, weightKg: event.target.value }))}
                        />
                      </label>
                      <label className="text-sm text-ink/70">
                        종
                        <select
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.species}
                          onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
                          disabled
                        >
                          <option value="DOG">강아지</option>
                          <option value="CAT">고양이</option>
                          <option value="OTHER">기타</option>
                        </select>
                      </label>
                      <label className="text-sm text-ink/70 md:col-span-2">
                        품종
                        <select
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.breed}
                          onChange={(event) => setForm((prev) => ({ ...prev, breed: event.target.value }))}
                          disabled={verified || form.species === "OTHER"}
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
                      <label className="text-sm text-ink/70">
                        성별
                        <select
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.gender}
                          onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                          disabled={verified}
                        >
                          <option value="MALE">수컷</option>
                          <option value="FEMALE">암컷</option>
                          <option value="UNKNOWN">모름</option>
                        </select>
                      </label>
                      <label className="text-sm text-ink/70">
                        중성화
                        <select
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                          value={form.neutered}
                          onChange={(event) => setForm((prev) => ({ ...prev, neutered: event.target.value }))}
                          disabled={verified}
                        >
                          <option value="">선택 안함</option>
                          <option value="true">완료</option>
                          <option value="false">미완료</option>
                        </select>
                      </label>
                    </div>
                    <label className="text-sm text-ink/70">
                      소개
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                        value={form.intro}
                        onChange={(event) => setForm((prev) => ({ ...prev, intro: event.target.value }))}
                      />
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-ink/70">
                        사진 업로드
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handlePetImageUpload(event.target.files?.[0])}
                        />
                      </label>
                      {form.photoUrl && <span className="text-xs text-ink/60">사진 선택됨</span>}
                    </div>
                    {petImageError && <p className="text-xs text-rose-500">{petImageError}</p>}
                    <Button onClick={handlePetSubmit} disabled={savingPet || !verified}>
                      {savingPet ? "저장 중..." : verified ? "반려동물 등록" : "등록번호 인증 필요"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          {!loading && pets.length === 0 && (
            <p className="mt-4 text-sm text-ink/60">등록된 반려동물이 없습니다.</p>
          )}
        </SectionShell>
      </main>
    </div>
  );
}
