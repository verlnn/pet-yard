"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PawPrint } from "lucide-react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <section className="min-h-screen bg-[#f5f6f8] px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-between text-slate-600">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sand">
              <PawPrint className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-slate-900">멍냥마당</span>
          </Link>
          <span className="text-xs">PetYard</span>
        </div>
        {children}
      </div>
    </section>
  );
}
