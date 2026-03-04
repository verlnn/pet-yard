import { BadgeCheck, PawPrint, Shield } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="Profile"
          title="내 프로필"
          description="반려동물 정보와 신뢰도, 안전 지표를 관리하세요."
        >
          <div className="grid gap-6 md:grid-cols-[0.6fr_1fr]">
            <Card className="gradient-shell">
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>HY</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-xl font-semibold">하윤</p>
                  <p className="text-sm text-ink/60">성수동 · 1년차 집사</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="soft">신뢰도 4.8</Badge>
                  <Badge variant="outline">안전 인증</Badge>
                </div>
                <Button className="w-full">프로필 수정</Button>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              <Card className="gradient-shell">
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4" />
                    <p className="font-display text-lg font-semibold">콩이</p>
                    <Badge variant="soft">푸들</Badge>
                  </div>
                  <p className="text-sm text-ink/70">
                    3살 · 중성화 완료 · 체중 5.2kg
                  </p>
                  <div className="flex gap-2 text-sm text-ink/60">
                    <BadgeCheck className="h-4 w-4" /> 예방접종 완료
                    <Shield className="ml-2 h-4 w-4" /> 산책 안전 필터 적용
                  </div>
                </CardContent>
              </Card>
              <Card className="gradient-shell">
                <CardContent className="space-y-3">
                  <p className="text-sm text-ink/60">신고/차단 현황</p>
                  <p className="font-display text-lg font-semibold">신고 0건</p>
                  <p className="text-sm text-ink/70">
                    커뮤니티 규칙을 잘 지키고 있어요. 안전 기록은 투명하게
                    관리됩니다.
                  </p>
                  <Button variant="secondary">신뢰도 상세 보기</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionShell>
      </main>
    </div>
  );
}
