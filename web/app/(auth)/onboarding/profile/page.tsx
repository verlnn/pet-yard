"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

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
  const visible = query ? options.filter((opt) => opt.name.includes(query.trim())) : options;

  useEffect(() => {
    if (!value) return;
    setQuery("");
  }, [value]);

  const displayValue = selected ? selected.name : query;

  return (
    <div className="onboarding-profile-combobox">
      <label className="onboarding-profile-combobox-label">{label}</label>
      <div className="onboarding-profile-combobox-shell">
        <input
          className="onboarding-profile-input"
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
          <div className="onboarding-profile-combobox-menu">
            {visible.length === 0 && (
              <div className="onboarding-profile-combobox-empty">결과가 없습니다.</div>
            )}
            {visible.map((opt) => (
              <button
                type="button"
                key={opt.code}
                className="onboarding-profile-combobox-option"
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

  const isProfileStepComplete = nickname.trim().length > 0;
  const isRegionStepComplete = Boolean(cityCode && districtCode && dongCode);
  const isPetStepComplete = hasPetChoice !== null;

  const handleProfileStepNext = () => {
    if (!isProfileStepComplete) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegionStepNext = () => {
    if (!isRegionStepComplete) {
      setError("지역 정보를 모두 선택해 주세요.");
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupToken) return;
    if (!isProfileStepComplete) return;
    if (!isRegionStepComplete) {
      setError("지역 정보를 모두 선택해 주세요.");
      return;
    }
    if (!isPetStepComplete) {
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

  const stepPanelClassName = (targetStep: 1 | 2 | 3, hiddenDirection: "left" | "right") =>
    [
      "onboarding-profile-step-panel",
      step === targetStep
        ? "onboarding-profile-step-panel-active"
        : hiddenDirection === "left"
          ? "onboarding-profile-step-panel-hidden-left"
          : "onboarding-profile-step-panel-hidden-right"
    ].join(" ");

  const petChoiceButtonClassName = (selected: boolean) =>
    [
      "onboarding-profile-choice-button",
      selected
        ? "onboarding-profile-choice-button-selected"
        : "onboarding-profile-choice-button-unselected"
    ].join(" ");

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="프로필 정보를 입력해 주세요"
        subtitle="멍냥마당에서 사용할 정보를 먼저 설정합니다."
        error={error}
      >
        <form className="onboarding-profile-form" onSubmit={handleSubmit}>
          <div className="onboarding-profile-progress">
            <div className="onboarding-profile-progress-header">
              <span>진행 단계</span>
              <span>{step}/3</span>
            </div>
            <div
              className="onboarding-profile-progress-track"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
            >
              <div
                className="onboarding-profile-progress-fill"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="onboarding-profile-step-shell">
            <div className={stepPanelClassName(1, "left")}>
              <div className="onboarding-profile-step-content">
                <label className="onboarding-profile-field">
                  닉네임
                  <input
                    className="onboarding-profile-input"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="멍냥마당에서 사용할 이름"
                    required
                  />
                </label>

                <div className="onboarding-profile-field-block">
                  프로필 이미지 (선택)
                  <div className="onboarding-profile-photo-row">
                    <div className="onboarding-profile-photo-preview">
                      {profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImageUrl} alt="프로필 미리보기" className="onboarding-profile-photo-image" />
                      ) : (
                        <div className="onboarding-profile-photo-empty">없음</div>
                      )}
                    </div>
                    <div className="onboarding-profile-photo-actions">
                      <label className="onboarding-profile-photo-upload">
                        사진 업로드
                        <input
                          type="file"
                          accept="image/*"
                          className="onboarding-profile-hidden-input"
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
                          className="onboarding-profile-photo-remove"
                          onClick={() => setProfileImageUrl("")}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  {profileImageError && <p className="onboarding-profile-photo-error">{profileImageError}</p>}
                </div>
              </div>

              <div className="onboarding-profile-step-actions-single">
                <button
                  type="button"
                  onClick={handleProfileStepNext}
                  className="onboarding-profile-primary-button"
                  disabled={!isProfileStepComplete}
                >
                  다음 단계
                </button>
              </div>
            </div>

            <div className={stepPanelClassName(2, "right")}>
              <div className="onboarding-profile-step-content">
                <label className="onboarding-profile-field-block onboarding-profile-region-block">
                  지역 선택
                  <div className="onboarding-profile-region-grid">
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
                  <div className="onboarding-profile-region-tags">
                    {selectedCity && <span className="onboarding-profile-region-tag">{selectedCity.name}</span>}
                    {selectedDistrict && (
                      <span className="onboarding-profile-region-tag">{selectedDistrict.name}</span>
                    )}
                    {selectedDong && <span className="onboarding-profile-region-tag">{selectedDong.name}</span>}
                  </div>
                </label>

                <label className="onboarding-profile-toggle-row">
                  <span>마케팅 수신 동의 (선택)</span>
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(event) => setMarketingOptIn(event.target.checked)}
                    className="onboarding-profile-checkbox"
                  />
                </label>
              </div>

              <div className="onboarding-profile-step-actions">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="onboarding-profile-secondary-button"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleRegionStepNext}
                  className="onboarding-profile-primary-button"
                  disabled={!isRegionStepComplete}
                >
                  다음
                </button>
              </div>
            </div>

            <div className={stepPanelClassName(3, "right")}>
              <div className="onboarding-profile-step-content">
                <div className="onboarding-profile-field-block">
                  반려동물 유무
                  <div className="onboarding-profile-choice-grid">
                    <button
                      type="button"
                      className={petChoiceButtonClassName(hasPetChoice === true)}
                      onClick={() => setHasPetChoice(true)}
                    >
                      반려동물이 있어요
                    </button>
                    <button
                      type="button"
                      className={petChoiceButtonClassName(hasPetChoice === false)}
                      onClick={() => setHasPetChoice(false)}
                    >
                      나중에 등록할게요
                    </button>
                  </div>
                </div>
              </div>

              <div className="onboarding-profile-step-actions">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="onboarding-profile-secondary-button"
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="onboarding-profile-primary-button"
                  disabled={loading || !isPetStepComplete}
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
