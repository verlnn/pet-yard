"use client";

import { MapPin, User } from "lucide-react";

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


const formatText = (text: string) => {
  return text.replace(
    /#[\w가-힣]+/g,
    (tag) => `<span class="text-blue-500">${tag}</span>`
  );
};

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
          <p className="text-sm font-semibold text-[var(--color-text)]">{nickname}</p>
          <p className="text-xs text-[var(--color-text-muted)]">반려동물 기록 작성 중</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {petName && <Badge variant="soft">{petName}</Badge>}
        {petBreed && <Badge variant="outline">{petBreed}</Badge>}
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words px-3 py-2 text-sm text-[var(--color-text)]"
          dangerouslySetInnerHTML={{ __html: formatText(content) }}
        />
        <textarea
          className="relative z-10 min-h-[140px] w-full rounded-2xl border border-[var(--color-input-border)] bg-transparent px-3 py-2 text-sm text-transparent caret-[var(--color-text)] placeholder:text-[var(--color-input-placeholder)]"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="오늘의 기록을 남겨보세요."
        />
      </div>

      <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" /> 태그할 반려동물 (준비중)
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> 위치 추가 (준비중)
        </div>
      </div>
    </div>
  );
}
