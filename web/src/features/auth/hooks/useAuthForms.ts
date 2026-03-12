"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api/authApi";
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

  const resetNotice = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  const handleSignup = useCallback(
    async (email: string, password: string) => {
      resetNotice();
      setLoading(true);
      try {
        await authApi.signup(email, password);
        setEmailCache(email);
        setMessage("인증 코드가 전송되었습니다. 이메일을 확인해 주세요.");
        onModeChange("verify");
      } catch (err) {
        setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
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
        setMessage("이메일 인증이 완료되었습니다. 로그인해 주세요.");
        onModeChange("login");
      } catch (err) {
        setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
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
        router.push(sanitizedNext);
      } catch (err) {
        setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [nextPath, resetNotice, router]
  );

  const handleResend = useCallback(async () => {
    if (!emailCache) {
      setError("이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.");
      return;
    }
    setLoading(true);
    try {
      // TODO: 재전송 API 연결
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMessage("인증 코드가 재전송되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "재전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [emailCache]);

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
    handleResend
  };
}
