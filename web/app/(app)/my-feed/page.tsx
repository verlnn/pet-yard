"use client";

import { useEffect, useMemo, useState } from "react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedProfileHeader } from "@/components/feed/FeedProfileHeader";
import { FeedGrid } from "@/components/feed/FeedGrid";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { NewPostModal } from "@/components/feed/NewPostModal";
import { authApi } from "@/src/features/auth/api/authApi";
import type { FeedPost, MyProfileResponse } from "@/src/features/auth/types/authTypes";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const tabs = [
  { id: "posts", label: "게시물" },
  { id: "saved", label: "저장됨" },
  { id: "tagged", label: "태그됨" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function MyFeedPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("posts");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        const [feedResponse, profileResponse] = await Promise.all([
          authApi.getMyFeed(accessToken),
          authApi.getMyProfile(accessToken)
        ]);
        setPosts(feedResponse);
        setProfile(profileResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "피드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  const grid = useMemo(() => posts, [posts]);

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("3MB 이하 이미지로 업로드해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === "string" ? reader.result : null);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setContent("");
    setImageUrl(null);
    setImageError(null);
  };

  const handleCreate = async () => {
    if (!accessToken) return;
    if (!content.trim() && !imageUrl) {
      setImageError("사진 또는 글을 입력해 주세요.");
      return;
    }
    setCreating(true);
    try {
      const created = await authApi.createFeedPost(accessToken, {
        content: content.trim() || null,
        imageUrl
      });
      setPosts((prev) => [created, ...prev]);
      resetForm();
      setModalOpen(false);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "피드 등록에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !selectedPost) return;
    setDeleting(true);
    try {
      await authApi.deleteFeedPost(accessToken, selectedPost.id);
      setPosts((prev) => prev.filter((post) => post.id !== selectedPost.id));
      setSelectedPost(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const primaryPet = profile?.pets?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-sand/40">
      <SiteNav />
      <main className="container py-10">
        <SectionShell
          eyebrow="My Feed"
          title="나의 피드"
          description="반려동물의 일상을 기록하고, 내 피드를 관리하세요."
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <FeedProfileHeader
              profile={profile}
              postCount={posts.length}
              onNewPost={() => setModalOpen(true)}
            />

            <div className="flex flex-wrap gap-3 rounded-full border border-slate-200/70 bg-white/80 p-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {activeTab === "posts" && (
              <>
                {grid.length === 0 && !loading ? (
                  <EmptyFeedState onNewPost={() => setModalOpen(true)} />
                ) : (
                  <FeedGrid posts={grid} onSelect={setSelectedPost} />
                )}
              </>
            )}

            {activeTab !== "posts" && (
              <Card className="gradient-shell">
                <CardContent className="py-12 text-center text-sm text-ink/60">
                  준비 중인 영역입니다.
                </CardContent>
              </Card>
            )}
          </div>
        </SectionShell>
      </main>

      <NewPostModal
        open={modalOpen}
        imageUrl={imageUrl}
        nickname={profile?.nickname ?? "멍냥마당"}
        profileImageUrl={profile?.profileImageUrl ?? null}
        petName={primaryPet?.name ?? null}
        petBreed={primaryPet?.breed ?? null}
        content={content}
        imageError={imageError}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        onImageUpload={handleImageUpload}
        onContentChange={setContent}
        onSubmit={handleCreate}
        submitting={creating}
      />

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[32px] bg-white">
            <div className="grid gap-0 md:grid-cols-[1.3fr_0.7fr]">
              <div className="bg-black">
                {selectedPost.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedPost.imageUrl} alt="피드 이미지" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div>
                  <p className="text-xs text-ink/50">작성일</p>
                  <p className="text-sm font-semibold">
                    {new Date(selectedPost.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink/50">내용</p>
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">
                    {selectedPost.content || "작성된 내용이 없습니다."}
                  </p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button variant="secondary" onClick={() => setSelectedPost(null)}>
                    닫기
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
