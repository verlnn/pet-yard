"use client";

import Link from "next/link";
import { Camera, Plus, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";
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
  const guardianList = [
    { username: "mxszuis__z", name: "mxszuis__z" },
    { username: "7ciderr", name: "7ciderr" },
    { username: "seo_jh_03", name: "서재형" },
    { username: "arti_jun_", name: "이준호" },
    { username: "kgr03kgr", name: "김강래" }
  ];

  useEffect(() => {
    if (!showGuardianCard) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowGuardianCard(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGuardianCard]);

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
        <div className="guardian-card-overlay">
          <div className="guardian-card">
            <div className="guardian-card-header">
              <p>집사들</p>
              <button
                type="button"
                className="guardian-card-close"
                onClick={() => setShowGuardianCard(false)}
                aria-label="집사 카드 닫기"
              >
                ×
              </button>
            </div>
            <div className="guardian-card-body">
              <input className="guardian-card-search" placeholder="검색" />
              <ul className="guardian-card-list">
                {guardianList.map((guardian) => (
                  <li key={guardian.username}>
                    <div>
                      <strong>{guardian.username}</strong>
                      <p>{guardian.name}</p>
                    </div>
                    <button type="button">삭제</button>
                  </li>
                ))}
              </ul>
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
