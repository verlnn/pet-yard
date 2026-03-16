"use client";

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
      aria-label="카카오 로그인"
      aria-busy={disabled}
      className="h-12 w-full overflow-hidden rounded-[12px] shadow-sm disabled:cursor-not-allowed"
    >
      <img
        src={KAKAO_BUTTON_SRC}
        alt="카카오 로그인"
        className="h-full w-full object-contain"
      />
    </button>
  );
}
