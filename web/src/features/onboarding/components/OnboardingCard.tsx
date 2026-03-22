import type { ReactNode } from "react";
import Image from "next/image";

interface OnboardingCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  message?: string | null;
  error?: string | null;
}

export default function OnboardingCard({ title, subtitle, children, message, error }: OnboardingCardProps) {
  return (
    <div className="onboarding-card">
      <header className="onboarding-card-header">
        <div className="onboarding-card-badge">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={18}
            height={18}
            className="onboarding-card-badge-icon"
          />
          Onboarding
        </div>
        <h2 className="onboarding-card-title">{title}</h2>
        {subtitle && <p className="onboarding-card-subtitle">{subtitle}</p>}
      </header>
      <div className="onboarding-card-body">{children}</div>
      {message && (
        <p className="onboarding-card-message">
          {message}
        </p>
      )}
      {error && (
        <p className="onboarding-card-error">
          {error}
        </p>
      )}
    </div>
  );
}
