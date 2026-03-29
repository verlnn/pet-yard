"use client";

import { Lock } from "lucide-react";

import type { GuardianRelationStatus } from "@/src/features/auth/types/authTypes";

interface PrivateProfileBlockedViewProps {
  guardianRelationStatus: GuardianRelationStatus;
  guardianLoading: boolean;
  onGuardianAction: () => void;
}

export function PrivateProfileBlockedView({
  guardianRelationStatus,
  guardianLoading,
  onGuardianAction
}: PrivateProfileBlockedViewProps) {
  const isPending = guardianRelationStatus === "OUTGOING_REQUESTED";

  return (
    <div className="private-profile-blocked-view">
      <div className="private-profile-blocked-icon-shell" aria-hidden="true">
        <Lock className="private-profile-blocked-icon" />
      </div>
      <p className="private-profile-blocked-title">비공개 계정입니다</p>
      <p className="private-profile-blocked-description">
        집사 관계인 경우에만 게시물을 볼 수 있습니다.
      </p>
      <button
        type="button"
        className="private-profile-blocked-action"
        onClick={onGuardianAction}
        disabled={isPending || guardianLoading}
      >
        {isPending ? "집사 신청 중" : "집사 신청"}
      </button>
    </div>
  );
}
