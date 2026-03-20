"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <section className="onboarding-layout">
      <div className="onboarding-layout-inner">
        <div className="onboarding-layout-brandbar">
          <Link href="/" className="onboarding-layout-brandlink">
            <div className="onboarding-layout-brandmark">
              <Image
                src="/images/brand/petyard-symbol.png"
                alt="멍냥마당 로고"
                width={26}
                height={26}
                className="onboarding-layout-brandmark-image"
                priority
              />
            </div>
            <span className="onboarding-layout-brandtitle">멍냥마당</span>
          </Link>
          <span className="onboarding-layout-wordmark">PetYard</span>
        </div>
        {children}
      </div>
    </section>
  );
}
