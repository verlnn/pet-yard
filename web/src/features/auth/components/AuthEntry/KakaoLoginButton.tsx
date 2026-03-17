"use client";

import Image from "next/image";

interface KakaoLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const KAKAO_BUTTON_SRC = "/images/auth/kakao-sign.png";

export default function KakaoLoginButton({ onClick, disabled }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="카카오로 시작"
      aria-busy={disabled}
      className="h-14 w-full overflow-hidden rounded-2xl bg-transparent transition hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
    >
      <Image
        src={KAKAO_BUTTON_SRC}
        alt="카카오로 시작"
        width={400}
        height={56}
        className="h-full w-full object-contain"
      />
    </button>
  );
}
