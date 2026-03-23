"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpenText, Compass, Home, PawPrint, HeartHandshake } from "lucide-react";

import Image from "next/image";

import { SidebarNotificationsPanel } from "@/components/layout/SidebarNotificationsPanel";
import { SidebarMoreMenu } from "@/components/layout/SidebarMoreMenu";
import { SidebarItem } from "@/components/layout/SidebarItem";
import { SidebarProfile } from "@/components/layout/SidebarProfile";
import { authApi } from "@/src/features/auth/api/authApi";
import type { MyProfileResponse, UserNotification } from "@/src/features/auth/types/authTypes";
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "comments">("all");
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [actingNotificationId, setActingNotificationId] = useState<number | null>(null);
  const panelContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setAccessToken(accessToken);
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

  useEffect(() => {
    if (!notificationPanelOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelContainerRef.current?.contains(event.target as Node)) {
        setNotificationPanelOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationPanelOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationPanelOpen]);

  const brandSubtitle = useMemo(() => {
    if (profile?.regionName) {
      return `${profile.regionName} 기반 커뮤니티`;
    }
    return "반려동물 동네 커뮤니티";
  }, [profile?.regionName]);

  const handleNavigate = () => {
    onCloseMobile();
  };

  const loadNotifications = async () => {
    if (!accessToken) {
      return;
    }
    setNotificationsLoading(true);
    try {
      const response = await authApi.getNotifications(accessToken);
      setNotifications(response);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationPanelToggle = async () => {
    const nextOpen = !notificationPanelOpen;
    setNotificationPanelOpen(nextOpen);
    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleAcceptNotification = async (notificationId: number) => {
    if (!accessToken) {
      return;
    }
    setActingNotificationId(notificationId);
    try {
      await authApi.acceptGuardianRequestNotification(accessToken, notificationId);
      await loadNotifications();
    } finally {
      setActingNotificationId(null);
    }
  };

  const handleRejectNotification = async (notificationId: number) => {
    if (!accessToken) {
      return;
    }
    setActingNotificationId(notificationId);
    try {
      await authApi.rejectGuardianRequestNotification(accessToken, notificationId);
      await loadNotifications();
    } finally {
      setActingNotificationId(null);
    }
  };

  return (
    <>
      <div
        className={`app-sidebar-scrim ${mobileOpen ? "app-sidebar-scrim-visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      {notificationPanelOpen ? (
        <div className="app-sidebar-notifications-backdrop" aria-hidden="true" />
      ) : null}
      <div ref={panelContainerRef}>
        <SidebarNotificationsPanel
          open={notificationPanelOpen}
          filter={notificationFilter}
          notifications={notifications}
          loading={notificationsLoading}
          actingNotificationId={actingNotificationId}
          onClose={() => setNotificationPanelOpen(false)}
          onFilterChange={setNotificationFilter}
          onAccept={handleAcceptNotification}
          onReject={handleRejectNotification}
        />
      </div>
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
            <button
              type="button"
              className={`app-sidebar-item ${notificationPanelOpen || isActiveRoute(pathname, ROUTES.notifications) ? "app-sidebar-item-active" : ""}`}
              onClick={handleNotificationPanelToggle}
            >
              <span className="app-sidebar-item-icon-shell">
                <Bell className="app-sidebar-item-icon" />
              </span>
              <span className="app-sidebar-item-label">알림</span>
            </button>
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
