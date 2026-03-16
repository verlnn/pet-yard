"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <section className="min-h-screen bg-[#f5f6f8] px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between text-slate-600">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/brand/petyard-symbol.png"
              alt="멍냥마당 로고"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="text-lg font-semibold text-slate-900">멍냥마당</span>
          </Link>
          <span className="text-xs">PetYard</span>
        </div>
        {children}
      </div>
    </section>
  );
}
