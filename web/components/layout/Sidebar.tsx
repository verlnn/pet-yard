"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpenText, Compass, Home, PawPrint, HeartHandshake } from "lucide-react";

import Image from "next/image";

import { SidebarMoreMenu } from "@/components/layout/SidebarMoreMenu";
import { SidebarItem } from "@/components/layout/SidebarItem";
import { SidebarProfile } from "@/components/layout/SidebarProfile";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse } from "@/src/features/auth/types/authTypes";
import { ROUTES } from "@/src/lib/routes";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const sidebarItems: Array<{ href: Route; label: string; icon: typeof Home }> = [
  { href: ROUTES.feed, label: "홈", icon: Home },
  { href: ROUTES.walks, label: "산책", icon: Compass },
  { href: ROUTES.boarding, label: "위탁", icon: HeartHandshake },
  { href: ROUTES.knowledge, label: "지식", icon: BookOpenText },
  { href: ROUTES.notifications, label: "알림", icon: Bell },
];

const isActiveRoute = (pathname: string | null, href: Route) => {
  if (!pathname) {
    return false;
  }
  if (href === ROUTES.feed) {
    return pathname === ROUTES.feed;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return;
    }
    const token = accessToken;

    const loadProfile = async () => {
      try {
        const response = await authApi.getMyProfile(token);
        setProfile(response);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, []);

  const brandSubtitle = useMemo(() => {
    if (profile?.regionName) {
      return `${profile.regionName} 기반 커뮤니티`;
    }
    return "반려동물 동네 커뮤니티";
  }, [profile?.regionName]);

  const handleNavigate = () => {
    onCloseMobile();
  };

  return (
    <>
      <div
        className={`app-sidebar-scrim ${mobileOpen ? "app-sidebar-scrim-visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`app-sidebar ${mobileOpen ? "app-sidebar-mobile-open" : ""}`}>
        <div className="app-sidebar-inner">
          <div className="app-sidebar-brand">
            <LinkButton />
            <div className="app-sidebar-brand-copy">
              <p className="app-sidebar-brand-title">멍냥마당</p>
              <p className="app-sidebar-brand-subtitle">{brandSubtitle}</p>
            </div>
          </div>

          <nav className="app-sidebar-nav" aria-label="앱 메뉴">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActiveRoute(pathname, item.href)}
                onNavigate={handleNavigate}
              />
            ))}
            <div className="app-sidebar-nav-profile-slot">
              <SidebarProfile profile={profile} onNavigate={handleNavigate} />
            </div>
          </nav>

          <div className="app-sidebar-footer">
            <SidebarMoreMenu onNavigate={handleNavigate} />
          </div>
        </div>
      </aside>
    </>
  );
}

function LinkButton() {
  return (
    <Link href={ROUTES.feed} className="app-sidebar-brand-mark" aria-label="멍냥마당 홈으로 이동">
      <Image
        src="/images/brand/petyard-symbol.png"
        alt="멍냥마당 로고"
        width={44}
        height={44}
        className="app-sidebar-brand-image"
        priority
      />
    </Link>
  );
}
