"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/src/lib/routes";

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
  onOpenMobileSidebar: () => void;
}

export function SidebarLayout({
  sidebar,
  children,
  rightPanel,
  onOpenMobileSidebar
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const isFullCanvasRoute = pathname === ROUTES.setting;

  return (
    <div className="app-layout">
      {sidebar}
      <button
        type="button"
        className="app-layout-mobile-trigger"
        onClick={onOpenMobileSidebar}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="app-layout-content-shell">
        <main className={`app-layout-main ${isFullCanvasRoute ? "app-layout-main-full" : ""}`}>{children}</main>
        {rightPanel ? <aside className="app-layout-right-panel">{rightPanel}</aside> : null}
      </div>
    </div>
  );
}
