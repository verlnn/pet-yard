import { ShieldCheck, Star } from "lucide-react";

import { BoardingCard } from "@/components/site/boarding-card";
import { SectionShell } from "@/components/site/section-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { boardingRequests } from "@/lib/mock";

export default function BoardingPage() {
  return (
    <>
      <SectionShell
        eyebrow="Boarding"
        title="위탁 매칭"
        description="신뢰도와 조건을 확인하고 안전하게 위탁을 제안하세요."
      >
        <Card className="gradient-shell">
          <CardContent className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-text-muted)]">기간</p>
              <Input placeholder="날짜 범위를 입력" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-text-muted)]">지역</p>
              <Input placeholder="동네를 입력" />
            </div>
            <Button size="lg">검색하기</Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {boardingRequests.map((request) => (
            <BoardingCard key={request.id} request={request} />
          ))}
        </div>
      </SectionShell>

      <section className="pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="gradient-shell">
            <CardContent className="space-y-3">
              <Badge variant="soft">안전 가이드</Badge>
              <p className="font-display text-lg font-semibold">
                위탁 전 체크리스트
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                집 구조, 응급 상황 대응, 산책 동선 등을 반드시 확인하세요.
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-shell">
            <CardContent className="space-y-3">
              <Badge variant="soft">신뢰도</Badge>
              <p className="font-display text-lg font-semibold">신뢰 점수 보기</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                후기, 신고 이력, 인증 정보를 기반으로 신뢰 점수를 제공합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-shell">
            <CardContent className="space-y-3">
              <Badge variant="soft">지식</Badge>
              <p className="font-display text-lg font-semibold">
                분쟁 예방 팁
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <ShieldCheck className="h-4 w-4" />
                계약 전에 조건을 문서로 남겨주세요.
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Star className="h-4 w-4" />
                신뢰도 높은 보호자에게 먼저 제안하세요.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
