"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/src/features/auth/api/authApi";
import type { FeedPost } from "@/src/features/auth/types/authTypes";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

export default function MyFeedPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        const response = await authApi.getMyFeed(accessToken);
        setPosts(response);
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

  return (
    <div>
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
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="gradient-shell">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">새 게시물</p>
                  <Plus className="h-4 w-4 text-ink/40" />
                </div>
                <div className="h-40 overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="업로드 이미지" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                      사진을 업로드하세요
                    </div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-ink/70">
                  사진 업로드
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageUpload(event.target.files?.[0])}
                  />
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
                  placeholder="오늘의 기록을 남겨보세요."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
                {imageError && <p className="text-xs text-rose-500">{imageError}</p>}
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "등록 중..." : "피드 올리기"}
                </Button>
              </CardContent>
            </Card>
            <div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {grid.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/80 text-left"
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt="피드 이미지"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-4 text-xs text-ink/40">
                          {post.content ? post.content.slice(0, 40) : "사진 없음"}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {!loading && posts.length === 0 && (
                <p className="mt-4 text-sm text-ink/60">아직 작성한 피드가 없어요.</p>
              )}
            </div>
          </div>
        </SectionShell>
      </main>
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white">
            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
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
                    {deleting ? "삭제 중..." : (
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> 삭제
                      </span>
                    )}
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
