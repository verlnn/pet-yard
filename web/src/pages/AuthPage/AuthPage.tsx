"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import AuthLayout from "@/src/features/auth/components/AuthLayout/AuthLayout";
import AuthCard from "@/src/features/auth/components/AuthCard/AuthCard";
import LoginForm from "@/src/features/auth/components/LoginForm/LoginForm";
import SignupForm from "@/src/features/auth/components/SignupForm/SignupForm";
import VerifyEmailForm from "@/src/features/auth/components/VerifyEmailForm/VerifyEmailForm";
import { useAuthForms } from "@/src/features/auth/hooks/useAuthForms";
import type { AuthMode } from "@/src/features/auth/types/authTypes";
import KakaoLoginButton from "@/src/features/auth/components/AuthEntry/KakaoLoginButton";
import AuthDivider from "@/src/features/auth/components/AuthEntry/AuthDivider";
import AuthEntryActions from "@/src/features/auth/components/AuthEntry/AuthEntryActions";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const {
    title,
    subtitle,
    message,
    error,
    loading,
    handleLogin,
    handleSignup,
    handleVerify,
    handleResend,
    handleExtend,
    remainingSeconds,
    extendCooldownSeconds
  } =
    useAuthForms({ mode, onModeChange: setMode, nextPath });

  const helperLink =
    mode === "login" ? (
      <p className="text-center text-sm text-slate-500">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-semibold text-ink hover:text-ink/80">
          회원가입
        </Link>
      </p>
    ) : mode === "signup" ? (
      <p className="text-center text-sm text-slate-500">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-ink hover:text-ink/80">
          로그인
        </Link>
      </p>
    ) : (
      <p className="text-center text-sm text-slate-500">
        계정으로 돌아가기{" "}
        <Link href="/login" className="font-semibold text-ink hover:text-ink/80">
          로그인
        </Link>
      </p>
    );

  return (
    <div className="min-h-screen">
      <AuthLayout
        brand={
          <div className="flex items-center justify-between text-slate-600">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sand">
                <PawPrint className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold text-slate-900">멍냥마당</span>
            </Link>
            <span className="text-xs">PetYard</span>
          </div>
        }
        card={
          <AuthCard
            title={title}
            subtitle={subtitle}
            message={message}
            error={error}
          >
            {mode !== "verify" && (
              <div className="space-y-5">
                <KakaoLoginButton onClick={() => router.push("/start")} />
                <AuthDivider />
                <AuthEntryActions
                  onGoogleLogin={() => console.log("google login")}
                  onAppleLogin={() => console.log("apple login")}
                  onNaverLogin={() => console.log("naver login")}
                />
              </div>
            )}
            {mode === "login" && <LoginForm onSubmit={handleLogin} loading={loading} />}
            {mode === "signup" && <SignupForm onSubmit={handleSignup} loading={loading} />}
            {mode === "verify" && (
              <VerifyEmailForm
                onVerify={handleVerify}
                onResend={handleResend}
                onExtend={handleExtend}
                remainingSeconds={remainingSeconds}
                extendCooldownSeconds={extendCooldownSeconds}
                loading={loading}
              />
            )}
            {mode !== "verify" && helperLink}
            {mode === "verify" && <div className="pt-2">{helperLink}</div>}
          </AuthCard>
        }
      />
    </div>
  );
}
