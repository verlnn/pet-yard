"use client";

type OnboardingProfilePetStepProps = {
  hasPetChoice: boolean | null;
  loading: boolean;
  onHasPetChange: (value: boolean) => void;
  onPrev: () => void;
};

export default function OnboardingProfilePetStep({
  hasPetChoice,
  loading,
  onHasPetChange,
  onPrev
}: OnboardingProfilePetStepProps) {
  const petChoiceButtonClassName = (selected: boolean) =>
    [
      "onboarding-profile-choice-button",
      selected
        ? "onboarding-profile-choice-button-selected"
        : "onboarding-profile-choice-button-unselected"
    ].join(" ");

  return (
    <>
      <div className="onboarding-profile-step-content onboarding-profile-step-content-spaced">
        <div className="onboarding-profile-field-block">
          반려동물 유무
          <div className="onboarding-profile-choice-grid">
            <button
              type="button"
              className={petChoiceButtonClassName(hasPetChoice === true)}
              onClick={() => onHasPetChange(true)}
            >
              반려동물이 있어요
            </button>
            <button
              type="button"
              className={petChoiceButtonClassName(hasPetChoice === false)}
              onClick={() => onHasPetChange(false)}
            >
              나중에 등록할게요
            </button>
          </div>
        </div>
      </div>

      <div className="onboarding-profile-step-actions">
        <button
          type="button"
          onClick={onPrev}
          className="onboarding-profile-secondary-button"
        >
          이전
        </button>
        <button
          type="submit"
          className="onboarding-profile-primary-button"
          disabled={loading || hasPetChoice === null}
        >
          {loading ? "저장 중..." : "다음"}
        </button>
      </div>
    </>
  );
}
