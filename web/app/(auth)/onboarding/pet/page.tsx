"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/src/features/auth/api/authApi";
import type { PetRegistrationVerificationResponse } from "@/src/features/auth/types/authTypes";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingPetDetailsStep from "@/src/features/onboarding/components/pet/OnboardingPetDetailsStep";
import OnboardingPetPhotoStep from "@/src/features/onboarding/components/pet/OnboardingPetPhotoStep";
import OnboardingPetProgress from "@/src/features/onboarding/components/pet/OnboardingPetProgress";
import OnboardingPetVerificationStep from "@/src/features/onboarding/components/pet/OnboardingPetVerificationStep";

const emptyVerification = {
  dogRegNo: "",
  rfidCd: "",
  ownerNm: "",
  ownerBirth: ""
};

const emptyDetailsForm = {
  weightKg: "",
  vaccinationComplete: "" as "" | "true" | "false",
  walkSafetyChecked: "" as "" | "true" | "false"
};

export default function OnboardingPetPage() {
  const router = useRouter();
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verification, setVerification] = useState(emptyVerification);
  const [verificationResult, setVerificationResult] = useState<PetRegistrationVerificationResponse | null>(null);
  const [detailsForm, setDetailsForm] = useState(emptyDetailsForm);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      router.replace("/start");
      return;
    }
    setSignupToken(token);
  }, [router]);

  const handleVerificationChange = (field: keyof typeof emptyVerification, value: string) => {
    setVerification((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerify = async () => {
    if (!verification.dogRegNo.trim() || !verification.rfidCd.trim() || !verification.ownerNm.trim() || !verification.ownerBirth.trim()) {
      setError("등록번호, RFID, 소유자 이름, 생년월일을 모두 입력해 주세요.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await authApi.signupVerifyPetRegistration({
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim()
      });
      setVerificationResult(result);
    } catch (err) {
      setVerificationResult(null);
      setError(err instanceof Error ? err.message : "반려동물 등록번호 인증에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetVerification = () => {
    setVerification(emptyVerification);
    setVerificationResult(null);
    setDetailsForm(emptyDetailsForm);
    setPhotoUrl("");
    setPhotoError(null);
    setError(null);
    setStep(1);
  };

  const handlePetImageUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("3MB 이하 이미지로 업로드해 주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === "string" ? reader.result : "");
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupToken || !verificationResult) {
      setError("반려동물 등록번호 인증을 먼저 완료해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.signupPet(signupToken, {
        dogRegNo: verification.dogRegNo.trim(),
        rfidCd: verification.rfidCd.trim(),
        ownerNm: verification.ownerNm.trim(),
        ownerBirth: verification.ownerBirth.trim(),
        photoUrl: photoUrl || null,
        weightKg: detailsForm.weightKg ? Number(detailsForm.weightKg) : null,
        vaccinationComplete:
          detailsForm.vaccinationComplete === ""
            ? null
            : detailsForm.vaccinationComplete === "true",
        walkSafetyChecked:
          detailsForm.walkSafetyChecked === ""
            ? null
            : detailsForm.walkSafetyChecked === "true"
      });

      if (result.nextStep === "COMPLETE") {
        router.push("/onboarding/complete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "반려동물 정보 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const stepPanelClassName = (targetStep: 1 | 2 | 3, hiddenDirection: "left" | "right") =>
    [
      "onboarding-pet-step-panel",
      step === targetStep
        ? "onboarding-pet-step-panel-active"
        : hiddenDirection === "left"
          ? "onboarding-pet-step-panel-hidden-left"
          : "onboarding-pet-step-panel-hidden-right"
    ].join(" ");

  return (
    <OnboardingLayout>
      <OnboardingCard
        title="반려동물 정보"
        subtitle="1단계에서 등록번호를 인증하고, 2단계와 3단계에서 기본정보와 사진을 저장해 주세요."
        error={error}
      >
        <form className="onboarding-pet-form" onSubmit={handleSubmit}>
          <OnboardingPetProgress step={step} />

          <div
            className={`onboarding-pet-step-shell ${
              step === 1 ? "onboarding-pet-step-shell-compact" : "onboarding-pet-step-shell-regular"
            }`}
          >
            <div className={stepPanelClassName(1, "left")}>
              <OnboardingPetVerificationStep
                verification={verification}
                verificationResult={verificationResult}
                verifying={verifying}
                onChange={handleVerificationChange}
                onVerify={handleVerify}
                onReset={handleResetVerification}
                onNext={() => {
                  if (!verificationResult) {
                    setError("반려동물 등록번호 인증을 먼저 완료해 주세요.");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
              />
            </div>

            <div className={stepPanelClassName(2, "right")}>
              {verificationResult && (
                <OnboardingPetDetailsStep
                  verificationResult={verificationResult}
                  form={detailsForm}
                  onWeightChange={(value) => setDetailsForm((prev) => ({ ...prev, weightKg: value }))}
                  onVaccinationChange={(value) =>
                    setDetailsForm((prev) => ({ ...prev, vaccinationComplete: value }))
                  }
                  onWalkSafetyChange={(value) =>
                    setDetailsForm((prev) => ({ ...prev, walkSafetyChecked: value }))
                  }
                  onPrev={() => setStep(1)}
                  onNext={() => {
                    setError(null);
                    setStep(3);
                  }}
                />
              )}
            </div>

            <div className={stepPanelClassName(3, "right")}>
              {verificationResult && (
                <OnboardingPetPhotoStep
                  photoUrl={photoUrl}
                  photoError={photoError}
                  loading={loading}
                  onPhotoSelect={handlePetImageUpload}
                  onPrev={() => setStep(2)}
                />
              )}
            </div>
          </div>
        </form>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
