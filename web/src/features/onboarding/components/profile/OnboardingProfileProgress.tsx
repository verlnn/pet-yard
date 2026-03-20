"use client";

type OnboardingProfileProgressProps = {
  step: 1 | 2 | 3;
};

export default function OnboardingProfileProgress({ step }: OnboardingProfileProgressProps) {
  return (
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
  );
}
