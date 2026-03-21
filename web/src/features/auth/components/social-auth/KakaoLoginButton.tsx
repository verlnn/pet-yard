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
      className="auth-kakao-button"
    >
      <Image
        src={KAKAO_BUTTON_SRC}
        alt="카카오로 시작"
        width={400}
        height={56}
        className="auth-kakao-button-image"
      />
    </button>
  );
}
