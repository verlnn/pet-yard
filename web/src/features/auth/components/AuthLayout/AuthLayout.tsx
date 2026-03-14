import type { ReactNode } from "react";

interface AuthLayoutProps {
  brand?: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-[#f5f6f8] px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        {brand && <div className="mb-8 w-full">{brand}</div>}
        <div className="w-full">{card}</div>
      </div>
    </section>
  );
}
