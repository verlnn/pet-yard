"use client";

type OnboardingPetProgressProps = {
  step: 1 | 2 | 3;
};

export default function OnboardingPetProgress({ step }: OnboardingPetProgressProps) {
  return (
    <div className="onboarding-pet-progress">
      <div className="onboarding-pet-progress-header">
        <span>진행 단계</span>
        <span>{step}/3</span>
      </div>
      <div
        className="onboarding-pet-progress-track"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        <div
          className="onboarding-pet-progress-fill"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}
