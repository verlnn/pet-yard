"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Lock, PawPrint, Search, ShieldAlert, UserRound } from "lucide-react";

import { PetSettingsPanel } from "@/src/features/pets/components/PetSettingsPanel";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";
import { ROUTES } from "@/src/lib/routes";

export type SettingsSectionKey =
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

const sectionRoutes: Record<SettingsSectionKey, Route> = {
  profile: ROUTES.setting,
  notifications: ROUTES.accountNotifications,
  privacy: ROUTES.accountPrivacy,
  "close-friends": ROUTES.accountCloseFriends,
  blocked: ROUTES.accountBlocked,
  "pet-add": ROUTES.accountPetsNew,
  "pet-manage": ROUTES.accountPets
};

const settingsSections: SettingsNavSection[] = [
  {
    title: "내 멍냥마당 사용 방식",
    items: [{ label: "프로필 편집", key: "profile" }, { label: "알림", key: "notifications" }]
  },
  {
    title: "내 콘텐츠를 볼 수 있는 사람",
    items: [
      { label: "계정 공개 범위", key: "privacy" },
      { label: "친한 친구", key: "close-friends" },
      { label: "차단된 계정", key: "blocked" }
    ]
  },
  {
    title: "반려동물",
    items: [
      { label: "반려동물 관리", key: "pet-manage" },
      { label: "반려동물 추가", key: "pet-add" }
    ]
  }
];

interface SettingsPageContentProps {
  activeSection: SettingsSectionKey;
}

export function SettingsPageContent({ activeSection }: SettingsPageContentProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("밝히고 싶지 않음");
  const [savingBio, setSavingBio] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await authApi.getMyProfile(accessToken);
        setProfile(response);
        setBio(response.bio ?? "");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [accessToken]);

  const profileName = profile?.nickname ?? (loading ? "불러오는 중..." : "멍냥마당");
  const profileHandle = useMemo(() => profileName.replace(/\s+/g, "_").toLowerCase(), [profileName]);
  const helperRegion = profile?.regionName ?? "반려생활 기반 커뮤니티";
  const activeItemLabel =
    settingsSections.flatMap((section) => section.items).find((item) => item.key === activeSection)?.label ?? "프로필 편집";
  const isPetSection = activeSection === "pet-add" || activeSection === "pet-manage";
  const isProfileSection = activeSection === "profile";
  const bioChanged = (profile?.bio ?? "") !== bio;

  const handleSaveBio = async () => {
    if (!accessToken || savingBio || !bioChanged) {
      return;
    }
    setSavingBio(true);
    setSaveMessage(null);
    try {
      const response = await authApi.updateMyProfileSettings(accessToken, {
        bio: bio.trim() || null
      });
      setProfile(response);
      setBio(response.bio ?? "");
      setSaveMessage("소개가 저장되었습니다.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "소개 저장에 실패했습니다.");
    } finally {
      setSavingBio(false);
    }
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
                      onClick={() => router.push(sectionRoutes[item.key])}
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
                  <div className="settings-page-field-action-row">
                    <button
                      type="button"
                      className="settings-page-inline-action"
                      onClick={handleSaveBio}
                      disabled={!bioChanged || savingBio}
                    >
                      {savingBio ? "저장 중..." : "소개 저장"}
                    </button>
                    {saveMessage ? <p className="settings-page-inline-feedback">{saveMessage}</p> : null}
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
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
