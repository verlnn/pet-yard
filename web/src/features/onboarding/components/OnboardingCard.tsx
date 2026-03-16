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
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span>멍냥마당 온보딩</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </header>
      <div className="mt-6 space-y-4">{children}</div>
      {message && (
        <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
