"use client";

import Image from "next/image";

interface SimpleSocialCircleButtonProps {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  iconSrc: string;
}

export default function SimpleSocialCircleButton({
  label,
  ariaLabel,
  onClick,
  iconSrc
}: SimpleSocialCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-transparent transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
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
