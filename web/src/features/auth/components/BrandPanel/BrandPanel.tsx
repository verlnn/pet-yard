import Image from "next/image";

export default function BrandPanel() {
  return (
    <aside className="relative flex h-full flex-col justify-between overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-br from-white/95 via-[#f4f6fb] to-sky/60 p-10 text-ink shadow-[0_26px_80px_-50px_rgba(31,29,26,0.45)]">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-600">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={22}
            height={22}
            className="h-5 w-5"
          />
          멍냥마당
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          동네에서 가장
          <br />
          믿을 수 있는 반려 생활.
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          성장 기록, 매칭, 커뮤니티를 한 번에. 멍냥마당에서 내 반려생활을
          더 단정하고 안전하게 시작하세요.
        </p>
      </div>
      <div className="relative mt-10 space-y-4 text-xs font-medium text-slate-600">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2">안심 매칭</span>
          <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2">산책 루틴</span>
          <span className="rounded-full border border-white/70 bg-white/70 px-4 py-2">동네 케어</span>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_40px_-30px_rgba(31,29,26,0.3)]">
          “우리 아이의 하루를 기록하고, 안전한 이웃과 연결해요.”
        </div>
      </div>
      <div className="pointer-events-none absolute -right-20 top-14 h-56 w-56 rounded-full bg-clay/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 left-8 h-44 w-44 animate-float rounded-full bg-ember/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-6 h-56 w-56 rounded-full bg-moss/20 blur-3xl" />
    </aside>
  );
}
