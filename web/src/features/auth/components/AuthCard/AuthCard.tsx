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
    <div className="relative w-full overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-8 shadow-[0_30px_90px_-70px_rgba(122,88,60,0.35)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,220,190,0.35),transparent_60%)] blur-2xl" />
      <header className="relative space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
          />
          PetYard
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
      </header>
      {tabs && <div className="mt-6">{tabs}</div>}
      <div className="mt-6 space-y-5">{children}</div>
      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
