"use client";

import { Plus, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";

interface FeedProfileHeaderProps {
  profile?: MyProfileResponse | null;
  postCount: number;
  onNewPost: () => void;
}

export function FeedProfileHeader({ profile, postCount, onNewPost }: FeedProfileHeaderProps) {
  const primaryPet = profile?.pets?.[0];
  return (
    <section className="rounded-[32px] border border-slate-200/70 bg-white/70 p-6 shadow-[0_18px_50px_-40px_rgba(30,41,59,0.6)] backdrop-blur">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-white">
              {profile?.profileImageUrl ? (
                <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
              ) : (
                <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
              )}
            </Avatar>
            {primaryPet?.photoUrl && (
              <div className="absolute -bottom-2 -right-2 h-9 w-9 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={primaryPet.photoUrl} alt={primaryPet.name} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-xl font-semibold">
                {profile?.nickname ?? "멍냥마당"}
              </p>
              {primaryPet?.breed && <Badge variant="soft">{primaryPet.breed}</Badge>}
            </div>
            <p className="mt-1 text-sm text-ink/60">
              {primaryPet?.name ? `${primaryPet.name}와 함께하는 일상` : "반려동물과의 기록을 남겨보세요."}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink/70">
              <span>
                게시물 <strong className="font-semibold text-ink">{postCount}</strong>
              </span>
              <span>
                반려동물 <strong className="font-semibold text-ink">{profile?.petCount ?? 0}</strong>
              </span>
              <span>
                지역 <strong className="font-semibold text-ink">{profile?.regionName ?? "미설정"}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="gap-2">
            <Settings className="h-4 w-4" /> 프로필 편집
          </Button>
          <Button onClick={onNewPost} className="gap-2">
            <Plus className="h-4 w-4" /> 새 게시물
          </Button>
        </div>
      </div>
    </section>
  );
}
