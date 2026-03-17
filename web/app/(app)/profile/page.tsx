"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, PawPrint, Shield } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse, PetBreed, PetProfile } from "@/src/features/auth/types/authTypes";

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

export default function ProfilePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [petImageError, setPetImageError] = useState<string | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [breeds, setBreeds] = useState<PetBreed[]>([]);

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
        setError(err instanceof Error ? err.message : "프로필 정보를 불러오지 못했습니다.");
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

  const joinedAt = useMemo(() => {
    if (!profile?.joinedAt) return "-";
    return new Date(profile.joinedAt).toLocaleDateString("ko-KR");
  }, [profile?.joinedAt]);

  const lastLoginAt = useMemo(() => {
    if (!profile?.lastLoginAt) return "알 수 없음";
    return new Date(profile.lastLoginAt).toLocaleString("ko-KR");
  }, [profile?.lastLoginAt]);

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

  const handlePetSubmit = async () => {
    if (!accessToken) return;
    if (!form.name.trim()) {
      setPetImageError("반려동물 이름을 입력해 주세요.");
      return;
    }
    setSavingPet(true);
    try {
      const payload = {
        name: form.name.trim(),
        species: form.species,
        breed: form.breed || null,
        birthDate: form.birthDate || null,
        ageGroup: form.ageGroup || null,
        gender: form.gender,
        neutered: form.neutered === "" ? null : form.neutered === "true",
        intro: form.intro || null,
        photoUrl: form.photoUrl || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null
      };
      const saved = await authApi.createPetProfile(accessToken, payload);
      setPets((prev) => [saved, ...prev]);
      setForm(emptyForm);
      setPetImageError(null);
    } catch (err) {
      setPetImageError(err instanceof Error ? err.message : "반려동물 저장에 실패했습니다.");
    } finally {
      setSavingPet(false);
    }
  };



  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="Profile"
          title="내 프로필"
          description="반려동물 정보와 신뢰도, 안전 지표를 관리하세요."
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-[0.6fr_1fr]">
            <Card className="gradient-shell">
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-20 w-20">
                  {profile?.profileImageUrl ? (
                    <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
                  ) : (
                    <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-display text-xl font-semibold">
                    {profile?.nickname ?? (loading ? "불러오는 중..." : "프로필")}
                  </p>
                  <p className="text-sm text-ink/60">
                    {profile?.regionName ?? "지역 미설정"} · 가입일 {joinedAt}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="soft">반려동물 {profile?.petCount ?? 0}마리</Badge>
                  <Badge variant="outline">등급 {profile?.tier ?? "-"}</Badge>
                </div>
                <Button className="w-full">프로필 수정</Button>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="gradient-shell">
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4" />
                      <p className="font-display text-lg font-semibold">{pet.name}</p>
                      <Badge variant="soft">{speciesLabel[pet.species] ?? pet.species}</Badge>
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
                  </CardContent>
                </Card>
              ))}
              <Card className="gradient-shell">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-semibold">반려동물 추가</p>
                    <Badge variant="outline">프로필 등록</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-ink/70">
                      이름
                      <input
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      />
                    </label>
                    <label className="text-sm text-ink/70">
                      생일
                      <input
                        type="date"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                        value={form.birthDate}
                        onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
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
                        disabled={form.species === "OTHER"}
                      >
                        <option value="">
                          {form.species === "OTHER" ? "기타 종은 품종 선택 없음" : "선택 안함"}
                        </option>
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
                    {form.photoUrl && (
                      <span className="text-xs text-ink/60">사진 선택됨</span>
                    )}
                  </div>
                  {petImageError && <p className="text-xs text-rose-500">{petImageError}</p>}
                  <Button onClick={handlePetSubmit} disabled={savingPet}>
                    {savingPet ? "저장 중..." : "반려동물 등록"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="gradient-shell">
                <CardContent className="space-y-3">
                  <p className="text-sm text-ink/60">최근 로그인</p>
                  <p className="font-display text-lg font-semibold">{lastLoginAt}</p>
                  <p className="text-sm text-ink/70">
                    활동 내역과 안전 기록은 투명하게 관리됩니다.
                  </p>
                  <Button variant="secondary">신뢰도 상세 보기</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionShell>
      </main>
    </div>
  );
}
