import { BookOpenCheck, Info } from "lucide-react";

import { KnowledgeCardView } from "@/components/site/knowledge-card";
import { SectionShell } from "@/components/site/section-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { knowledgeCards } from "@/lib/mock";

export default function KnowledgePage() {
  return (
    <>
      <SectionShell
        eyebrow="Knowledge"
        title="반려동물 지식 가이드"
        description="의학적 진단이 아닌 정보 제공을 위한 가이드입니다."
      >
        <Card className="gradient-shell">
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <p className="text-xs text-ink/60">종/품종</p>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="종 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">강아지</SelectItem>
                  <SelectItem value="cat">고양이</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-ink/60">나이대</p>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="나이 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1세</SelectItem>
                  <SelectItem value="2-5">2-5세</SelectItem>
                  <SelectItem value="6+">6세 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="lg">검색하기</Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {knowledgeCards.map((card) => (
            <KnowledgeCardView key={card.id} card={card} />
          ))}
        </div>
      </SectionShell>

      <section className="pb-12">
        <Card className="gradient-shell">
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge variant="soft">안내</Badge>
              <h3 className="font-display text-xl font-semibold">
                건강 정보는 참고용입니다
              </h3>
              <p className="text-sm text-ink/70">
                증상이 있다면 반드시 수의사의 진료를 받으세요. 멍냥마당은
                의료 행위를 제공하지 않습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">
                <BookOpenCheck className="h-4 w-4" />
                검진 체크리스트
              </Button>
              <Button variant="secondary">
                <Info className="h-4 w-4" />
                주의사항 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
