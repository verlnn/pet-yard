"use client";

type OnboardingPetPhotoStepProps = {
  photoUrl: string;
  photoError: string | null;
  loading: boolean;
  onPhotoSelect: (file: File | null) => void;
  onPrev: () => void;
};

export default function OnboardingPetPhotoStep({
  photoUrl,
  photoError,
  loading,
  onPhotoSelect,
  onPrev
}: OnboardingPetPhotoStepProps) {
  return (
    <>
      <div className="onboarding-pet-step-content">
        <div className="onboarding-pet-field-block">
          <p className="onboarding-pet-section-title">3단계 · 반려동물 사진 업로드</p>
          <p className="onboarding-pet-section-description">
            프로필에 사용할 대표 사진을 업로드해 주세요. 사진은 지금 등록하지 않아도 됩니다.
          </p>
        </div>

        <label className="onboarding-pet-photo-card">
          <div className="onboarding-pet-photo-card-preview">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="반려동물 사진" className="onboarding-pet-photo-card-image" />
            ) : (
              <div className="onboarding-pet-photo-card-empty">No Photo</div>
            )}
          </div>
          <div className="onboarding-pet-photo-card-actions">
            <div className="onboarding-pet-photo-card-copy">
              <p className="onboarding-pet-photo-card-title">
                {photoUrl ? "사진을 바꾸려면 이 영역을 눌러주세요" : "사진 영역을 눌러 업로드하세요"}
              </p>
              <p className="onboarding-pet-photo-card-help">
                대표 사진으로 사용됩니다. JPG, PNG 형식의 3MB 이하 이미지를 권장합니다.
              </p>
            </div>
            <div className="onboarding-pet-photo-card-meta">
              <span className="onboarding-pet-photo-card-meta-dot" />
              <span>{photoUrl ? "업로드된 사진 있음" : "아직 업로드한 사진 없음"}</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="onboarding-pet-hidden-input"
              onChange={(event) => onPhotoSelect(event.target.files?.[0] ?? null)}
            />
          </div>
        </label>

        {photoError && <p className="onboarding-pet-photo-error">{photoError}</p>}
      </div>

      <div className="onboarding-pet-step-actions">
        <button
          type="button"
          className="onboarding-pet-reset-button"
          onClick={onPrev}
        >
          이전
        </button>
        <button
          type="submit"
          className="onboarding-pet-submit-button onboarding-pet-submit-button-half"
          disabled={loading}
        >
          {loading ? "저장 중..." : "반려동물 등록 완료"}
        </button>
      </div>
    </>
  );
}
