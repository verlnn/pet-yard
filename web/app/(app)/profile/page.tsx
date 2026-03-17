"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";

export default function ProfilePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        const response = await authApi.getMyProfile(accessToken);
        setProfile(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  const joinedAt = useMemo(() => {
    if (!profile?.joinedAt) return "-";
    return new Date(profile.joinedAt).toLocaleDateString("ko-KR");
  }, [profile?.joinedAt]);

  const lastLoginAt = useMemo(() => {
    if (!profile?.lastLoginAt) return "알 수 없음";
    return new Date(profile.lastLoginAt).toLocaleString("ko-KR");
  }, [profile?.lastLoginAt]);

  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="Profile"
          title="내 프로필"
          description="계정 상태와 반려동물 정보를 확인하세요."
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-[0.6fr_1fr]">
            <Card className="gradient-shell">
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-20 w-20">
                  {profile?.profileImageUrl ? (
                    <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
                  ) : (
                    <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-display text-xl font-semibold">
                    {profile?.nickname ?? (loading ? "불러오는 중..." : "프로필")}
                  </p>
                  <p className="text-sm text-ink/60">
                    {profile?.regionName ?? "지역 미설정"} · 가입일 {joinedAt}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="soft">반려동물 {profile?.petCount ?? 0}마리</Badge>
                  <Badge variant="outline">등급 {profile?.tier ?? "-"}</Badge>
                </div>
                <Button className="w-full">프로필 수정</Button>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              <Card className="gradient-shell">
                <CardContent className="space-y-3">
                  <p className="text-sm text-ink/60">반려동물 정보</p>
                  <p className="font-display text-lg font-semibold">
                    {profile?.petCount ?? 0}마리 등록됨
                  </p>
                  <p className="text-sm text-ink/70">
                    등록번호 인증을 통해 반려견 정보를 안전하게 관리할 수 있어요.
                  </p>
                  <Button asChild>
                    <Link href="/pets">반려동물 관리로 이동</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="gradient-shell">
                <CardContent className="space-y-3">
                  <p className="text-sm text-ink/60">최근 로그인</p>
                  <p className="font-display text-lg font-semibold">{lastLoginAt}</p>
                  <p className="text-sm text-ink/70">
                    활동 내역과 안전 기록은 투명하게 관리됩니다.
                  </p>
                  <Button variant="secondary">신뢰도 상세 보기</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionShell>
      </main>
    </div>
  );
}
