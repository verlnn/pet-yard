"use client";

import Link from "next/link";
import { Plus, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";

interface FeedProfileHeaderProps {
  profile?: MyProfileResponse | null;
  postCount: number;
  onNewPost: () => void;
  onProfileImageClick?: () => void;
}

export function FeedProfileHeader({ profile, postCount, onNewPost, onProfileImageClick }: FeedProfileHeaderProps) {
  const primaryPet = profile?.pets?.[0];

  return (
    <section className="feed-profile-header">
      <div className="feed-profile-header-layout">
        <FeedProfileIdentity
          profile={profile}
          primaryPet={primaryPet}
          postCount={postCount}
          onProfileImageClick={onProfileImageClick}
        />
        <FeedProfileActions onNewPost={onNewPost} />
      </div>
    </section>
  );
}

interface FeedProfileIdentityProps {
  profile?: MyProfileResponse | null;
  primaryPet?: MyProfileResponse["pets"][number];
  postCount: number;
  onProfileImageClick?: () => void;
}

function FeedProfileIdentity({ profile, primaryPet, postCount, onProfileImageClick }: FeedProfileIdentityProps) {
  const avatar = (
    <Avatar className="feed-profile-header-avatar">
      {profile?.profileImageUrl ? (
        <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
      ) : (
        <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
      )}
    </Avatar>
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
        </button>
      ) : (
        avatar
      )}

      <div className="feed-profile-header-copy">
        <div className="feed-profile-header-heading-row">
          <div className="feed-profile-header-title-group">
            <p className="feed-profile-header-title">{profile?.nickname ?? "멍냥마당"}</p>
          </div>
          <Link href="/profile" className="feed-profile-header-settings-link" aria-label="프로필 설정">
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <div className="feed-profile-header-stats">
          <FeedProfileStat label="게시물" value={postCount} />
          <FeedProfileStat label="반려동물" value={profile?.petCount ?? 0} />
          <FeedProfileStat label="지역" value={profile?.regionName ?? "미설정"} />
        </div>

        <div className="feed-profile-header-meta">
          <p className="feed-profile-header-subtitle">
            {primaryPet?.name ? `${primaryPet.name}와 함께하는 일상` : "반려동물과의 기록을 남겨보세요."}
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
      <Button variant="secondary" className="feed-profile-header-secondary-action" asChild>
        <Link href="/profile">
          프로필 편집
        </Link>
      </Button>
      <Button onClick={onNewPost} className="feed-profile-header-primary-action">
        <Plus className="h-4 w-4" /> 새 게시물
      </Button>
    </div>
  );
}

interface FeedProfileStatProps {
  label: string;
  value: string | number;
}

function FeedProfileStat({ label, value }: FeedProfileStatProps) {
  return (
    <span className="feed-profile-header-stat">
      <strong className="feed-profile-header-stat-value">{value}</strong>
      <span className="feed-profile-header-stat-label">{label}</span>
    </span>
  );
}
