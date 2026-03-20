"use client";

import OnboardingRegionComboBox, { type RegionOption } from "./OnboardingRegionComboBox";

type OnboardingProfileRegionStepProps = {
  cityCode: string;
  districtCode: string;
  dongCode: string;
  cities: RegionOption[];
  districts: RegionOption[];
  dongs: RegionOption[];
  selectedCityName?: string;
  selectedDistrictName?: string;
  selectedDongName?: string;
  marketingOptIn: boolean;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onDongChange: (value: string) => void;
  onMarketingOptInChange: (value: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
};

export default function OnboardingProfileRegionStep({
  cityCode,
  districtCode,
  dongCode,
  cities,
  districts,
  dongs,
  selectedCityName,
  selectedDistrictName,
  selectedDongName,
  marketingOptIn,
  onCityChange,
  onDistrictChange,
  onDongChange,
  onMarketingOptInChange,
  onPrev,
  onNext,
  nextDisabled
}: OnboardingProfileRegionStepProps) {
  return (
    <>
      <div className="onboarding-profile-step-content">
        <label className="onboarding-profile-field-block onboarding-profile-region-block">
          지역 선택
          <div className="onboarding-profile-region-grid">
            <OnboardingRegionComboBox
              label="시/도"
              placeholder="시/도 검색"
              value={cityCode}
              options={cities}
              onChange={onCityChange}
            />
            <OnboardingRegionComboBox
              label="구/군"
              placeholder="구/군 검색"
              value={districtCode}
              options={districts}
              disabled={!cityCode}
              onChange={onDistrictChange}
            />
            <OnboardingRegionComboBox
              label="읍/면/동"
              placeholder="읍/면/동 검색"
              value={dongCode}
              options={dongs}
              disabled={!districtCode}
              onChange={onDongChange}
            />
          </div>
          <div className="onboarding-profile-region-tags">
            {selectedCityName && <span className="onboarding-profile-region-tag">{selectedCityName}</span>}
            {selectedDistrictName && (
              <span className="onboarding-profile-region-tag">{selectedDistrictName}</span>
            )}
            {selectedDongName && <span className="onboarding-profile-region-tag">{selectedDongName}</span>}
          </div>
        </label>

        <label className="onboarding-profile-toggle-row">
          <span>마케팅 수신 동의 (선택)</span>
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(event) => onMarketingOptInChange(event.target.checked)}
            className="onboarding-profile-checkbox"
          />
        </label>
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
          type="button"
          onClick={onNext}
          className="onboarding-profile-primary-button"
          disabled={nextDisabled}
        >
          다음
        </button>
      </div>
    </>
  );
}
