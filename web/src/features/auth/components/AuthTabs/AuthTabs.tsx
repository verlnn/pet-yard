"use client";

import type { AuthMode } from "../../types/authTypes";

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

const tabBase =
  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/40";

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="flex gap-2 rounded-full bg-ink/5 p-1" role="tablist" aria-label="auth tabs">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        className={`${tabBase} ${
          mode === "login"
            ? "bg-ink text-sand shadow-soft"
            : "text-ink/60 hover:bg-white/70"
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
            : "text-ink/60 hover:bg-white/70"
        }`}
        onClick={() => onChange("signup")}
      >
        회원가입
      </button>
    </div>
  );
}
