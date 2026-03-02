import { MapPin, Timer } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { WalkCard } from "@/components/site/walk-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { walkEvents } from "@/lib/mock";

export default function WalksPage() {
  return (
    <div>
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="Matching"
          title="산책 매칭"
          description="조건을 설정하고 동네 산책 메이트를 찾아보세요."
        >
          <Card className="gradient-shell">
            <CardContent className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-end">
              <div className="space-y-2">
                <p className="text-xs text-ink/60">지역</p>
                <Input placeholder="동네를 입력하세요" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-ink/60">견종</p>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="견종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">소형견</SelectItem>
                    <SelectItem value="medium">중형견</SelectItem>
                    <SelectItem value="large">대형견</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-ink/60">시간대</p>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="시간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">아침</SelectItem>
                    <SelectItem value="evening">저녁</SelectItem>
                    <SelectItem value="weekend">주말</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg">검색하기</Button>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {walkEvents.map((event) => (
              <WalkCard key={event.id} event={event} />
            ))}
          </div>
        </SectionShell>

        <section className="pb-10">
          <Card className="gradient-shell">
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm text-ink/60">산책 호스트 가이드</p>
                <h3 className="font-display text-xl font-semibold">
                  산책 모집 시 꼭 확인하세요
                </h3>
                <p className="text-sm text-ink/70">
                  시간/장소/인원/견종 조건을 명확히 작성하고, 중성화 여부
                  등의 추가 조건을 안내해주세요.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary">
                  <MapPin className="h-4 w-4" />
                  장소 가이드
                </Button>
                <Button variant="secondary">
                  <Timer className="h-4 w-4" />
                  일정 체크
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
