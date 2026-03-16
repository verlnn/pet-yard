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
      aria-label="카카오로 시작"
      aria-busy={disabled}
      className="h-12 w-full overflow-hidden rounded-[14px] shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      <img
        src={KAKAO_BUTTON_SRC}
        alt="카카오로 시작"
        className="h-full w-full object-contain"
      />
    </button>
  );
}
