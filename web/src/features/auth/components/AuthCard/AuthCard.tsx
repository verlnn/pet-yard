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
    <div className="relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] blur-2xl" />
      <header className="relative space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/70">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
          />
          PetYard
        </div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-sm leading-relaxed text-white/70">{subtitle}</p>
      </header>
      {tabs && <div className="mt-6">{tabs}</div>}
      <div className="mt-6 space-y-5">{children}</div>
      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      )}
    </div>
  );
}
