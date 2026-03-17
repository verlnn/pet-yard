"use client";

import { useState } from "react";
import { authGhostButtonClass, authInputClass, authPrimaryButtonClass } from "../authStyles";

interface VerifyEmailFormProps {
  onVerify: (code: string) => void;
  onResend: () => void;
  onExtend: () => void;
  loading?: boolean;
  remainingSeconds?: number | null;
  extendCooldownSeconds?: number;
}

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
  const isExpired = remainingSeconds != null && remainingSeconds <= 0;
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
        인증 코드
        <input
          type="text"
          className={authInputClass}
          aria-label="인증 코드"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="6자리 코드"
          maxLength={6}
          required
        />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        className={authPrimaryButtonClass}
        type="submit"
        disabled={loading}
      >
        {loading ? "인증 중..." : "이메일 인증"}
      </button>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)]">
        <span>남은 시간</span>
        <span className="font-semibold text-slate-900">{formatTime(remainingSeconds)}</span>
      </div>
      <button
        type="button"
        className={authGhostButtonClass}
        onClick={onExtend}
        disabled={loading || remainingSeconds == null || isExpired || isExtendCooling}
      >
        {isExtendCooling ? `연장 대기 ${extendCooldownSeconds}s` : "인증 시간 1분 연장"}
      </button>
      {isExtendCooling && (
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(100, ((3 - extendCooldownSeconds) / 3) * 100))}%` }}
          />
        </div>
      )}
      {isExtendCooling && (
        <p className="text-center text-xs text-slate-500">잠시만 기다려 주세요…</p>
      )}
      {!isExpired && (
        <p className="text-center text-xs text-slate-400">만료 후 재전송 버튼이 표시됩니다.</p>
      )}
      {isExpired && (
        <button
          type="button"
          className={authGhostButtonClass}
          onClick={onResend}
          disabled={loading}
        >
          인증 코드 재전송
        </button>
      )}
    </form>
  );
}
