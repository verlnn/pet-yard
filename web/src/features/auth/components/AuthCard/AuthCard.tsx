import type { ReactNode } from "react";

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
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">멍냥마당</p>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </header>
      {tabs && <div className="mt-6">{tabs}</div>}
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
