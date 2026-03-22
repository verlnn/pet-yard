import type { ReactNode } from "react";

interface AuthLayoutProps {
  brand?: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="auth-layout">
      <div className="auth-layout-inner">
        {brand && <div className="auth-layout-brand-shell">{brand}</div>}
        <div className="auth-layout-card-shell">{card}</div>
      </div>
    </section>
  );
}
