"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, ShieldCheck, X } from "lucide-react";

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

const NOTIFICATION_SUGGESTIONS = [
  { username: "ohdohodo", nickname: "ohdohodo", meta: "ensue_6님 외 5명이 팔로우합니다.", profileImageUrl: null },
  { username: "miaaaaaalovesleep", nickname: "miaa chow", meta: "회원님을 위한 추천", profileImageUrl: null },
  { username: "cloehri", nickname: "엄베리", meta: "junnahalo님이 팔로우합니다.", profileImageUrl: null },
  { username: "n.haneluc", nickname: "하늘", meta: "wonzooni__216님 외 1명이 팔로우합니다.", profileImageUrl: null },
  { username: "yeon__02", nickname: "젠이", meta: "회원님을 위한 추천", profileImageUrl: null },
  { username: "sye__0", nickname: "김서연", meta: "juheeii님 외 6명이 팔로우합니다.", profileImageUrl: null }
];

const relativeTimeFormat = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

function formatRelative(value: string) {
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "";
  }
  const diffMinutes = Math.round((target.getTime() - Date.now()) / 60000);
  if (Math.abs(diffMinutes) < 1) {
    return "지금";
  }
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

function sectionTitleOf(value: string) {
  const target = new Date(value);
  const now = new Date();
  if (Number.isNaN(target.getTime())) {
    return "이전 활동";
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - startOfTarget) / 86400000);

  if (diffDays <= 0) {
    return "오늘";
  }
  if (target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth()) {
    return "이번 달";
  }
  return "이전 활동";
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
  const [guardianRequestsExpanded, setGuardianRequestsExpanded] = useState(false);

  useEffect(() => {
    if (!open) {
      setGuardianRequestsExpanded(false);
    }
  }, [open]);

  const guardianRequestNotifications = useMemo(
    () => notifications.filter((notification) => notification.type === "GUARDIAN_REQUEST" && notification.actionable),
    [notifications]
  );

  useEffect(() => {
    if (guardianRequestsExpanded && guardianRequestNotifications.length === 0) {
      setGuardianRequestsExpanded(false);
    }
  }, [guardianRequestNotifications.length, guardianRequestsExpanded]);

  const selectedGuardianRequest = guardianRequestNotifications[0] ?? null;

  const visibleNotifications = useMemo(() => {
    const filtered = filter === "comments"
      ? notifications.filter((notification) => notification.type.startsWith("COMMENT") || notification.type === "PAW_ON_COMMENT")
      : notifications.filter((notification) => notification.type !== "GUARDIAN_REQUEST" || !notification.actionable);

    return filtered.reduce<Array<{ title: string; items: UserNotification[] }>>((sections, notification) => {
      const title = sectionTitleOf(notification.createdAt);
      const existingSection = sections.find((section) => section.title === title);
      if (existingSection) {
        existingSection.items.push(notification);
        return sections;
      }
      sections.push({ title, items: [notification] });
      return sections;
    }, []);
  }, [filter, notifications]);

  const guardianRequestSummaryLabel = useMemo(() => {
    if (!selectedGuardianRequest) {
      return null;
    }
    const base = selectedGuardianRequest.actorUsername?.trim() || selectedGuardianRequest.actorNickname;
    if (guardianRequestNotifications.length <= 1) {
      return base;
    }
    return `${base} 외 ${guardianRequestNotifications.length - 1}명`;
  }, [guardianRequestNotifications.length, selectedGuardianRequest]);

  return (
    <aside
      className={`app-sidebar-notifications-panel ${open ? "app-sidebar-notifications-panel-open" : ""}`}
      aria-hidden={!open}
    >
      <div className="app-sidebar-notifications-header">
        {guardianRequestsExpanded ? (
          <button
            type="button"
            className="app-sidebar-notifications-back"
            aria-label="집사 요청 요약으로 돌아가기"
            onClick={() => setGuardianRequestsExpanded(false)}
          >
            <ArrowLeft className="app-sidebar-notifications-back-icon" />
          </button>
        ) : (
          <h2 className="app-sidebar-notifications-title">알림</h2>
        )}
        {guardianRequestsExpanded ? (
          <p className="app-sidebar-notifications-detail-title">집사 요청</p>
        ) : null}
        <button
          type="button"
          className="app-sidebar-notifications-close"
          aria-label="알림 패널 닫기"
          onClick={onClose}
        >
          <X className="app-sidebar-notifications-close-icon" />
        </button>
      </div>

      {!guardianRequestsExpanded ? (
        <>
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

          {guardianRequestNotifications.length > 0 ? (
            <div className="app-sidebar-notifications-priority">
              <button
                type="button"
                className="app-sidebar-notifications-priority-trigger"
                onClick={() => setGuardianRequestsExpanded(true)}
              >
                <div className="app-sidebar-notifications-priority-main">
                  <Avatar className="app-sidebar-notification-avatar">
                    {selectedGuardianRequest?.actorProfileImageUrl ? (
                      <AvatarImage src={selectedGuardianRequest.actorProfileImageUrl} alt={selectedGuardianRequest.actorNickname} />
                    ) : (
                      <AvatarFallback>{selectedGuardianRequest?.actorNickname?.[0] ?? "멍"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="app-sidebar-notification-copy">
                    <p className="app-sidebar-notification-priority-title">집사 요청</p>
                    <p className="app-sidebar-notification-priority-name">{guardianRequestSummaryLabel}</p>
                  </div>
                </div>
                <div className="app-sidebar-notification-priority-meta">
                  <span className="app-sidebar-notification-priority-dot" aria-hidden="true" />
                  <ChevronRight className="app-sidebar-notification-priority-chevron" />
                </div>
              </button>
            </div>
          ) : null}

          <div className="app-sidebar-notifications-list">
            {loading ? (
              <p className="app-sidebar-notifications-empty">알림을 불러오는 중입니다.</p>
            ) : visibleNotifications.length === 0 ? (
              <p className="app-sidebar-notifications-empty">표시할 알림이 없어요.</p>
            ) : visibleNotifications.map((section) => (
              <section key={section.title} className="app-sidebar-notifications-section-block">
                <div className="app-sidebar-notifications-section">
                  <p className="app-sidebar-notifications-section-title">{section.title}</p>
                </div>
                <div className="app-sidebar-notifications-section-list">
                  {section.items.map((notification) => {
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

                        {notification.type === "GUARDIAN_REQUEST_ACCEPTED" ? (
                          <span className="app-sidebar-notification-badge">
                            <ShieldCheck className="app-sidebar-notification-badge-icon" />
                            연결됨
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="app-sidebar-notifications-detail">
          {selectedGuardianRequest ? (
            <>
              <div className="app-sidebar-notifications-detail-card">
                <div className="app-sidebar-notifications-detail-main">
                  <Avatar className="app-sidebar-notification-avatar">
                    {selectedGuardianRequest.actorProfileImageUrl ? (
                      <AvatarImage src={selectedGuardianRequest.actorProfileImageUrl} alt={selectedGuardianRequest.actorNickname} />
                    ) : (
                      <AvatarFallback>{selectedGuardianRequest.actorNickname[0] ?? "멍"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="app-sidebar-notification-copy">
                    <p className="app-sidebar-notification-priority-name">{selectedGuardianRequest.actorUsername ?? selectedGuardianRequest.actorNickname}</p>
                    <p className="app-sidebar-notification-meta">{selectedGuardianRequest.actorNickname}</p>
                  </div>
                </div>
                <div className="app-sidebar-notification-actions">
                  <button
                    type="button"
                    className="app-sidebar-notification-accept"
                    onClick={() => onAccept(selectedGuardianRequest.id)}
                    disabled={actingNotificationId === selectedGuardianRequest.id}
                  >
                    {selectedGuardianRequest.primaryActionLabel ?? "수락"}
                  </button>
                  <button
                    type="button"
                    className="app-sidebar-notification-reject"
                    onClick={() => onReject(selectedGuardianRequest.id)}
                    disabled={actingNotificationId === selectedGuardianRequest.id}
                  >
                    {selectedGuardianRequest.secondaryActionLabel ?? "거절"}
                  </button>
                </div>
              </div>

              <div className="app-sidebar-notifications-recommendations">
                <p className="app-sidebar-notifications-section-title">회원님을 위한 추천</p>
                <div className="app-sidebar-notifications-recommendation-list">
                  {NOTIFICATION_SUGGESTIONS.map((suggestion) => (
                    <div key={suggestion.username} className="app-sidebar-notification-item">
                      <Link href={buildProfileRoute(suggestion.username)} className="app-sidebar-notification-main">
                        <Avatar className="app-sidebar-notification-avatar">
                          {suggestion.profileImageUrl ? (
                            <AvatarImage src={suggestion.profileImageUrl} alt={suggestion.nickname} />
                          ) : (
                            <AvatarFallback>{suggestion.nickname[0] ?? "멍"}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="app-sidebar-notification-copy">
                          <p className="app-sidebar-notification-priority-name">{suggestion.username}</p>
                          <p className="app-sidebar-notification-message">{suggestion.nickname}</p>
                          <p className="app-sidebar-notification-meta">{suggestion.meta}</p>
                        </div>
                      </Link>
                      <button type="button" className="app-sidebar-notification-accept">
                        집사 요청
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="app-sidebar-notifications-empty">처리할 집사 요청이 없어요.</p>
          )}
        </div>
      )}
    </aside>
  );
});
