import type { ReactNode } from "react";
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
        <p className="auth-card-kicker">PetYard Account</p>
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
