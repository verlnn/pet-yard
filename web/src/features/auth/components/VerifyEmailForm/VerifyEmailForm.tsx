"use client";

import { useState } from "react";

interface VerifyEmailFormProps {
  onVerify: (code: string) => void;
  onResend: () => void;
  onExtend: () => void;
  loading?: boolean;
  remainingSeconds?: number | null;
  extendCooldownSeconds?: number;
}

const inputClassName =
  "w-full rounded-xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm transition focus:border-ember/40 focus:outline-none focus:ring-2 focus:ring-ember/20";

function formatTime(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "--:--";
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export default function VerifyEmailForm({
  onVerify,
  onResend,
  onExtend,
  loading,
  remainingSeconds,
  extendCooldownSeconds = 0
}: VerifyEmailFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isExpired = remainingSeconds !== null && remainingSeconds <= 0;
  const isExtendCooling = extendCooldownSeconds > 0;

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
      <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm text-ink/70">
        <span>남은 시간</span>
        <span className="font-semibold text-ink">{formatTime(remainingSeconds)}</span>
      </div>
      <button
        type="button"
        className="w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ember/40 hover:text-ember disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onExtend}
        disabled={loading || remainingSeconds === null || isExpired || isExtendCooling}
      >
        {isExtendCooling ? `연장 대기 ${extendCooldownSeconds}s` : "인증 시간 1분 연장"}
      </button>
      {isExtendCooling && (
        <div className="relative h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember/70 via-ember to-ink/70 transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(100, ((3 - extendCooldownSeconds) / 3) * 100))}%` }}
          />
        </div>
      )}
      {isExtendCooling && (
        <p className="text-center text-xs text-ink/60">잠시만 기다려 주세요…</p>
      )}
      {!isExpired && (
        <p className="text-center text-xs text-ink/50">만료 후 재전송 버튼이 표시됩니다.</p>
      )}
      {isExpired && (
        <button
          type="button"
          className="w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ember/40 hover:text-ember"
          onClick={onResend}
          disabled={loading}
        >
          인증 코드 재전송
        </button>
      )}
    </form>
  );
}
