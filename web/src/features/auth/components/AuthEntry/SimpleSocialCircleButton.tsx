"use client";

interface SimpleSocialCircleButtonProps {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  backgroundClass: string;
  foregroundClass: string;
  iconSizeClass: string;
  iconSrc: string;
  borderClass: string;
  hoverBackgroundClass: string;
  hoverBorderClass: string;
}

export default function SimpleSocialCircleButton({
  label,
  ariaLabel,
  onClick,
  backgroundClass,
  foregroundClass,
  iconSizeClass,
  iconSrc,
  borderClass,
  hoverBackgroundClass,
  hoverBorderClass
}: SimpleSocialCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group flex h-12 w-12 items-center justify-center rounded-full border ${borderClass} ${backgroundClass} ${foregroundClass} ${hoverBackgroundClass} ${hoverBorderClass} shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40`}
    >
      <img
        src={iconSrc}
        alt={label}
        className={`${iconSizeClass} object-contain`}
      />
    </button>
  );
}
