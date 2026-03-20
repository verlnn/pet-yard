"use client";

type OnboardingPetProgressProps = {
  step: 1 | 2;
};

export default function OnboardingPetProgress({ step }: OnboardingPetProgressProps) {
  return (
    <div className="onboarding-pet-progress">
      <div className="onboarding-pet-progress-header">
        <span>진행 단계</span>
        <span>{step}/2</span>
      </div>
      <div
        className="onboarding-pet-progress-track"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={2}
      >
        <div
          className="onboarding-pet-progress-fill"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>
    </div>
  );
}
