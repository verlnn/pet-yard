"use client";

import Link from "next/link";
import { Camera, Plus, Settings, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authApi } from "@/src/features/auth/api/authApi";
import type { GuardianSummary, MyProfileResponse } from "@/src/features/auth/types/authTypes";
import { CommonButton } from "@/components/ui/CommonButton";

interface FeedProfileHeaderProps {
  profile?: MyProfileResponse | null;
  postCount: number;
  onNewPost: () => void;
  onProfileImageClick?: () => void;
  onPetsClick?: () => void;
}

export function FeedProfileHeader({ profile, postCount, onNewPost, onProfileImageClick, onPetsClick }: FeedProfileHeaderProps) {
  const primaryPet = profile?.pets?.find((pet) => pet.id === profile?.primaryPetId) ?? profile?.pets?.[0];
  const [showGuardianCard, setShowGuardianCard] = useState(false);
  const [guardians, setGuardians] = useState<GuardianSummary[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);
  const [guardiansError, setGuardiansError] = useState<string | null>(null);
  const dismissGuardianCard = useCallback(() => {
    setShowGuardianCard(false);
    setGuardians([]);
    setGuardiansLoading(false);
    setGuardiansError(null);
  }, []);

  useEffect(() => {
    if (!showGuardianCard) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissGuardianCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGuardianCard, dismissGuardianCard]);

  useEffect(() => {
    if (!showGuardianCard || !profile?.username) {
      return undefined;
    }

    let active = true;
    setGuardiansLoading(true);
    setGuardiansError(null);

    authApi
      .getPublicProfileGuardians(profile.username)
      .then((response) => {
        if (active) {
          setGuardians(response.guardians);
        }
      })
      .catch((error) => {
        if (active) {
          setGuardians([]);
          setGuardiansError(error instanceof Error ? error.message : "집사 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) {
          setGuardiansLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [showGuardianCard, profile?.username]);

  return (
    <section className="feed-profile-header">
      <div className="feed-profile-header-layout">
        <FeedProfileIdentity
          profile={profile}
          primaryPet={primaryPet}
          postCount={postCount}
          onProfileImageClick={onProfileImageClick}
          onPetsClick={onPetsClick}
          onGuardiansClick={() => setShowGuardianCard(true)}
        />
        <FeedProfileActions onNewPost={onNewPost} />
      </div>
      {showGuardianCard && (
        <div
          className="guardian-card-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="집사 목록"
          onClick={dismissGuardianCard}
        >
          <div className="guardian-card" role="document" onClick={(event) => event.stopPropagation()}>
            <div className="guardian-card-header">
              <p>집사들</p>
              <button
                type="button"
                className="guardian-card-close"
                onClick={dismissGuardianCard}
                aria-label="집사 카드 닫기"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="guardian-card-body">
              <div className="guardian-card-search-section">
                <input className="guardian-card-search" placeholder="검색" />
              </div>
              <div className="guardian-card-list-section">
                {guardiansError && (
                  <p className="guardian-card-error" role="alert">
                    {guardiansError}
                  </p>
                )}
                {guardiansLoading ? (
                  <p className="guardian-card-loading">집사 목록을 불러오는 중입니다.</p>
                ) : (
                  <ul className="guardian-card-list">
                    {guardians.length === 0 ? (
                      <li className="guardian-card-empty">
                        <p>아직 연결된 집사들이 없습니다.</p>
                        <span>집사 요청을 보내보세요.</span>
                      </li>
                    ) : (
                      guardians.map((guardian) => (
                        <li key={guardian.userId}>
                          <div className="guardian-card-list-item">
                            <Avatar className="guardian-card-list-avatar">
                              {guardian.profileImageUrl ? (
                                <AvatarImage src={guardian.profileImageUrl} alt={guardian.nickname} />
                              ) : (
                                <AvatarFallback>
                                  {(guardian.nickname?.[0] ?? guardian.username?.[0])?.toUpperCase() ?? "G"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="guardian-card-list-copy">
                              <strong>{guardian.username}</strong>
                              <span>{guardian.nickname}</span>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface FeedProfileIdentityProps {
  profile?: MyProfileResponse | null;
  primaryPet?: MyProfileResponse["pets"][number];
  postCount: number;
  onProfileImageClick?: () => void;
  onPetsClick?: () => void;
  onGuardiansClick?: () => void;
}

function FeedProfileIdentity({
  profile,
  primaryPet,
  postCount,
  onProfileImageClick,
  onPetsClick,
  onGuardiansClick
}: FeedProfileIdentityProps) {
  const profileUsername = profile?.username?.trim() || "username";
  const profileDisplayName = profile?.nickname?.trim() || "멍냥마당";
  const avatar = (
    <div className="feed-profile-header-avatar-shell">
      <Avatar className="feed-profile-header-avatar">
        {profile?.profileImageUrl ? (
          <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
        ) : (
          <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
        )}
      </Avatar>
      {primaryPet ? (
        <span className="feed-profile-header-primary-pet" aria-hidden="true">
          {primaryPet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primaryPet.photoUrl} alt={primaryPet.name} className="feed-profile-header-primary-pet-image" />
          ) : (
            <span className="feed-profile-header-primary-pet-fallback">{primaryPet.name[0] ?? "펫"}</span>
          )}
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="feed-profile-header-identity">
      {onProfileImageClick ? (
        <button
          type="button"
          className="feed-profile-header-avatar-button"
          onClick={onProfileImageClick}
          aria-label="프로필 사진 바꾸기"
        >
          {avatar}
          <span className="feed-profile-header-avatar-overlay" aria-hidden="true">
            <Camera className="feed-profile-header-avatar-overlay-icon" />
            <span className="feed-profile-header-avatar-overlay-label">사진 변경</span>
          </span>
        </button>
      ) : (
        avatar
      )}

      <div className="feed-profile-header-copy">
        <div className="feed-profile-header-heading-row">
          <div className="feed-profile-header-title-group">
            <p className="feed-profile-header-title">{profileUsername}</p>
            <p className="feed-profile-header-display-name">{profileDisplayName}</p>
          </div>
          <Link href="/accounts/edit" className="feed-profile-header-settings-link" aria-label="프로필 설정">
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <div className="feed-profile-header-stats">
          <FeedProfileStat label="게시물" value={postCount} />
          <FeedProfileStat
            label="집사들"
            value={profile?.guardianCount ?? 0}
            onClick={onGuardiansClick}
          />
          <FeedProfileStat label="반려동물" value={profile?.petCount ?? 0} onClick={onPetsClick} />
        </div>

        <div className="feed-profile-header-meta">
          <p className="feed-profile-header-subtitle">
            {profile?.bio?.trim()
              ? profile.bio
              : primaryPet?.name
              ? `${primaryPet.name}와 함께하는 일상`
              : "반려동물과의 기록을 남겨보세요."}
          </p>
          {primaryPet?.breed && <p className="feed-profile-header-meta-line">{primaryPet.breed}</p>}
        </div>
      </div>
    </div>
  );
}

function FeedProfileActions({ onNewPost }: Pick<FeedProfileHeaderProps, "onNewPost">) {
  return (
    <div className="feed-profile-header-actions">
      <CommonButton variant="secondary" className="feed-profile-header-secondary-action" asChild>
        <Link href="/accounts/edit">
          프로필 편집
        </Link>
      </CommonButton>
      <CommonButton onClick={onNewPost} className="feed-profile-header-primary-action">
        <Plus className="h-4 w-4" /> 새 게시물
      </CommonButton>
    </div>
  );
}

interface FeedProfileStatProps {
  label: string;
  value: string | number;
  onClick?: () => void;
}

function FeedProfileStat({ label, value, onClick }: FeedProfileStatProps) {
  const Comp = onClick ? "button" : "span";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      className={cn(
        "feed-profile-header-stat",
        onClick ? "feed-profile-header-stat-clickable" : ""
      )}
      onClick={onClick}
    >
      <strong className="feed-profile-header-stat-value">{value}</strong>
      <span className="feed-profile-header-stat-label">{label}</span>
    </Comp>
  );
}
