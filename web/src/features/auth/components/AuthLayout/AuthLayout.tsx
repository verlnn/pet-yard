import type { ReactNode } from "react";
import "./AuthLayout.scss";

interface AuthLayoutProps {
  brand: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="authLayout__container">
      <div className="authLayout__brand">{brand}</div>
      <div className="authLayout__card">{card}</div>
    </section>
  );
}
