"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthMascot from "./AuthMascot";
import { useAuthMascotState } from "./useAuthMascotState";
import type { FocusedField } from "./types";
import { authApi } from "@/src/features/auth/api/authApi";

interface AuthFormProps {
  mode: "login" | "signup";
  nextPath?: string | null;
}

const inputClassName =
  "w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm transition focus:border-ember/40 focus:outline-none focus:ring-2 focus:ring-ember/20";

export default function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mascotState = useAuthMascotState({
    emailValue: email,
    passwordValue: password,
    focusedField,
    isPasswordVisible
  });

  const title = useMemo(() => (mode === "login" ? "다시 만나 반가워요" : "함께할 준비가 됐어요"), [mode]);
  const subtitle = useMemo(
    () => (mode === "login" ? "멍냥마당 계정으로 로그인하세요." : "이메일 인증으로 시작할 수 있어요."),
    [mode]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.includes("@")) {
      setError("이메일 형식을 확인해주세요.");
      return;
    }

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        return;
      }
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const tokens = await authApi.login(email.trim(), password);
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        document.cookie = `accessToken=${tokens.accessToken}; path=/`;

        const sanitizedNext =
          nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/feed";
        router.push(sanitizedNext);
      } else {
        await authApi.signup(email.trim(), password);
        localStorage.setItem("pendingEmail", email.trim());
        setMessage("인증 코드가 전송되었습니다. 이메일을 확인해 주세요.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-[28px] border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <AuthMascot
            state={mascotState.mascotState}
            inputProgress={mascotState.inputProgress}
            trackingIntensity={mascotState.trackingIntensity}
          />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">멍냥마당 계정</p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">{title}</h1>
            <p className="mt-2 text-sm text-ink/70">{subtitle}</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            이메일
            <input
              type="email"
              className={inputClassName}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@pet-yard.com"
              required
              aria-label="이메일"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            비밀번호
            <div className="flex items-center gap-2">
              <input
                type={isPasswordVisible ? "text" : "password"}
                className={inputClassName}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="비밀번호"
                required
                aria-label="비밀번호"
              />
              <button
                type="button"
                className="whitespace-nowrap rounded-2xl border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-ember/40 hover:text-ember"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-pressed={isPasswordVisible}
                aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {isPasswordVisible ? "숨기기" : "보기"}
              </button>
            </div>
          </label>

          {mode === "signup" && (
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              비밀번호 확인
              <input
                type={isPasswordVisible ? "text" : "password"}
                className={inputClassName}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="비밀번호 다시 입력"
                required
                aria-label="비밀번호 확인"
              />
            </label>
          )}

          {error && (
            <p className="rounded-xl border border-ember/20 bg-ember/10 px-4 py-3 text-sm text-ember" role="alert">
              {error}
            </p>
          )}

          {message && (
            <div className="space-y-3">
              <p
                className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {message}
              </p>
              <button
                type="button"
                onClick={() => router.push("/verify")}
                className="w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ember/40 hover:text-ember"
              >
                인증하러 가기
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/40"
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "로그인 중..."
                : "가입 중..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
