import { Lock, LockOpen, Loader2 } from "lucide-react";

interface PrivacyToggleCardProps {
  isPrivate: boolean;
  saving: boolean;
  onToggle: () => void;
}

export function PrivacyToggleCard({ isPrivate, saving, onToggle }: PrivacyToggleCardProps) {
  return (
    <div className="settings-page-preference-card">
      <div className="settings-page-preference-copy">
        <div className="privacy-panel-title-row">
          {isPrivate ? (
            <Lock className="privacy-panel-lock-icon" aria-hidden="true" />
          ) : (
            <LockOpen className="privacy-panel-lock-icon privacy-panel-lock-icon-open" aria-hidden="true" />
          )}
          <p className="settings-page-preference-title">비공개 계정</p>
          {saving && (
            <span className="privacy-panel-saving-badge" aria-live="polite">
              <Loader2 className="privacy-panel-saving-spinner" aria-hidden="true" />
              저장 중
            </span>
          )}
        </div>
        <p className="settings-page-preference-description">
          {isPrivate
            ? "집사 관계인 사용자만 게시물과 프로필을 볼 수 있습니다."
            : "모든 사용자가 게시물과 프로필을 볼 수 있습니다."}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isPrivate}
        aria-label="비공개 계정 토글"
        className={`settings-page-switch ${isPrivate ? "settings-page-switch-active" : ""}`}
        onClick={onToggle}
        disabled={saving}
      >
        <span className="settings-page-switch-thumb" />
      </button>
    </div>
  );
}
