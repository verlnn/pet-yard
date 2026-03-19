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
      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent transition ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
      }`}
    >
      <Image
        src={iconSrc}
        alt={label}
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
      />
    </button>
  );
}
