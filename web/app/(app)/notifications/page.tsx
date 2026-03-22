import { BellRing, CheckCircle } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const notifications = [
  {
    id: "noti-1",
    title: "산책 참여 요청이 도착했어요",
    body: "저녁 한강 산책에 1명이 참여 요청했습니다.",
    time: "방금"
  },
  {
    id: "noti-2",
    title: "위탁 제안이 수락되었습니다",
    body: "주말 1박 위탁 제안이 수락되었습니다.",
    time: "1시간 전"
  },
  {
    id: "noti-3",
    title: "새 댓글이 달렸어요",
    body: "콩이 첫 산책 게시물에 댓글이 달렸습니다.",
    time: "어제"
  }
];

export default function NotificationsPage() {
  return (
    <SectionShell
      eyebrow="Notifications"
      title="알림"
      description="활동 변화와 안전 알림을 놓치지 마세요."
    >
      <div className="grid gap-4">
        {notifications.map((item) => (
          <Card key={item.id} className="gradient-shell">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                <p className="font-display text-base font-semibold">
                  {item.title}
                </p>
                <Badge variant="soft">NEW</Badge>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{item.body}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
                <CheckCircle className="h-3 w-3" /> {item.time}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
