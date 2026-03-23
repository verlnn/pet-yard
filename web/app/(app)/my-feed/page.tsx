"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";

import { FeedDetailPhotoPanel } from "@/components/feed/detail/FeedDetailPhotoPanel";
import { FeedDetailSidebar } from "@/components/feed/detail/FeedDetailSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FeedProfileHeader } from "@/components/feed/FeedProfileHeader";
import { FeedGrid } from "@/components/feed/FeedGrid";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { NewPostModal } from "@/components/feed/NewPostModal";
import { FeedPostPermissionDialog } from "@/components/feed/FeedPostPermissionDialog";
import { AppAlertDialog } from "@/components/ui/AppAlertDialog";
import { getBoxSize, getTargetRatio } from "@/components/feed/imageSizing";
import { authApi } from "@/src/features/auth/api/authApi";
import type {
  FeedPost,
  FeedPostComment,
  GuardianRelationStatus,
  MyProfileResponse,
  PublicProfileResponse
} from "@/src/features/auth/types/authTypes";
import { buildProfileRoute } from "@/src/lib/routes";
import { useRouter } from "next/navigation";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_IMAGES = 15;
const GUARDIAN_REQUEST_CANCEL_COOLDOWN_MS = 2000;
const FEED_DETAIL_SHELL_TRANSITION = {
  duration: 0.4,
  ease: [0.22, 1.5, 0.36, 1] as const
};

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

type ProfilePageProfile = MyProfileResponse | PublicProfileResponse;

function getGuardianActionLabel(status: GuardianRelationStatus) {
  if (status === "CONNECTED") return "집사 해제";
  if (status === "OUTGOING_REQUESTED") return "요청 취소";
  if (status === "INCOMING_REQUESTED") return "집사 요청 수락";
  return "집사 요청";
}

