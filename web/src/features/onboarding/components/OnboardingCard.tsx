import type { ReactNode } from "react";
import Image from "next/image";

interface OnboardingCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  message?: string | null;
  error?: string | null;
}

export default function OnboardingCard({ title, subtitle, children, message, error }: OnboardingCardProps) {
  return (
    <div className="w-full rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_70px_-45px_rgba(31,29,26,0.45)] backdrop-blur">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
          />
          Onboarding
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      </header>
      <div className="mt-6 space-y-5">{children}</div>
      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
