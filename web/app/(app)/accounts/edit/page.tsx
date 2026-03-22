"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, Lock, PawPrint, Search, ShieldAlert, UserRound } from "lucide-react";

import { PetSettingsPanel } from "@/src/features/pets/components/PetSettingsPanel";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";
import { ROUTES } from "@/src/lib/routes";

type SettingsSectionKey =
  | "profile"
  | "notifications"
  | "privacy"
  | "close-friends"
  | "blocked"
  | "pet-add"
  | "pet-manage";

interface SettingsNavItem {
  label: string;
  key: SettingsSectionKey;
}

interface SettingsNavSection {
  title: string;
  items: SettingsNavItem[];
}

const settingsSections: SettingsNavSection[] = [
  {
    title: "내 멍냥마당 사용 방식",
    items: [{ label: "프로필 편집", key: "profile" }, { label: "알림", key: "notifications" }]
  },
  {
    title: "내 콘텐츠를 볼 수 있는 사람",
    items: [{ label: "계정 공개 범위", key: "privacy" }, { label: "친한 친구", key: "close-friends" }, { label: "차단된 계정", key: "blocked" }]
  },
  {
    title: "반려동물",
    items: [{ label: "반려동물 추가", key: "pet-add" }, { label: "반려동물 관리", key: "pet-manage" }]
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("반려생활 기록을 차곡차곡 쌓는 중");
  const [gender, setGender] = useState("밝히고 싶지 않음");
  const [recommendAccount, setRecommendAccount] = useState(true);
  const activeSection = (searchParams?.get("section") as SettingsSectionKey | null) ?? "profile";

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await authApi.getMyProfile(accessToken);
        setProfile(response);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profileName = profile?.nickname ?? (loading ? "불러오는 중..." : "멍냥마당");
  const profileHandle = useMemo(() => profileName.replace(/\s+/g, "_").toLowerCase(), [profileName]);
  const helperRegion = profile?.regionName ?? "반려생활 기반 커뮤니티";
  const activeItemLabel =
    settingsSections.flatMap((section) => section.items).find((item) => item.key === activeSection)?.label ?? "프로필 편집";
  const isPetSection = activeSection === "pet-add" || activeSection === "pet-manage";
  const isProfileSection = activeSection === "profile";

  const handleSectionChange = (section: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (section === "profile") {
      next.delete("section");
    } else {
      next.set("section", section);
    }
    const query = next.toString();
    router.push(query ? `${ROUTES.setting}?${query}` : ROUTES.setting);
  };

  return (
    <section className="settings-page">
      <div className="settings-page-layout">
        <aside className="settings-page-sidebar">
          <div className="settings-page-sidebar-header">
            <h1 className="settings-page-sidebar-title">설정</h1>
          </div>

          <label className="settings-page-search">
            <Search className="settings-page-search-icon" />
            <input
              className="settings-page-search-input"
              type="search"
              placeholder="검색"
            />
          </label>

          <div className="settings-page-nav">
            {settingsSections.map((section) => (
              <div key={section.title} className="settings-page-nav-section">
                <p className="settings-page-nav-section-title">{section.title}</p>
                <div className="settings-page-nav-list">
                  {section.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`settings-page-nav-item ${activeSection === item.key ? "settings-page-nav-item-active" : ""}`}
                      onClick={() => handleSectionChange(item.key)}
                    >
                      <span className="settings-page-nav-item-icon">
                        {item.label === "프로필 편집" && <UserRound className="settings-page-nav-item-icon-mark" />}
                        {item.label === "알림" && <Bell className="settings-page-nav-item-icon-mark" />}
                        {item.label === "계정 공개 범위" && <Lock className="settings-page-nav-item-icon-mark" />}
                        {item.label === "친한 친구" && <ShieldAlert className="settings-page-nav-item-icon-mark" />}
                        {item.label === "차단된 계정" && <ShieldAlert className="settings-page-nav-item-icon-mark" />}
                        {(item.key === "pet-add" || item.key === "pet-manage") && (
                          <PawPrint className="settings-page-nav-item-icon-mark" />
                        )}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="settings-page-content">
          {isPetSection ? (
            <PetSettingsPanel mode={activeSection === "pet-add" ? "add" : "manage"} />
          ) : !isProfileSection ? (
            <>
              <div className="settings-page-content-header">
                <p className="settings-page-content-eyebrow">Settings</p>
                <h2 className="settings-page-content-title">{activeItemLabel}</h2>
                <p className="settings-page-field-helper">이 섹션은 현재 설정 페이지 구조에 맞춰 정리 중입니다.</p>
              </div>
              <div className="settings-page-editor-card">
                <p className="settings-page-field-helper">우선 반려동물 관리와 프로필 편집 섹션부터 설정 페이지 안으로 통합했습니다.</p>
              </div>
            </>
          ) : (
            <>
              <div className="settings-page-content-header">
                <p className="settings-page-content-eyebrow">Settings</p>
                <h2 className="settings-page-content-title">프로필 편집</h2>
              </div>

              <div className="settings-page-editor-card">
                <div className="settings-page-profile-row">
                  <div className="settings-page-profile-summary">
                    <div className="settings-page-profile-avatar">
                      {profile?.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.profileImageUrl} alt={profileName} className="settings-page-profile-avatar-image" />
                      ) : (
                        <div className="settings-page-profile-avatar-fallback">{profileName[0] ?? "멍"}</div>
                      )}
                    </div>
                    <div className="settings-page-profile-copy">
                      <p className="settings-page-profile-name">{profileName}</p>
                      <p className="settings-page-profile-handle">@{profileHandle}</p>
                      <p className="settings-page-profile-region">{helperRegion}</p>
                    </div>
                  </div>
                  <button type="button" className="settings-page-profile-action">
                    사진 변경
                  </button>
                </div>

                <div className="settings-page-field">
                  <label className="settings-page-field-label" htmlFor="settings-website">웹사이트</label>
                  <input
                    id="settings-website"
                    className="settings-page-input"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="웹사이트"
                  />
                  <p className="settings-page-field-helper">
                    링크 수정은 모바일에서도 바로 반영되도록 준비 중입니다. 현재는 미리보기 형태로 제공됩니다.
                  </p>
                </div>

                <div className="settings-page-field">
                  <label className="settings-page-field-label" htmlFor="settings-bio">소개</label>
                  <div className="settings-page-textarea-shell">
                    <textarea
                      id="settings-bio"
                      className="settings-page-textarea"
                      value={bio}
                      maxLength={150}
                      onChange={(event) => setBio(event.target.value)}
                    />
                    <span className="settings-page-textarea-count">{bio.length} / 150</span>
                  </div>
                </div>

                <div className="settings-page-field">
                  <label className="settings-page-field-label" htmlFor="settings-gender">성별</label>
                  <div className="settings-page-select-shell">
                    <select
                      id="settings-gender"
                      className="settings-page-select"
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                    >
                      <option>밝히고 싶지 않음</option>
                      <option>여성</option>
                      <option>남성</option>
                      <option>직접 입력하지 않음</option>
                    </select>
                    <ChevronDown className="settings-page-select-icon" />
                  </div>
                  <p className="settings-page-field-helper">이 정보는 공개 프로필에 포함되지 않습니다.</p>
                </div>

                <div className="settings-page-preference-card">
                  <div className="settings-page-preference-copy">
                    <p className="settings-page-preference-title">프로필에 계정 추천 표시</p>
                    <p className="settings-page-preference-description">
                      사람들이 회원님의 프로필에서 비슷한 계정 추천을 볼 수 있는지를 조절합니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={recommendAccount}
                    className={`settings-page-switch ${recommendAccount ? "settings-page-switch-active" : ""}`}
                    onClick={() => setRecommendAccount((prev) => !prev)}
                  >
                    <span className="settings-page-switch-thumb" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
