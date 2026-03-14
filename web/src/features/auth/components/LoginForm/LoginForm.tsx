"use client";

import { useState } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        이메일
        <input
          type="email"
          className={inputClassName}
          aria-label="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@pet-yard.com"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        비밀번호
        <div className="flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            className={inputClassName}
            aria-label="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            required
          />
          <button
            type="button"
            className="whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
        type="submit"
        disabled={loading}
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
