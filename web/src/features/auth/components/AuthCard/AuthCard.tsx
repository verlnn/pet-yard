import type { ReactNode } from "react";
import Image from "next/image";

interface AuthCardProps {
  title: string;
  subtitle: string;
  tabs?: ReactNode;
  children: ReactNode;
  message?: string | null;
  error?: string | null;
}

export default function AuthCard({ title, subtitle, tabs, children, message, error }: AuthCardProps) {
  return (
    <div className="auth-card">
      <header className="auth-card-header">
        <div className="auth-card-brand-badge">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
          />
          PetYard
        </div>
        <h2 className="auth-card-title">{title}</h2>
        <p className="auth-card-subtitle">{subtitle}</p>
      </header>
      {tabs && <div className="auth-card-tabs">{tabs}</div>}
      <div className="auth-card-body">{children}</div>
      {message && (
        <p className="auth-card-message">
          {message}
        </p>
      )}
      {error && (
        <p className="auth-card-error">
          {error}
        </p>
      )}
    </div>
  );
}
