"use client";

import type { AuthMode } from "../../types/authTypes";
import "./AuthTabs.scss";

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export default function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="authTabs" role="tablist" aria-label="auth tabs">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        className={`authTabs__tab ${mode === "login" ? "is-active" : ""}`}
        onClick={() => onChange("login")}
      >
        로그인
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        className={`authTabs__tab ${mode === "signup" ? "is-active" : ""}`}
        onClick={() => onChange("signup")}
      >
        회원가입
      </button>
    </div>
  );
}
