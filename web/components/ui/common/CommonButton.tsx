import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type CommonButtonSize = "small" | "medium" | "large" | "wide";

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: CommonButtonSize;
  color?: string;
  fontColor?: string;
  href?: Parameters<typeof Link>[0]["href"];
  icon?: React.ReactNode;
  text?: React.ReactNode;
}

const sizeClassName: Record<CommonButtonSize, string> = {
  small: "h-9 min-w-auto px-3 text-xs",
  medium: "",
  large: "",
  wide: "h-11 px-8 text-sm tracking-[0.3em]"
};

function CommonButton({
  size = "medium",
  color,
  fontColor,
  href,
  icon,
  text,
  className,
  children,
  style,
  disabled,
  ...rest
}: CommonButtonProps) {
  const finalClassName = cn(
    "relative h-12 min-w-[250px] flex-1 inline-flex items-center justify-center gap-2 overflow-hidden rounded-[10px] px-6 font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)] disabled:pointer-events-none disabled:opacity-50",
    sizeClassName[size],
    className
  );

  const finalStyle = {
    backgroundColor: color ?? "var(--color-button-secondary-bg)",
    color: fontColor ?? "var(--color-button-secondary-text)",
    ...(style ?? {})
  };

  const content = text ?? children;

  if (href) {
    return (
      <Link href={href} className={finalClassName} style={finalStyle}>
        {icon && <span className="flex items-center justify-center">{icon}</span>}
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={finalClassName}
      style={finalStyle}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {content}
    </button>
  );
}

export default CommonButton;
