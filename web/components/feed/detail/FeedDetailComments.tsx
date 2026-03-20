"use client";

interface FeedDetailCommentsProps {
  className?: string;
}

export function FeedDetailComments({ className }: FeedDetailCommentsProps) {
  return (
    <div className={className}>
      <div className="border-t border-slate-100 px-6 py-4">
        <p className="text-xs font-semibold text-ink/55">댓글</p>
        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-ink/45">
          아직 댓글이 없습니다.
        </div>
      </div>
    </div>
  );
}
