"use client";

import { MapPin, Tag, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PostComposerSidebarProps {
  nickname: string;
  profileImageUrl?: string | null;
  petName?: string | null;
  petBreed?: string | null;
  content: string;
  onContentChange: (value: string) => void;
}

export function PostComposerSidebar({
  nickname,
  profileImageUrl,
  petName,
  petBreed,
  content,
  onContentChange
}: PostComposerSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={nickname} />
          ) : (
            <AvatarFallback>{nickname.slice(0, 1)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{nickname}</p>
          <p className="text-xs text-ink/60">반려동물 기록 작성 중</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {petName && <Badge variant="soft">{petName}</Badge>}
        {petBreed && <Badge variant="outline">{petBreed}</Badge>}
      </div>
      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm"
        placeholder="오늘의 기록을 남겨보세요."
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
      />
      <div className="space-y-2 text-xs text-ink/60">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> 태그할 반려동물 (준비중)
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> 위치 추가 (준비중)
        </div>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" /> 해시태그 (준비중)
        </div>
      </div>
    </div>
  );
}
