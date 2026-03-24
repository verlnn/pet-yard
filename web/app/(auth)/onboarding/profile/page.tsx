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
  const [username, setUsername] = useState("");
  const [verifiedUsername, setVerifiedUsername] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameCheckMessage, setUsernameCheckMessage] = useState<string | null>(null);
  const [usernameCheckError, setUsernameCheckError] = useState(false);
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
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
  }, [router]);

  useEffect(() => {
    if (!signupToken || progressLoaded) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await authApi.signupProgress(signupToken);
        if (cancelled) return;

        const normalizedUsername = response.username?.trim().toLowerCase() ?? "";
        setNickname((prev) => prev || response.nickname ?? "");
        setUsername((prev) => prev || response.username ?? "");
        setVerifiedUsername((prev) => prev || normalizedUsername);
        setProfileImageUrl((prev) => prev || response.profileImageUrl ?? "");
        if (response.hasPet === true || response.hasPet === false) {
          setHasPetChoice(response.hasPet);
        }
        setProgressError(null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "진행 중인 회원가입 정보를 불러오지 못했습니다.";
        setProgressError(message);
        setError(message);
      } finally {
        if (!cancelled) {
          setProgressLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [progressLoaded, signupToken]);

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

  const normalizedUsername = username.trim().toLowerCase();
  const isUsernameVerified = normalizedUsername.length > 0 && verifiedUsername === normalizedUsername;
  const isProfileStepComplete = nickname.trim().length > 0 && username.trim().length > 0 && isUsernameVerified;
  const isRegionStepComplete = Boolean(cityCode && districtCode && dongCode);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setVerifiedUsername("");
    setUsernameCheckMessage(null);
    setUsernameCheckError(false);
  };

  const handleUsernameCheck = async () => {
    if (!signupToken) {
      return;
    }

    const candidate = username.trim();
    if (!candidate) {
      setVerifiedUsername("");
      setUsernameCheckMessage("공개 ID를 먼저 입력해 주세요.");
      setUsernameCheckError(true);
      return;
    }

    setUsernameChecking(true);
    setUsernameCheckMessage(null);
    setUsernameCheckError(false);

    try {
      const response = await authApi.signupProfileUsernameCheck(signupToken, candidate);
      setUsername(response.username);
      setVerifiedUsername(response.username);
      setUsernameCheckMessage("사용 가능한 공개 ID입니다.");
      setUsernameCheckError(false);
    } catch (err) {
      setVerifiedUsername("");
      setUsernameCheckMessage(err instanceof Error ? err.message : "공개 ID 확인에 실패했습니다.");
      setUsernameCheckError(true);
    } finally {
      setUsernameChecking(false);
    }
  };

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
    if (!nickname.trim() || !username.trim()) {
      setError("닉네임과 공개 ID를 입력해 주세요.");
      return;
    }
    if (!isUsernameVerified) {
      setError("공개 ID 확인하기를 완료해 주세요.");
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
        username: username.trim(),
        regionCode: selectedRegion,
        profileImageUrl: profileImageUrl.trim() || null,
        marketingOptIn,
        hasPet: hasPetChoice
      });

      if (result.nextStep === "PET") {
        router.push("/onboarding/pet");
      } else if (result.nextStep === "CONSENTS") {
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
                username={username}
                usernameVerified={isUsernameVerified}
                usernameChecking={usernameChecking}
                usernameCheckMessage={usernameCheckMessage}
                usernameCheckError={usernameCheckError}
                profileImageUrl={profileImageUrl}
                profileImageError={profileImageError}
                onNicknameChange={setNickname}
                onUsernameChange={handleUsernameChange}
                onUsernameCheck={handleUsernameCheck}
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
