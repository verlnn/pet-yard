"use client";

import { useState, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

interface MainLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function MainLayout({ children, rightPanel }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <SidebarLayout
      sidebar={<Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />}
      rightPanel={rightPanel}
      onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
    >
      {children}
    </SidebarLayout>
  );
}
