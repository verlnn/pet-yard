"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "../api/authApi";
import type { AuthMode } from "../types/authTypes";

interface UseAuthFormsOptions {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  nextPath?: string | null;
}

export function useAuthForms({ mode, onModeChange, nextPath }: UseAuthFormsOptions) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailCache, setEmailCache] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [extendCooldownSeconds, setExtendCooldownSeconds] = useState(0);
  const extendRateRef = useRef({ windowStart: 0, count: 0 });

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    if (storedEmail) {
      setEmailCache(storedEmail);
    }
    const storedExpiresAt = localStorage.getItem("pendingEmailExpiresAt");
    if (storedExpiresAt) {
      setExpiresAt(storedExpiresAt);
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (extendCooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setExtendCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [extendCooldownSeconds]);

  const resetNotice = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  const toMessage = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  };

  const handleSignup = useCallback(
    async (username: string, email: string, password: string) => {
      resetNotice();
      setLoading(true);
      try {
        const result = await authApi.signup(username, email, password);
        setEmailCache(email);
        localStorage.setItem("pendingEmail", email);
        setExpiresAt(result.expiresAt);
        localStorage.setItem("pendingEmailExpiresAt", result.expiresAt);
        setMessage("인증 코드가 전송되었습니다. 이메일을 확인해 주세요.");
        onModeChange("verify");
      } catch (err) {
        setError(toMessage(err, "회원가입에 실패했습니다."));
      } finally {
        setLoading(false);
      }
    },
    [onModeChange, resetNotice]
  );

  const handleVerify = useCallback(
    async (code: string) => {
      resetNotice();
      setLoading(true);
      try {
        const email = emailCache;
        if (!email) {
          throw new Error("이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.");
        }
        await authApi.verifyEmail(email, code);
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingEmailExpiresAt");
        setExpiresAt(null);
        setMessage("이메일 인증이 완료되었습니다. 로그인해 주세요.");
        onModeChange("login");
      } catch (err) {
        setError(toMessage(err, "인증에 실패했습니다."));
      } finally {
        setLoading(false);
      }
    },
    [emailCache, onModeChange, resetNotice]
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      resetNotice();
      setLoading(true);
      try {
        const tokens = await authApi.login(email, password);
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        document.cookie = `accessToken=${tokens.accessToken}; path=/`;
        setMessage("로그인에 성공했습니다.");
        const sanitizedNext =
          nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/feed";
        router.push(sanitizedNext as Route);
      } catch (err) {
        setError(toMessage(err, "로그인에 실패했습니다."));
      } finally {
        setLoading(false);
      }
    },
    [nextPath, resetNotice, router]
  );

  const handleResend = useCallback(async () => {
    resetNotice();
    if (!emailCache) {
      setError("이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.");
      return;
    }
    if (remainingSeconds !== null && remainingSeconds > 0) {
      setError("아직 인증 시간이 남아 있습니다. 만료 후 재전송이 가능합니다.");
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.resendEmail(emailCache);
      setExpiresAt(result.expiresAt);
      localStorage.setItem("pendingEmailExpiresAt", result.expiresAt);
      setMessage("인증 코드가 재전송되었습니다.");
    } catch (err) {
      setError(toMessage(err, "재전송에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  }, [emailCache, remainingSeconds, resetNotice]);

  const handleExtend = useCallback(async () => {
    resetNotice();
    if (!emailCache) {
      setError("이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.");
      return;
    }
    if (remainingSeconds !== null && remainingSeconds <= 0) {
      setError("이미 만료되었습니다. 재전송을 진행해주세요.");
      return;
    }

    const now = Date.now();
    if (now - extendRateRef.current.windowStart > 1000) {
      extendRateRef.current.windowStart = now;
      extendRateRef.current.count = 0;
    }
    if (extendRateRef.current.count >= 2) {
      setError("너무 자주 요청했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    extendRateRef.current.count += 1;
    setExtendCooldownSeconds(3);

    setLoading(true);
    try {
      const result = await authApi.extendEmail(emailCache);
      setExpiresAt(result.expiresAt);
      localStorage.setItem("pendingEmailExpiresAt", result.expiresAt);
      setMessage("인증 시간이 1분 연장되었습니다.");
    } catch (err) {
      setError(toMessage(err, "인증 시간 연장에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  }, [emailCache, remainingSeconds, resetNotice]);

  const title = useMemo(() => {
    if (mode === "signup") return "환영합니다";
    if (mode === "verify") return "이메일 인증";
    return "다시 만나 반가워요";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "signup") return "멍냥마당에서 반려생활을 함께하세요.";
    if (mode === "verify") return "이메일로 받은 6자리 코드를 입력하세요.";
    return "멍냥마당 계정으로 로그인하세요.";
  }, [mode]);

  return {
    title,
    subtitle,
    message,
    error,
    loading,
    handleSignup,
    handleVerify,
    handleLogin,
    handleResend,
    handleExtend,
    remainingSeconds,
    extendCooldownSeconds
  };
}
