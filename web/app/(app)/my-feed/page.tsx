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

  useEffect(() => {
    if (!selectedPost) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost]);

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
    const imageUrls = images.map((image) => image.originalUrl);
    if (imageUrls.length === 0) {
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

      const created = await authApi.createFeedPost(accessToken, formData);
      const createdWithImages: FeedPost = {
        ...created,
        imageUrl: created.imageUrls?.[0] ?? created.imageUrl ?? null,
        imageAspectRatioValue: images[0] ? getAspectRatioValue(images[0]) : null,
        imageAspectRatio: images[0]?.aspectRatio ?? null,
        imageUrls: created.imageUrls?.length ? created.imageUrls : created.imageUrl ? [created.imageUrl] : null
      };
      setPosts((prev) => [createdWithImages, ...prev]);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
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
                ) : selectedPost.imageUrl ? (
                  <FeedImageFrame
                    src={selectedPost.imageUrl}
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
      )}
    </div>
  );
}
