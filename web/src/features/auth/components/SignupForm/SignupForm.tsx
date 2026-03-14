"use client";

import { useState } from "react";

interface SignupFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

export default function SignupForm({ onSubmit, loading }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("이메일 형식을 확인해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
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
        <input
          type="password"
          className={inputClassName}
          aria-label="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="6자리 이상"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        비밀번호 확인
        <input
          type="password"
          className={inputClassName}
          aria-label="비밀번호 확인"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="비밀번호 다시 입력"
          required
        />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
        type="submit"
        disabled={loading}
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
