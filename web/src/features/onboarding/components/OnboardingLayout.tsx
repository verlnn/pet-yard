"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#efe6dc] via-[#e6dbd1] to-[#dccfc3] px-6 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(239,170,120,0.28),transparent_62%)] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,210,175,0.22),transparent_65%)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[140px] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(150,210,190,0.2),transparent_65%)] blur-[120px]" />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between text-slate-500">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)]">
              <Image
                src="/images/brand/petyard-symbol.png"
                alt="멍냥마당 로고"
                width={26}
                height={26}
                className="h-6 w-6"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-slate-800">멍냥마당</span>
          </Link>
          <span className="text-xs tracking-[0.3em] text-slate-400">PetYard</span>
        </div>
        {children}
      </div>
    </section>
  );
}
