import type { ReactNode } from "react";

interface AuthLayoutProps {
  brand: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
      <div className="order-2 lg:order-1">{brand}</div>
      <div className="order-1 flex items-center justify-center lg:order-2">{card}</div>
    </section>
  );
}
