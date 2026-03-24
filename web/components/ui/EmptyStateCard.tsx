import * as React from "react";

import CommonButton from "@/components/ui/CommonButton";

interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function EmptyStateCard({
  icon,
  title,
  body,
  buttonLabel,
  onButtonClick
}: EmptyStateCardProps) {
  return (
    <div className="profile-empty-state">
      <div className="profile-empty-state-icon">{icon}</div>
      <p className="profile-empty-state-title">{title}</p>
      <p className="profile-empty-state-body">{body}</p>
      {buttonLabel && onButtonClick && (
        <CommonButton
          variant="default"
          className="profile-empty-state-button"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </CommonButton>
      )}
    </div>
  );
}
