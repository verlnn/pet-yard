"use client";

import { useState } from "react";
import { authInputClass, authPrimaryButtonClass } from "../authStyles";

interface SignupFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
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
      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
        비밀번호
        <input
          type="password"
          className={authInputClass}
          aria-label="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="6자리 이상"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
        비밀번호 확인
        <input
          type="password"
          className={authInputClass}
          aria-label="비밀번호 확인"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="비밀번호 다시 입력"
          required
        />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        className={authPrimaryButtonClass}
        type="submit"
        disabled={loading}
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
