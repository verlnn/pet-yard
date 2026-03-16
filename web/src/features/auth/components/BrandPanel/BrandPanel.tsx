import Image from "next/image";

export default function BrandPanel() {
  return (
    <aside className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white/90 via-sand/80 to-sky/70 p-10 text-ink shadow-card">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          멍냥마당
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          반려 생활을 더 따뜻하게,
          <br />
          동네에서 더 가깝게.
        </h1>
        <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
          성장 기록부터 산책 매칭까지. 멍냥마당에서 나와 반려동물을 위한 동네 네트워크를 만나보세요.
        </p>
      </div>
      <div className="relative mt-10 flex flex-wrap gap-3 text-xs font-medium text-ink/70">
        <span className="rounded-full border border-ink/10 bg-white/70 px-4 py-2">주간 산책 루틴</span>
        <span className="rounded-full border border-ink/10 bg-white/70 px-4 py-2">동네 케어 파트너</span>
        <span className="rounded-full border border-ink/10 bg-white/70 px-4 py-2">멍냥 커뮤니티</span>
      </div>
      <div className="pointer-events-none absolute -right-12 top-10 h-48 w-48 rounded-full bg-clay/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-8 h-40 w-40 animate-float rounded-full bg-ember/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-moss/20 blur-3xl" />
    </aside>
  );
}
