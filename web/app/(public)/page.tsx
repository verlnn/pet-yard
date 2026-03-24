import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { BoardingCard } from "@/components/site/boarding-card";
import { KnowledgeCardView } from "@/components/site/knowledge-card";
import { PostCard } from "@/components/site/post-card";
import { QuickPost } from "@/components/site/quick-post";
import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { WalkCard } from "@/components/site/walk-card";
import { Badge } from "@/components/ui/badge";
import { CommonButton } from "@/components/ui/CommonButton";
import { Card, CardContent } from "@/components/ui/card";
import { boardingRequests, feedPosts, knowledgeCards, walkEvents } from "@/lib/mock";

export default function HomePage() {
  return (
    <div>
      <SiteNav />
      <main className="container">
        <section className="grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center gap-6">
            <Badge className="w-fit" variant="soft">
              우리 동네 반려생활 대시보드
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              반려동물 성장 기록과 안전한 이웃 매칭을 한 번에.
            </h1>
            <p className="text-base text-[var(--color-text-muted)]">
              멍냥마당은 성장 기록을 중심으로, 산책/위탁 매칭과 지식
              가이드를 연결하는 반려동물 전용 SNS입니다. 동네 기반으로
              연결되고, 안전 정책과 신고 시스템으로 신뢰를 지켜요.
            </p>
            <div className="flex flex-wrap gap-3">
              <CommonButton size="lg">
                오늘의 피드 보기 <ArrowRight className="h-4 w-4" />
              </CommonButton>
              <Link href="/walks">
                <CommonButton variant="secondary" size="lg">
                  산책 매칭 열기
                </CommonButton>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> 동 단위 노출
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> 신고/차단 기본 제공
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> 성장 기록 중심
              </span>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="gradient-shell">
              <CardContent className="space-y-4">
                <p className="text-sm text-[var(--color-text-muted)]">오늘 가장 많이 본 기록</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">콩이 첫 산책</p>
                    <p className="text-xs text-[var(--color-text-muted)]">성수동 · 124 좋아요</p>
                  </div>
                  <Badge>상승중</Badge>
                </div>
                <div className="rounded-2xl bg-sand/80 p-4 text-sm">
                  “산책 루틴과 강아지 체력 체크리스트가 궁금한가요? 지식
                  탭에서 종별 가이드를 확인하세요.”
                </div>
              </CardContent>
            </Card>
            <QuickPost />
          </div>
        </section>

        <SectionShell
          eyebrow="Real-time"
          title="오늘의 산책 모집"
          description="거리/시간/견종 조건에 맞춘 동네 산책 모집글을 확인하세요."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {walkEvents.map((event) => (
              <WalkCard key={event.id} event={event} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Boarding"
          title="위탁 요청 요약"
          description="신뢰 점수, 조건, 가격을 한 눈에 보고 빠르게 제안하세요."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {boardingRequests.map((request) => (
              <BoardingCard key={request.id} request={request} />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Feed"
          title="동네 성장 기록"
          description="팔로우와 동네 기준으로 안전하게 공유되는 성장 기록입니다."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-6">
            <Link href="/feed">
              <CommonButton variant="secondary">피드 전체 보기</CommonButton>
            </Link>
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Knowledge"
          title="초보 반려인을 위한 지식 카드"
          description="종/나이/체중에 맞춘 검진과 주의사항을 제공합니다."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {knowledgeCards.map((card) => (
              <KnowledgeCardView key={card.id} card={card} />
            ))}
          </div>
        </SectionShell>

        <section className="pb-14">
          <div className="rounded-3xl border border-ink/10 bg-pine px-6 py-10 text-sand md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-sand/70">
                  Safety First
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  신고·차단·신뢰도 시스템이 기본값입니다.
                </h3>
                <p className="text-sm text-sand/80">
                  동네 기반 매칭은 정밀 주소를 공개하지 않으며, 위탁/산책
                  매칭에는 신고와 제재 정책이 적용됩니다.
                </p>
              </div>
              <CommonButton variant="accent" size="lg">
                안전 정책 보기
              </CommonButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
