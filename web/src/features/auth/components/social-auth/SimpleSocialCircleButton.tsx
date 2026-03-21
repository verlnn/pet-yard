"use client";

import Image from "next/image";

interface SimpleSocialCircleButtonProps {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  iconSrc: string;
  disabled?: boolean;
}

export default function SimpleSocialCircleButton({
  label,
  ariaLabel,
  onClick,
  iconSrc,
  disabled = false
}: SimpleSocialCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className="auth-social-provider-button"
    >
      <span className="auth-social-provider-button-inner">
        <Image
          src={iconSrc}
          alt={label}
          width={22}
          height={22}
          className="auth-social-provider-button-icon"
        />
        <span className="auth-social-provider-button-label">{label}로 계속</span>
      </span>
      {disabled && <span className="auth-social-provider-button-badge">준비 중</span>}
    </button>
  );
}
