"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  href: Route;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}

export function SidebarItem({ href, label, icon: Icon, active, onNavigate }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn("app-sidebar-item", active && "app-sidebar-item-active")}
      onClick={onNavigate}
    >
      <span className="app-sidebar-item-icon-shell">
        <Icon className="app-sidebar-item-icon" />
      </span>
      <span className="app-sidebar-item-label">{label}</span>
    </Link>
  );
}
