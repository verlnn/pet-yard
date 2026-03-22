"use client";

import Image from "next/image";

interface KakaoLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const KAKAO_BUTTON_SRC = "/images/auth/kakao-sign2.png";

export default function KakaoLoginButton({ onClick, disabled }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="카카오로 계속"
      aria-busy={disabled}
      className="auth-social-provider-button"
    >
      <span className="auth-social-provider-button-inner">
        <Image
          src={KAKAO_BUTTON_SRC}
          alt="카카오"
          width={22}
          height={22}
          className="auth-social-provider-button-icon"
        />
        <span className="auth-social-provider-button-label">카카오로 계속</span>
      </span>
    </button>
  );
}
