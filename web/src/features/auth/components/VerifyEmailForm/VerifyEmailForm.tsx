"use client";

import { useState } from "react";

interface VerifyEmailFormProps {
  onVerify: (code: string) => void;
  onResend: () => void;
  loading?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm transition focus:border-ember/40 focus:outline-none focus:ring-2 focus:ring-ember/20";

export default function VerifyEmailForm({ onVerify, onResend, loading }: VerifyEmailFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }
    if (code.trim().length !== 6) {
      setError("6자리 코드를 입력해주세요.");
      return;
    }
    setError(null);
    onVerify(code.trim());
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        인증 코드
        <input
          type="text"
          className={inputClassName}
          aria-label="인증 코드"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="6자리 코드"
          maxLength={6}
          required
        />
      </label>
      {error && <p className="text-sm text-ember">{error}</p>}
      <button
        className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
        type="submit"
        disabled={loading}
      >
        {loading ? "인증 중..." : "이메일 인증"}
      </button>
      <button
        type="button"
        className="w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ember/40 hover:text-ember"
        onClick={onResend}
        disabled={loading}
      >
        인증 코드 재전송
      </button>
    </form>
  );
}
