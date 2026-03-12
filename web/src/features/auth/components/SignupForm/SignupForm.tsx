"use client";

import { useState } from "react";

interface SignupFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm transition focus:border-ember/40 focus:outline-none focus:ring-2 focus:ring-ember/20";

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
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
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
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
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
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
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
      {error && <p className="text-sm text-ember">{error}</p>}
      <button
        className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
        type="submit"
        disabled={loading}
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
