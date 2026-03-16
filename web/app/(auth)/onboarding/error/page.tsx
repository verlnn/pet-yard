"use client";

import Link from "next/link";
import OnboardingLayout from "@/src/features/onboarding/components/OnboardingLayout";
import OnboardingCard from "@/src/features/onboarding/components/OnboardingCard";

export default function OnboardingErrorPage() {
  return (
    <OnboardingLayout>
      <OnboardingCard
        title="문제가 발생했어요"
        subtitle="잠시 후 다시 시도해 주세요."
      >
        <Link
          href="/start"
          className="block w-full rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-sand transition hover:bg-ink/90"
        >
          다시 시작하기
        </Link>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
