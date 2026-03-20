"use client";

import { useState } from "react";
import { authInputClass, authPrimaryButtonClass } from "../authStyles";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

export default function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("이메일 형식을 확인해주세요.");
      return;
    }
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    setError(null);
    onSubmit(email.trim(), password);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
        이메일
        <input
          type="email"
          className={authInputClass}
          aria-label="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@meongnyang.com"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
        비밀번호
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-input-border)] bg-[var(--color-input-bg)] p-1.5 shadow-[var(--shadow-card-token)]">
          <input
            type={showPassword ? "text" : "password"}
            className="h-11 w-full bg-transparent px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-input-placeholder)] focus:outline-none"
            aria-label="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            required
          />
          <button
            type="button"
            className="whitespace-nowrap rounded-xl bg-[var(--color-surface-muted)] px-3 py-2 text-[11px] font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-hover-surface)] hover:text-[var(--color-text)]"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        className={authPrimaryButtonClass}
        type="submit"
        disabled={loading}
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
