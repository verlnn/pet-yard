"use client";

import { useEffect, useState } from "react";

import { authApi } from "@/src/features/auth/api/authApi";
import { PrivacyInfoSection } from "./PrivacyInfoSection";
import { PrivacyLoadingSkeleton } from "./PrivacyLoadingSkeleton";
import { PrivacyToggleCard } from "./PrivacyToggleCard";

export function PrivacySettingsPanel() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const profile = await authApi.getMyProfile(accessToken);
        setIsPrivate(profile.isPrivate);
      } catch (err) {
        setError(err instanceof Error ? err.message : "프로필 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken]);

  const handleToggle = async () => {
    if (!accessToken || isPrivate === null || saving) return;
    const next = !isPrivate;
    setSaving(true);
    setError(null);
    try {
      await authApi.updateAccountPrivacy(accessToken, next);
      setIsPrivate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="settings-page-content-header">
        <h2 className="settings-page-content-title">계정 공개 범위</h2>
        <p className="settings-page-field-helper">나의 게시물과 프로필을 볼 수 있는 사람을 설정합니다.</p>
      </div>

      {loading ? (
        <PrivacyLoadingSkeleton />
      ) : (
        <>
          <PrivacyToggleCard
            isPrivate={isPrivate ?? false}
            saving={saving}
            onToggle={handleToggle}
          />
          {error ? <p className="privacy-panel-error">{error}</p> : null}
          {isPrivate !== null ? <PrivacyInfoSection isPrivate={isPrivate} /> : null}
        </>
      )}
    </>
  );
}
