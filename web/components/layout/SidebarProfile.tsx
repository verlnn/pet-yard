"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";
import { ROUTES } from "@/src/lib/routes";

interface SidebarProfileProps {
  profile: MyProfileResponse | null;
  onNavigate?: () => void;
}

export function SidebarProfile({ profile, onNavigate }: SidebarProfileProps) {
  const primaryPet = profile?.pets?.find((pet) => pet.id === profile.primaryPetId) ?? profile?.pets?.[0] ?? null;
  const nickname = profile?.nickname ?? "멍냥마당";
  const subtitle = profile?.bio?.trim()
    ? profile.bio
    : primaryPet?.name
    ? `${primaryPet.name}와 함께하는 일상`
    : profile?.regionName ?? "프로필을 확인해 보세요";

  return (
    <Link href={ROUTES.myFeed} className="app-sidebar-profile" onClick={onNavigate}>
      <div className="app-sidebar-profile-visual">
        <Avatar className="app-sidebar-profile-avatar">
          {profile?.profileImageUrl ? (
            <AvatarImage src={profile.profileImageUrl} alt={nickname} />
          ) : (
            <AvatarFallback>{nickname[0] ?? "멍"}</AvatarFallback>
          )}
        </Avatar>
        <div className="app-sidebar-profile-pet">
          {primaryPet?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primaryPet.photoUrl} alt={primaryPet.name} className="app-sidebar-profile-pet-image" />
          ) : (
            <div className="app-sidebar-profile-pet-fallback">{primaryPet?.name?.[0] ?? "펫"}</div>
          )}
        </div>
      </div>
      <div className="app-sidebar-profile-copy">
        <p className="app-sidebar-profile-name">{nickname}</p>
        <p className="app-sidebar-profile-subtitle">{subtitle}</p>
      </div>
    </Link>
  );
}
