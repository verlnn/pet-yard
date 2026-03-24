"use client";

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bell, Compass, HeartHandshake, MapPin, PawPrint, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CommonButton } from "@/components/ui/CommonButton";
import { AppAlertDialog } from "@/components/ui/AppAlertDialog";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/src/features/auth/api/authApi";
import { buildProfileRoute, ROUTES } from "@/src/lib/routes";

const links: Array<{ href: Route; label: string; icon: LucideIcon }> = [
  { href: ROUTES.feed, label: "피드", icon: PawPrint },
  { href: ROUTES.walks, label: "산책", icon: Compass },
  { href: ROUTES.boarding, label: "위탁", icon: HeartHandshake },
  { href: ROUTES.knowledge, label: "지식", icon: Shield }
];

export function SiteNav() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const profileHref = buildProfileRoute(myUsername);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    setHasToken(Boolean(accessToken || refreshToken));
    if (!accessToken) {
      return;
    }
    authApi.getMyProfile(accessToken)
      .then((profile) => setMyUsername(profile.username))
      .catch(() => setMyUsername(null));
  }, []);

  const handleLogout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      setLogoutConfirmOpen(false);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie = "accessToken=; path=/; max-age=0";
      setHasToken(false);
      router.push(ROUTES.login);
    }
  }, [router]);

  return (
    <>
      <AppAlertDialog
        open={logoutConfirmOpen}
        title="로그아웃할까요?"
        description="현재 기기에서 로그인 상태가 해제됩니다."
        confirmLabel="로그아웃"
        actionsClassName="app-alert-dialog-actions-horizontal"
        onConfirm={handleLogout}
        onClose={() => setLogoutConfirmOpen(false)}
      />

      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/70 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={44}
            height={44}
            className="h-11 w-11"
            priority
          />
          <div>
            <p className="font-display text-lg font-semibold">멍냥마당</p>
            <div className="flex items-center gap-2 text-xs text-ink/60">
              <MapPin className="h-3 w-3" />
              <span>성수동 · 동네 커뮤니티</span>
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-sand"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {hasToken ? (
            <Link
              href={profileHref}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink/70 hover:bg-sand"
            >
              <PawPrint className="h-4 w-4" />
              내 피드
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          <Badge variant="soft" className="hidden md:inline-flex">
            산책 매칭 12건
          </Badge>
          <CommonButton variant="ghost" size="sm" aria-label="알림">
            <Bell className="h-4 w-4" />
          </CommonButton>
          {hasToken && (
            <CommonButton variant="secondary" size="sm" onClick={() => setLogoutConfirmOpen(true)}>
              로그아웃
            </CommonButton>
          )}
          <Link href={profileHref}>
            <CommonButton variant="secondary" size="sm">
              내 프로필
            </CommonButton>
          </Link>
        </div>
        </div>
        <div className="border-t border-ink/10 bg-white/90 md:hidden">
          <div className="container flex items-center justify-between py-2 text-xs text-ink/60">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="px-2 py-1">
                {link.label}
              </Link>
            ))}
            {hasToken ? (
              <Link href={profileHref} className="px-2 py-1">
                내 피드
              </Link>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
