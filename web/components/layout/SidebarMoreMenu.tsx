"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  Bookmark,
  LogOut,
  Menu,
  Moon,
  RefreshCcw,
  Settings,
  SquareActivity
} from "lucide-react";

import { authApi } from "@/src/features/auth/api/authApi";
import { useTheme } from "@/src/hooks/useTheme";
import { ROUTES } from "@/src/lib/routes";

interface SidebarMoreMenuProps {
  onNavigate?: () => void;
}

export function SidebarMoreMenu({ onNavigate }: SidebarMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "theme">("menu");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setView("menu");
    onNavigate?.();
  };

  const handleOpenChange = () => {
    setOpen((prev) => {
      const next = !prev;
      if (!next) {
        setView("menu");
      }
      return next;
    });
  };

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore logout API failure and clear local session regardless.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";
      handleClose();
      window.location.href = ROUTES.login;
    }
  };

  return (
    <div className="app-sidebar-more" ref={containerRef}>
      {open && (
        <div className="app-sidebar-more-panel" role="menu" aria-label="더보기 메뉴">
          {view === "menu" ? (
            <>
              <div className="app-sidebar-more-list">
                <Link href={ROUTES.profile} className="app-sidebar-more-item" onClick={handleClose}>
                  <Settings className="app-sidebar-more-item-icon" />
                  <span>설정</span>
                </Link>
                <button type="button" className="app-sidebar-more-item" onClick={handleClose}>
                  <SquareActivity className="app-sidebar-more-item-icon" />
                  <span>내 활동</span>
                </button>
                <button type="button" className="app-sidebar-more-item" onClick={handleClose}>
                  <Bookmark className="app-sidebar-more-item-icon" />
                  <span>저장됨</span>
                </button>
                <button type="button" className="app-sidebar-more-item" onClick={() => setView("theme")}>
                  <Moon className="app-sidebar-more-item-icon" />
                  <span>모드 전환</span>
                </button>
                <button type="button" className="app-sidebar-more-item" onClick={handleClose}>
                  <AlertCircle className="app-sidebar-more-item-icon" />
                  <span>문제 신고</span>
                </button>
              </div>

              <div className="app-sidebar-more-divider" />

              <button type="button" className="app-sidebar-more-item" onClick={handleClose}>
                <RefreshCcw className="app-sidebar-more-item-icon" />
                <span>계정 전환</span>
              </button>

              <div className="app-sidebar-more-divider" />

              <button
                type="button"
                className="app-sidebar-more-item app-sidebar-more-item-danger"
                onClick={handleLogout}
              >
                <LogOut className="app-sidebar-more-item-icon" />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <div className="app-sidebar-theme-panel">
              <div className="app-sidebar-theme-header">
                <button type="button" className="app-sidebar-theme-back" onClick={() => setView("menu")}>
                  <ChevronLeft className="app-sidebar-theme-back-icon" />
                </button>
                <p className="app-sidebar-theme-title">모드 전환</p>
                <Moon className="app-sidebar-theme-mode-icon" />
              </div>

              <div className="app-sidebar-more-divider" />

              <div className="app-sidebar-theme-row">
                <div className="app-sidebar-theme-copy">
                  <p className="app-sidebar-theme-row-title">다크 모드</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={resolvedTheme === "dark"}
                  className={`app-sidebar-theme-switch ${
                    resolvedTheme === "dark" ? "app-sidebar-theme-switch-active" : ""
                  }`}
                  onClick={handleThemeToggle}
                >
                  <span className="app-sidebar-theme-switch-thumb" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="app-sidebar-more-trigger"
        onClick={handleOpenChange}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="app-sidebar-more-trigger-icon-shell">
          <Menu className="app-sidebar-more-trigger-icon" />
        </span>
        <span className="app-sidebar-more-trigger-label">더 보기</span>
      </button>
    </div>
  );
}
