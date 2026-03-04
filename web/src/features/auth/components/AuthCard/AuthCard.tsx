import type { ReactNode } from "react";
import "./AuthCard.scss";

interface AuthCardProps {
  title: string;
  subtitle: string;
  tabs: ReactNode;
  children: ReactNode;
  message?: string | null;
  error?: string | null;
}

export default function AuthCard({ title, subtitle, tabs, children, message, error }: AuthCardProps) {
  return (
    <div className="authCard">
      <header className="authCard__header">
        <p className="authCard__eyebrow">멍냥마당 계정</p>
        <h2 className="authCard__title">{title}</h2>
        <p className="authCard__subtitle">{subtitle}</p>
      </header>
      {tabs}
      <div className="authCard__content">{children}</div>
      {message && <p className="authCard__message">{message}</p>}
      {error && <p className="authCard__error">{error}</p>}
    </div>
  );
}
