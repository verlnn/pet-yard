interface AuthDividerProps {
  label?: string;
}

export default function AuthDivider({ label = "또는" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200/80" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200/80" />
    </div>
  );
}
