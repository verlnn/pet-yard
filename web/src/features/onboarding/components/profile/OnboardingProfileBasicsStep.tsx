"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type OnboardingProfileBasicsStepProps = {
  nickname: string;
  username: string;
  profileImageUrl: string;
  profileImageError: string | null;
  onNicknameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onImageSelect: (file: File | null) => void;
  onImageRemove: () => void;
  onNext: () => void;
  nextDisabled: boolean;
};

export default function OnboardingProfileBasicsStep({
  nickname,
  username,
  profileImageUrl,
  profileImageError,
  onNicknameChange,
  onUsernameChange,
  onImageSelect,
  onImageRemove,
  onNext,
  nextDisabled
}: OnboardingProfileBasicsStepProps) {
  const [isUsernameRulesOpen, setIsUsernameRulesOpen] = useState(false);

  return (
    <>
      <div className="onboarding-profile-step-content onboarding-profile-step-content-basics">
        <label className="onboarding-profile-field">
          닉네임
          <input
            className="onboarding-profile-input"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder="멍냥마당에서 사용할 이름"
            required
          />
        </label>

        <label className="onboarding-profile-field">
          공개 ID
          <input
            className="onboarding-profile-input"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="meongnyang.owner"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={30}
            required
          />
        </label>

        <div className="onboarding-profile-help-block">
          <button
            type="button"
            className="onboarding-profile-help-toggle"
            onClick={() => setIsUsernameRulesOpen((current) => !current)}
            aria-expanded={isUsernameRulesOpen}
          >
            <span>규칙보기</span>
            {isUsernameRulesOpen ? (
              <ChevronUp aria-hidden="true" className="onboarding-profile-help-toggle-icon" />
            ) : (
              <ChevronDown aria-hidden="true" className="onboarding-profile-help-toggle-icon" />
            )}
          </button>
          {isUsernameRulesOpen ? (
            <div className="onboarding-profile-help-panel">
              <ul className="onboarding-profile-help-list">
                <li>영문 소문자, 숫자, 점(.)만 사용할 수 있어요.</li>
                <li>3자 이상 30자 이하로 입력해 주세요.</li>
                <li>앞뒤를 점으로 시작하거나 끝낼 수 없어요.</li>
                <li>다른 사용자와 중복되지 않아야 해요.</li>
              </ul>
            </div>
          ) : null}
        </div>

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
                  onChange={(event) => onImageSelect(event.target.files?.[0] ?? null)}
                />
              </label>
              {profileImageUrl && (
                <button
                  type="button"
                  className="onboarding-profile-photo-remove"
                  onClick={onImageRemove}
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
          onClick={onNext}
          className="onboarding-profile-primary-button"
          disabled={nextDisabled}
        >
          다음 단계
        </button>
      </div>
    </>
  );
}
