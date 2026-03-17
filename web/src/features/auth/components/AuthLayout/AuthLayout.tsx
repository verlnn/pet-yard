import type { ReactNode } from "react";

interface AuthLayoutProps {
  brand?: ReactNode;
  card: ReactNode;
}

export default function AuthLayout({ brand, card }: AuthLayoutProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-sand px-6 py-16 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(213,233,245,0.6),transparent_62%)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(217,184,164,0.45),transparent_65%)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-140px] top-[120px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,155,111,0.25),transparent_65%)] blur-[120px]" />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        {brand}
        <div className="w-full max-w-md">{card}</div>
      </div>
    </section>
  );
}
