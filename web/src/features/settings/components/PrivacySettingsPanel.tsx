"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen } from "lucide-react";

import { authApi } from "@/src/features/auth/api/authApi";

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

  if (loading) {
    return (
      <>
        <div className="settings-page-content-header">
          <h2 className="settings-page-content-title">계정 공개 범위</h2>
        </div>
        <div className="settings-page-editor-card">
          <p className="settings-page-field-helper">불러오는 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="settings-page-content-header">
        <h2 className="settings-page-content-title">계정 공개 범위</h2>
      </div>

      <div className="settings-page-preference-card">
        <div className="settings-page-preference-copy">
          <div className="privacy-panel-title-row">
            {isPrivate ? (
              <Lock className="privacy-panel-lock-icon" aria-hidden="true" />
            ) : (
              <LockOpen className="privacy-panel-lock-icon privacy-panel-lock-icon-open" aria-hidden="true" />
            )}
            <p className="settings-page-preference-title">비공개 계정</p>
          </div>
          <p className="settings-page-preference-description">
            {isPrivate
              ? "현재 계정이 비공개 상태입니다. 집사 관계인 사용자만 게시물과 프로필을 볼 수 있습니다."
              : "현재 계정이 공개 상태입니다. 모든 사용자가 게시물과 프로필을 볼 수 있습니다."}
          </p>
          {error ? (
            <p className="privacy-panel-error">{error}</p>
          ) : null}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPrivate ?? false}
          aria-label="비공개 계정 토글"
          className={`settings-page-switch ${isPrivate ? "settings-page-switch-active" : ""}`}
          onClick={handleToggle}
          disabled={saving || isPrivate === null}
        >
          <span className="settings-page-switch-thumb" />
        </button>
      </div>
    </>
  );
}
