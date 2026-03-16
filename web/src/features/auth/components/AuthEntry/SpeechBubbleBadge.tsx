interface SpeechBubbleBadgeProps {
  text: string;
}

export default function SpeechBubbleBadge({ text }: SpeechBubbleBadgeProps) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
      <span>{text}</span>
      <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 translate-y-[1px] border-x-8 border-t-8 border-x-transparent border-t-slate-200" />
      <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-white" />
    </div>
  );
}
