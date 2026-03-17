"use client";

import type { AuthMode } from "../../types/authTypes";

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

const tabBase =
  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="flex gap-2 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]" role="tablist" aria-label="auth tabs">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        className={`${tabBase} ${
          mode === "login"
            ? "bg-ink text-sand shadow-soft"
            : "text-slate-500 hover:bg-white/80"
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
            ? "bg-ink text-sand shadow-soft"
            : "text-slate-500 hover:bg-white/80"
        }`}
        onClick={() => onChange("signup")}
      >
        회원가입
      </button>
    </div>
  );
}
