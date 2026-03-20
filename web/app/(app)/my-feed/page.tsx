"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";

import { SectionShell } from "@/components/site/section-shell";
import { SiteNav } from "@/components/site/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedProfileHeader } from "@/components/feed/FeedProfileHeader";
import { FeedGrid } from "@/components/feed/FeedGrid";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { NewPostModal } from "@/components/feed/NewPostModal";
import { PostImageCarousel } from "@/components/feed/PostImageCarousel";
import { FeedImageFrame } from "@/components/feed/FeedImageFrame";
import { getBoxSize, getTargetRatio } from "@/components/feed/imageSizing";
import { authApi } from "@/src/features/auth/api/authApi";
import type { FeedPost, MyProfileResponse } from "@/src/features/auth/types/authTypes";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_IMAGES = 15;

const tabs = [
  { id: "posts", label: "게시물" },
  { id: "saved", label: "저장됨" },
  { id: "tagged", label: "태그됨" }
] as const;

type TabId = (typeof tabs)[number]["id"];
type ComposerImage = {
  id: string;
  name: string;
  file: File;
  originalUrl: string;
  aspectRatio: "original" | "1:1" | "4:5" | "16:9";
  naturalSize?: { width: number; height: number };
};

const getAspectRatioValue = (image: ComposerImage | undefined) => {
  if (!image) return null;
  if (image.aspectRatio === "1:1") return 1;
  if (image.aspectRatio === "4:5") return 4 / 5;
  if (image.aspectRatio === "16:9") return 16 / 9;
  if (image.naturalSize?.width && image.naturalSize?.height) {
    return image.naturalSize.width / image.naturalSize.height;
  }
  return null;
};

const createImageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("이미지 읽기에 실패했습니다."));
      }
    };
    reader.onerror = () => reject(new Error("이미지 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });

export default function MyFeedPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("posts");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [postActionMenuOpen, setPostActionMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const postActionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        const [feedResponse, profileResponse] = await Promise.all([
          authApi.getOwnPosts(accessToken),
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

  const refreshOwnPosts = async (token: string) => {
    const ownPosts = await authApi.getOwnPosts(token);
    setPosts(ownPosts);
    return ownPosts;
  };

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  const grid = useMemo(() => posts, [posts]);
  const selectedPostIndex = useMemo(
    () => (selectedPost ? posts.findIndex((post) => post.id === selectedPost.id) : -1),
    [posts, selectedPost]
  );
  const hasPrevPost = selectedPostIndex > 0;
  const hasNextPost = selectedPostIndex !== -1 && selectedPostIndex < posts.length - 1;
  const selectedPostPhotoSize = useMemo(() => {
    if (!selectedPost || !viewportSize.width || !viewportSize.height) {
      return { width: 0, height: 0 };
    }

    const targetRatio = getTargetRatio({
      aspectRatio: selectedPost.imageAspectRatio,
      aspectRatioValue: selectedPost.imageAspectRatioValue
    });
    const modalMaxHeight = Math.min(viewportSize.height * 0.88, 820);
    const sidebarWidth = 360;
    const modalMaxWidth = Math.min(viewportSize.width - 32, 1280);
    const photoMaxWidth = Math.max(280, modalMaxWidth - sidebarWidth);
    const isWideLandscape = selectedPost.imageAspectRatio === "16:9";

    if (isWideLandscape) {
      return {
        width: photoMaxWidth,
        height: modalMaxHeight
      };
    }

    return getBoxSize({
      containerWidth: photoMaxWidth,
      containerHeight: modalMaxHeight,
      targetRatio
    });
  }, [selectedPost, viewportSize]);

  const handleSelectPrevPost = () => {
    if (!hasPrevPost) return;
    setSelectedPost(posts[selectedPostIndex - 1] ?? null);
  };

  const handleSelectNextPost = () => {
    if (!hasNextPost) return;
    setSelectedPost(posts[selectedPostIndex + 1] ?? null);
  };

  const handleCloseSelectedPost = () => {
    setSelectedPost(null);
    setPostActionMenuOpen(false);
    setDeleteConfirmOpen(false);
  };

  useEffect(() => {
    if (!selectedPost) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseSelectedPost();
        return;
      }
      if (event.key === "ArrowLeft") {
        handleSelectPrevPost();
        return;
      }
      if (event.key === "ArrowRight") {
        handleSelectNextPost();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, hasPrevPost, hasNextPost, selectedPostIndex, posts]);

  useEffect(() => {
    if (!postActionMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!postActionMenuRef.current?.contains(event.target as Node)) {
        setPostActionMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [postActionMenuOpen]);

  const handleAddImages = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setImageError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }

    const selectedFiles = Array.from(files);
    const acceptedFiles = selectedFiles.slice(0, remaining);
    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: 이미지 파일만 업로드할 수 있어요.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: 3MB 이하 이미지로 업로드해 주세요.`);
        continue;
      }
      validFiles.push(file);
    }

    if (selectedFiles.length > remaining) {
      errors.push(`최대 ${MAX_IMAGES}장까지만 추가할 수 있어요.`);
    }

    if (validFiles.length === 0) {
      if (errors.length > 0) {
        setImageError(errors[0]);
      }
      return;
    }

    try {
      const dataUrls = await Promise.all(validFiles.map((file) => readFileAsDataUrl(file)));
      const nextImages = dataUrls.map((url, index) => ({
        id: createImageId(),
        name: validFiles[index]?.name ?? `image-${index + 1}`,
        file: validFiles[index] as File,
        originalUrl: url,
        aspectRatio: "original" as const,
      }));
      setImages((prev) => [...prev, ...nextImages]);
      setImageError(errors[0] ?? null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleReorderImages = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setImages((prev) => {
      const next = [...prev];
      const sourceIndex = next.findIndex((image) => image.id === sourceId);
      const targetIndex = next.findIndex((image) => image.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleUpdateImage = (id: string, update: Partial<ComposerImage>) => {
    setImages((prev) => prev.map((image) => (image.id === id ? { ...image, ...update } : image)));
  };

  const resetForm = () => {
    setContent("");
    setImages([]);
    setImageError(null);
  };

  const handleCreate = async () => {
    if (!accessToken) return;
    if (images.length === 0) {
      setImageError("사진을 한 장 이상 추가해 주세요.");
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      images.forEach((image) => {
        formData.append("images", image.file);
        const aspectRatioValue = getAspectRatioValue(image);
        if (aspectRatioValue !== null) {
          formData.append("imageAspectRatioValue", String(aspectRatioValue));
        }
        formData.append("imageAspectRatio", image.aspectRatio);
      });

      await authApi.createFeedPost(accessToken, formData);
      await refreshOwnPosts(accessToken);
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
      setPostActionMenuOpen(false);
      setDeleteConfirmOpen(false);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const primaryPet = profile?.pets?.[0];

  return (
    <div className="min-h-screen">
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
        images={images}
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
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveImage}
        onReorderImages={handleReorderImages}
        onUpdateImage={handleUpdateImage}
        onContentChange={setContent}
        onSubmit={handleCreate}
        submitting={creating}
      />

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={handleCloseSelectedPost}
        >
          {hasPrevPost && (
            <button
              type="button"
              onClick={handleSelectPrevPost}
              className="absolute left-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-ink shadow-lg transition hover:bg-white"
              aria-label="이전 게시물 보기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {hasNextPost && (
            <button
              type="button"
              onClick={handleSelectNextPost}
              className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-ink shadow-lg transition hover:bg-white"
              aria-label="다음 게시물 보기"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={handleCloseSelectedPost}
              className="absolute -right-3 -top-3 z-20 rounded-full bg-white p-2 text-ink shadow-lg transition hover:bg-slate-100"
              aria-label="피드 상세 닫기"
            >
              <X className="h-5 w-5" />
            </button>
            <div ref={postActionMenuRef} className="absolute right-5 top-5 z-20">
              <button
                type="button"
                onClick={() => setPostActionMenuOpen((prev) => !prev)}
                className="rounded-full bg-white/95 p-2 text-ink shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                aria-label="게시물 메뉴 열기"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <div
                className={`absolute right-0 top-12 w-48 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl transition duration-200 ${
                  postActionMenuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                }`}
              >
                  <button
                    type="button"
                    onClick={() => {
                      setPostActionMenuOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                    disabled={deleting}
                    className="flex w-full items-center px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-ink transition hover:bg-slate-50"
                  >
                    좋아요 수 숨기기
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-ink transition hover:bg-slate-50"
                  >
                    댓글기능 해제
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-ink transition hover:bg-slate-50"
                  >
                    공유기능 해제
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-ink transition hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-ink/70 transition hover:bg-slate-50"
                  >
                    취소
                  </button>
                </div>
            </div>
          <div className="flex overflow-hidden rounded-[32px] bg-white">
            <div
              className="flex items-center justify-center bg-black"
              style={{
                width: `${selectedPostPhotoSize.width || 480}px`,
                height: `${selectedPostPhotoSize.height || 480}px`
              }}
            >
                {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 ? (
                  <PostImageCarousel
                    images={selectedPost.imageUrls}
                    aspectRatio={selectedPost.imageAspectRatio}
                    aspectRatioValue={selectedPost.imageAspectRatioValue}
                  />
                ) : selectedPost.thumbnailImageUrl ? (
                  <FeedImageFrame
                    src={selectedPost.thumbnailImageUrl}
                    alt="피드 이미지"
                    aspectRatio={selectedPost.imageAspectRatio}
                    aspectRatioValue={selectedPost.imageAspectRatioValue}
                    outerClassName="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/60">
                    이미지 없음
                  </div>
                )}
              </div>
              <div
                className="flex flex-col gap-4 overflow-y-auto p-6"
                style={{
                  width: "360px",
                  maxHeight: `${selectedPostPhotoSize.height || 480}px`
                }}
              >
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
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div>
                    <p className="text-xs text-ink/50">해시태그</p>
                    <p className="mt-1 flex flex-wrap gap-2 text-xs text-sky-700">
                      {selectedPost.hashtags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-1">
                          #{tag}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
          </div>
          {deleteConfirmOpen && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35">
              <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl">
                <div className="px-6 py-7">
                  <p className="text-center text-base font-semibold text-ink">
                    이 게시물을 삭제하시겠습니까?
                  </p>
                </div>
                <div className="border-t border-slate-200" />
                <div className="grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    disabled={deleting}
                    className="flex h-14 items-center justify-center text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-14 items-center justify-center border-l border-slate-200 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