function PublicProfileHeader({
  profile,
  postCount,
  guardianLoading,
  guardianRequestCooldown,
  onGuardianAction
}: {
  profile?: PublicProfileResponse | null;
  postCount: number;
  guardianLoading: boolean;
  guardianRequestCooldown: boolean;
  onGuardianAction: () => void;
}) {
  const primaryPet = profile?.pets?.find((pet) => pet.id === profile?.primaryPetId) ?? profile?.pets?.[0];
  const profileUsername = profile?.username?.trim() || "username";
  const profileDisplayName = profile?.nickname?.trim() || "멍냥마당";
  const guardianRelationStatus = profile?.guardianRelationStatus ?? "NONE";
  const guardianActionLabel = guardianRequestCooldown ? "요청 취소됨" : getGuardianActionLabel(guardianRelationStatus);
  const guardianActionDisabled = guardianLoading || guardianRequestCooldown;

  return (
    <section className="feed-profile-header">
      <div className="feed-profile-header-layout">
        <div className="feed-profile-header-identity">
          <div className="feed-profile-header-avatar-shell">
            <Avatar className="feed-profile-header-avatar">
              {profile?.profileImageUrl ? (
                <AvatarImage src={profile.profileImageUrl} alt={profile.nickname} />
              ) : (
                <AvatarFallback>{profile?.nickname?.[0] ?? "MY"}</AvatarFallback>
              )}
            </Avatar>
            {primaryPet ? (
              <span className="feed-profile-header-primary-pet" aria-hidden="true">
                {primaryPet.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryPet.photoUrl} alt={primaryPet.name} className="feed-profile-header-primary-pet-image" />
                ) : (
                  <span className="feed-profile-header-primary-pet-fallback">{primaryPet.name[0] ?? "펫"}</span>
                )}
              </span>
            ) : null}
          </div>

          <div className="feed-profile-header-copy">
            <div className="feed-profile-header-heading-row">
              <div className="feed-profile-header-title-group">
                <p className="feed-profile-header-title">{profileUsername}</p>
                <p className="feed-profile-header-display-name">{profileDisplayName}</p>
              </div>
            </div>

            <div className="feed-profile-header-stats">
              <span className="feed-profile-header-stat">
                <strong className="feed-profile-header-stat-value">{postCount}</strong>
                <span className="feed-profile-header-stat-label">게시물</span>
              </span>
              <span className="feed-profile-header-stat">
                <strong className="feed-profile-header-stat-value">{profile?.guardianCount ?? 0}</strong>
                <span className="feed-profile-header-stat-label">집사들</span>
              </span>
              <span className="feed-profile-header-stat">
                <strong className="feed-profile-header-stat-value">{profile?.petCount ?? 0}</strong>
                <span className="feed-profile-header-stat-label">반려동물</span>
              </span>
            </div>

            <div className="feed-profile-header-meta">
              <p className="feed-profile-header-subtitle">
                {profile?.bio?.trim()
                  ? profile.bio
                  : primaryPet?.name
                  ? `${primaryPet.name}와 함께하는 일상`
                  : "반려동물과의 기록을 남겨보세요."}
              </p>
              {primaryPet?.breed && <p className="feed-profile-header-meta-line">{primaryPet.breed}</p>}
            </div>
          </div>
        </div>
        <div className="feed-profile-header-actions">
          <Button
            type="button"
            variant={guardianRelationStatus === "CONNECTED" ? "secondary" : "default"}
            className={`${guardianRelationStatus === "CONNECTED" ? "feed-profile-header-secondary-action" : "feed-profile-header-primary-action"} ${guardianRequestCooldown ? "guardian-request-cooldown" : ""}`}
            onClick={onGuardianAction}
            disabled={guardianActionDisabled}
          >
            {guardianRequestCooldown ? <span className="guardian-request-cooldown-bar" aria-hidden="true" /> : null}
            <span className="guardian-request-cooldown-label">{guardianActionLabel}</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="feed-profile-header-message-action"
          >
            메시지 보내기
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ProfileFeedPageClient({ usernameParam }: { usernameParam?: string }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePageProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [creating, setCreating] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("posts");
  const [modalOpen, setModalOpen] = useState(false);
  const [postPermissionDialogOpen, setPostPermissionDialogOpen] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [postActionMenuOpen, setPostActionMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pawLoading, setPawLoading] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState<FeedPostComment[]>([]);
  const [selectedPostCommentsLoading, setSelectedPostCommentsLoading] = useState(false);
  const [selectedPostCommentsError, setSelectedPostCommentsError] = useState<string | null>(null);
  const [selectedPostCommentValue, setSelectedPostCommentValue] = useState("");
  const [selectedPostCommentSubmitting, setSelectedPostCommentSubmitting] = useState(false);
  const [commentFocusToken, setCommentFocusToken] = useState(0);
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [guardianUnregisterAlertOpen, setGuardianUnregisterAlertOpen] = useState(false);
  const [guardianErrorMessage, setGuardianErrorMessage] = useState<string | null>(null);
  const [guardianRequestCooldown, setGuardianRequestCooldown] = useState(false);
  const guardianCooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postActionMenuRef = useRef<HTMLDivElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImageAlertOpen, setProfileImageAlertOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      setLoading(true);
      try {
        const myProfile = await authApi.getMyProfile(accessToken);
        const normalizedUsername = usernameParam?.trim();
        const shouldShowOwnProfile = !normalizedUsername || normalizedUsername === myProfile.username;
        setIsOwnProfile(shouldShowOwnProfile);

        if (shouldShowOwnProfile) {
          const feedResponse = await authApi.getOwnPosts(accessToken);
          setPosts(feedResponse);
          setProfile(myProfile);
        } else {
          const [feedResponse, profileResponse] = await Promise.all([
            authApi.getUserPosts(accessToken, normalizedUsername),
            authApi.getPublicProfile(accessToken, normalizedUsername)
          ]);
          setPosts(feedResponse);
          setProfile(profileResponse);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "피드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken, usernameParam]);

  useEffect(() => {
    if (!usernameParam && isOwnProfile && profile?.username) {
      router.replace(buildProfileRoute(profile.username));
    }
  }, [isOwnProfile, profile?.username, router, usernameParam]);

  const refreshProfilePosts = async (token: string) => {
    if (!profile?.username) {
      return [];
    }
    const nextPosts = isOwnProfile
      ? await authApi.getOwnPosts(token)
      : await authApi.getUserPosts(token, profile.username);
    setPosts(nextPosts);
    return nextPosts;
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

  useEffect(() => {
    return () => {
      if (guardianCooldownTimeoutRef.current) {
        clearTimeout(guardianCooldownTimeoutRef.current);
      }
    };
  }, []);

  const startGuardianRequestCooldown = () => {
    if (guardianCooldownTimeoutRef.current) {
      clearTimeout(guardianCooldownTimeoutRef.current);
    }
    setGuardianRequestCooldown(true);
    guardianCooldownTimeoutRef.current = setTimeout(() => {
      setGuardianRequestCooldown(false);
      guardianCooldownTimeoutRef.current = null;
    }, GUARDIAN_REQUEST_CANCEL_COOLDOWN_MS);
  };

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
    const previousPost = posts[selectedPostIndex - 1] ?? null;
    setSelectedPost(previousPost);
    setSelectedPostComments([]);
    setSelectedPostCommentsError(null);
    setSelectedPostCommentValue("");
    if (previousPost && accessToken) {
      void loadSelectedPostComments(previousPost.id);
    }
  };

  const handleSelectNextPost = () => {
    if (!hasNextPost) return;
    const nextPost = posts[selectedPostIndex + 1] ?? null;
    setSelectedPost(nextPost);
    setSelectedPostComments([]);
    setSelectedPostCommentsError(null);
    setSelectedPostCommentValue("");
    if (nextPost && accessToken) {
      void loadSelectedPostComments(nextPost.id);
    }
  };

  const handleCloseSelectedPost = () => {
    setSelectedPost(null);
    setSelectedPostComments([]);
    setSelectedPostCommentsError(null);
    setSelectedPostCommentValue("");
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
      await refreshProfilePosts(accessToken);
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

  const handleTogglePaw = async () => {
    if (!accessToken || !selectedPost || pawLoading) return;
    setPawLoading(true);
    try {
      const response = selectedPost.pawedByMe
        ? await authApi.removeFeedPostPaw(accessToken, selectedPost.id)
        : await authApi.addFeedPostPaw(accessToken, selectedPost.id);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === response.postId
            ? { ...post, pawCount: response.pawCount, pawedByMe: response.pawedByMe }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev.id === response.postId
          ? { ...prev, pawCount: response.pawCount, pawedByMe: response.pawedByMe }
          : prev
      );
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "발자국 처리에 실패했습니다.");
    } finally {
      setPawLoading(false);
    }
  };

  const loadSelectedPostComments = async (postId: number) => {
    if (!accessToken) {
      return;
    }
    setSelectedPostCommentsLoading(true);
    setSelectedPostCommentsError(null);
    try {
      const response = await authApi.getFeedPostComments(accessToken, postId);
      setSelectedPostComments(response);
    } catch (error) {
      setSelectedPostCommentsError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
    } finally {
      setSelectedPostCommentsLoading(false);
    }
  };

  const handleSelectPost = (post: FeedPost) => {
    setSelectedPost(post);
    setSelectedPostComments([]);
    setSelectedPostCommentsError(null);
    setSelectedPostCommentValue("");
    void loadSelectedPostComments(post.id);
  };

  const handleSubmitSelectedPostComment = async () => {
    if (!selectedPost || !accessToken || selectedPostCommentSubmitting) {
      return;
    }
    const trimmed = selectedPostCommentValue.trim();
    if (!trimmed) {
      return;
    }
    setSelectedPostCommentSubmitting(true);
    setSelectedPostCommentsError(null);
    try {
      const created = await authApi.addFeedPostComment(accessToken, selectedPost.id, trimmed);
      setSelectedPostComments((previous) => [...previous, created]);
      setPosts((previous) =>
        previous.map((post) =>
          post.id === selectedPost.id
            ? { ...post, commentCount: ((post as FeedPost & { commentCount?: number }).commentCount ?? 0) + 1 }
            : post
        )
      );
      setSelectedPost((previous) => previous ? {
        ...previous,
        commentCount: previous.commentCount + 1
      } : previous);
      setSelectedPostCommentValue("");
      setCommentFocusToken((previous) => previous + 1);
    } catch (error) {
      setSelectedPostCommentsError(error instanceof Error ? error.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setSelectedPostCommentSubmitting(false);
    }
  };

  const primaryPet = profile?.pets?.find((pet) => pet.id === profile?.primaryPetId) ?? profile?.pets?.[0];
  const handleRequestNewPost = () => {
    if (loading) {
      return;
    }
    if ((profile?.petCount ?? 0) > 0) {
      setModalOpen(true);
      return;
    }
    setPostPermissionDialogOpen(true);
  };

  const handleProfileImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("프로필 사진은 3MB 이하 이미지로 선택해 주세요.");
      return;
    }

    try {
      const nextProfileImageUrl = await readFileAsDataUrl(file);
      setProfile((prev) => prev ? { ...prev, profileImageUrl: nextProfileImageUrl } : prev);
      setProfileImageAlertOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 읽기에 실패했습니다.");
    }
  };

  const handleRequestProfileImageUpload = () => {
    setProfileImageAlertOpen(false);
    profileImageInputRef.current?.click();
  };

  const handleRemoveProfileImage = () => {
    setProfile((prev) => prev ? { ...prev, profileImageUrl: null } : prev);
    setProfileImageAlertOpen(false);
  };

  const handleGuardianAction = async () => {
    if (!accessToken || isOwnProfile || !profile) {
      return;
    }
    if (guardianRequestCooldown) {
      return;
    }
    if (profile.guardianRelationStatus === "CONNECTED") {
      setGuardianUnregisterAlertOpen(true);
      return;
    }
    if (profile.guardianRelationStatus === "OUTGOING_REQUESTED") {
      await handleConfirmGuardianRemove();
      return;
    }

    setGuardianLoading(true);
    try {
      const response = await authApi.registerGuardian(accessToken, profile.userId);
      setProfile((prev) => {
        if (!prev || !("guardianRelationStatus" in prev)) {
          return prev;
        }
        const nextGuardianCount = response.guardianRelationStatus === "CONNECTED"
          && prev.guardianRelationStatus !== "CONNECTED"
          ? prev.guardianCount + 1
          : prev.guardianCount;
        return {
          ...prev,
          guardianRelationStatus: response.guardianRelationStatus,
          guardianCount: nextGuardianCount
        };
      });
      setGuardianErrorMessage(null);
    } catch (error) {
      setGuardianErrorMessage(error instanceof Error ? error.message : "집사 요청 처리에 실패했습니다.");
    } finally {
      setGuardianLoading(false);
    }
  };

  const handleConfirmGuardianRemove = async () => {
    if (!accessToken || isOwnProfile || !profile) {
      return;
    }

    setGuardianLoading(true);
    try {
      const shouldStartCooldown = profile.guardianRelationStatus === "OUTGOING_REQUESTED";
      const response = await authApi.unregisterGuardian(accessToken, profile.userId);
      setProfile((prev) => {
        if (!prev || !("guardianRelationStatus" in prev)) {
          return prev;
        }
        const nextGuardianCount = prev.guardianRelationStatus === "CONNECTED" && prev.guardianCount > 0
          ? prev.guardianCount - 1
          : prev.guardianCount;
        return {
          ...prev,
          guardianRelationStatus: response.guardianRelationStatus,
          guardianCount: nextGuardianCount
        };
      });
      if (shouldStartCooldown) {
        startGuardianRequestCooldown();
      }
      setGuardianUnregisterAlertOpen(false);
      setGuardianErrorMessage(null);
    } catch (error) {
      setGuardianErrorMessage(error instanceof Error ? error.message : "집사 관계를 해제하지 못했습니다.");
    } finally {
      setGuardianLoading(false);
    }
  };

  return (
    <>
      <AppAlertDialog
        open={guardianErrorMessage !== null}
        title="집사 요청을 처리하지 못했어요"
        description={guardianErrorMessage ?? ""}
        actions={[{ label: "확인", onClick: () => setGuardianErrorMessage(null), tone: "accent" }]}
        onClose={() => setGuardianErrorMessage(null)}
      />
      <AppAlertDialog
        open={guardianUnregisterAlertOpen}
        title={`${profile?.nickname ?? "이 사용자"}님과 맺은 집사 관계를 해제하시겠어요?`}
        actionsClassName="app-alert-dialog-actions-vertical"
        actions={[
          { label: "집사 해제", onClick: handleConfirmGuardianRemove, tone: "danger" },
          { label: "취소", onClick: () => setGuardianUnregisterAlertOpen(false) }
        ]}
        onClose={() => setGuardianUnregisterAlertOpen(false)}
      />
      <AppAlertDialog
        open={profileImageAlertOpen}
        title="프로필 사진 바꾸기"
        description="프로필 사진에 적용할 작업을 선택해 주세요."
        actionsClassName="app-alert-dialog-actions-vertical"
        actions={[
          { label: "사진 업로드", onClick: handleRequestProfileImageUpload, tone: 'accent' },
          { label: "현재 사진 삭제", onClick: handleRemoveProfileImage, tone: "danger" },
          { label: "취소", onClick: () => setProfileImageAlertOpen(false) }
        ]}
        onClose={() => setProfileImageAlertOpen(false)}
      />

      <input
        ref={profileImageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleProfileImageFileChange}
      />

      <section className="my-feed-page">
        {error && (
          <div className="my-feed-error-alert">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {isOwnProfile ? (
            <FeedProfileHeader
              profile={profile as MyProfileResponse | null}
              postCount={posts.length}
              onNewPost={handleRequestNewPost}
              onProfileImageClick={() => setProfileImageAlertOpen(true)}
            />
          ) : (
            <PublicProfileHeader
              profile={profile as PublicProfileResponse | null}
              postCount={posts.length}
              guardianLoading={guardianLoading}
              guardianRequestCooldown={guardianRequestCooldown}
              onGuardianAction={handleGuardianAction}
            />
          )}

          {isOwnProfile ? (
            <div className="my-feed-tab-list">
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
          ) : null}

          {(isOwnProfile ? activeTab === "posts" : true) && (
            <>
              {grid.length === 0 && !loading ? (
                isOwnProfile ? (
                  <EmptyFeedState onNewPost={handleRequestNewPost} />
                ) : (
                  <Card className="gradient-shell">
                    <CardContent className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                      이 사용자가 공개한 게시물이 아직 없습니다.
                    </CardContent>
                  </Card>
                )
              ) : (
                <FeedGrid posts={grid} onSelect={handleSelectPost} />
              )}
            </>
          )}

          {isOwnProfile && activeTab !== "posts" && (
            <Card className="gradient-shell">
              <CardContent className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                준비 중인 영역입니다.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {isOwnProfile ? (
        <>
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

          <FeedPostPermissionDialog
            open={postPermissionDialogOpen}
            onClose={() => setPostPermissionDialogOpen(false)}
            onGoVerify={() => {
              setPostPermissionDialogOpen(false);
              router.push("/pets");
            }}
          />
        </>
      ) : null}

      <AnimatePresence>
        {selectedPost ? (
          <motion.div
            className="feed-detail-overlay"
            onClick={handleCloseSelectedPost}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {hasPrevPost && (
              <button
                type="button"
                onClick={handleSelectPrevPost}
                className="feed-detail-nav-button feed-detail-nav-button-prev"
                aria-label="이전 게시물 보기"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {hasNextPost && (
              <button
                type="button"
                onClick={handleSelectNextPost}
                className="feed-detail-nav-button feed-detail-nav-button-next"
                aria-label="다음 게시물 보기"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
            <motion.div
              className="feed-detail-shell"
              onClick={(event) => event.stopPropagation()}
              initial={{
                opacity: 0,
                scale: 0.7,
                y: -20
              }}
              animate={{
                opacity: 1,
                scale: [0.7, 1.1, 0.95, 1],
                y: [-20, 0]
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 10
              }}
              transition={FEED_DETAIL_SHELL_TRANSITION}
            >
              <button
                type="button"
                onClick={handleCloseSelectedPost}
                className="feed-detail-close-button"
                aria-label="피드 상세 닫기"
              >
                <X className="h-5 w-5" />
              </button>
              {isOwnProfile ? (
                <div ref={postActionMenuRef} className="feed-detail-menu-anchor">
                  <button
                    type="button"
                    onClick={() => setPostActionMenuOpen((prev) => !prev)}
                    className="feed-detail-menu-trigger"
                    aria-label="게시물 메뉴 열기"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <div
                    className={`feed-detail-menu ${
                      postActionMenuOpen
                        ? "feed-detail-menu-open"
                        : "feed-detail-menu-closed"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPostActionMenuOpen(false);
                        setDeleteConfirmOpen(true);
                      }}
                      disabled={deleting}
                      className="feed-detail-menu-item feed-detail-menu-item-danger"
                    >
                      {deleting ? "삭제 중..." : "삭제"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostActionMenuOpen(false)}
                      className="feed-detail-menu-item"
                    >
                      좋아요 수 숨기기
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostActionMenuOpen(false)}
                      className="feed-detail-menu-item"
                    >
                      댓글기능 해제
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostActionMenuOpen(false)}
                      className="feed-detail-menu-item"
                    >
                      공유기능 해제
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostActionMenuOpen(false)}
                      className="feed-detail-menu-item"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostActionMenuOpen(false)}
                      className="feed-detail-menu-item feed-detail-menu-item-muted"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : null}
            <div className="feed-detail-content">
              <FeedDetailPhotoPanel
                post={selectedPost}
                width={selectedPostPhotoSize.width || 480}
                height={selectedPostPhotoSize.height || 480}
              />
              <FeedDetailSidebar
                post={selectedPost}
                maxHeight={selectedPostPhotoSize.height || 480}
                onTogglePaw={handleTogglePaw}
                pawLoading={pawLoading}
                comments={selectedPostComments}
                commentsLoading={selectedPostCommentsLoading}
                commentsErrorMessage={selectedPostCommentsError}
                commentValue={selectedPostCommentValue}
                onCommentValueChange={setSelectedPostCommentValue}
                onCommentSubmit={handleSubmitSelectedPostComment}
                commentSubmitting={selectedPostCommentSubmitting}
                focusCommentToken={commentFocusToken}
              />
            </div>
            {isOwnProfile && deleteConfirmOpen && (
              <div className="feed-detail-confirm-overlay">
                <div className="feed-detail-confirm-dialog">
                  <div className="feed-detail-confirm-body">
                    <p className="feed-detail-confirm-title">
                      이 게시물을 삭제하시겠습니까?
                    </p>
                  </div>
                  <div className="feed-detail-confirm-divider" />
                  <div className="feed-detail-confirm-actions">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      disabled={deleting}
                      className="feed-detail-confirm-button feed-detail-confirm-cancel"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="feed-detail-confirm-button feed-detail-confirm-submit"
                    >
                      {deleting ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default function MyFeedPage() {
  return <ProfileFeedPageClient />;
}
