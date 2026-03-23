"use client";

import Link from "next/link";
import { memo } from "react";
import { ShieldCheck, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserNotification } from "@/src/features/auth/types/authTypes";
import { buildProfileRoute } from "@/src/lib/routes";

interface SidebarNotificationsPanelProps {
  open: boolean;
  filter: "all" | "comments";
  notifications: UserNotification[];
  loading: boolean;
  actingNotificationId: number | null;
  onClose: () => void;
  onFilterChange: (filter: "all" | "comments") => void;
  onAccept: (notificationId: number) => void;
  onReject: (notificationId: number) => void;
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

function formatRelative(value: string) {
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "";
  }
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60000);
  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormat.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormat.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormat.format(diffDays, "day");
}

export const SidebarNotificationsPanel = memo(function SidebarNotificationsPanel({
  open,
  filter,
  notifications,
  loading,
  actingNotificationId,
  onClose,
  onFilterChange,
  onAccept,
  onReject
}: SidebarNotificationsPanelProps) {
  const visibleNotifications = filter === "comments"
    ? notifications.filter((notification) => notification.type.startsWith("COMMENT"))
    : notifications;

  return (
    <aside
      className={`app-sidebar-notifications-panel ${open ? "app-sidebar-notifications-panel-open" : ""}`}
      aria-hidden={!open}
    >
      <div className="app-sidebar-notifications-header">
        <h2 className="app-sidebar-notifications-title">알림</h2>
        <button
          type="button"
          className="app-sidebar-notifications-close"
          aria-label="알림 패널 닫기"
          onClick={onClose}
        >
          <X className="app-sidebar-notifications-close-icon" />
        </button>
      </div>

      <div className="app-sidebar-notifications-filters">
        <button
          type="button"
          className={`app-sidebar-notifications-filter ${filter === "all" ? "app-sidebar-notifications-filter-active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          모두
        </button>
        <button
          type="button"
          className={`app-sidebar-notifications-filter ${filter === "comments" ? "app-sidebar-notifications-filter-active" : ""}`}
          onClick={() => onFilterChange("comments")}
        >
          댓글
        </button>
      </div>

      <div className="app-sidebar-notifications-section">
        <p className="app-sidebar-notifications-section-title">이전 활동</p>
      </div>

      <div className="app-sidebar-notifications-list">
        {loading ? (
          <p className="app-sidebar-notifications-empty">알림을 불러오는 중입니다.</p>
        ) : visibleNotifications.length === 0 ? (
          <p className="app-sidebar-notifications-empty">표시할 알림이 없어요.</p>
        ) : visibleNotifications.map((notification) => {
          const profileHref = buildProfileRoute(notification.actorUsername);
          return (
            <div key={notification.id} className="app-sidebar-notification-item">
              <Link href={profileHref} className="app-sidebar-notification-main">
                <Avatar className="app-sidebar-notification-avatar">
                  {notification.actorProfileImageUrl ? (
                    <AvatarImage src={notification.actorProfileImageUrl} alt={notification.actorNickname} />
                  ) : (
                    <AvatarFallback>{notification.actorNickname[0] ?? "멍"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="app-sidebar-notification-copy">
                  <p className="app-sidebar-notification-message">{notification.message}</p>
                  <p className="app-sidebar-notification-meta">{formatRelative(notification.createdAt)}</p>
                </div>
              </Link>

              {notification.actionable ? (
                <div className="app-sidebar-notification-actions">
                  <button
                    type="button"
                    className="app-sidebar-notification-accept"
                    onClick={() => onAccept(notification.id)}
                    disabled={actingNotificationId === notification.id}
                  >
                    {notification.primaryActionLabel ?? "수락"}
                  </button>
                  <button
                    type="button"
                    className="app-sidebar-notification-reject"
                    onClick={() => onReject(notification.id)}
                    disabled={actingNotificationId === notification.id}
                  >
                    {notification.secondaryActionLabel ?? "거절"}
                  </button>
                </div>
              ) : notification.type === "GUARDIAN_REQUEST_ACCEPTED" ? (
                <span className="app-sidebar-notification-badge">
                  <ShieldCheck className="app-sidebar-notification-badge-icon" />
                  연결됨
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
});
