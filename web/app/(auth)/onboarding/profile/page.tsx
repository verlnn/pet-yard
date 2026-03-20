"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

const inputClassName =
  "w-full rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3.5 text-sm text-slate-900 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.25)] transition placeholder:text-slate-400 focus:border-ink/30 focus:outline-none focus:ring-4 focus:ring-ink/10";

type RegionOption = {
  code: string;
  name: string;
};

type ComboBoxProps = {
  label: string;
  placeholder: string;
  value: string;
  options: RegionOption[];
  disabled?: boolean;
  onChange: (nextCode: string) => void;
};

function RegionComboBox({ label, placeholder, value, options, disabled, onChange }: ComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.code === value);
  const visible = query
    ? options.filter((opt) => opt.name.includes(query.trim()))
    : options;

  useEffect(() => {
    if (!value) return;
    setQuery("");
  }, [value]);

  const displayValue = selected ? selected.name : query;

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</label>
      <div className="relative">
        <input
          className={inputClassName}
          value={displayValue}
          placeholder={placeholder}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (selected) onChange("");
            if (!open) setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          disabled={disabled}
        />
        {open && !disabled && (
          <div className="absolute z-20 mt-2 max-h-52 w-full overflow-auto rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)]">
            {visible.length === 0 && (
              <div className="px-4 py-3 text-xs text-slate-400">결과가 없습니다.</div>
            )}
            {visible.map((opt) => (
              <button
                type="button"
                key={opt.code}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                onMouseDown={() => {
                  onChange(opt.code);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nickname, setNickname] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [dongCode, setDongCode] = useState("");
  const [cities, setCities] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [dongs, setDongs] = useState<RegionOption[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [hasPetChoice, setHasPetChoice] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
  }, [router]);

  useEffect(() => {
    if (!signupToken || defaultsLoaded) return;
    const loadDefaults = async () => {
      try {
        const progress = await authApi.signupProgress(signupToken);
        if (!nickname && progress.nickname) {
          setNickname(progress.nickname);
        }
        if (!profileImageUrl && progress.profileImageUrl) {
          setProfileImageUrl(progress.profileImageUrl);
        }
      } catch {
        // ignore
      } finally {
        setDefaultsLoaded(true);
      }
    };
    loadDefaults();
  }, [signupToken, defaultsLoaded, nickname, profileImageUrl]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/regions?level=CITY`);
        if (!response.ok) throw new Error("지역 정보를 불러오지 못했습니다.");
        const payload = (await response.json()) as RegionOption[];
        setCities(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "지역 정보를 불러오지 못했습니다.");
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    if (!cityCode) {
      setDistricts([]);
      setDistrictCode("");
      setDongs([]);
      setDongCode("");
      return;
    }
    const loadDistricts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/regions?level=DISTRICT&parentCode=${cityCode}`);
        if (!response.ok) throw new Error("구/군 정보를 불러오지 못했습니다.");
        const payload = (await response.json()) as RegionOption[];
        setDistricts(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "구/군 정보를 불러오지 못했습니다.");
      }
    };
    loadDistricts();
  }, [cityCode]);

  useEffect(() => {
    if (!districtCode) {
      setDongs([]);
      setDongCode("");
      return;
    }
    const loadDongs = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/regions?level=DONG&parentCode=${districtCode}`);
        if (!response.ok) throw new Error("읍/면/동 정보를 불러오지 못했습니다.");
        const payload = (await response.json()) as RegionOption[];
        setDongs(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "읍/면/동 정보를 불러오지 못했습니다.");
      }
    };
    loadDongs();
  }, [districtCode]);

  const selectedCity = cities.find((city) => city.code === cityCode);
  const selectedDistrict = districts.find((district) => district.code === districtCode);
  const selectedDong = dongs.find((dong) => dong.code === dongCode);
  useEffect(() => {
    setDistrictCode("");
    setDongCode("");
  }, [cityCode]);

  useEffect(() => {
    setDongCode("");
  }, [districtCode]);

  const handleNextStep = () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegionStepNext = () => {
    setError(null);
    setStep(3);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupToken) return;
    if (!nickname.trim()) return;
    if (hasPetChoice === null) {
      setError("반려동물 유무를 선택해 주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const selectedRegion = dongCode || districtCode || cityCode || null;
        const result = await authApi.signupProfile(signupToken, {
          nickname: nickname.trim(),
          regionCode: selectedRegion,
          profileImageUrl: profileImageUrl.trim() || null,
          marketingOptIn,
          hasPet: hasPetChoice ?? false
        });
      if (result.nextStep === "CONSENTS") {
        router.push("/onboarding/consents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="프로필 정보를 입력해 주세요"
        subtitle="멍냥마당에서 사용할 정보를 먼저 설정합니다."
        error={error}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>진행 단계</span>
              <span>{step}/3</span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-slate-200/70"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
            >
              <div
                className="h-full rounded-full bg-ink transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden pb-2">
            <div
              className={`absolute inset-0 flex min-h-full flex-col transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step === 1
                  ? "z-10 translate-x-0 opacity-100"
                  : "pointer-events-none z-0 -translate-x-8 opacity-0"
              }`}
            >
              <div className="space-y-4">
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
                닉네임
                <input
                  className={inputClassName}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="멍냥마당에서 사용할 이름"
                  required
                />
              </label>
                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  프로필 이미지 (선택)
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                      {profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImageUrl} alt="프로필 미리보기" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                          없음
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                        사진 업로드
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (!file.type.startsWith("image/")) {
                              setProfileImageError("이미지 파일만 업로드할 수 있어요.");
                              return;
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              setProfileImageError("2MB 이하 이미지로 업로드해 주세요.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setProfileImageUrl(typeof reader.result === "string" ? reader.result : "");
                              setProfileImageError(null);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {profileImageUrl && (
                        <button
                          type="button"
                          className="w-fit text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                          onClick={() => setProfileImageUrl("")}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  {profileImageError && <p className="text-[11px] text-rose-500">{profileImageError}</p>}
                </div>
              </div>
              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90"
                >
                  다음 단계
                </button>
              </div>
            </div>

            <div
              className={`absolute inset-0 flex min-h-full flex-col transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step === 2
                  ? "z-10 translate-x-0 opacity-100"
                  : "pointer-events-none z-0 translate-x-8 opacity-0"
              }`}
            >
              <div className="space-y-4">
              <label className="flex flex-col gap-3 text-xs font-semibold text-slate-500">
                지역 선택
                <div className="grid gap-4 sm:grid-cols-2">
                  <RegionComboBox
                    label="시/도"
                    placeholder="시/도 검색"
                    value={cityCode}
                    options={cities}
                    onChange={setCityCode}
                  />
                  <RegionComboBox
                    label="구/군"
                    placeholder="구/군 검색"
                    value={districtCode}
                    options={districts}
                    disabled={!cityCode}
                    onChange={setDistrictCode}
                  />
                  <RegionComboBox
                    label="읍/면/동"
                    placeholder="읍/면/동 검색"
                    value={dongCode}
                    options={dongs}
                    disabled={!districtCode}
                    onChange={setDongCode}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                  {selectedCity && (
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1">
                      {selectedCity.name}
                    </span>
                  )}
                  {selectedDistrict && (
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1">
                      {selectedDistrict.name}
                    </span>
                  )}
                  {selectedDong && (
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1">
                      {selectedDong.name}
                    </span>
                )}
              </div>
            </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600">
                <span>마케팅 수신 동의 (선택)</span>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-ink focus:ring-ink/20"
                />
              </label>
              </div>
              <div className="mt-auto flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleRegionStepNext}
                  className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
                >
                  다음
                </button>
              </div>
            </div>

            <div
              className={`absolute inset-0 flex min-h-full flex-col transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                step === 3
                  ? "z-10 translate-x-0 opacity-100"
                  : "pointer-events-none z-0 translate-x-8 opacity-0"
              }`}
            >
              <div className="space-y-4">
                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  반려동물 유무
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                        hasPetChoice === true
                          ? "border-ink/80 bg-ink text-sand shadow-[0_12px_26px_-20px_rgba(31,29,26,0.4)]"
                          : "border-slate-200/70 bg-white/80 text-slate-600"
                      }`}
                      onClick={() => setHasPetChoice(true)}
                    >
                      반려동물이 있어요
                    </button>
                    <button
                      type="button"
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                        hasPetChoice === false
                          ? "border-ink/80 bg-ink text-sand shadow-[0_12px_26px_-20px_rgba(31,29,26,0.4)]"
                          : "border-slate-200/70 bg-white/80 text-slate-600"
                      }`}
                      onClick={() => setHasPetChoice(false)}
                    >
                      나중에 등록할게요
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
                  disabled={loading}
                >
                  {loading ? "저장 중..." : "다음"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
