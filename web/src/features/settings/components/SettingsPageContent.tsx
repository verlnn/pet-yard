"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Lock, PawPrint, Search, ShieldAlert, UserRound, X } from "lucide-react";

import { PetSettingsPanel } from "@/src/features/pets/components/PetSettingsPanel";
import { PrivacySettingsPanel } from "@/src/features/settings/components/PrivacySettingsPanel";
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

interface SettingsSearchResult extends SettingsNavItem {
  sectionTitle: string;
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

const genderOptions = [
  { value: "PRIVATE", label: "밝히고 싶지 않음" },
  { value: "FEMALE", label: "여성" },
  { value: "MALE", label: "남성" },
  { value: "UNSPECIFIED", label: "선택 안 함" }
] as const;

const dispatchProfileRefresh = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event("petyard:profile-refresh"));
};

interface SettingsPageContentProps {
  activeSection: SettingsSectionKey;
}

export function SettingsPageContent({ activeSection }: SettingsPageContentProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<(typeof genderOptions)[number]["value"]>("PRIVATE");
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [primaryPetId, setPrimaryPetId] = useState<string>("none");
  const [searchQuery, setSearchQuery] = useState("");

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
        setUsername(response.username ?? "");
        setBio(response.bio ?? "");
        setGender((response.gender as (typeof genderOptions)[number]["value"] | null) ?? "PRIVATE");
        setPrimaryPetId(response.primaryPetId ? String(response.primaryPetId) : "none");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [accessToken]);

  const profileName = profile?.nickname ?? (loading ? "불러오는 중..." : "멍냥마당");
  const profileHandle = useMemo(() => username.trim() || profile?.username || "", [profile?.username, username]);
  const helperRegion = profile?.regionName ?? "반려생활 기반 커뮤니티";
  const activeItemLabel =
    settingsSections.flatMap((section) => section.items).find((item) => item.key === activeSection)?.label ?? "프로필 편집";
  const isPetSection = activeSection === "pet-add" || activeSection === "pet-manage";
  const isProfileSection = activeSection === "profile";
  const isPrivacySection = activeSection === "privacy";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearchQuery.length > 0;
  const usernameChanged = (profile?.username ?? "") !== username.trim().toLowerCase();
  const bioChanged = (profile?.bio ?? "") !== bio;
  const genderChanged = (profile?.gender ?? "PRIVATE") !== gender;
  const primaryPetChanged = String(profile?.primaryPetId ?? "none") !== primaryPetId;
  const hasProfileChanges = usernameChanged || bioChanged || genderChanged || primaryPetChanged;
  const searchResults = useMemo<SettingsSearchResult[]>(() => {
    if (!isSearching) {
      return [];
    }

    return settingsSections.flatMap((section) =>
      section.items
        .filter((item) => {
          const labelMatch = item.label.toLowerCase().includes(normalizedSearchQuery);
          const sectionMatch = section.title.toLowerCase().includes(normalizedSearchQuery);
          return labelMatch || sectionMatch;
        })
        .map((item) => ({
          ...item,
          sectionTitle: section.title
        }))
    );
  }, [isSearching, normalizedSearchQuery]);

  const renderNavIcon = (item: SettingsNavItem) => {
    if (item.label === "프로필 편집") {
      return <UserRound className="settings-page-nav-item-icon-mark" />;
    }
    if (item.label === "알림") {
      return <Bell className="settings-page-nav-item-icon-mark" />;
    }
    if (item.label === "계정 공개 범위") {
      return <Lock className="settings-page-nav-item-icon-mark" />;
    }
    if (item.label === "친한 친구" || item.label === "차단된 계정") {
      return <ShieldAlert className="settings-page-nav-item-icon-mark" />;
    }
    if (item.key === "pet-add" || item.key === "pet-manage") {
      return <PawPrint className="settings-page-nav-item-icon-mark" />;
    }
    return <UserRound className="settings-page-nav-item-icon-mark" />;
  };

  const handleSaveProfileChanges = async () => {
    if (!accessToken || savingChanges || !hasProfileChanges) {
      return;
    }
    setSavingChanges(true);
    setSaveMessage(null);
    try {
      const response = await authApi.updateMyProfileSettings(accessToken, {
        username: username.trim() || null,
        bio: bio.trim() || null,
        gender,
        primaryPetId: primaryPetId === "none" ? null : Number(primaryPetId)
      });
      setProfile(response);
      setUsername(response.username ?? "");
      setBio(response.bio ?? "");
      setGender((response.gender as (typeof genderOptions)[number]["value"] | null) ?? "PRIVATE");
      setPrimaryPetId(response.primaryPetId ? String(response.primaryPetId) : "none");
      dispatchProfileRefresh();
      setSaveMessage("변경사항이 저장되었습니다.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "변경사항 저장에 실패했습니다.");
    } finally {
      setSavingChanges(false);
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {isSearching ? (
              <button
                type="button"
                className="settings-page-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="검색어 지우기"
              >
                <X className="settings-page-search-clear-icon" />
              </button>
            ) : null}
          </label>

          <div className="settings-page-nav">
            {isSearching ? (
              <div className="settings-page-search-results">
                {searchResults.length > 0 ? (
                  <div className="settings-page-nav-list">
                    {searchResults.map((item) => (
                      <button
                        key={`${item.sectionTitle}-${item.key}`}
                        type="button"
                        className={`settings-page-nav-item ${activeSection === item.key ? "settings-page-nav-item-active" : ""}`}
                        onClick={() => router.push(sectionRoutes[item.key])}
                      >
                        <span className="settings-page-nav-item-icon">
                          {renderNavIcon(item)}
                        </span>
                        <span className="settings-page-search-result-copy">
                          <span>{item.label}</span>
                          <span className="settings-page-search-result-meta">{item.sectionTitle}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="settings-page-search-empty">검색 결과가 없습니다.</p>
                )}
              </div>
            ) : (
              settingsSections.map((section) => (
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
                          {renderNavIcon(item)}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="settings-page-content">
          {isPetSection ? (
            <PetSettingsPanel mode={activeSection === "pet-add" ? "add" : "manage"} />
          ) : isPrivacySection ? (
            <PrivacySettingsPanel />
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
                      <p className="settings-page-profile-handle">@{profileHandle || "username"}</p>
                      <p className="settings-page-profile-region">{helperRegion}</p>
                    </div>
                  </div>
                  <button type="button" className="settings-page-profile-action">
                    사진 변경
                  </button>
                </div>

                <div className="settings-page-field">
                  <label className="settings-page-field-label" htmlFor="settings-username">공개 ID</label>
                  <input
                    id="settings-username"
                    className="settings-page-input"
                    value={username}
                    maxLength={30}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="meongnyang.owner"
                  />
                  <p className="settings-page-field-helper">
                    영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.
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
                      onChange={(event) =>
                        setGender(event.target.value as (typeof genderOptions)[number]["value"])
                      }
                    >
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="settings-page-select-icon" />
                  </div>
                  <p className="settings-page-field-helper">이 정보는 공개 프로필에 포함되지 않습니다.</p>
                </div>

                <div className="settings-page-field">
                  <label className="settings-page-field-label" htmlFor="settings-primary-pet">대표 반려동물</label>
                  <div className="settings-page-select-shell">
                    <select
                      id="settings-primary-pet"
                      className="settings-page-select"
                      value={primaryPetId}
                      onChange={(event) => setPrimaryPetId(event.target.value)}
                      disabled={(profile?.pets?.length ?? 0) === 0}
                    >
                      <option value="none">선택 안 함</option>
                      {(profile?.pets ?? []).map((pet) => (
                        <option key={pet.id} value={String(pet.id)}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="settings-page-select-icon" />
                  </div>
                  <p className="settings-page-field-helper">
                    {(profile?.pets?.length ?? 0) > 0
                      ? "사이드바와 내 피드에서 우선적으로 보여줄 반려동물을 선택합니다."
                      : "먼저 반려동물을 등록하면 대표 반려동물을 고를 수 있어요."}
                  </p>
                </div>

                <div className="settings-page-submit-row">
                  {saveMessage ? <p className="settings-page-inline-feedback">{saveMessage}</p> : null}
                  <button
                    type="button"
                    className="settings-page-submit-button"
                    onClick={handleSaveProfileChanges}
                    disabled={!hasProfileChanges || savingChanges}
                  >
                    {savingChanges ? "저장 중..." : "변경사항 저장"}
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
