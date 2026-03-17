import type { ReactNode } from "react";

interface AuthLayoutProps {
  brand?: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#d9c6b9] via-[#c8b8ad] to-[#b7a89e] px-6 py-16 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(234,155,105,0.3),transparent_62%)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(246,195,165,0.26),transparent_65%)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-140px] top-[120px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(140,195,180,0.22),transparent_65%)] blur-[120px]" />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        {brand}
        <div className="w-full max-w-md">{card}</div>
      </div>
    </section>
  );
}
