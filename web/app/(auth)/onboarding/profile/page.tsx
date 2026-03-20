"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingProfileBasicsStep from "@/src/features/onboarding/components/profile/OnboardingProfileBasicsStep";
import OnboardingProfilePetStep from "@/src/features/onboarding/components/profile/OnboardingProfilePetStep";
import OnboardingProfileProgress from "@/src/features/onboarding/components/profile/OnboardingProfileProgress";
import OnboardingProfileRegionStep from "@/src/features/onboarding/components/profile/OnboardingProfileRegionStep";
import type { RegionOption } from "@/src/features/onboarding/components/profile/OnboardingRegionComboBox";

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

  useEffect(() => {
    setDistrictCode("");
    setDongCode("");
  }, [cityCode]);

  useEffect(() => {
    setDongCode("");
  }, [districtCode]);

  const selectedCity = cities.find((city) => city.code === cityCode);
  const selectedDistrict = districts.find((district) => district.code === districtCode);
  const selectedDong = dongs.find((dong) => dong.code === dongCode);

  const isProfileStepComplete = nickname.trim().length > 0;
  const isRegionStepComplete = Boolean(cityCode && districtCode && dongCode);

  const handleProfileImageSelect = (file: File | null) => {
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
  };

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
    if (!signupToken || !isProfileStepComplete) return;
    if (!isRegionStepComplete) {
      setError("지역 정보를 모두 선택해 주세요.");
      return;
    }
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
        hasPet: hasPetChoice
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

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="프로필 정보를 입력해 주세요"
        subtitle="멍냥마당에서 사용할 정보를 먼저 설정합니다."
        error={error}
      >
        <form className="onboarding-profile-form" onSubmit={handleSubmit}>
          <OnboardingProfileProgress step={step} />

          <div className="onboarding-profile-step-shell">
            <div className={stepPanelClassName(1, "left")}>
              <OnboardingProfileBasicsStep
                nickname={nickname}
                profileImageUrl={profileImageUrl}
                profileImageError={profileImageError}
                onNicknameChange={setNickname}
                onImageSelect={handleProfileImageSelect}
                onImageRemove={() => setProfileImageUrl("")}
                onNext={handleProfileStepNext}
                nextDisabled={!isProfileStepComplete}
              />
            </div>

            <div className={stepPanelClassName(2, "right")}>
              <OnboardingProfileRegionStep
                cityCode={cityCode}
                districtCode={districtCode}
                dongCode={dongCode}
                cities={cities}
                districts={districts}
                dongs={dongs}
                selectedCityName={selectedCity?.name}
                selectedDistrictName={selectedDistrict?.name}
                selectedDongName={selectedDong?.name}
                marketingOptIn={marketingOptIn}
                onCityChange={setCityCode}
                onDistrictChange={setDistrictCode}
                onDongChange={setDongCode}
                onMarketingOptInChange={setMarketingOptIn}
                onPrev={() => setStep(1)}
                onNext={handleRegionStepNext}
                nextDisabled={!isRegionStepComplete}
              />
            </div>

            <div className={stepPanelClassName(3, "right")}>
              <OnboardingProfilePetStep
                hasPetChoice={hasPetChoice}
                loading={loading}
                onHasPetChange={setHasPetChoice}
                onPrev={() => setStep(2)}
              />
            </div>
          </div>
        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
