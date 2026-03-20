"use client";

import type { AuthMode } from "../../types/authTypes";

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

const tabBase =
  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30";

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div
      className="flex gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-[var(--shadow-card-token)]"
      role="tablist"
      aria-label="auth tabs"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        className={`${tabBase} ${
          mode === "login"
            ? "bg-[var(--color-button-bg)] text-[var(--color-button-text)] shadow-[var(--shadow-soft-token)]"
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-hover-surface)]"
        }`}
        onClick={() => onChange("login")}
      >
        로그인
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        className={`${tabBase} ${
          mode === "signup"
            ? "bg-[var(--color-button-bg)] text-[var(--color-button-text)] shadow-[var(--shadow-soft-token)]"
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-hover-surface)]"
        }`}
        onClick={() => onChange("signup")}
      >
        회원가입
      </button>
    </div>
  );
}
