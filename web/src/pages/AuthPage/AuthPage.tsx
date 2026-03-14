"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/src/features/auth/components/AuthLayout/AuthLayout";
import BrandPanel from "@/src/features/auth/components/BrandPanel/BrandPanel";
import AuthCard from "@/src/features/auth/components/AuthCard/AuthCard";
import AuthTabs from "@/src/features/auth/components/AuthTabs/AuthTabs";
import LoginForm from "@/src/features/auth/components/LoginForm/LoginForm";
import SignupForm from "@/src/features/auth/components/SignupForm/SignupForm";
import VerifyEmailForm from "@/src/features/auth/components/VerifyEmailForm/VerifyEmailForm";
import { useAuthForms } from "@/src/features/auth/hooks/useAuthForms";
import type { AuthMode } from "@/src/features/auth/types/authTypes";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
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

  return (
    <div className="min-h-screen">
      <AuthLayout
        brand={<BrandPanel />}
        card={
          <AuthCard
            title={title}
            subtitle={subtitle}
            tabs={<AuthTabs mode={mode} onChange={setMode} />}
            message={message}
            error={error}
          >
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
          </AuthCard>
        }
      />
    </div>
  );
}
