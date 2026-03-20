"use client";

import { useQuery } from "@tanstack/react-query";
import { Filter, SlidersHorizontal } from "lucide-react";

import { PostCard } from "@/components/site/post-card";
import { SectionShell } from "@/components/site/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { feedPosts } from "@/lib/mock";

const fetchFeed = async () => {
  return new Promise<typeof feedPosts>((resolve) => {
    setTimeout(() => resolve(feedPosts), 300);
  });
};

export function FeedClient() {
  const { data = feedPosts } = useQuery({
    queryKey: ["feed", "neighborhood"],
    queryFn: fetchFeed
  });

  return (
    <SectionShell
      eyebrow="Social"
      title="성장 기록 피드"
      description="팔로우/동네/추천 탭을 전환하며 맞춤 피드를 확인하세요."
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs defaultValue="neighborhood" className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="following">팔로우</TabsTrigger>
            <TabsTrigger value="neighborhood">동네</TabsTrigger>
            <TabsTrigger value="recommend">추천</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <div className="relative w-full md:w-72">
            <Input placeholder="검색: 반려동물, 태그, 위치" />
          </div>
          <Button variant="secondary" size="sm">
            <Filter className="h-4 w-4" /> 필터
          </Button>
          <Button variant="secondary" size="sm">
            <SlidersHorizontal className="h-4 w-4" /> 정렬
          </Button>
        </div>
      </div>
      <Tabs defaultValue="neighborhood" className="mt-6">
        <TabsContent value="neighborhood">
          <div className="grid gap-4 md:grid-cols-3">
            {data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="following">
          <Card className="gradient-shell">
            <CardContent className="text-sm text-[var(--color-text-muted)]">
              팔로우 기반 피드는 아직 준비 중입니다. 관심 계정을 추가하면
              맞춤형 피드가 표시됩니다.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommend">
          <Card className="gradient-shell">
            <CardContent className="text-sm text-[var(--color-text-muted)]">
              추천 피드는 반려동물 유형과 활동 이력을 기반으로 구성됩니다.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SectionShell>
  );
}
