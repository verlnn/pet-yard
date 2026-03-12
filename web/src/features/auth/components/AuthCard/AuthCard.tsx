import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  tabs: ReactNode;
  children: ReactNode;
  message?: string | null;
  error?: string | null;
}

export default function AuthCard({ title, subtitle, tabs, children, message, error }: AuthCardProps) {
  return (
    <div className="gradient-shell w-full max-w-md rounded-[28px] border border-white/60 p-8 shadow-card">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/60">멍냥마당 계정</p>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink/70">{subtitle}</p>
      </header>
      <div className="mt-6">{tabs}</div>
      <div className="mt-6 space-y-4">{children}</div>
      {message && (
        <p className="mt-6 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-ember/20 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
